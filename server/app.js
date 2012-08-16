
/**
 * Basic includes,
 * import all necessary objects
 */
var socket_io = require('socket.io');
var express = require('express');
var extend = require('extend');
var utils = require('./requirements/utils.js');
var c = require('./requirements/constants.js');

/**
 * Basic modules initialisations
 */
var app = express();
var io = socket_io.listen(c.SOCKET_PORT);

/**
 * Ip authorization middlewares
 */
function check_ip_read_auth(ip){
    if (utils.is_in_array(ip, c.IP_WHITE_LIST.read)){ // If request ip is in read white-list ip table
        return true; // Grant access (pass authentification)
    } else {
        return false;
    }
}
function check_ip_write_auth(req, res, next){
    if (utils.is_in_array(req.ip, c.IP_WHITE_LIST.write)){ // If request ip is in write white-list ip table
        next(); // Grant access (pass authentification)
    } else {
        utils.e403(req, res);
    }
}

/**
 * Push a paquet to every listening clients
 * of the corresponding category.
 *
 * @param  {String} category category of the information
 * @param  {Object} datas    formatted datas to be pushed
 */
function push_to_clients(req, res, category, datas){

    var clients = c.clients[category];

    if (typeof(clients) != 'undefined'){
        for (var key in clients){
            clients[key].emit('pushed', datas);
        }
    }

    res.send(200, "Pushed!");
}

/**
 * add GET method standard handler
 */
if (utils.is_in_array('get', c.allowed_methods)){

    app.get('/:category/push', check_ip_write_auth, function (req, res){

        var category = req.params.category;

        var fdatas = extend({}, c.default_data, req.query, {'category': category});

        push_to_clients(req, res, category, fdatas);
    });
}

/**
 * add POST method standard handler
 */
if (utils.is_in_array('post', c.allowed_methods)){

    app.post('/:category/push', check_ip_write_auth, function(req, res){

        var category = req.params.category;

        var fdatas = extend({}, c.default_data, req.body, {'category': category});

        push_to_clients(req, res, category, fdatas);
    });
}

/**
 * Client socket listening handler
 */
io.sockets.on('connection', function(socket){

    var client_ip = socket.handshake.address.address; // might be socket.io version dependant

    if (check_ip_read_auth(client_ip) == true){

        c.client_count += 1;

        /**
         * On register, add client
         * to corresponding category listeners
         */
        socket.on('registering', function(datas){

            var category = datas + ""; // force a string, in case of bad datas
            var client_array = c.clients[category];

            if (typeof(client_array) == 'undefined'){
                c.clients[category] = new Array(socket);
            } else {
                client_array.push(socket);
            }
        });

        /**
         * On disconnect,
         * remove client from listeners
         */
        socket.on('disconnect', function(){

            c.client_count -= 1;

            for (var key in c.clients){

                var idx = c.clients[key].indexOf(socket);

                if (idx != -1){
                    c.clients[key] = c.clients[key].splice(idx, 1);
                }
            }
        });

        console.log("> Successfull connection from " + client_ip);

    } else {
        console.log("> Denied connection from " + client_ip);
    }

});

/**
 * If no route found, just return 404
 */
app.get('*', utils.e404);
app.post('*', utils.e404);
app.put('*', utils.e404);
app.del('*', utils.e404);

/**
 * Starting express web server with correct modules.
 */
app.use(express.bodyParser());
app.use(express.methodOverride());

app.listen(c.LISTEN_PORT);

/**
 * Logging utility
 */
setInterval(function(){
    console.log("[" + new Date() + "] " + c.client_count + " client(s) listening.");
}, 10000);