const express = require ('express');
const app = express();
const server = require('http').createServer(app);

const PORT = process.env.PORT || 3100

server.listen( PORT, ()=>{
    console.log('Connected to port:' + PORT);
});