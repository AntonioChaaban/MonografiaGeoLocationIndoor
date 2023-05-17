var express = require('express');
const router = express.Router();
const fs = require('fs');
const cors = require('cors');
var stats = require("stats-lite");

//Definição de variaveis necessarias para todo o processo de localização
let minhasInstancias = [];
const blocos = [];
const posicaoAtual = [];

//Definição de linha de percurso para o ponteiro de posicionamento
const polyQuarto1 = [[-5378050.936841136,-1140239.8477179788],[-5378051.2326916205,-1140238.3321621572],[-5378052.429888388,-1140237.9019187817]];
const polyCorredorQuarto1 = [[-5378052.429888388,-1140237.9019187817],[-5378053.994576692,-1140237.287124286]];

const polyQuarto2 = [[-5378055.188905488,-1140237.8096429855],[-5378055.935361086,-1140238.3321617108],[-5378055.860715886,-1140239.8997182415]];
const polyCorredorQuarto2 = [[-5378055.188905488,-1140237.8096429855],[-5378053.994576692,-1140237.287124286]];

const polyCorredor = [[-5378053.994576692,-1140237.287124286],[-5378054.0720900195,-1140234.6921608197]];
const polyCorredorSala = [[-5378054.0720900195,-1140234.6921608197],[-5378055.56213269,-1140234.5998845808]];

const polySala = [[-5378055.56213269,-1140234.5998845808],[-5378057.654938721,-1140234.3239484641],[-5378060.640759871,-1140235.0704038048],[-5378060.864696457,-1140236.7872510862]];
const polySalaCozinha = [[-5378055.56213269,-1140234.5998845808],[-5378057.654938721,-1140234.3239484641],[-5378058.849267181,-1140233.129619921]];

const polyCozinha = [[-5378058.849267181,-1140233.129619921],[-5378060.7900509285,-1140233.0549743862],[-5378059.521076941,-1140231.4127726392]];

//Definição de objeto utilizado para conversar com o front da aplicação
// const backToFront = {
//   nomeDoAmbiente: '',
//   bloco: 0,
//   deslocamento: false,
//   lineString: [[]],
//   cordenadas: [[]],
// }

//Definição de classe para o preencimento dos dados vindos da placa esp32 para localização atual e suas variaveis
class devices {
  constructor(nome, rssi) {
    this.nome = nome;
    this.rssi = rssi;
    this.leituras = [];

    this.id = parseInt(nome.slice(-1));
  }

  adicionarPosicao(posicao){
    this.posicao = posicao;
  }

  adicionarLeitura(leitura){
    this.leituras.push(leitura);
  }

  calcularParamentros(listaDeLeitura){
    // Calcular a média dos valores RSSI 
    this.mean_rssi = listaDeLeitura.reduce((a, b) => a + b, 0) / listaDeLeitura.length;

    let media = this.mean_rssi;

    // Calcular o desvio padrão dos valores RSSI
    this.std_rssi = Math.sqrt(listaDeLeitura.reduce((a, b) => a + (b - media) ** 2, 0) / listaDeLeitura.length);

    // Calcular a variância dos valores RSSI 
    this.var_rssi = listaDeLeitura.reduce((a, b) => a + (b - media) ** 2, 0) / listaDeLeitura.length;

    this.quarts = stats.percentile(listaDeLeitura, 0.85);

  }
};

//Definição de classe para o preencimento dos dados vindos da placa esp32,para base de dados e suas variaveis
//Classe para o fingerprint
class DeviceLeitura {
  constructor(nome, valoresRSSI){
    this.nome = nome;
    this.valoresRSSI = valoresRSSI;

    
    this.id = parseInt(nome.slice(-1));
    // Calcular a média dos valores RSSI 
    this.mean_rssi = valoresRSSI.reduce((a, b) => a + b, 0) / valoresRSSI.length;

    // Calcular o desvio padrão dos valores RSSI 
    this.std_rssi = Math.sqrt(valoresRSSI.reduce((a, b) => a + (b - this.mean_rssi) ** 2, 0) / valoresRSSI.length);

    // Calcular a variância dos valores RSSI 
    this.var_rssi = valoresRSSI.reduce((a, b) => a + (b - this.mean_rssi) ** 2, 0) / valoresRSSI.length;

    this.quarts = stats.percentile(valoresRSSI, 0.25);
  }
}

