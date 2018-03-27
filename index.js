const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const DB = require('./db');
const app = express();
const port = 3000;

const indexPage = __dirname + '/public/index.html';

// app.use(cookieParser());
// app.use(session({ secret: 'example' }));
// app.use(bodyParser());
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(indexPage);
});

app.get('/write', function (req, res) {
    res.json(DB.writeSomething(req.query));
});
app.get('/enums', function (req, res) {
    res.json(DB.getEnums() );
});
app.get('/data/:from/:to/:order', function (req, res) {
    //@todo need auth
    res.json(DB.getAll(req.params.from, req.params.to, req.params.order) );
});

app.get('/login', function (req, res, next) {
    // res.render('login', { flash: req.flash() } );
    res.sendFile(path.join(__dirname + '/public/login.html'));
});
app.post('/login', function (req, res, next) {
    // you might like to do a database look-up or something more scalable here
    if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
        req.session.authenticated = true;
        res.redirect('/admin');
    } else {
        req.flash('error', 'Username and password are incorrect');
        res.redirect('/login');
    }

});
app.get('/admin', function (req, res, next) {
    res.sendFile(path.join(__dirname + '/admin/admin.html'));
});

app.get('/logout', function (req, res, next) {
    delete req.session.authenticated;
    res.redirect('/');
});
app.listen(port, function () {
    console.log("listen on port %s", port);
});

function checkAuth (req, res, next) {
    console.log('checkAuth ' + req.url);

    // don't serve /secure to those not logged in
    // you should add to this list, for each and every secure url
    if (req.url === '/secure' && (!req.session || !req.session.authenticated)) {
        // res.render('unauthorised', { status: 403 });
        res.send("unauthorised!");
        return;
    }
    next();
}