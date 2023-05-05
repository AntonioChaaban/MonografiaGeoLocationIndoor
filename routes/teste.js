var express = require('express');
const router = express.Router();
const cors = require('cors');

let minhasInstancias = [];
const SPEED_OF_LIGHT = 299792458; // velocidade da luz em m/s

const plates = [
    { id: 1, lat: -10.188817164894045, lon: -48.311850092258055, rssi: null },
    { id: 2, lat: -10.188805285294608, lon: -48.31190910085108, rssi: null },
    { id: 3, lat: -10.18875248706955, lon: -48.3119493339827, rssi: null },
  ];
class devices {
    constructor(nome, rssi) {
        this.nome = nome;
        this.rssi = rssi;
    }

    adicionarPosicao(posicao){
        this.posicao = posicao;
    }
};

const posicaoApUm = { x: -10.188817164894045, y: -48.311850092258055 };
const posicaoApDois = { x: -10.188805285294608, y: -48.31190910085108 };
const posicaoApTres = { x: -10.18875248706955, y: -48.3119493339827 };

const longLat = {
    longitude: 0,
    latitude: 0
}

const atualizarDados = async (minhasInstancias, rssi, nomeplaca) => {
    let devices = minhasInstancias.find(devices => devices.nome === nomeplaca);
    let index = minhasInstancias.indexOf(devices);
    //console.log(index);
    //console.log(rssi);
    //console.log(minhasInstancias[index]);
    minhasInstancias[index].rssi = rssi;
    //console.log(minhasInstancias[index]);
    return minhasInstancias;
};

// Função para calcular a distância a partir do RSSI e da frequência do sinal
function calculateDistance(rssi) {
    const freq = 2430
    const txPower = -59; // potência do transmissor em dBm
    const ratio = rssi * 1.0 / txPower;
    const exp = (27.55 - (20 * Math.log10(freq)) + Math.abs(rssi)) / 20.0;
    const distance = Math.pow(10.0, exp);
    return distance;
  }

function calculatePosition(distances) {
  
    const A = [];
    const B = [];
  
    for (let i = 0; i < distances.length; i++) {
      const d = distances[i];
      const p = plates[i];
  
      const x = SPEED_OF_LIGHT / p.freq;
      const y = (p.lat ** 2) + (p.lon ** 2);
  
      A.push([-2 * p.lat, -2 * p.lon, -2 * x]);
      B.push([d ** 2 - y - x ** 2 * p.rssi ** 2]);
    }
  
    const AT = math.transpose(A);
    const ATA = math.multiply(AT, A);
    const ATB = math.multiply(AT, B);
  
    const X = math.multiply(math.inv(ATA), ATB);
  
    const lat = X[0];
    const lon = X[1];
  
    return { lat, lon };
  }
  function updatePlates(id, rssi) {
    const plate = plates.find(p => p.id === id);
    if (plate) {
      plate.rssi = rssi;
      plate.freq = 2430;
    }
  }

function triangulate(rssi1, rssi2, rssi3) {
    // converter RSSI em distância
    const d1 = calculateDistance(rssi1); // frequência de 2,4 GHz
    const d2 = calculateDistance(rssi2);
    const d3 = calculateDistance(rssi3);
  
    // calcular ângulo entre placas esp32 e dispositivo móvel
    const a = distance(posicaoApUm.x, posicaoApUm.y, posicaoApDois.x, posicaoApDois.y);
    const b = distance(posicaoApDois.x, posicaoApDois.y, posicaoApTres.x, posicaoApTres.y);
    const c = distance(posicaoApTres.x, posicaoApTres.y, posicaoApUm.x, posicaoApUm.y);
  
    const alpha = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    const beta = Math.acos((c * c + a * a - b * b) / (2 * c * a));
    const gamma = Math.acos((a * a + b * b - c * c) / (2 * a * b));
  
    // calcular posição do dispositivo móvel usando a lei dos cossenos
    const lat = (posicaoApUm.x + posicaoApDois.x + posicaoApTres.x) / 3 + (d1 * Math.cos(gamma) * (posicaoApTres.x - posicaoApDois.x) + d2 * Math.cos(alpha) * (posicaoApUm.x - posicaoApTres.x) + d3 * Math.cos(beta) * (posicaoApDois.x - posicaoApUm.x)) / (d1 * Math.cos(gamma) + d2 * Math.cos(alpha) + d3 * Math.cos(beta));
    const lon = (posicaoApUm.y + posicaoApDois.y + posicaoApTres.y) / 3 + (d1 * Math.sin(gamma) * (posicaoApTres.y - posicaoApDois.y) + d2 * Math.sin(alpha) * (posicaoApUm.y - posicaoApTres.y) + d3 * Math.sin(beta) * (posicaoApDois.y - posicaoApUm.y)) / (d1 * Math.sin(gamma) + d2 * Math.sin(alpha) + d3 * Math.sin(beta));
    
    longLat.latitude = lat;
    longLat.longitude = lon;
    console.log(`Posição calculada: x = ${lon}, y = ${lat}`);
    console.log(`Posição calculada: x = ${longLat.longitude}, y = ${longLat.latitude}`);
    return { lat, lon };
}
  
function distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // raio médio da Terra em km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
}
  
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
  
/* GET home page. */
router.get('/geoData', cors(), function(req, res, next) {

    const geojson = {
        type: 'FeatureCollection',
        features: [
            {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [longLat.longitude, longLat.latitude],
            },
            properties: {
                name: 'My Point',
            },
            },
        ],
    };
    
    res.json(geojson);

});

router.post('/tcp-data', async (req, res, next) =>{
    //const { rssi1, rssi2, rssi3, lat1, lon1, lat2, lon2, lat3, lon3 } = req.body;
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
      minhasInstancias.forEach(element => {
        if(element.nome === nomeplaca){
            
            updatePlates(id,rssi);
        }
      });
      triangulate(minhasInstancias.at(0).rssi, minhasInstancias.at(1).rssi, minhasInstancias.at(2).rssi);
    }else{
      //console.log(json);
      console.log(nomeplaca);
      //console.log(minhasInstancias.at(0).nome);
      //console.log(minhasInstancias.at(1).nome);
      console.log(`Esperando os 3 APs conectarem`);
    }
  }
});

module.exports = router;
