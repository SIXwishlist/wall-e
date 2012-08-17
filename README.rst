======
Wall-E
======

Wall clients fetching notifications from a NodeJS server.
Used for monitoring purposes at Online.net


Requirements
============

+ node.js 0.8.4+

node.js modules
---------------

* express 3.0+
* socket.io 0.9.10+
* extend

client
------

* JQuery 1.8.0+

Installation
============

Server
------

On the server, copy '**server/**' folder and use as following::

    node app.js

*(don't forget the requirements)*

Client
------

(see *'client/client_example.html'*)

use in html head :

    * client.wall-e.css
    * client.wall-e.js

call **listen_to_walls()** function within javascript *(see Configuration)*

Configuration
=============

Server
------

You can edit *'requirements/constants.js'* following values:

    * **LISTEN_PORT**, port used for data pushing with http methods
    * **SOCKET_PORT**, port used for sockets (by clients)
    * **allowed_methods**, allowed http data pushing methods. by default: 'get' and 'post'
    * **IP_WHITE_LIST**, IPs address allowed to retreive or push informations on the server

*Server need to be restarted if a change is applied.*

Client
------

use *listen_to_walls()* function prototype::

    /**
     * Register this client to remote wall server
     *
     * @param  {String} address     server address
     * @param  {Array}  categories  array of listened wall categories
     */
    function listen_to_walls(address, categories)

*example (assuming LISTEN_PORT=42420)*::

    listen_to_walls("http://my_server.org:42420/", ['home', 'foo', 'bar'])
    // will connect to my_server.org on port 42420,
    // listening to 'home', 'foo' and 'bar' related informations

Usage
=====

Pushing data to clients
-----------------------

Simply access '/[mycategory]/push' on your server
with following arguments: (from an allowed ip address, *see Configuration*)

    - title : Your message title
    - message : Your message body
    - (optional) timeout : Popup display time (will fade out after this period) in ms
    - (optional) popup_class : css class appended to the popup container (use this for customization)


*GET method examples (assuming SOCKET_PORT=9999)*::

    http://my_server.org:9999/home/push?title=Hello&message=World&timeout=10000
    // will broadcast 'Hello'(title) and 'world'(message) to all clients listening to 'home'
    // popup will fade out after 10 seconds

    http://my_server.org:9999/foobar/push?title=Hello&message=World&timeout=10000000&popup_class=important
    // will broadcast the same message to all clients listening to 'foobar',
    // with a differently skinned popup that will last 10000 seconds.

*(see 'client/post_example.html' for 'POST' method example)*

Change skin/theme
-----------------

Simply edit the file *'client.wall-e.css'*.

Remember that any class can be passed to the popup via 'popup_class' on pushing.

*(see client.wall-e.css for examples and details)*