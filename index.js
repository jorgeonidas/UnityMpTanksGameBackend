var io = require('socket.io')(process.env.PORT || 52300);
console.log('Server has started');
//Custom classes
var Player = require('./Classes/Player.js');

var players = [];
var sockets = [];

io.on('connection',function(socket){
    console.log('Connecton Made!');
    //creo nuevo player y su id
    var player = new Player();
    var thisPlayerId = player.id;

    //lo almaceno el en diccionario de players mapeando con su id
    players[thisPlayerId] = player;
    //socket del respectivo player
    sockets[thisPlayerId] = socket;

    //emmit le avisa a mi socked desde el server
    //dile al cliente que esta es nuestra id para el server
    socket.emit('register',
    {
        id : thisPlayerId
    });
    //dile a mi mismo que he spawneado
    socket.emit('spawn', player);

    //brodcast le avisa a todos los sockets conectados al server
    //dile a los demas que he spawneado
    socket.broadcast.emit('spawn', player);

    //avisame a mi sobre los otros en el juego
   for(var playerID in players){
       if(playerID != thisPlayerId){
            socket.emit('spawn', players[playerID])
       }
   }

   //rotacion
   socket.on('updateRotation', function name(data) {
       //recibo rotacion del cliente
       player.tankRotation = data.tankRotation;
       player.barrelRotation = data.barrelRotation;
        //actualizo la rotacion de el jugador que envia a los demas clientes
       socket.broadcast.emit('updateRotation', player);
   })

   //data posicional de clientes
   socket.on('updatePosition', function(data) {
       player.position.x = data.position.x;
       player.position.y = data.position.y;
        /* asi va a llegar
       var d = {
           id : player.id,
           position : {
               x : player.position.x,
               y : player.position.y
           }
       }
        */
       //actualizo la posicion del jugador que envio esta data a los demas clientes
       socket.broadcast.emit('updatePosition', player);
   })

    socket.on('disconnect',function() {
        console.log('player disconnected');
        delete players[thisPlayerId];
        delete sockets[thisPlayerId];
        socket.broadcast.emit('disconected',player);
    })
});