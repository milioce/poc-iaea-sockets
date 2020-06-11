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
      lib.deviceTurnOn(data);
    }
    if (data.event === 'device-disconnect') {
      lib.deviceTurnOff(data);
    }
    if (data.event === 'device-start') {
      lib.deviceStart(data);
    }
    if (data.event === 'device-stop') {
      lib.deviceStop(data);
    }
    if (data.event === 'device-data') {
      lib.deviceData(data);
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

  deviceTurnOn: function(data) {
    this.devices[data.index].dom.find('[data-js=on]').removeClass('d-none');
    this.devices[data.index].dom.find('[data-js=off]').addClass('d-none');
    this.devices[data.index].dom.find('.device-body').removeClass('d-none');
    this.devices[data.index].dom.find('.device-header .status')
      .html(`<strong>DEVICE ${data.index}</strong> connected`);
  },

  deviceTurnOff: function(data) {
    this.devices[data.index].dom.find('[data-js=on]').addClass('d-none');
    this.devices[data.index].dom.find('[data-js=off]').removeClass('d-none');
    this.devices[data.index].dom.find('.device-body').addClass('d-none');
    this.devices[data.index].dom.find('.device-header .status')
      .html(`<strong>DEVICE ${data.index}</strong> disconnected`);
  },

  deviceStart: function(data) {
    this.devices[data.index].dom.find('[data-js=start]').removeClass('d-none');
    this.devices[data.index].dom.find('[data-js=stop]').addClass('d-none');
  },

  deviceStop: function(data) {
    this.devices[data.index].dom.find('[data-js=start]').addClass('d-none');
    this.devices[data.index].dom.find('[data-js=stop]').removeClass('d-none');
  },

  deviceData: function(data) {
    text_t = parseFloat(data.value_t).toFixed(1);
    text_h = parseFloat(data.value_h).toFixed(1);
    this.devices[data.index].dom.find('[data-js=value_t]')
    .text(text_t + 'ºC');
    this.devices[data.index].dom.find('[data-js=value_h]')
    .text(text_h + '%');

    text_ts = lib.getTimestamp(data.ts);
    this.devices[data.index].dom.find('[data-js=ts]').text(text_ts);
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