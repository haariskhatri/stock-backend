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
const { getSharePrice, getTopShares } = require('./src/controllers/Share');
const { buyOrder, sellOrder, newBuy } = require('./src/controllers/BuySell');
const shareModel = require('./src/models/share');
const userModel = require('./src/models/User');
const { addUser, creditBalance, debitBalance } = require('./src/controllers/User');
const sendMail = require('./src/controllers/Mail');
const path = require('path');
const sharesrouter = require('./src/routes/sharesrouter');
const signuprouter = require('./src/routes/signuprouter');
const loginrouter = require('./src/routes/loginrouter');
const adminloginrouter = require('./src/routes/adminloginrouter');




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
app.use(cors());
app.use(bodyParser.json());



app.use('/api/api/user', userrouter);
app.use('/api/api/ipo', iporouter);
app.use('/api/api/trade', traderouter);
app.use('/api/api/share', sharerouter);
app.use('/public', express.static(path.join(__dirname, 'images')))
app.use('/api/shares', sharesrouter);
app.use('/api/signup', signuprouter);
app.use('/api/login', loginrouter);
app.use('/api/adminlogin', adminloginrouter);

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

app.get('/admincompony', async (req, res) => {
    const data = ipomodel.find();
    console.log(data)
})

app.post('/iposub', urlencodedParser, async (req, res) => {
    const { ipo_id, userid } = req.body;
    console.log("ipo_id is:", ipo_id, "and userid is ", userid);

})

app.get('/getiposub/:ipo_id', urlencodedParser, async (req, res) => {
    const { ipo_id } = req.params;
    console.log("ipo_id is:", ipo_id);

})

app.get('/singleipo/:componyid', urlencodedParser, async (req, res) => {
    const { componyid } = req.params;
    const singleipo = await ipomodel.findOne({ companyId: componyid })

    res.json({ singleipo: singleipo })

})

app.get('/getipo', urlencodedParser, async (req, res) => {
    const ipo = await ipomodel.find();
    res.json({ ipo: ipo })
})

app.get('/getshares', urlencodedParser, async (req, res) => {
    const shares = await shareModel.find();
    res.json({ shares: shares })
})

app.get('/singleshares/:shareId', urlencodedParser, async (req, res) => {
    const { shareId } = req.params;
    const singleshare = await shareModel.findOne({ shareId: shareId })

    res.json({ singleshare: singleshare })

})


var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'kishancoc99@gmail.com',
        pass: 'ibhqkbqskwqfwjqc'
    }

});

app.post('/login', urlencodedParser, async (req, res) => {
    const { email, password } = req.body;
    res.json({ message: "Login page" })
    const user = await userModel.find({ "email": email });
    console.log(email, password)
    const session = await UserSession.find({ "email": email });

    if (session[0]?.status == "false") {
        if (user[0]?.status == "Active") {

            if (user[0]?.email == email && bcrypt.compareSync(password, user[0].password)) {
                console.log('logged in')
                req.session.isAuth = true;
                const token = jwt.sign({ 'email': email }, 'my-secret-key')
                const sessionmod = await UserSession.findOneAndUpdate({ "email": email }, { "jwt_id": token })
                const passwordHash = bcrypt.hashSync(password, 10);

                res.cookie('jwt', token, { httpOnly: true, expires: 0 })

                res.redirect('/logout')
                // var mailOptions = {
                //   to: email,
                //   subject: "OTP for registration is ",
                //   text: 'Hello to myself!',
                //   html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                // };
                // console.log(mailOptions);
                // transporter.sendMail(mailOptions, (error, info) => {
                //   if (error) {
                //     return console.log(error);
                //   }
                //   console.log('Message sent: %s', info.messageId);
                //   console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                //   res.redirect('/optpage')
                // });


            } else {
                //res.send('invalid credential')
                res.render(path.join(__dirname, "/views/signin.ejs"), { success: "Invalid Credential" });
            }
        }
        else {
            //res.send("Please Confirm Your Email")
            res.render(path.join(__dirname, "/views/signin.ejs"), { success: "Please Confirm Your Email" });
        }
    } else {
        // res.send("You are restricted")
        res.render(path.join(__dirname, "/views/signin.ejs"), { success: "Your are Restricted" });

    }
})

app.post('/signup', urlencodedParser, async (req, res) => {
    const { userName, email, password } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    console.log("This is email" + email, password, userName)

    const checkUserExists = await userModel.find({ "email": email })

    const token = jwt.sign({ email }, "my-secret-key")

    if (checkUserExists.length !== 0) {
        socket.emit("email-error")
    } else {
        const confirmationCode = otp;
        req.session.isAuth = true;
        res.cookie('jwt', token, { httpOnly: true, expires: 0 })
        await addUser(userName, email, passwordHash, confirmationCode)
        const userses = new UserSession({ email: email, jwt_id: token });
        userses.save();

        var mailOptions = {
            to: email,
            subject: "OTP for Registration Tradetrek",
            text: 'Hello to myself!',
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + confirmationCode + "</h1>"// html body
        };
        console.log(mailOptions);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            socket.emit("email-success")
        });
    }
})




server.listen(4000, () => {
    console.log("Listening");
    mongoose.connect('mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock')
    console.log("Mongoose Connected");
})




