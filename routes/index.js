var express = require('express');
const router = express.Router();
const fs = require('fs');
const cors = require('cors');

let minhasInstancias = [];
const blocos = [];
const posicaoAtual = [];

const polyQuarto1 = [[-5378050.936841136,-1140239.8477179788],[-5378051.2326916205,-1140238.3321621572],[-5378052.429888388,-1140237.9019187817]];
const polyCorredor = [[-5378053.994576692,-1140237.287124286],[-5378054.0720900195,-1140234.6921608197]];
const polyCorredorQuarto1 = [[-5378052.429888388,-1140237.9019187817],[-5378053.994576692,-1140237.287124286]];

const backToFront = {
  nomeDoAmbiente: '',
  bloco: 0,
  deslocamento: false,
  lineString: [[]],
  cordenadas: [[]],
}

class devices {
  constructor(nome, rssi) {
    this.nome = nome;
    this.rssi = rssi;
    this.leituras = [];
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

    // Calcular o desvio padrão dos valores RSSI
    this.std_rssi = Math.sqrt(listaDeLeitura.reduce((a, b) => a + (b - this.mean_rssi) ** 2, 0) / listaDeLeitura.length);

    // Calcular a variância dos valores RSSI 
    this.var_rssi = listaDeLeitura.reduce((a, b) => a + (b - this.mean_rssi) ** 2, 0) / listaDeLeitura.length;
  }
};

class DeviceLeitura {
  constructor(nome, valoresRSSI){
    this.nome = nome;
    this.valoresRSSI = valoresRSSI;

    // Calcular a média dos valores RSSI 
    this.mean_rssi = valoresRSSI.reduce((a, b) => a + b, 0) / valoresRSSI.length;

    // Calcular o desvio padrão dos valores RSSI 
    this.std_rssi = Math.sqrt(valoresRSSI.reduce((a, b) => a + (b - this.mean_rssi) ** 2, 0) / valoresRSSI.length);

    // Calcular a variância dos valores RSSI 
    this.var_rssi = valoresRSSI.reduce((a, b) => a + (b - this.mean_rssi) ** 2, 0) / valoresRSSI.length;
  }
}

const quantidadeDeBlocos = 12;
const quantidadeDePlacas = 5;
let vetorComTodasAsLeituras = [];

for (let indexBloco = 1; indexBloco <= quantidadeDeBlocos; indexBloco++) {
  for (let indexPlaca = 1; indexPlaca <= quantidadeDePlacas; indexPlaca++) {

    let diretorio = './Bloco' + indexBloco + '/Bloco' + indexBloco + 'AP' + indexPlaca + '.txt';
    let valores = fs.readFileSync(diretorio, 'utf8').toString().split('\n').map(function(str) {
      return parseInt(str);
    });
    let nomePlaca = 'AP' + indexPlaca;
    const BlocoAP = new DeviceLeitura(nomePlaca,valores);

    //Gravar no vetorComTdoasAsLeituras
    vetorComTodasAsLeituras.push(BlocoAP);

  }
  // abastecer vetor de blocos 
  let bloco = {
    id: 0,
    placas: []
  }

  bloco.id = indexBloco;
  bloco.placas = vetorComTodasAsLeituras.slice();
  
  blocos.push(bloco);

  vetorComTodasAsLeituras.length = 0;
}

const quarto1 = {
  nome: 'Quarto1',
  cordenadas: [[]]
};
const quarto2 = {
  nome: 'Quarto2',
  cordenadas: []
};
const corredor = {
  nome: 'Corredor',
  cordenadas: [[]]
};
const sala = {
  nome: 'Sala',
  cordenadas: []
};
const cozinha = {
  nome: 'Sala',
  cordenadas: []
};

let longitude;
let latitude;

const atualizarDados = async (minhasInstancias, rssi, nomeplaca) => {
  let devices = minhasInstancias.find(devices => devices.nome === nomeplaca);
  let index = minhasInstancias.indexOf(devices);
  minhasInstancias[index].rssi = rssi;
  minhasInstancias[index].adicionarLeitura(rssi);
  //if(minhasInstancias[index].leituras.length === 4){
  //  minhasInstancias[index].leituras = 0;
  //}
  return minhasInstancias;
};


