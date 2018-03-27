const express = require('express');
const DB = require('./db');
const app = express();
const port = 3000;

const indexPage = __dirname + '/public/index.html';

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


app.listen(port);