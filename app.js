const express = require('express');
const app = express()
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app)
const io = socketIO(server)

const port = process.env.port || 3000

app.set('view engine', 'ejs')
app.use('/public', express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

server.listen(port)