/* GET home page. */
router.get('/geoData', cors(), function(req, res, next) {

  //exemploGooglemaps[0] = exemploGooglemaps[0] + i;
  //exemploGooglemaps[1] = exemploGooglemaps[1] + i;

  console.log(cordenadasApUm);

  // Create a GeoJSON object
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        properties: {
          name: 'My Point',
        },
      },
    ],
  };

  res.json(geojson);
});

// Rota para criação de arquivos .txt com os dados das multiplas placas sobre um determinada ponto
router.post('/tcp-data1', (req, res, next) =>{

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

  let nomeDoAqrquivo = 'Bloco12' + nomeplaca + '.txt';

  if(minhasInstancias.length > 2){
    fs.appendFile(nomeDoAqrquivo, `${rssi},\n`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erro ao escrever no arquivo');
      } else {
        res.status(200).send('Valor de RSSI adicionado com sucesso');
      }
    });
  }

});

// esse metodo vai ser para testar o caminho entre obloco 2 para o bloco 3
let conjuntoDeMediasLidas = [];
let conjuntoDeTresLeituras = new Array(3);
let numeroMaximoDeConjuto = 3;
let numeroMaximoDeLeituraDeMediasLidas = 3;

router.post('/tcp-data1', (req, res, next) =>{

  res.send('JSON recebido com sucesso!'); 
  const json = req.body;
  let media = 0;
  let mediaDosConjutosDeMedia = 0;
  let conjuntosDeMediaEmArray = []; 
  const pontos_referencia = [];

  // Popular a lista dos conjutos de RSSI
  if(conjuntoDeTresLeituras.length == 3){
    conjuntoDeTresLeituras.length = 0;
    mediaDosConjutosDeMedia = 0;
  }else{
    json.clients.map((client) => {
      conjuntoDeTresLeituras.push(client.RSSI);
    });
  }
  
  if(conjuntoDeTresLeituras.length == 3){
    conjuntoDeTresLeituras.forEach(element => {
      media = media + element;
    });
    media = media/numeroMaximoDeConjuto;
    conjuntoDeMediasLidas.push(media);
    if(conjuntoDeMediasLidas.length >= 4){

      let ultimoIndice = conjuntoDeMediasLidas.length - 1;

      for (let i = ultimoIndice; i >= ultimoIndice - 2 && i >= 0; i--) {
        //console.log("x");
        conjuntosDeMediaEmArray.push(conjuntoDeMediasLidas[i]);
        mediaDosConjutosDeMedia = mediaDosConjutosDeMedia + conjuntoDeMediasLidas[i];
      }
      console.log(conjuntoDeTresLeituras[2]);
      console.log(media);
      mediaDosConjutosDeMedia = mediaDosConjutosDeMedia/numeroMaximoDeLeituraDeMediasLidas;
      
      conjuntosDeMediaEmArray
      
      // Calcular a média dos valores RSSI do bloco 4
      let mediaRssiAtuais = conjuntosDeMediaEmArray.reduce((a, b) => a + b, 0) / conjuntosDeMediaEmArray.length;

      // Calcular o desvio padrão dos valores RSSI do bloco 4
      let desviopadraoAtuais = Math.sqrt(conjuntosDeMediaEmArray.reduce((a, b) => a + (b - mediaRssiAtuais) ** 2, 0) / conjuntosDeMediaEmArray.length);

      // Calcular a variância dos valores RSSI do bloco 4
      let variciaRssiAtuais = conjuntosDeMediaEmArray.reduce((a, b) => a + (b - mediaRssiAtuais) ** 2, 0) / conjuntosDeMediaEmArray.length;

      pontos_referencia.push({ mediaRssiAtuais, desviopadraoAtuais, variciaRssiAtuais });

       // Comparar as características de cada ponto de referência com as medidas de cada bloco
      let bloco_atual = null;
      let menor_distancia = Infinity;
      blocos.forEach((bloco) => {
        const distancia = Math.sqrt(
          (bloco.mean_rssi - pontos_referencia[0].mediaRssiAtuais) ** 2 +
            (bloco.std_rssi - pontos_referencia[0].desviopadraoAtuais) ** 2 +
            (bloco.var_rssi - pontos_referencia[0].variciaRssiAtuais) ** 2
        );
        if (distancia < menor_distancia) {
          console.log(bloco.id);
          menor_distancia = distancia;
          bloco_atual = bloco;
        }
      });
      console.log(bloco_atual);
      console.log(mediaDosConjutosDeMedia);
      if(bloco_atual.id == 1){
        console.log("Entrou aqui 1");
        longitude = -48.311858215024785;
        latitude = -10.188818540164236;
      }
      if(bloco_atual.id == 2){
        console.log("Entrou aqui 2");
        longitude = -48.31187300061844;
        latitude = -10.188787195123636;
      }
      if(bloco_atual.id == 4){
        console.log("Entrou aqui 4");
        longitude = -48.31188171779696;
        latitude = -10.188787195123636
      }
    }
  }


  //json.clients.map((client) => {
  //  fs.appendFile('placa1.txt', `${client.RSSI}\n`, (err) => {
  //    if (err) {
  //      console.error(err);
  //      res.status(500).send('Erro ao escrever no arquivo');
  //    } else {
  //      res.status(200).send('Valor de RSSI adicionado com sucesso');
  //    }
  //  });
  //});

});

