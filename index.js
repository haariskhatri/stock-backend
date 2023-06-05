const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const nodemailer = require('nodemailer');
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt")
const cookie = require('cookie-parser');
const jwt = require('jsonwebtoken');

const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const ipomodel = require('./src/models/ipo');


const userrouter = require('./src/routes/userrouter');
const iporouter = require('./src/routes/iporouter');
const traderouter = require('./src/routes/traderouter');
const sharerouter = require('./src/routes/sharerouter');
const { getSharePrice } = require('./src/controllers/Share');
const { buyOrder, sellOrder, newBuy } = require('./src/controllers/BuySell');
const shareModel = require('./src/models/share');
const userModel = require('./src/models/User');
const { addUser } = require('./src/controllers/User');
const sharesrouter = require('./src/routes/sharesrouter');
const signuprouter = require('./src/routes/signuprouter');
const loginrouter = require('./src/routes/loginrouter');
const adminloginrouter = require('./src/routes/adminloginrouter');
const path = require('path');




const app = express();
const server = http.createServer(app)
const io = new Server({ cors: { origin: 'http://localhost:5173' } });
const store = new MongoDBSession({
    uri: 'mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock',
    collection: "mySessionsss"
})

app.use(
    session({
        secret: "key that will sign cookie",
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);
app.use(cookie())


app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());


app.use('/api/user', userrouter);
app.use('/api/ipo', iporouter);
app.use('/api/trade', traderouter);
app.use('/api/share', sharerouter);
app.use('/api/shares', sharesrouter);
app.use('/api/signup', signuprouter);
app.use('/api/login', loginrouter);
app.use('/api/adminlogin', adminloginrouter);
app.use('/public', express.static(path.join(__dirname, 'images')))

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




