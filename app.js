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
// const keys = require('./keys/keys')
const events = require('events');

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use('/public', express.static('public'))

// Cookie session
app.use(cookieSession({
     maxAge: 24 * 60 * 60 * 1000,
     keys: [process.env.COOKIE_KEY]
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

app.use((req, res) => {
    res.render('404')
})

// Connect to DB
mongoose.connect(process.env.MONGO_CONNECTION_STRING, () => {
    console.log('connected');
})

// Communication codings

// Current users
let currentUsers = [], doesExist = false
let isImg, indexOfUser

io.on('connection', (socket) => {
    doesExist = false
    // Init message
    socket.on('init', data => {
        socket.username = data.name
        currentUsers.forEach((user, index) => {
            if(user.name == data.name) {
                doesExist = true
                socket.broadcast.emit('list', currentUsers[index])
                                
            }
        })

            
        if(!doesExist) {
            currentUsers.push(data)
            socket.broadcast.emit('list', currentUsers[currentUsers.length - 1])
        }
        
        currentUsers.forEach(item => {
            socket.emit('list', item)
        })

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
        io.sockets.in(data.to).emit('link', {name: data.from, link: data.link, image: data.image, source: 'games', currentUser: socket.username})
    })

    socket.on('responded', data => {
        console.log('response came to Server')
        io.sockets.in(data.to).emit('responded', data)
    })

    socket.on('restart', data => {
        io.sockets.in(data.to).emit('restart', data)
    })

    socket.on('initGame', data => {
        socket.join(data.name)
    })

    // Group chat codes
    let groupmembers = [], groupMembersCount = 0
    socket.on('groupChatInit', data => {
        console.log(data)
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


