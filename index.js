// starting point for application

// initialize express
const express = require('express');
// use 'http', a native node library for working with incoming http requests
const http = require('http');
// middleware that parses incoming http requests as json
const bodyParser = require('body-parser');
// logging framework middleware
const morgan = require('morgan');
// creates an instance of express as my app
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// DB Setup
// tell Mongoose to connect to a particular session of mongoDB
mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true })
  .then((res) => { console.log('Connected to database successfully.'); })
  .catch(() => { console.log('Connection to database failed.'); });

// App Setup (express setup)
// tell app to register(use) this middleware to handle incoming requests
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));

router(app);

// Server Setup (express <==> outside world)

// if there is an env var of 'port' already defined, use it, otherwise use port 3090
const port = process.env.PORT || 3090;
// create an http server that knows how to receive requests, anything that comes in should be forwarded to my express app
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on port', port);