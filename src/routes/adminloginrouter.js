const express = require('express');
const cors = require('cors');

const { Server } = require('socket.io');
const ipoModel = require('../models/ipo');
const app = express();
const io = new Server( { cors: { origin: 'http://localhost:5173' } });


app.use(express.json());
app.use(cors());

const adminloginrouter = express.Router();
const isAuth = (req, res, next) => {
    if (req?.session?.isAuth) {
      next()
    }
    else {
      res.json({success:false,message:"Session Is Expires Login Again"})
    }
  }
  
  const Authjwt = (req, res, next) => {
    const token = req?.cookie?.jwt;
    if (token) {
      jwt.verify(token, 'my-secret-key', (err, decode) => {
        if (err) {
          res.json({success:false,message:err})
        }
        else {
          req.user = decode
          next();
        }
      })
    }
    else {
      res.json({success:false,message:"Login Fisrt Please"})
    }
  }

adminloginrouter.get('/admincompony',isAuth,Authjwt,async(req,res)=>{
    const data=ipoModel.find();
    console.log(data)
    
})


module.exports = adminloginrouter;