const quantidadeDeBlocos = 12;
const quantidadeDePlacas = 5;
const vetorComTodasAsLeituras = [];
//const vetorComTodasAsLeiturasEstaticas = [];

//inicialização do contexto dos blocos pela leitura dos dados contidos nas pastas, fingerprint
for (let indexBloco = 1; indexBloco <= quantidadeDeBlocos; indexBloco++) {
  for (let indexPlaca = 1; indexPlaca <= quantidadeDePlacas; indexPlaca++) {

    //Leitura dos arquivos para pegar dados de Leitura em deslocamento no ambiente do aparelho movel
    let diretorio = './Bloco' + indexBloco + '/Bloco' + indexBloco + 'AP' + indexPlaca + '.txt';
    let valores = fs.readFileSync(diretorio, 'utf8').toString().split('\n').map(function(str) {
      return parseInt(str);
    });
    let nomePlaca = 'AP' + indexPlaca;
    const BlocoAP = new DeviceLeitura(nomePlaca,valores);
    //Gravar no vetorComTdoasAsLeituras
    vetorComTodasAsLeituras.push(BlocoAP);

    //Leitura dos arquivos para pegar dados de Leitura estatica no ambiente do aparelho movel
    //let diretorioLeituraEstatica = './Bloco' + indexBloco + '/Bloco' + indexBloco + 'AP' + indexPlaca + 'Estaticas.txt';
    // let valoresDaLeituraEstatica = fs.readFileSync(diretorioLeituraEstatica, 'utf8').toString().split('\n').map(function(str) {
    //   return parseInt(str);
    // });
    // let nomePlacaDaLeituraEstatica = 'AP' + indexPlaca;
    // const BlocoAPEstatico = new DeviceLeitura(nomePlacaDaLeituraEstatica,valoresDaLeituraEstatica);
    // //Gravar no vetorComTdoasAsLeituras
    // vetorComTodasAsLeiturasEstaticas.push(BlocoAPEstatico);

  }
  // abastecer vetor de blocos 
  let bloco = {
    id: 0,
    placas: [],
    placasComMenorSinal: [],
    nomeDoAmbienteOndeEstaOBloco: '',
    cordenadasDoBloco: [],
    polyAmbiente: [],
  }

  bloco.id = indexBloco;
  bloco.placas = vetorComTodasAsLeituras.slice();
  //bloco.placasEstaticas = vetorComTodasAsLeiturasEstaticas.slice();
  
  blocos.push(bloco);

  vetorComTodasAsLeituras.length = 0;
  //vetorComTodasAsLeiturasEstaticas.length = 0;
}

blocos[0].placasComMenorSinal = [1];
blocos[0].nomeDoAmbienteOndeEstaOBloco = 'Quarto1';
blocos[0].cordenadasDoBloco = [-5378050.936841136,-1140239.8477179788];
blocos[0].polyAmbiente = polyQuarto1;

blocos[1].placasComMenorSinal = [1];
blocos[1].nomeDoAmbienteOndeEstaOBloco = 'Quarto1';
blocos[1].cordenadasDoBloco = [-5378052.429888388,-1140237.9019187817];
blocos[1].polyAmbiente = polyQuarto1;

blocos[2].placasComMenorSinal = [1,2];
blocos[2].nomeDoAmbienteOndeEstaOBloco = 'Corredor';
blocos[2].cordenadasDoBloco = [-5378053.994576692,-1140237.287124286];
blocos[2].polyAmbiente = polyCorredor;

blocos[3].placasComMenorSinal = [2];
blocos[3].nomeDoAmbienteOndeEstaOBloco = 'Quarto2';
blocos[3].cordenadasDoBloco = [-5378055.935361086,-1140238.3321617108];
blocos[3].polyAmbiente = polyQuarto2;

blocos[4].placasComMenorSinal = [2];
blocos[4].nomeDoAmbienteOndeEstaOBloco = 'Quarto2';
blocos[4].cordenadasDoBloco = [-5378055.860715886,-1140239.8997182415];
blocos[4].polyAmbiente = polyQuarto2;

