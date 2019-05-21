const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

app.use(express.static(__dirname + '/../public'));
app.use(fileUpload()); 
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'hbs');

module.exports = {
  app,
  port: 8080
};