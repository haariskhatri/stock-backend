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
const path = require('path');

const ipomodel = require('./src/models/ipo');


const userrouter = require('./src/routes/userrouter');
const { iporouter } = require('./src/routes/iporouter');
const traderouter = require('./src/routes/traderouter');
const sharerouter = require('./src/routes/sharerouter');
const { getSharePrice, getShare, getAllShares, getsharesinit, getShareSymbol, getPrice, getShareWithSymbol } = require('./src/controllers/Share');
const { buyOrder, sellOrder, newBuy, setstockmap, getStockMap, match3, printmap } = require('./src/controllers/BuySell');
const shareModel = require('./src/models/share');
const userModel = require('./src/models/User');
const { addUser, addStocktoUser, debitBalance, creditBalance, getInvestment, getPrices, getUserBalance } = require('./src/controllers/User');
const sharesrouter = require('./src/routes/sharesrouter');
const signuprouter = require('./src/routes/signuprouter');
const loginrouter = require('./src/routes/loginrouter');
const adminloginrouter = require('./src/routes/adminloginrouter');
const multer = require('multer');
const { log } = require('console');
const { getIpoSlots, getTotalSlots, getSubscribed, checkSubscription } = require('./src/controllers/Slot');
const { priceModel } = require('./src/models/prices');
const { appendPrice, getPriceArray } = require('./src/controllers/Price');





const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } });
const store = new MongoDBSession({
    uri: process.env.MONGO_URL,
    collection: "mySessionsss"
})

app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            maxAge: 3 * 60 * 60 * 1000
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

const circuit = 15;


io.on('connection', async (socket) => {
    console.log(socket.id)

    socket.on('shareprice', async (data) => {

        const price = await getSharePrice(data)
        socket.emit('shareprice', price);
    })

    socket.on('investment', async (data) => {

        const investment = await getInvestment(data);
        socket.emit('investment', investment);
    })

    socket.on('givedetail', async () => {
        await getsharesinit().then(data => {
            io.emit('detail', data);
        });
    })

    socket.emit('circuit', circuit);

    socket.on('buyOrder', async (data) => {
        const result = await buyOrder(data);

        io.emit('updateorder', getStockMap(result.stock))
        getShareWithSymbol(result.stock).then((data) => {
            io.emit('takestock', data)
            io.emit('userbalance');
        })
        getPriceArray(result.stock).then((data) => {
            io.emit('priceupdate', data)
        })

        if (result.matched == 1) {

            console.log(getStockMap(result.stock))

        }

        if (result.added == 1) {
            socket.emit('buysuccess');
        }
        console.log('result', result);

        // if (matched == 200) {
        //     console.log('here matched');
        //     getShareWithSymbol(stock).then((data) => {
        //         io.emit('takestock', data)
        //         io.emit('userbalance');
        //     })
        // }
    })

    socket.on('getstock', (data) => {

        getShare(data).then((data) => {
            socket.emit('takestock', data);

        })

    })

    socket.on('getupdate', (data) => {
        console.log(data);
        io.emit('updateorder', getStockMap(data))

    })

    socket.on('getprices', (data) => {
        console.log('prices', data)
        getPriceArray(data).then((datanew) => {
            socket.emit('priceupdate', datanew)
        })
    })

    socket.on('sellOrder', async (data) => {


        const result = await sellOrder(data);


        if (result.matched == 1) {

            console.log(getStockMap(result.stock))
            io.emit('updateorder', getStockMap(result.stock))

        }

        getPriceArray(result.stock).then((data) => {
            io.emit('priceupdate', data)
        })



        getShareWithSymbol(result.stock).then((data) => {
            io.emit('takestock', data)
            io.emit('userbalance');
        })

        if (result.added == 1) {
            socket.emit('sellsuccess');

        }

        // if (matched == 200) {
        //     console.log('here matched');
        //     getShareWithSymbol(stock).then((data) => {
        //         io.emit('takestock', data)
        //         io.emit('userbalance');
        //     })
        // }

    })



})








server.listen(4000, async () => {
    console.log("Listening");
    mongoose.connect(process.env.MONGO_URL)
    await setstockmap();
    console.log("Mongoose Connected");
})




