const express = require('express');
const app = express();
const port = 3000;

// Dados de referência de cada bloco
const blocos = [
  {
    id: 1,
    mean_rssi: -60,
    std_rssi: 3,
    var_rssi: 9,
  },
  {
    id: 2,
    mean_rssi: -65,
    std_rssi: 2.5,
    var_rssi: 6.25,
  },
  {
    id: 3,
    mean_rssi: -68,
    std_rssi: 4,
    var_rssi: 16,
  },
  {
    id: 4,
    mean_rssi: -62,
    std_rssi: 3.5,
    var_rssi: 12.25,
  },
];

// Endpoint POST que recebe a localização do dispositivo móvel
app.post('/localizacao', (req, res) => {
  // Receber os dados de localização do dispositivo móvel
  const { lat, long, rssi_values } = req.body;

  // Calcular as características de cada ponto de referência
  const pontos_referencia = [];
  rssi_values.forEach((rssi) => {
    // Calcular a média dos valores RSSI
    const mean_rssi = rssi.reduce((a, b) => a + b, 0) / rssi.length;

    // Calcular o desvio padrão dos valores RSSI
    const std_rssi = Math.sqrt(rssi.reduce((a, b) => a + (b - mean_rssi) ** 2, 0) / rssi.length);

    // Calcular a variância dos valores RSSI
    const var_rssi = rssi.reduce((a, b) => a + (b - mean_rssi) ** 2, 0) / rssi.length;

    pontos_referencia.push({ mean_rssi, std_rssi, var_rssi });
  });

  // Comparar as características de cada ponto de referência com as medidas de cada bloco
  let bloco_atual = null;
  let menor_distancia = Infinity;
  blocos.forEach((bloco) => {
    const distancia = Math.sqrt(
      (bloco.mean_rssi - pontos_referencia[0].mean_rssi) ** 2 +
        (bloco.std_rssi - pontos_referencia[0].std_rssi) ** 2 +
        (bloco.var_rssi - pontos_referencia[0].var_rssi) ** 2
    );
    if (distancia < menor_distancia) {
      menor_distancia = distancia;
      bloco_atual = bloco;
    }
  });

  // Retornar o bloco atual como resposta
  res.json({ lat, long, bloco_atual });
});

// Iniciar o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});