blocos[5].placasComMenorSinal = [3];
blocos[5].nomeDoAmbienteOndeEstaOBloco = 'Corredor';
blocos[5].cordenadasDoBloco = [-5378054.0720900195,-1140234.6921608197];
blocos[5].polyAmbiente = polyCorredor;

blocos[6].placasComMenorSinal = [3,4];
blocos[6].nomeDoAmbienteOndeEstaOBloco = 'Sala';
blocos[6].cordenadasDoBloco = [-5378055.56213269,-1140234.5998845808];
blocos[6].polyAmbiente = polySala;

blocos[7].placasComMenorSinal = [3,4];
blocos[7].nomeDoAmbienteOndeEstaOBloco = 'Sala';
blocos[7].cordenadasDoBloco = [-5378060.640759871,-1140235.0704038048];
blocos[7].polyAmbiente = polySala;

blocos[8].placasComMenorSinal = [4];
blocos[8].nomeDoAmbienteOndeEstaOBloco = 'Sala';
blocos[8].cordenadasDoBloco = [-5378060.864696457,-1140236.7872510862];
blocos[8].polyAmbiente = polySala;

blocos[9].placasComMenorSinal = [5];
blocos[9].nomeDoAmbienteOndeEstaOBloco = 'Cozinha';
blocos[9].cordenadasDoBloco = [-5378058.849267181,-1140233.129619921];
blocos[9].polyAmbiente = polyCozinha;

blocos[10].placasComMenorSinal = [5];
blocos[10].nomeDoAmbienteOndeEstaOBloco = 'Cozinha';
blocos[10].cordenadasDoBloco = [-5378060.7900509285,-1140233.0549743862];
blocos[10].polyAmbiente = polyCozinha;

blocos[11].placasComMenorSinal = [5];
blocos[11].nomeDoAmbienteOndeEstaOBloco = 'Cozinha';
blocos[11].cordenadasDoBloco = [-5378059.521076941,-1140231.4127726392];
blocos[11].polyAmbiente = polyCozinha;

