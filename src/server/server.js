const app = require('http').createServer();
const io = module.exports.io = require('socket.io')(app)

const PORT = process.env.PORT || 3100

const socketManager =  require('./socketManager');

io.on('connection', socketManager)

app.listen( PORT, ()=>{
    console.log('Connected to port:' + PORT);
});