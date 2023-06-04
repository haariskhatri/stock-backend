const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const upload = require('express-fileupload');
const path = require('path');


const http = require('http');
const { Server } = require('socket.io');


const userrouter = require('./src/routes/userrouter');
const iporouter = require('./src/routes/iporouter');
const traderouter = require('./src/routes/traderouter');
const sharerouter = require('./src/routes/sharerouter');
const { getSharePrice, getAllShares } = require('./src/controllers/Share');
const { buyOrder, sellOrder, newBuy, print, matchOrder } = require('./src/controllers/BuySell');
const { getUserBalance, addStocktoUser, debitStock, getShares } = require('./src/controllers/User');
const { getTradeId, incrementTradeId } = require('./src/models/trades');






const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

app.use(express.json());
app.use(cors());

app.use('/api/user', userrouter);
app.use('/api/ipo', iporouter);
app.use('/api/trade', traderouter);
app.use('/api/share', sharerouter);

app.use(upload({
    limits: {
        fileSize: 50 * 1024 * 1024
    }
}))
app.use('/public', express.static(path.join(__dirname, 'public', 'logos')))

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

const buy = [
    {
        socketId: 'AvGvetHFxETMHmXLAAGd',
        stockId: 'ADA',
        userId: 3,
        shares: '10',
        price: '10'
    },
    {
        socketId: 'PhlJsz6tU479J-RbAAHD',
        stockId: 'ADA',
        userId: 3,
        shares: '10',
        price: '100'
    }
]



server.listen(4000, () => {
    console.log("Listening");
    mongoose.connect('mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock')
    console.log("Mongoose Connected");
})