//let blocosAtuais = [];
router.post('/tcp-data1', (req, res, next) =>{

  res.send('JSON recebido com sucesso!');

  const json = req.body;
  let conjuntosDeMediaEmArray = []; 
  const pontos_referencia = [];

  json.clients.map((client) => {
    conjuntoDeMediasLidas.push(client.RSSI);
  });

  if(conjuntoDeMediasLidas.length >= 5){

    let ultimoIndice = conjuntoDeMediasLidas.length - 1;

    for (let i = ultimoIndice; i >= ultimoIndice - 2 && i >= 0; i--) {
      console.log(conjuntoDeMediasLidas[i]);
      conjuntosDeMediaEmArray.push(conjuntoDeMediasLidas[i]);
    }
    
    // Calcular a média dos valores RSSI atual
    let mediaRssiAtuais = conjuntosDeMediaEmArray.reduce((a, b) => a + b, 0) / conjuntosDeMediaEmArray.length;

    // Calcular o desvio padrão dos valores RSSI atual
    let desviopadraoAtuais = Math.sqrt(conjuntosDeMediaEmArray.reduce((a, b) => a + (b - mediaRssiAtuais) ** 2, 0) / conjuntosDeMediaEmArray.length);

    // Calcular a variância dos valores RSSI atual
    let variciaRssiAtuais = conjuntosDeMediaEmArray.reduce((a, b) => a + (b - mediaRssiAtuais) ** 2, 0) / conjuntosDeMediaEmArray.length;

    pontos_referencia.push({ mediaRssiAtuais, desviopadraoAtuais, variciaRssiAtuais });

      // Comparar as características de cada ponto de referência com as medidas de cada bloco
    let bloco_atual = null;
    let menor_distancia = Infinity;

    blocos.forEach((bloco) => {
      console.log(bloco);
      const distancia = Math.sqrt(
        (bloco.mean_rssi - pontos_referencia[0].mediaRssiAtuais) ** 2 +
          (bloco.std_rssi - pontos_referencia[0].desviopadraoAtuais) ** 2 +
          (bloco.var_rssi - pontos_referencia[0].variciaRssiAtuais) ** 2
      );
      if (distancia < menor_distancia) {
        console.log(bloco.id);
        console.log(distancia);
        menor_distancia = distancia;
        bloco_atual = bloco;
      }
    });
    console.log(bloco_atual);
    console.log(mediaRssiAtuais);

    conjuntoDeMediasLidas.length = 0;


    if(mediaRssiAtuais >= -43){
      console.log("Entrou aqui 1");
      longitude = -48.311858215024785;
      latitude = -10.188818540164236;

      quarto1.cordenadas = [-48.311853553377034,-10.188820238354564];
      posicaoAtual.push(quarto1);
    }
    if(mediaRssiAtuais <= -43 && mediaRssiAtuais >= -63){
      console.log("Entrou aqui 2");
      longitude = -48.311866965648704;
      latitude = -10.188803034590341;

      quarto1.cordenadas = [[-48.311866965648704,-10.188803034590341]];
      posicaoAtual.push(quarto1);
    }
    if(mediaRssiAtuais <= -63){
      console.log("Entrou aqui 4");
      longitude = -48.31188171779696;
      latitude = -10.188774655545258;

      corredor.cordenadas = [[-48.31188171779696,-10.188774655545258]];
      posicaoAtual.push(corredor);
    }
  }
});

