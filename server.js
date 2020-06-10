const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

var admins = [];
var devices = [];
var logs = [];

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  log(`socket connected ${socket.id}`);

  socket.on('device-init', (msg) => {
    socket.id = msg.id;
    socket.type = 'device';
    socket.index = devices.length;
    devices.push(socket);
    log(`device-init - id: ${msg.id} ts: ${msg.ts}`);
    emitAdminEvent('device-init', msg);
  });

  socket.on('admin-init', (msg) => {
    socket.id = msg.id;
    socket.type = 'admin';
    socket.index = admins.length;
    admins.push(socket);
    log(`admin-init - id: ${msg.id} ts: ${msg.ts}`);
  });

  socket.on('log-init', (msg) => {
    socket.id = null;
    socket.type = 'log';
    socket.index = logs.length;
    logs.push(socket);
    console.log(`log-init - ts: ${msg.ts}`);
  });

  socket.on('disconnect', () => {
    log('socket disconnected ' + socket.id);
    if (socket.type === 'device') {
      const data = {id: socket.id};
      emitAdminEvent('device-disconnect', data);
    }
  });

  socket.on('device-start', (msg) => {
    log(`device-start - id: ${msg.id} ts: ${msg.ts}`);
    emitAdminEvent('device-start', msg);
  });

  socket.on('device-stop', (msg) => {
    log(`device-stop - id: ${msg.id} ts: ${msg.ts}`);
    emitAdminEvent('device-stop', msg);
  });

  socket.on('device-data', (data, callback) => {
    console.log('device-data', data);
    if (callback) {
      callback('received from socket.id' + socket.id);
    }

    const message = `device-data - id: ${data.id} `
      + ` ts: ${data.ts}`
      + ` sensor: ${data.sensor} `
      + ` value_t: ${data.value_t}`
      + ` value_h: ${data.value_h}`
      + ` status: ${data.status}`;
    log(message);
    emitAdminEvent('device-data', data);
  });

  socket.on('sensor-status', (data, callback) => {
    console.log('sensor-status', data);
    if (callback) {
      const obj = { error: false };
      callback(obj);
    }

    const message = `sensor-status - id: ${data.id} `
      + ` ts: ${data.ts}`
      + ` sensor: ${data.sensor} `
      + ` status: ${data.status}`;
    log(message);
    emitAdminEvent('sensor-status', data);
  });
});

function log(message) {
  console.log(message);
  logs.forEach(socket => socket.emit('log', message));
}

function emitAdminEvent(event, data) {
  const msg = {...data, event: event};
  admins.forEach(socket => socket.emit('admin-event', msg));
}
