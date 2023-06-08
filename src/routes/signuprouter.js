const express = require('express');
const cors = require('cors');
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt")
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { addUser } = require('../controllers/User');

const { Server } = require('socket.io');
const userModel = require('../models/User');
const UserSession = require('../models/SessionModel');
const { otpMail } = require('../controllers/Mail');

const app = express();

app.use(express.json());
app.use(cors());



const signuprouter = express.Router();



var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'kishancoc99@gmail.com',
    pass: 'ibhqkbqskwqfwjqc'
  }

});

signuprouter.post('/signup', async (req, res) => {
  const { userName, email, password } = req.body;
  console.log(req.body);
  const passwordHash = bcrypt.hashSync(password, 10);

  const checkUserExists = await userModel.findOne({ "email": email })
  console.log(checkUserExists);
  var otp = Math.random();
  otp = otp * 1000000;
  otp = parseInt(otp);
  console.log(otp);

  if (checkUserExists === null) {
    const adduser = await addUser(userName, email, passwordHash)
    req.session.isAuth = true;
    req.session.email = email;
    req.session.userId = adduser;
    const confirmationCode = otp;
    req.session.otp = confirmationCode;
    await otpMail(email, confirmationCode);
    res.json(true)
  } else {
    res.json(false);
  }
})

signuprouter.post('/verifyotp', async (req, res) => {
  const { otp } = req.body;
  if (otp == req.session.otp) {
    const email = req.session.email;
    const token = jwt.sign({ email }, "my-secret-key")
    res.cookie('jwt', token, { httpOnly: true, expires: 0 })
    const userses = new UserSession({ email: email, jwt_id: token });
    await userses.save();

    const user = await userModel.findOneAndUpdate({ "email": req.session.email }, { "userStatus": 1 })
    res.json({ success: true, message: "Account Verifyed Successfully" })
  } else {
    res.json({ success: false, message: "Wrong Otp" })

  }
})

module.exports = signuprouter;