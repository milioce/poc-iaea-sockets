const express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

var admins = [];
var devices = [];
var logs = [];
const success = { error: false };

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  log(`socket connected ${socket.id}`);

  socket.on('device-init', (msg, callback) => {
    console.log('device-init', msg);
    const index = getDeviceIndex(msg.id);
    if (index === -1) {
      devices.push(msg.id);
      socket.index = devices.length - 1;
    } else {
      socket.index = index;
    }
    socket.extid = msg.id;
    socket.type = 'device';
    log(`device-init - id: ${msg.id} ts: ${msg.ts} socket: ${socket.id} index: ${index}`);
    emitAdminEvent('device-init', msg, socket.index);

    if (callback) {
      callback(success);
    }
  });

  socket.on('admin-init', (msg, callback) => {
    const index = admins.length;
    socket.extid = msg.id;
    socket.type = 'admin';
    socket.index = index;
    admins.push(socket);
    log(`admin-init - id: ${msg.extid} ts: ${msg.ts}`);

    if (callback) {
      callback(success);
    }
  });

  socket.on('log-init', (msg, callback) => {
    socket.extid = null;
    socket.type = 'log';
    socket.index = logs.length;
    logs.push(socket);
    console.log(`log-init - ts: ${msg.ts}`);

    if (callback) {
      callback(success);
    }
  });

  socket.on('disconnect', () => {
    if (socket.type === 'device') {
      log(`device disconnected: id: ${socket.extid} socket: ${socket.id}`);
      const data = {id: socket.extid};
      emitAdminEvent('device-disconnect', data, socket.index);
    } else {
      log(`socket disconnected ${socket.type} socket: ${socket.id}`);
    }
  });

  socket.on('device-start', (msg, callback) => {
    log(`device-start - id: ${socket.extid} ts: ${msg.ts}`);
    emitAdminEvent('device-start', msg, socket.index);

    if (callback) {
      callback(success);
    }
});

  socket.on('device-stop', (msg, callback) => {
    log(`device-stop - id: ${socket.extid} ts: ${msg.ts}`);
    emitAdminEvent('device-stop', msg, socket.index);

    if (callback) {
      callback(success);
    }
  });

  socket.on('device-data', (data, callback) => {
    console.log('device-data', data);
    const message = `device-data - id: ${data.id} `
      + ` ts: ${data.ts}`
      + ` sensor: ${data.sensor} `
      + ` value_t: ${data.value_t}`
      + ` value_h: ${data.value_h}`
      + ` status: ${data.status}`;
    log(message);
    emitAdminEvent('device-data', data, socket.index);

    if (callback) {
      callback(success);
    }
  });

  socket.on('sensor-status', (data, callback) => {
    const message = `sensor-status - id: ${data.id} `
      + ` ts: ${data.ts}`
      + ` sensor: ${data.sensor} `
      + ` status: ${data.status}`;
    log(message);
    emitAdminEvent('sensor-status', data, socket.index);

    if (callback) {
      callback(success);
    }
  });
});

function getDeviceIndex(mac) {
  for (let index = 0; index < devices.length; index++) {
    if (devices[index] === mac) {
      console.log('get device index for mac ' + mac + ' is index', devices);
      console.log(`Index for ${mac} is ${index}`);
      return index;
    }
  }

  console.log('get device index for mac ' + mac + ' not found', devices);

  return -1;
}

function log(message) {
  console.log(message);
  logs.forEach(socket => socket.emit('log', message));
}

function emitAdminEvent(event, data, index) {
  const msg = {...data, event: event, index: index};
  admins.forEach(socket => socket.emit('admin-event', msg));
}
