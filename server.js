const path = require ('path');
const http = require ('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser } =require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketio (server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatBot';

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
   
        //Mensaje solo al usuario que se conecta
        socket.emit('message', formatMessage(botName, 'Welcome to chat') );
        
        // Mensaje a todos los clientes o usuario, excepto el que se esta conectando al instante
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} se ha conectado al chat`));
   
    })


    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        console.log(msg);

        //mensaje a tdos los usuarios conectados en el socket
        io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
        
    });

});


const PORT = 3000 || Process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));