const express = require('express');
const cors = require('cors');

const { Server } = require('socket.io');
const ipoModel = require('../models/ipo');
const ipomapsModel = require('../models/ipomaps');
const userModel = require('../models/User');
const { debitBalance, addStocktoUser } = require('../controllers/User');
const shareModel = require('../models/share');
const { addShare } = require('../controllers/Share');
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
    
})

adminloginrouter.get('/allocation_slot/:componyId',async(req,res)=>{

  const users=await ipomapsModel.find({ipoId:req.params.componyId})
  const ipos=await ipoModel.findOne({companyId:req.params.componyId})
  var minimumshare=ipos.companyMinimumSlotSize;
  var valuepershare=ipos.companyValuepershare;
  var balance=minimumshare * valuepershare
  
  users.map(async(u)=>{
   
    await debitBalance(u.customerId,balance)
    await addStocktoUser(u.customerId,ipos.companySymbol,minimumshare)
  })
  
  await addShare(ipos.companyName, ipos.companySymbol, ipos.companyValuepershare, ipos.companyShares, ipos.companyDescription, "Manufacture")
  
  res.json({success:true,message:"Slot Located"})
})


module.exports = adminloginrouter;