const localizasoes = [];

router.post('/tcp-data1', async (req, res, next) =>{
  
  res.send('JSON recebido com sucesso!'); 
  const json = req.body;

  let nomeplaca;
  let rssi;
  let device;

  let conjuntosDeMediaEmArray = []; 
  const pontos_referencia = [];

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

  if(minhasInstancias.length > 2){ 
    minhasInstancias = await atualizarDados(minhasInstancias,rssi,nomeplaca);

    let placa = minhasInstancias.find(objeto => objeto.nome === nomeplaca);
    if(placa.leituras.length >= 3){
      let ultimoIndice = placa.leituras.length - 1;

      for (let i = ultimoIndice; i >= ultimoIndice - 2 && i >= 0; i--) {
        conjuntosDeMediaEmArray.push(placa.leituras[i]);
      }

      placa.calcularParamentros(conjuntosDeMediaEmArray);
      
      let bloco_atual = null;
      let menor_distancia = Infinity;

      blocos.forEach((bloco) => {
        bloco.placas.forEach((LeiturasPlaca) => {
          minhasInstancias.forEach(placa => {
            // e comparar com os já existentes 
          });
        });
        // para então dar o valor de posicionamento 
        console.log(bloco);
        const distancia = Math.sqrt(
          (bloco.mean_rssi - pontos_referencia[0].mediaRssiAtuais) ** 2 +
            (bloco.std_rssi - pontos_referencia[0].desviopadraoAtuais) ** 2 +
            (bloco.var_rssi - pontos_referencia[0].variciaRssiAtuais) ** 2
        );
        if (distancia < menor_distancia) {
          console.log(bloco.id);
          console.log(distancia);
          menor_distancia = distancia;
          bloco_atual = bloco;
        }
      });

      console.log(mediaRssiAtuais);

      if(placa.nome === "AP1"){
        if(mediaRssiAtuais >= -53){
          console.log("Entrou aqui 1");

          backToFront.nomeDoAmbiente = quarto1.nome;
          backToFront.bloco = 1;
          backToFront.cordenadas = [polyCorredor[1]];



        }
        if(mediaRssiAtuais <= -53 && mediaRssiAtuais >= -63){
          console.log("Entrou aqui 2");

          // Alterar dados para dados reais
          backToFront.nomeDoAmbiente = quarto1.nome;
          backToFront.bloco = 2;
          backToFront.cordenadas = [polyCorredor[1]];


        }
        if(mediaRssiAtuais <= -63){
          console.log("Entrou aqui 4");

          // Alterar dados para dados reais
          backToFront.nomeDoAmbiente = corredor.nome;
          backToFront.bloco = 3;
          backToFront.cordenadas = [polyCorredor[1]];
          

        }
      }
      if(localizasoes.length === 0){
        localizasoes.push(backToFront);
      }

      if(backToFront.nomeDoAmbiente === localizasoes[localizasoes.length - 1].nomeDoAmbiente){

        console.log(localizasoes[localizasoes.length - 1].cordenadas[0] + ":  LOCALIZAÇAO DA CORDENADA DO PONTO PASSADO");
        console.log(backToFront.cordenadas[0] + ":  POSIÇAO ATUAL ");

        if(!(localizasoes[localizasoes.length - 1].bloco === backToFront.bloco)){
          // Mas se for no Quarto 1 que tem 3 pontos 
          console.log(backToFront.bloco + ":  MUDOU DE ambienteAtual  ");
          if(backToFront.nomeDoAmbiente === "Quarto1"){
            const isEqual = JSON.stringify(backToFront.cordenadas[0]) === JSON.stringify(polyQuarto1[0]);
            if(isEqual){
              // Ele ta no bloco 1 do Quarto 1
              console.log("################ENTORU AQUIIIII");
              let rotaAuxiliar = polyQuarto1.reverse();
              backToFront.lineString = [rotaAuxiliar];
              localizasoes.push(backToFront);
            }else{
              backToFront.lineString = [polyQuarto1];
              localizasoes.push(backToFront);
            }
          }
        }else{
          localizasoes.push(backToFront);
        }
        console.log(backToFront);
      }
      // Do quarto1/2 Pro Corredor
      if(localizasoes[localizasoes.length - 1].nome === "Quarto1" || localizasoes[localizasoes.length - 1].nome === "Quarto2"){
        if(backToFront.nomeDoAmbiente === "Corredor"){
          // aqui ele vai mover o piao até o centro do corredor.polyCorredor[0]
          const isEqual = JSON.stringify(backToFront.cordenadas[0]) === JSON.stringify(polyCorredor[0]);
          const isEqualCorredor = JSON.stringify(localizasoes[localizasoes.length - 1].cordenadas === JSON.stringify(polyQuarto1[0]));
          
          if(isEqual){
            if(isEqualCorredor){
              let aux = polyQuarto1.concat(polyCorredorQuarto1);
              backToFront.lineString = [aux];
            }else{
              backToFront.lineString = [polyCorredorQuarto1];
            }
          }else{
            if(isEqualCorredor){
              let aux = polyQuarto1;
              aux.concat(polyCorredorQuarto1,polyCorredor);
              backToFront.lineString = [aux];
            }else{
              let aux = polyCorredorQuarto1;
              aux.concat(polyCorredor);
              backToFront.lineString = [aux];
            }
          }
        }
      }
      // Do Corredor Pro Quarto1
      if(localizasoes[localizasoes.length - 1].nome === "Corredor" ){
        if(backToFront.nomeDoAmbiente === "Quarto1"){

          const isEqual = JSON.stringify(backToFront.cordenadas[0]) === JSON.stringify(polyQuarto1[0]);
          const isEqualCorredor = JSON.stringify(localizasoes[localizasoes.length - 1].cordenadas === JSON.stringify(polyCorredor[0]));


          if(isEqual){
            if(isEqualCorredor){
              let corredor = polyCorredorQuarto1.reverse();
              corredor.concat(polyQuarto1.reverse());
              backToFront.lineString = [corredor];
            }else{
              let corredor = polyCorredor.reverse();
              const lineAuxiliar = corredor.concat(polyCorredorQuarto1.reverse(),polyQuarto1.reverse());
              backToFront.lineString = [lineAuxiliar];
            }
          }else{
            if(isEqualCorredor){
              backToFront.lineString = [polyCorredorQuarto1.reverse()];
            }else{
              let corredor = polyCorredor.reverse();
              corredor.concat(polyCorredorQuarto1.reverse());
              backToFront.lineString = [corredor];
            }
          }
        }
      }
    }
  }else{
    console.log(json);
    console.log(minhasInstancias.at(0).nome);
    console.log(`Esperando se ao menos 3 se conectaram APs conectarem`);
  }
});








