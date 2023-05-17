// const leituraPlaca1 = [-41,-42,-41,-41,-42,-42];
// const leituraPlaca2 = [-57,-57,-58,-57,-57,-57];
// const leituraPlaca3 = [-73,-71,-72,-74,-74,-74];
// const leituraPlaca4 = [-72,-74,-77,-74,-73,-73];
// const leituraPlaca5 = [-83,-83,-83,-79,-80,-81];

// const placa1 = new devices("AP1",-78);
// const placa2 = new devices("AP2",-69);
// const placa3 = new devices("AP3",-56);
// const placa4 = new devices("AP4",-40);
// const placa5 = new devices("AP5",-71);

// placa1.leituras = leituraPlaca1;
// placa2.leituras = leituraPlaca2;
// placa3.leituras = leituraPlaca3;
// placa4.leituras = leituraPlaca4;
// placa5.leituras = leituraPlaca5;

// placa1.calcularParamentros(leituraPlaca1);
// placa2.calcularParamentros(leituraPlaca2);
// placa3.calcularParamentros(leituraPlaca3);
// placa4.calcularParamentros(leituraPlaca4);
// placa5.calcularParamentros(leituraPlaca5);

// minhasInstancias.push(placa1);
// minhasInstancias.push(placa2);
// minhasInstancias.push(placa3);
// minhasInstancias.push(placa4);
// minhasInstancias.push(placa5);

// const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

// const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
// const valoresRssI = [];
// const arrayDePlacas = [];

// minhasInstancias.forEach((placas) => {
//   placas.leituras.reduce(function(soma, i) {
//     return soma + i;
//   });
//   let auxPlacas = {placa: placas.id,menorValor: placas.leituras[0]};
//   valoresRssI.push(placas.leituras.reduce(function(soma, i) {
//     return soma + i;
//   }));
//   arrayDePlacas.push(auxPlacas);
// });

// const ArrayDeDistanciaPorBlocoEntrePlacas = [];
// const validandoBlocos =[];
// const regresao = [];
// const auxregresao = [];

// let blocoFinal;
// let SituasaoSuperAproximasao = false;

// blocos.forEach((bloco) => {
//   let menores = argMax(valoresRssI);
//   bloco.placasComMenorSinal.forEach((placaMenorSinal) => {
//     if(placaMenorSinal === arrayDePlacas[menores].placa){
//       bloco.placas.forEach((LeiturasPlaca) => {
//         minhasInstancias.forEach(placas => {
//           if(LeiturasPlaca.nome === placas.nome){
//             //console.log("_______________________________________________________");
//             //console.log("Leitura para o Bloco:"+ bloco.id);
//             //console.log("Entre as placas:"+ LeiturasPlaca.nome + " e " + LeiturasPlaca.nome);
//             //console.log("Sendo a leitura dos fingerprints"+ LeiturasPlaca.nome);
//             //console.log("E o dado atual na placa"+ placas.nome);
    
//             let distancia = Math.sqrt(
//               (LeiturasPlaca.mean_rssi - placas.mean_rssi) ** 2 +
//                 (LeiturasPlaca.std_rssi - placas.std_rssi) ** 2 +
//                 (LeiturasPlaca.var_rssi - placas.var_rssi) ** 2
//             );

//             const testeRegressao = linearRegression(placas.leituras,LeiturasPlaca.valoresRSSI);

//             regresao.push(testeRegressao.rSquared);
//             auxregresao.push(testeRegressao.rSquared);

//             ArrayDeDistanciaPorBlocoEntrePlacas.push(distancia);
//           }
//         });
//       });
//       //let placaLida = bloco.placas.find((a) => a.id === placaMenorSinal); 
//       //let placaParaSerLida = minhasInstancias.find((a) => a.id === placaMenorSinal);

//       let soma = ArrayDeDistanciaPorBlocoEntrePlacas.reduce(function(soma, i) {
//         return soma + i;
//       });
//       let somaRegresao = regresao.reduce(function(soma, i) {
//         return soma + i;
//       });
  
//       let scannerBloco = {
//         id: 0,
//         soma: 0,
//         regresao: 0,
//       };
      
//       scannerBloco.id = bloco.id;
//       scannerBloco.soma = soma;
//       scannerBloco.regresao = somaRegresao;

//       validandoBlocos.push(scannerBloco);
//       ArrayDeDistanciaPorBlocoEntrePlacas.length = 0;
//       regresao.length = 0;
      
//       if(bloco.placasComMenorSinal.length == 1){
//         let placaParaSerLida = minhasInstancias.find((a) => a.id === placaMenorSinal);

//         if(stats.percentile(placaParaSerLida.leituras, 0.85) > -38){
//           SituasaoSuperAproximasao = true;
//           let arraySoma = validandoBlocos.map(objeto => objeto.soma);
//           let menorvalorSoma = Math.min(...arraySoma);
//           let pegandoIdDoBloco = validandoBlocos.find((objeto) => objeto.soma == menorvalorSoma);
//           let pegandoBloco = blocos.find((element) => element.id == pegandoIdDoBloco.id);
//           blocoFinal = pegandoBloco;
//           return;
//         }
//       }
//     }
//   });
// });

// //console.log(blocoFinal);
// let maiorRegressao = 0;
// let validade = true;
// if(SituasaoSuperAproximasao == false){
//   validandoBlocos.forEach(objeto => {
//     if (isNaN(objeto.regresao)) {
//       validade = false;
//     }else{
//       if (objeto.regresao > maiorRegressao) {
//         maiorRegressao = objeto.regresao;
//         let pegandoBloco = blocos.find((element) => element.id == objeto.id);
//         blocoFinal = pegandoBloco;
//       }
//     }
//   });
//   // prevendo resultados NaN
//   if(validade == false){
//     let arraySoma = validandoBlocos.map(objeto => objeto.soma);
//     let menorvalorSoma = Math.min(...arraySoma);
//     let pegandoIdDoBloco = validandoBlocos.find((objeto) => objeto.soma == menorvalorSoma);
//     let pegandoBloco = blocos.find((element) => element.id == pegandoIdDoBloco);
//     blocoFinal = pegandoBloco;
//   }
// }
// console.log(validandoBlocos);
// console.log(auxregresao);
// console.log("O dispositivo está no Bloco:");
// console.log(blocoFinal);

// console.log("o Codigo antigo terminava aqui ");