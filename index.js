const express = require('express');
const path = require('path');

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const isAuth = require('connect-ensure-login').ensureLoggedIn();

const DATA = require('./dataService');
const app = express();
const port = 3000;

const indexPage = __dirname + '/public/index.html';

let online = new Map();

passport.use(new Strategy(
    function(username, password, cb) {
        if (username === "user" && password === "pass") {
            return cb(null, {
                id: Math.round(Math.random() * 999999).toString(16),
                username:username,
                password:password
            });
        }
        // db.users.findByUsername(username, function(err, user) {
        //     if (err) { return cb(err); }
        //     if (!user) { return cb(null, false); }
        //     if (user.password != password) { return cb(null, false); }
        //     return cb(null, user);
        // });
    })
);
passport.serializeUser(function(user, cb) {
    online.set(user.id, user);
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    let user = online.get(id);
    cb(null, user);
});


app.use(express.static('public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());



app.get('/', function (req, res) {
    res.sendFile(indexPage);
});

app.get('/write', function (req, res) {
    res.json(DATA.save(req.query));
});
app.get('/enums', function (req, res) {
    res.json(DATA.getEnums() );
});
app.get('/data/:from/:to/:order', isAuth, function (req, res) {
    //@todo need auth
    res.json(DATA.getAll(req.params.from, req.params.to, req.params.order) );
});

app.get('/login', function (req, res, next) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function (req, res, next) {
    res.redirect('/admin');
});
app.get('/admin', isAuth, function (req, res, next) {
    res.sendFile(path.join(__dirname + '/admin/admin.html'));
});

app.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});
app.listen(port, function () {
    console.log("listen on port %s", port);
});