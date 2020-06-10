jQuery(function($) {
  var socket;

  lib.initialize();

  // Connect socket
  socket = io();

  // Admin login
  var ts = new Date();
  var data = {id: 1, ts: ts.getTime()};
  socket.emit('admin-init', data);

  // Listener
  socket.on('admin-event', function(data) {
    console.log('admin-event', data);
    if (data.event === 'device-init') {
      lib.deviceTurnOn(data.id);
    }
    if (data.event === 'device-disconnect') {
      lib.deviceTurnOff(data.id);
    }
    if (data.event === 'device-start') {
      lib.deviceStart(data.id);
    }
    if (data.event === 'device-stop') {
      lib.deviceStop(data.id);
    }
    if (data.event === 'device-data') {
      lib.deviceData(data.id, data);
    }
  });
});

lib = {
  devices : [
    {
      dom: null,
      socket: null,
      timeout: null,
      count: 0,
      sensor_h: null,
      sensor_t: null,
      status: 'off'
    },
    {
      dom: null,
      socket: null,
      timeout: null,
      count: 0,
      sensor_h: null,
      sensor_t: null,
      status: 'off'
    }

  ],

  initialize: function() {
    this.devices[0].dom = $('.device[data-id=0]');
    this.devices[1].dom = $('.device[data-id=1]');
  },

  deviceTurnOn: function(id) {
    this.devices[id].dom.find('[data-js=on]').removeClass('d-none');
    this.devices[id].dom.find('[data-js=off]').addClass('d-none');
    this.devices[id].dom.find('.device-body').removeClass('d-none');
    this.devices[id].dom.find('.device-header .status')
      .html(`<strong>DEVICE ${id}</strong> connected`);
  },

  deviceTurnOff: function(id) {
    this.devices[id].dom.find('[data-js=on]').addClass('d-none');
    this.devices[id].dom.find('[data-js=off]').removeClass('d-none');
    this.devices[id].dom.find('.device-body').addClass('d-none');
    this.devices[id].dom.find('.device-header .status')
      .html(`<strong>DEVICE ${id}</strong> disconnected`);
  },

  deviceStart: function(id) {
    this.devices[id].dom.find('[data-js=start]').removeClass('d-none');
    this.devices[id].dom.find('[data-js=stop]').addClass('d-none');
  },

  deviceStop: function(id) {
    this.devices[id].dom.find('[data-js=start]').addClass('d-none');
    this.devices[id].dom.find('[data-js=stop]').removeClass('d-none');
  },

  deviceData: function(id, data) {
    text_t = parseFloat(data.value_t).toFixed(1);
    text_h = parseFloat(data.value_h).toFixed(1);
    this.devices[id].dom.find('[data-js=value_t]')
    .text(text_t + 'ºC');
    this.devices[id].dom.find('[data-js=value_h]')
    .text(text_h + '%');

    text_ts = lib.getTimestamp(data.ts);
    this.devices[id].dom.find('[data-js=ts]').text(text_ts);
  },

  deviceXXX: function(id) {
  },

  getTimestamp: function(ts) {
    var date = new Date(ts);

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  },

  getDeviceId: function(element) {
    return $(element).closest('.device').data('id');
  }
};