router.post('/tcp-data2', async (req, res, next) =>{
  
  res.send('JSON recebido com sucesso!'); 
  const json = req.body;

  let instanciaExistente;
  let nomeplaca;
  let rssi;

  json.clients.map((client) => {
    instanciaExistente = minhasInstancias.find(devices => devices.nome === client.AP);
    nomeplaca = client.AP;
    rssi = client.RSSI;
  });

  let device;
  let posicao;
  if(typeof instanciaExistente === "undefined" || instanciaExistente === null){
    console.log("Entrou aqui 2");
    json.clients.map((client) => {
      device = new devices(client.AP,client.RSSI);
    });
    if(device.nome === "AP1"){
      posicao = { x: -10.188817957043392, y: -48.31186446021277 };
      device.adicionarPosicao(posicao);
      minhasInstancias.push(device);
    }
    if(device.nome === "AP2"){
      posicao = { x: -10.188780338310917, y: -48.311912069425 };
      device.adicionarPosicao(posicao);
      minhasInstancias.push(device);
    }
    if(device.nome === "AP3"){
      posicao = { x: -10.188728860040156, y: -48.31193486819463 };
      device.adicionarPosicao(posicao);
      minhasInstancias.push(device);
    }
  }else{
    if(minhasInstancias[2]){   
      console.log(json);
      console.log("Entrou aqui");
      minhasInstancias = await atualizarDados(minhasInstancias,rssi,nomeplaca);

      // aqui eu entrego as posições perante as placa que acessou o metodo POST
      
    }else{
      console.log(json);
      console.log(minhasInstancias.at(0).nome);
      //console.log(minhasInstancias.at(1).nome);
      console.log(`Esperando os 3 APs conectarem`);
    }
  }
});

module.exports = router;
