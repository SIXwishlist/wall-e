# Basic includes,
# import all necessary objects
socket_io = require 'socket.io'
express =   require 'express'
extend =    require 'extend'
utils =     require './requirements/utils'
c =         require './requirements/constants'

# Basic modules initializations
app = do express
app.use express.bodyParser()
app.use express.methodOverride()

io = socket_io.listen c.SOCKET_PORT
io.set 'log level', 1

# Ip authorization middlewares
check_ip_read_auth = (ip) ->
  return utils.is_in_array(ip, c.IP_WHITE_LIST.read)   # Grant access (pass authentication) if request ip is in read white-list ip table

check_ip_write_auth = (req, res, next) ->
  if utils.is_in_array req.ip, c.IP_WHITE_LIST.write   # If request ip is in write white-list ip table
    return do next                                     # Grant access (pass authentification)
  utils.e403(req, res)


# Push a paquet to every listening clients
# of the corresponding category.
#
# @param  {String} category category of the information
# @param  {Object} datas    formatted datas to be pushed
push_to_clients = (req, res, category, datas) ->
  clients = c.clients[category]

  # Assert minimum message header
  if typeof(datas.title) == 'undefined' || typeof(datas.message) == 'undefined'
    res.send(500, "You must specify a title and a message")
    return null

  if typeof(clients) != 'undefined'
    for client in clients
      client.emit 'pushed', datas
  res.send 200, "Pushed!"


# add GET method standard handler
if utils.is_in_array 'get', c.allowed_methods
  app.get '/:category/push', check_ip_write_auth, (req, res) ->
    category = req.params.category
    fdatas = extend {}, c.default_data, req.query, {'category': category}
    push_to_clients req, res, category, fdatas

# add POST method standard handler
if utils.is_in_array 'post', c.allowed_methods
  app.post '/:category/push', check_ip_write_auth, (req, res) ->
    category = req.params.category
    fdatas = extend {}, c.default_data, req.body, {'category': category}
    push_to_clients req, res, category, fdatas

# Client socket listening handler
io.sockets.on 'connection', (socket) ->
  client_ip = socket.handshake.address.address   # might be socket.io version dependant
  if check_ip_read_auth(client_ip) is true
    c.client_count++

    # On register, add client
    # to corresponding category listeners
    socket.on 'registering', (datas) ->
      category = "#{datas}"                     # force a string, in case of bad datas
      client_array = c.clients[category]
      if typeof(client_array) == 'undefined'
        c.clients[category] = new Array socket
      else
        client_array.push socket

    # On disconnect,
    # remove client from listeners
    socket.on 'disconnect', ->
      c.client_count--
      for key in c.clients
        idx = c.clients[key].indexOf(socket)
        unless idx is -1
          c.clients[key] = c.clients[key].splice idx, 1

    console.log "> Successfull connection from #{client_ip}"
  else
    console.log "> Denied connection from #{client_ip}"

# If no route found, just return 404
app.get  '*', utils.e404
app.post '*', utils.e404
app.put  '*', utils.e404
app.del  '*', utils.e404

# Starting express web server with correct modules.
app.listen c.LISTEN_PORT

# Logging utility, also force socket heartbeat
# to avoid socket automatic timeout
heartbeat_clients = (categories) ->
  for key in categories
    clients = categories[key]
    for idx in clients
      clients[idx].emit 'ping', {}

setInterval (->
  console.log("[#{new Date()}] #{c.client_count}# client(s) listening.")
  heartbeat_clients c.clients
), 20000