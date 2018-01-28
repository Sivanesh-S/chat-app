const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const User = require('../models/user-models')
// const keys = require('../keys/keys')
const events = require('events');

// Cookie management using mongoID
passport.serializeUser((user, done) => {
    done (null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done (null, user)
    })
})

passport.use(
    new GoogleStrategy({
        // Options for Strategy
        callbackURL: process.env.CALLBACK_URL,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
}, (accessToken, refreshToken, profile, done) => {
    // Callback Passport
    
    
    // Check user already exist in DB
    User.findOne({googleID: profile.id}).then((currentUser) => {
        
        // Event emitter
        let emitter = new events.EventEmitter()
        emitter.emit('user', currentUser)

        if(currentUser) {
            // Already have user
            done(null, currentUser)
        } else {
            new User({
                username: profile.displayName,
                googleID: profile.id,

            }).save().then((user) => {
                done(null, user)
            })
         // .save() returns promisethat's why .then((record we saved))
        }
        
    })


    /* new User({
        username: profile.displayName,
        googleID: profile.id

    }).save().then((a) => {
        console.log('new User created ' + a);
    })
    // .save() returns promisethat's why .then((record we saved)) */
})
)

