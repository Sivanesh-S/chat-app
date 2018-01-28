const express = require('express');
const app = express()
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app)
const io = socketIO(server)
const passport = require('passport')
const passportSetup = require('./config/passport-setup')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session');
const auth = require('./auth/google-auth')
const keys = require('./keys/keys')
const events = require('events');

const port = process.env.port || 3000

app.set('view engine', 'ejs')
app.use('/public', express.static('public'))

// Cookie session
app.use(cookieSession({
     maxAge: 24 * 60 * 60 * 1000,
     keys: [keys.COOKIE_KEY]
}))

// Init passport 
app.use(passport.initialize())
app.use(passport.session())
app.use('/auth', auth)


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/chat', (req, res) => {
    res.render('chatpage')
})

app.get('/signup', (req, res) => {
    res.render('signup-email')
})

app.get('/chatpage', (req, res) => {
    console.log('Request User: ', req.user)
    res.render('chatpage', {data: req.user})
})

app.get('/games', (req, res) => {
    res.render('tic-tac-toe', {qs: req.query})
})

// Connect to DB
mongoose.connect(keys.MONGO_CONNECTION_STRING, () => {
    console.log('connected');
})

// Communication codings

// Current users
let currentUsers = [], doesExist = false
let isImg

io.on('connection', (socket) => {
    
    // Init message
    socket.on('init', data => {
        currentUsers.forEach(user => {
            if(user.name == data.name) {
                doesExist = true
            }

            
        })
        if(!doesExist) {
            socket.username = data.name
            currentUsers.push(data)
            socket.broadcast.emit('list', currentUsers[currentUsers.length - 1])
            currentUsers.forEach(item => {
                socket.emit('list', item)
            })
            
        }
        console.log('Current users are')
        currentUsers.forEach(users => {
            console.log(users.name)
        })
        socket.join(data.name)
    })

    socket.on('msg', data => {
        console.log(data)
        io.sockets.in(data.to).emit('msg', {name: data.from, text: data.text, image: data.image})
    })

    socket.on('event', data => {
        io.sockets.in(data.to).emit('event', {name: data.from})
    })

    socket.on('seen', data => {
        io.sockets.in(data.to).emit('seen', data.from)
    })

    socket.on('link', data => {
        io.sockets.in(data.to).emit('link', {name: data.from, link: data.link,image: data.image, source: 'games'})
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
        currentUsers.forEach((user, index) => {
            if(user.name == socket.username) {
                currentUsers.splice(index, 1)
            }
        })
        console.log('Current Users are')
        currentUsers.forEach(user => console.log(user.name))
        io.emit('removeList', socket.username)
    })
})



server.listen(port)


