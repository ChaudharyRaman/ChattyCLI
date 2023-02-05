import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {
    console.log('Client connected ' + socket.id);

    socket.on('join-room', ({ playerName, roomId }) => {
        console.log('Client joined chat + ' + roomId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('joined-room', { playerName, message: `${playerName} Joined The Room` });

        socket.on('message', data => {
            // console.log(data);
            // socket.to(roomId).emit('message-received', data);
            socket.broadcast.to(roomId).emit('message-received', data);
        })
    })

    // socket.on('data', data => {
    //     console.log(data);
    //     // socket.broadcast.emit('data', data);
    //     // socket.emit('message', data);
    //     // socket.broadcast.emit('message', data);
    // });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
