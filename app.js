var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const net = require('net');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testeRouter = require('./routes/teste');
const trilateration = require('trilateration');

var app = express();

// Create the TCP server
const tcpServer = net.createServer((socket) => {
  console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

  let minhasInstancias = [];

  class devices {
    constructor(nome, rssi) {
      this.nome = nome;
      this.rssi = rssi;
    }

    adicionarPosicao({}){
      this.posicao = {}
    }
  };

  const posicaoApUm = { x: -10.188817957043392, y: -48.31186446021277 };
  const posicaoApDois = { x: -10.188780338310917, y: -48.311912069425 };
  const posicaoApTres = { x: -10.188728860040156, y: -48.31193486819463 };

  const posicoes = [
    posicaoApUm,
    posicaoApDois,
    posicaoApTres
  ];

  function calculateDistance(rssi) {
    // Cálculo da distância com base no valor RSSI
    const txPower = -30; // Potência de transmissão do dispositivo
    const n = 2.0; // Expoente do modelo de perda de sinal
    const distance = Math.pow(10, ((txPower - rssi) / (10 * n)));
    return distance;
  }

  socket.on('data', (data) => {
    console.log(`Data received: ${data}`);
    const json = JSON.parse(data.toString());

    let instanciaExistente;
    json.clients.map((client) => {
      instanciaExistente = minhasInstancias.find(devices => devices.nome === client.AP);
    });

    let device;
    if(!instanciaExistente){
      json.clients.map((client) => {
        device = new devices(client.AP,client.RSSI);
      });
      if(device.nome == "AP1"){
        device.adicionarPosicao(posicaoApUm);
        minhasInstancias.push(device);
      }else if(device.nome == "AP2"){
        device.adicionarPosicao(posicaoApDois);
        minhasInstancias.push(device);
      }else{
        device.adicionarPosicao(posicaoApTres);
        minhasInstancias.push(device);
      }
    }else{
      if(minhasInstancias[2]){   
        const distances = [
          calculateDistance(device.rssi),
          calculateDistance(device.rssi),
          calculateDistance(device.rssi),
        ];
        let position = trilateration(posicoes, distances);

        console.log(`Posição calculada: x = ${position[0]}, y = ${position[1]}`);
      }else{
        console.log(minhasInstancias.length);
        console.log(`Esperando os 3 APs conectarem`);
      }
    }

  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error(`Error: ${err}`);
  });
});

// Start the TCP server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/teste', testeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(bodyParser.text({ type: 'text/plain' }));

app.use((req, res, next) => {
  req.tcpData = req.body;
  next();
});

module.exports = app;
