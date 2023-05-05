const SPEED_OF_LIGHT = 299792458; // velocidade da luz em m/s

// Array de objetos com as informações de cada placa
const plates = [
  { id: 1, lat: -23.55052, lon: -46.63331, rssi: null },
  { id: 2, lat: -23.55111, lon: -46.63412, rssi: null },
  { id: 3, lat: -23.55090, lon: -46.63385, rssi: null },
];

// Função para calcular a distância a partir do RSSI e da frequência do sinal
function calculateDistance(rssi, freq) {
  const txPower = -59; // potência do transmissor em dBm
  const ratio = rssi * 1.0 / txPower;
  const exp = (27.55 - (20 * Math.log10(freq)) + Math.abs(rssi)) / 20.0;
  const distance = Math.pow(10.0, exp);
  return distance;
}

// Função para calcular a posição a partir das distâncias calculadas
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

// Função para atualizar os valores RSSI das placas
function updatePlates(id, rssi, freq) {
  const plate = plates.find(p => p.id === id);
  if (plate) {
    plate.rssi = rssi;
    plate.freq = freq;
  }
}

// Exemplo de uso
// Suponha que recebemos os valores RSSI dos IDs 1, 2 e 3 com frequência de 2.4 GHz
updatePlates(1, -60, 2400);
updatePlates(2, -50, 2400);
updatePlates(3, -65, 2400);

// Calculamos as distâncias a partir dos valores RSSI e da frequência
const distances = plates.map(p => calculateDistance(p.rssi, p.freq));

// Calculamos a posição do objeto a partir das distâncias calculadas
const position = calculatePosition(distances);

console.log(`Latitude: ${position.lat}, Longitude: ${position.lon}`);
