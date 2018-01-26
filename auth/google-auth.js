const router = require('express').Router()
const passport = require('passport')

router.get('/google', passport.authenticate('google', {
scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
     res.redirect('/chatpage')
})

router.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

module.exports = router
