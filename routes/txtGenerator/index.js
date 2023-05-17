var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Rota para criação de arquivos .txt com os dados Brutos das multiplas placas sobre um determinada ponto e dispositivo
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
  

module.exports = router;