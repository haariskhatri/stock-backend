const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');


const http = require('http');
const { Server } = require('socket.io');


const userrouter = require('./src/routes/userrouter');
const iporouter = require('./src/routes/iporouter');
const traderouter = require('./src/routes/traderouter');
const sharerouter = require('./src/routes/sharerouter');
const { getSharePrice } = require('./src/controllers/Share');
const { buyOrder, sellOrder, newBuy } = require('./src/controllers/BuySell');






const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

app.use(express.json());
app.use(cors());

app.use('/user', userrouter);
app.use('/ipo', iporouter);
app.use('/trade', traderouter);
app.use('/share', sharerouter);

io.on('connection', (socket) => {

    socket.on('shareprice', async (data) => {
        console.log(data);
        const price = await getSharePrice(data)
        socket.emit('shareprice', price);
    })

    socket.on('buyOrder', (data) => {

        buyOrder(data);
        socket.emit('buysuccess');
    })

    socket.on('sellOrder', (data) => {

        sellOrder(data);
        socket.emit('sellsuccess');
    })



})

const brodcastBook = () => {
    io.emit('new order book', {
        buy: buy.slice(0, 10),
        sell: sell.slice(0, 10)
    })
}

server.listen(4000, () => {
    console.log("Listening");
    mongoose.connect('mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock')
    console.log("Mongoose Connected");
})




