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
    const { userName,email, password } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const checkUserExists = await userModel.find({ "email": email })
    var otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    console.log(otp);
  
    if (checkUserExists.length !== 0) {
      res.json({success: false, message: 'userAlready there'})
    } else {
      req.session.isAuth =true;
      req.session.email=email;
      req.session.userId=checkUserExists.userId;
      const confirmationCode = otp;
      req.session.otp=confirmationCode;
      res.json({success: true, message: 'otp sent'})
      
      await addUser(userName,email,passwordHash)
      
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

signuprouter.post('/verifyotp',async(req,res)=>{
    const {otp}=req.body;
    if(otp == req.session.otp)
    {
      const email=req.session.email;
      const token = jwt.sign({ email }, "my-secret-key")
      res.cookie('jwt', token, { httpOnly: true, expires: 0 })
      const userses = new UserSession({ email: email, jwt_id: token });
      await userses.save();

      const user=await userModel.findOneAndUpdate({"email":req.session.email},{"userStatus":1})
      res.json({success:true,message:"Account Verifyed Successfully"})
    }else{
      res.json({success:false,message:"Wrong Otp"})

    }
})

module.exports = signuprouter;