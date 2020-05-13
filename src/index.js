const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

const { generateMessage, genetareLocationMessage } = require('./utils/messages')
const { addUSer, removeUser, getUsersInRoom, getUser } = require('./utils/users')

app.use(express.static(publicDirPath))

let  count = 0

io.on('connection',socket => { // 'connection' is a built-in event
    console.log('New WebSocket connection')

    // socket.emit('message',generateMessage('Welcome!') )
    // socket.broadcast.emit('message',generateMessage('A new user is joined'))  // send excet this

    socket.on('join', (options, callback)=>{

        const { error, user }  = addUSer({ id: socket.id, ...options })
        // 'socket.id' unique identifier for this particular connection

        if(error) return callback(error)

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome!') )
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))  // send excet this
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

        //io.to(room).emit send a msg to everybody in the specified room
        //socket.broadcast.to(room).emit send a msg to everybody in the specified room exept to client itself
    })

    socket.on('sendMessage', (messsage,callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(messsage)) 
            return callback('Bad language is not allowed!')
        io.to(user.room).emit('message',generateMessage(user.username,messsage))
        callback()
    })

    socket.on('sendLocation', (coords,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', genetareLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', _ => { // 'disconnect' is a built-in event
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message',generateMessage(user.username,`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
    }) 
})

server.listen(port, _=>{
    console.log(`server is running on port ${port}`)
})