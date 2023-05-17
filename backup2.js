function calcularCorrelacao(arr2, arr1) {
  const n = arr1.length;
  let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

  for (let i = 0; i < n; i++) {
    const x = arr1[i];
    const y = arr2[i];

    sum1 += x;
    sum2 += y;
    sum1Sq += Math.pow(x, 2);
    sum2Sq += Math.pow(y, 2);
    pSum += x * y;
  }

  const numerator = pSum - (sum1 * sum2 / n);
  
  const denominator = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n));

  if (denominator === 0) {
    return 0;
  }

  const r = numerator / denominator;

  return r;
}
function testeTStudent(arr1, arr2) {
  const n1 = arr1.length;
  const n2 = arr2.length;
  const mean1 = arr1.reduce((acc, val) => acc + val, 0) / n1;
  const mean2 = arr2.reduce((acc, val) => acc + val, 0) / n2;
  const std1 = Math.sqrt(arr1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) / (n1 - 1));
  const std2 = Math.sqrt(arr2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0) / (n2 - 1));
  const pooledStd = Math.sqrt(((n1 - 1) * Math.pow(std1, 2) + (n2 - 1) * Math.pow(std2, 2)) / (n1 + n2 - 2));
  const t = (mean1 - mean2) / (pooledStd * Math.sqrt(1 / n1 + 1 / n2));

  return t;
}

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
  
  //let menores = argMax(placas.leituras);
  placas.leituras.reduce(function(soma, i) {
    return soma + i;
  });
  let auxPlacas = {placa: placas.id,menorValor: placas.leituras[0]};
  //valoresRssI.push(placas.leituras[0]);
  valoresRssI.push(placas.leituras.reduce(function(soma, i) {
    return soma + i;
  }));
  arrayDePlacas.push(auxPlacas);
});

console.log(valoresRssI);

//Corrigir esse codigo pq está errado na variavel menores
aux.forEach((element) => {
  let blocoEncontrado = blocos.find((a) => a.id === element.id);
  //console.log(blocoEncontrado.placas);

  let menores = argMax(valoresRssI);
  //console.log(valoresRssI[menores]);
  //console.log("Bloco" + element.id);

  //console.log("coeficiente de relaçao" + calcularCorrelacao(placaLida.valoresRSSI,placaParaSerLida.leituras));
  //console.log("TesteHipotese" + testeTStudent(placaLida.valoresRSSI,placaParaSerLida.leituras));
  blocoEncontrado.placasComMenorSinal.forEach((blcoMenorSinal) => {
    let placaLida = blocoEncontrado.placas.find((a) => a.id === blcoMenorSinal);
    let placaParaSerLida = minhasInstancias.find((a) => a.id === blcoMenorSinal);
    if(blcoMenorSinal === arrayDePlacas[menores].placa){
       //console.log(blocoEncontrado);
      console.log(arrayDePlacas[menores].placa);
      console.log("Bloco" + element.id);
      console.log("coeficiente de relaçao" + calcularCorrelacao(placaLida.valoresRSSI,placaParaSerLida.leituras));
      console.log("TesteHipotese" + testeTStudent(placaLida.valoresRSSI,placaParaSerLida.leituras));
      console.log("_____________________");
      //console.log("Bloco7");
      //console.log("coeficiente de relaçao DO BLOCO 7:" + calcularCorrelacao( blocos[6].placas[2].valoresRSSI,placaParaSerLida.leituras));
      //console.log("TesteHipotese DO BLOCO 7:" + testeTStudent( blocos[6].placas[2].valoresRSSI,placaParaSerLida.leituras));
    }
  });
});

function pearsonCorrelation(arrayMaior, arrayMenor) {
  const mediaMaior = arrayMaior.reduce((acc, curr) => acc + curr) / arrayMaior.length;
  const mediaMenor = arrayMenor.reduce((acc, curr) => acc + curr) / arrayMenor.length;

  const desvioPadraoMaior = Math.sqrt(arrayMaior.reduce((acc, curr) => acc + Math.pow(curr - mediaMaior, 2), 0) / arrayMaior.length);
  const desvioPadraoMenor = Math.sqrt(arrayMenor.reduce((acc, curr) => acc + Math.pow(curr - mediaMenor, 2), 0) / arrayMenor.length);

  let numerador = 0;
  for (let i = 0; i < arrayMenor.length; i++) {
    numerador += (arrayMaior[i] - mediaMaior) * (arrayMenor[i] - mediaMenor);
  }

  let denominador = desvioPadraoMaior * desvioPadraoMenor;

  if (denominador === 0) {
    return 0;
  } else {
    return numerador / denominador;
  }
}
function calcularEntropia(arr) {
  const freq = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  const valores = Object.values(freq);
  const total = arr.length;
  const proporcoes = valores.map((val) => val / total);
  const logProp = proporcoes.map((prop) => Math.log2(prop));
  const entropia = -logProp.reduce((acc, val) => acc + val, 0);

  return entropia;
}
function mannWhitneyTest(arr1, arr2) {
  let n1 = arr1.length;
  let n2 = arr2.length;
  let ranked = [...arr1, ...arr2].sort((a, b) => a - b).map((v, i, arr) => arr.indexOf(v) + 1 + arr.filter(w => w === v && w !== v).length / 2);
  let rankSum1 = arr1.reduce((a, b) => a + ranked[arr1.indexOf(b)], 0);
  let U1 = rankSum1 - n1 * (n1 + 1) / 2;
  let U2 = n1 * n2 - U1;
  let meanRank1 = rankSum1 / n1;
  let meanRank2 = (n1 * n2 + n1 * (n1 + 1) / 2 - rankSum1) / n2;
  let stdDev = Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
  let z = Math.abs((U1 - n1 * n2 / 2) / stdDev);
  let p = 1 - phi(z);
  return p;
}

function phi(z) {
  return 1 / (Math.sqrt(2 * Math.PI)) * Math.exp(-z * z / 2);
}

function calcularEstatisticas(array) {
  const n = array.length;

  // Calcular média
  const media = array.reduce((acc, cur) => acc + cur, 0) / n;

  // Calcular variância
  const variancia = array.reduce((acc, cur) => acc + Math.pow(cur - media, 2), 0) / (n - 1);

  // Calcular desvio padrão
  const desvioPadrao = Math.sqrt(variancia);

  return { media, variancia, desvioPadrao };
}

//console.log("tudo da placa 3 DO BLOCO 7:" + blocos[6].placas[2].moda);
//console.log("tudo da placa 3 DO BLOCO 7:" + blocos[6].placas[2].quarts);
//console.log(blocos[6].placas[2].histograma);
//console.log("Bloco da variavel global id: " + blocos[4].placas[1].valoresRSSI);
//calcularCorrelacao(placaLida.valoresRSSI,placaParaSerLida.leituras)
//console.log(arrayCincoMenores);
//console.log(somaDosBlocos);
//console.log(objetoDaSomaDosBlocos);
//console.log(aux);
//console.log(arrayDePlacas);
