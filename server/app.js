// Generated by CoffeeScript 1.4.0
(function() {
  var app, c, check_ip_read_auth, check_ip_write_auth, express, extend, heartbeat_clients, http, io, push_to_clients, server, socket_io, utils;

  socket_io = require('socket.io');

  express = require('express');

  extend = require('extend');

  http = require('http');

  utils = require('./requirements/utils');

  c = require('./requirements/constants');

  app = express();

  app.use(express.bodyParser());

  app.use(express.methodOverride());

  server = http.createServer(app);

  io = socket_io.listen(c.SOCKET_PORT || server);

  io.set('log level', 1);

  check_ip_read_auth = function(ip) {
    return utils.is_in_array(ip, c.IP_WHITE_LIST.read);
  };

  check_ip_write_auth = function(req, res, next) {
    if (utils.is_in_array(req.ip, c.IP_WHITE_LIST.write)) {
      return next();
    }
    return utils.e403(req, res);
  };

  push_to_clients = function(req, res, category, datas) {
    var client, clients, _i, _len;
    clients = c.clients[category];
    if (typeof datas.title === 'undefined' || typeof datas.message === 'undefined') {
      res.send(500, "You must specify a title and a message");
      return null;
    }
    if (typeof clients !== 'undefined') {
      for (_i = 0, _len = clients.length; _i < _len; _i++) {
        client = clients[_i];
        client.emit('pushed', datas);
      }
    }
    return res.send(200, "Pushed!");
  };

  if (utils.is_in_array('get', c.allowed_methods)) {
    app.get('/:category/push', check_ip_write_auth, function(req, res) {
      var category, fdatas;
      category = req.params.category;
      fdatas = extend({}, c.default_data, req.query, {
        'category': category
      });
      return push_to_clients(req, res, category, fdatas);
    });
  }

  if (utils.is_in_array('post', c.allowed_methods)) {
    app.post('/:category/push', check_ip_write_auth, function(req, res) {
      var category, fdatas;
      category = req.params.category;
      fdatas = extend({}, c.default_data, req.body, {
        'category': category
      });
      return push_to_clients(req, res, category, fdatas);
    });
  }

  io.sockets.on('connection', function(socket) {
    var client_ip;
    client_ip = socket.handshake.address.address;
    if (check_ip_read_auth(client_ip) === true) {
      c.client_count++;
      socket.on('registering', function(datas) {
        var category, client_array;
        category = "" + datas;
        client_array = c.clients[category];
        if (typeof client_array === 'undefined') {
          return c.clients[category] = new Array(socket);
        } else {
          return client_array.push(socket);
        }
      });
      socket.on('disconnect', function() {
        var idx, key, _i, _len, _ref, _results;
        c.client_count--;
        _ref = c.clients;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          idx = c.clients[key].indexOf(socket);
          if (idx !== -1) {
            _results.push(c.clients[key] = c.clients[key].splice(idx, 1));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return console.log("> Successfull connection from " + client_ip);
    } else {
      return console.log("> Denied connection from " + client_ip);
    }
  });

  app.use('/client/', express["static"]("" + __dirname + "/../client/"));

  app.use(utils.e404);

  server.listen(c.LISTEN_PORT);

  console.log("-------");

  console.log("HTTP server is listening on port " + c.LISTEN_PORT);

  if (c.SOCKET_PORT) {
    console.log("IO server is listening on port " + c.SOCKET_PORT);
  }

  console.log("Some links :");

  console.log("- http://localhost:" + c.LISTEN_PORT + "/client/screen.html");

  console.log("- http://localhost:" + c.LISTEN_PORT + "/home/push?title=Hello&message=World&timeout=2000&popup_class=warning");

  console.log("- http://localhost:" + c.LISTEN_PORT + "/noc/push?title=Hello&message=World&timeout=2000&popup_class=important");

  console.log("-------");

  heartbeat_clients = function(categories) {
    var clients, idx, key, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = categories.length; _i < _len; _i++) {
      key = categories[_i];
      clients = categories[key];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = clients.length; _j < _len1; _j++) {
          idx = clients[_j];
          _results1.push(clients[idx].emit('ping', {}));
        }
        return _results1;
      })());
    }
    return _results;
  };

  setInterval((function() {
    console.log("[" + (new Date()) + "] " + c.client_count + " client(s) listening.");
    return heartbeat_clients(c.clients);
  }), 20000);

}).call(this);