// função de regreção linear
function linearRegression(x, y) {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
    sumYY += y[i] * y[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const rSquared =
    Math.pow(n * sumXY - sumX * sumY, 2) /
    ((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return { slope, intercept, rSquared };
}

console.log("o Codigo antigo começava aqui backup3");
console.log("o Codigo antigo terminava aqui backup3");

let liberarAnaliseDePosicionamento = false;
let placasParaSeremZeradas = false;
let contadorDeVezesQuePassouEmAtualizarDados = 0;

const atualizarDados = async(minhasInstancias, rssi, nomeplaca) => {
  
  let placasPreparadas = [];

  contadorDeVezesQuePassouEmAtualizarDados++;
  let devices = minhasInstancias.find(devices => devices.nome === nomeplaca);
  let index = minhasInstancias.indexOf(devices);

  minhasInstancias[index].rssi = rssi;
  minhasInstancias[index].adicionarLeitura(rssi);
  // console.log("_________________________________");
  // console.log(minhasInstancias[index].leituras);
  // console.log(minhasInstancias[index].nome);
  // console.log("_________________________________");

  if(minhasInstancias[index].leituras.length > 6){
    minhasInstancias[index].leituras.splice(0,2);
  }
  if(placasParaSeremZeradas){
    placasParaSeremZeradas = false;
    minhasInstancias.forEach((devices) => {
      devices.leituras.length = 0;
    });
  }
  minhasInstancias.forEach((element) => {
    if(element.leituras.length === 6){
      element.calcularParamentros(element.leituras);
      if (placasPreparadas.length === 0) {
        placasPreparadas.push(element);
      }
      if(!placasPreparadas.some(objeto => objeto.nome === element.nome)){
        placasPreparadas.push(element);
      }
    }
  });
  //console.log(placasPreparadas);
  if(placasPreparadas.length == 5){
    console.log("******* T O D O S O C H E I O S *************");
    minhasInstancias.forEach((element) => {
      console.log("Leituras da Placa " + element.nome + "  :" + element.leituras);
    });
    liberarAnaliseDePosicionamento = true;
  }

  //console.log("Quantidade de vezes que foram passadas aqui:"+contadorDeVezesQuePassouEmAtualizarDados);
  return minhasInstancias;
};


// GET Dados de deslocamento do ponto virtual
router.get('/geoData', cors(), function(req, res, next) {
  const enviandoDados = backToFront;
  res.json(enviandoDados);
});

const localizasoes = [];

router.post('/tcp-data', async (req, res, next) =>{
  
  //res.send('JSON recebido com sucesso!'); 
  const json = req.body;

  let nomeplaca;
  let rssi;
  let device;

  json.clients.map((client) => {
    nomeplaca = client.AP;
    rssi = client.RSSI;

    device = new devices(nomeplaca,rssi);
    device.adicionarLeitura(rssi);

    if (minhasInstancias.length === 0) {
      minhasInstancias.push(device);
    } else {
      if(!minhasInstancias.some(objeto => objeto.nome === nomeplaca)){
        minhasInstancias.push(device);
      }
    }
  });

  if(minhasInstancias.length == 5){ 
    minhasInstancias = await atualizarDados(minhasInstancias,rssi,nomeplaca);

    console.log("Todos se conectaram");
    // nao fazer todo o tempo o posicionamento, só dps que todos tiverem mais de 6 
    if(liberarAnaliseDePosicionamento){
      console.log("******** P A S S O U/ A Q U I/ P A R A/ M E D I R/ O N D E/ E S T A ******************");

      liberarAnaliseDePosicionamento = false;
      placasParaSeremZeradas = true;

      const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

      const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
      const valoresRssI = [];
      const arrayDePlacas = [];

      minhasInstancias.forEach((placas) => {
        placas.leituras.reduce(function(soma, i) {
          return soma + i;
        });
        let auxPlacas = {placa: placas.id,menorValor: placas.leituras[0]};
        valoresRssI.push(placas.leituras.reduce(function(soma, i) {
          return soma + i;
        }));
        arrayDePlacas.push(auxPlacas);
      });

      const ArrayDeDistanciaPorBlocoEntrePlacas = [];
      const validandoBlocos =[];
      const regresao = [];
      const auxregresao = [];

      let blocoFinal;
      let SituasaoSuperAproximasao = false;

      blocos.forEach((bloco) => {
        let menores = argMax(valoresRssI);
        bloco.placasComMenorSinal.forEach((placaMenorSinal) => {
          if(placaMenorSinal === arrayDePlacas[menores].placa){
            bloco.placas.forEach((LeiturasPlaca) => {
              minhasInstancias.forEach(placas => {
                if(LeiturasPlaca.nome === placas.nome){
                  //console.log("_______________________________________________________");
                  //console.log("Leitura para o Bloco:"+ bloco.id);
                  //console.log("Entre as placas:"+ LeiturasPlaca.nome + " e " + LeiturasPlaca.nome);
                  //console.log("Sendo a leitura dos fingerprints"+ LeiturasPlaca.nome);
                  //console.log("E o dado atual na placa"+ placas.nome);
          
                  let distancia = Math.sqrt(
                    (LeiturasPlaca.mean_rssi - placas.mean_rssi) ** 2 +
                      (LeiturasPlaca.std_rssi - placas.std_rssi) ** 2 +
                      (LeiturasPlaca.var_rssi - placas.var_rssi) ** 2
                  );

                  const testeRegressao = linearRegression(placas.leituras,LeiturasPlaca.valoresRSSI);

                  regresao.push(testeRegressao.rSquared);
                  auxregresao.push(testeRegressao.rSquared);

                  ArrayDeDistanciaPorBlocoEntrePlacas.push(distancia);
                }
              });
            });
            //let placaLida = bloco.placas.find((a) => a.id === placaMenorSinal); 
            //let placaParaSerLida = minhasInstancias.find((a) => a.id === placaMenorSinal);

            let soma = ArrayDeDistanciaPorBlocoEntrePlacas.reduce(function(soma, i) {
              return soma + i;
            });
            let somaRegresao = regresao.reduce(function(soma, i) {
              return soma + i;
            });
        
            let scannerBloco = {
              id: 0,
              soma: 0,
              regresao: 0,
            };
            
            scannerBloco.id = bloco.id;
            scannerBloco.soma = soma;
            scannerBloco.regresao = somaRegresao;

            validandoBlocos.push(scannerBloco);
            ArrayDeDistanciaPorBlocoEntrePlacas.length = 0;
            regresao.length = 0;
            
            if(bloco.placasComMenorSinal.length == 1){
              let placaParaSerLida = minhasInstancias.find((a) => a.id === placaMenorSinal);

              if(stats.percentile(placaParaSerLida.leituras, 0.85) > -38){
                SituasaoSuperAproximasao = true;
                let arraySoma = validandoBlocos.map(objeto => objeto.soma);
                let menorvalorSoma = Math.min(...arraySoma);
                let pegandoIdDoBloco = validandoBlocos.find((objeto) => objeto.soma == menorvalorSoma);
                let pegandoBloco = blocos.find((element) => element.id == pegandoIdDoBloco.id);
                blocoFinal = pegandoBloco;
              }
            }
          }
        });
      });

      //console.log(blocoFinal);
      let maiorRegressao = 0;
      let validade = true;
      if(SituasaoSuperAproximasao == false){
        // validandoBlocos.forEach(objeto => {
        //   if (isNaN(objeto.regresao)) {
        //     validade = false;
        //   }else{
        //     if (objeto.regresao > maiorRegressao) {
        //       maiorRegressao = objeto.regresao;
        //       let pegandoBloco = blocos.find((element) => element.id == objeto.id);
        //       blocoFinal = pegandoBloco;
        //     }
        //   }
        // });
        // prevendo resultados NaN
        if(validade == true){
          let arraySoma = validandoBlocos.map(objeto => objeto.soma);
          let menorvalorSoma = Math.min(...arraySoma);
          let pegandoIdDoBloco = validandoBlocos.find((objeto) => objeto.soma == menorvalorSoma);
          let pegandoBloco = blocos.find((element) => element.id == pegandoIdDoBloco.id);
          blocoFinal = pegandoBloco;
        }
      }
      SituasaoSuperAproximasao = false;
      console.log(validandoBlocos);
      console.log(auxregresao);
      console.log("%%%%%%%% D I S P O S I T I V O/ E N C O N T R A D O/ N O/ B L O C O %%%%%%%%%%%%%%%%%%");
      console.log(blocoFinal);

      const backToFront = {
        nomeDoAmbiente: blocoFinal.nomeDoAmbienteOndeEstaOBloco,
        bloco: blocoFinal.id,
        deslocamento: false,
        lineString: [],
        cordenadas: [blocoFinal.cordenadasDoBloco],
        polyAmbiente: [blocoFinal.polyAmbiente],
      }

      //localizasoes.push(backToFront);
      //console.log(localizasoes);

      if(localizasoes.length === 0){
        localizasoes.push(backToFront);
      }

      // Posição atual no mesmo ambiete da anterior
      if(backToFront.nomeDoAmbiente === localizasoes[localizasoes.length - 1].nomeDoAmbiente){

        // se for no mesmo ambiente só q em blocos diferentes
        if(!(localizasoes[localizasoes.length - 1].bloco === backToFront.bloco)){
          //Aqui eu vou achar a posição no array do bloco atual e vou montar o lineString
          // andando pelo array
          let cordenadasAnteriores = backToFront.polyAmbiente.indexOf(localizasoes[localizasoes.length - 1].cordenadas);
          let cordenadasAtuais = backToFront.polyAmbiente.indexOf(backToFront.cordenadas);

          if(cordenadasAnteriores === 0){
            backToFront.lineString = backToFront.polyAmbiente;
            backToFront.deslocamento = true;
            localizasoes.push(backToFront);
          }else{
            backToFront.lineString = backToFront.polyAmbiente.reverse();
            backToFront.deslocamento = true;
            localizasoes.push(backToFront);
          }

          //lidar com o ambiente da sala
          // if(backToFront.polyAmbiente > 3){
          // }
        }else{
          localizasoes.push(backToFront);
        }
        //console.log(backToFront);
      }
      // Posição atual em ambiete diferente da anterior
    }
    res.send('JSON recebido com sucesso!');
  }else{
    console.log(json);
    minhasInstancias.forEach((element) => console.log(element.nome));
    console.log(`Esperando se ao menos 3 se conectaram APs conectarem`);
    res.send('JSON recebido com sucesso!');
  }
});

module.exports = router;
