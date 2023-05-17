let placaComMenorValorRSSIScanneado = 0;
let somaDosBlocos = [];
let objetoDaSomaDosBlocos = [];
let menor_distancia = Infinity;
let contador = 0;
let porBloco = [];
let correlasao = [];

blocos.forEach((bloco) => {
  //console.log("Bloco:" + bloco.id);
  bloco.placas.forEach((LeiturasPlaca) => {
    minhasInstancias.forEach(placas => {
      // e comparar com os já existentes 
      if(LeiturasPlaca.nome === placas.nome){
        //console.log("Leitura para o Bloco:"+ bloco.id);
        //console.log("Entre as placas:"+ LeiturasPlaca.nome + " e " + LeiturasPlaca.nome);
        //console.log("Sendo a leitura dos fingerprints"+ LeiturasPlaca.nome);
        //console.log("E o dado atual na placa"+ placas.nome);
        //console.log("_______________________________________________________");

        let distancia = Math.sqrt(
          (LeiturasPlaca.mean_rssi - placas.mean_rssi) ** 2 +
            (LeiturasPlaca.std_rssi - placas.std_rssi) ** 2 +
            (LeiturasPlaca.var_rssi - placas.var_rssi) ** 2
        );
        
        correlasao.push(calcularCorrelacao(LeiturasPlaca.valoresRSSI,placas.leituras));
        porBloco.push(distancia);
      }
    });
  });
  const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]
  const argMin = argFact((max, el) => (el[0] < max[0] ? el : max));
  //console.log(argMin(porBloco));
  //console.log('____________________________');

  let soma = porBloco.reduce(function(soma, i) {
    return soma + i;
  });

  let somaCorrelasao = correlasao.reduce(function(soma, i) {
    return soma + i;
  });

  let scannerBloco = {
    id: 0,
    soma: 0,
    correlasao: 0,
    menor_sinal: 0
  };

  scannerBloco.id = bloco.id;
  scannerBloco.soma = soma;
  scannerBloco.correlasao = somaCorrelasao;
  scannerBloco.menor_sinal = bloco.placasComMenorSinal;

  objetoDaSomaDosBlocos.push(scannerBloco);
  somaDosBlocos.push(soma);

  porBloco.forEach((distancia) => {
    if (distancia < menor_distancia) {
      contador++;
    }
  });
  if(contador === 5){
    //console.log("Esta entrando aqui1");
    //console.log(bloco.id);
    porBloco.forEach((distancia) => {
      //console.log(distancia);
    });
    contador = 0;
  }else{
    contador = 0;
  }
  porBloco.length = 0;
  correlasao.length = 0;
});


console.log(objetoDaSomaDosBlocos);

//console.log(somaDosBlocos);
//console.log('____________________________');
const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]
const argMin = argFact((max, el) => (el[0] < max[0] ? el : max));

let tresmenores = 0;
let arrayCincoMenores = [];

//console.log(somaDosBlocos);

somaDosBlocos.forEach(() => {
  if(tresmenores < 5){
    tresmenores++;
    let menores = argMin(somaDosBlocos);
    arrayCincoMenores.push(somaDosBlocos[menores]);
    somaDosBlocos.splice(menores,1);
  }
});

let aux = [];
objetoDaSomaDosBlocos.forEach((element) => {
  arrayCincoMenores.forEach((medisoes) => {
    if(element.soma === medisoes){
      aux.push(element);
    }
  });
});

//console.log('____________skdbcshbcsjhcdbjsbh_______________');

// Agora tem a parte de reconhecer em qual placa está vindo o maior sinal para jogar como fato de decisao de qual
// Bloco o dispositivo movel está
const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
let placaAux;
let valoresRssI = [];
let arrayDePlacas = [];

minhasInstancias.forEach((placas) => {
  let menores = argMax(placas.leituras);
  let auxPlacas = {placa: placas.id,menorValor: placas.leituras[menores]};
  valoresRssI.push(placas.leituras[menores]);
  arrayDePlacas.push(auxPlacas);
});

console.log(aux);

//Corrigir esse codigo pq está errado na variavel menores
aux.forEach((element) => {
  let blocoEncontrado = blocos.find((a) => a.id === element.id);
  //console.log(blocoEncontrado.placas);

  let menores = argMax(valoresRssI);
  //console.log(valoresRssI[menores]);

  let placaLida = blocoEncontrado.placas.find((a) => a.id === blocoEncontrado.placasComMenorSinal);
  let placaParaSerLida = minhasInstancias.find((a) => a.id === blocoEncontrado.placasComMenorSinal);
  //console.log("Bloco" + element.id);

  //console.log("coeficiente de relaçao" + calcularCorrelacao(placaLida.valoresRSSI,placaParaSerLida.leituras));
  //console.log("TesteHipotese" + testeTStudent(placaLida.valoresRSSI,placaParaSerLida.leituras));
  
  if(blocoEncontrado.placasComMenorSinal === arrayDePlacas[menores].placa){
    //console.log(blocoEncontrado);
    console.log(arrayDePlacas[menores].placa);
    console.log("Bloco" + element.id);
    //console.log("coeficiente de relaçao" + calcularCorrelacao(placaLida.valoresRSSI,placaParaSerLida.leituras));
  }
});

//calcularCorrelacao(placaLida.valoresRSSI,placaParaSerLida.leituras)
//console.log(arrayCincoMenores);
//console.log(somaDosBlocos);
//console.log(objetoDaSomaDosBlocos);
//console.log(aux);
//console.log(arrayDePlacas);
