const express = require('express');
const { ipoCounterModel } = require('../models/counters');
const ipoModel = require('../models/ipo');
const { getallIpo, getActiveIpos, getId } = require('../controllers/Ipo');
const jwt = require('jsonwebtoken');
const cookie=require('cookie-parser')


const iporouter = express.Router();

const isAuth = (req, res, next) => {
    if (req?.session?.isAuth) {
      next()
    }
    else {
      res.json({success:false,message:"Session Is Expires Login Again"})
    }
  }
  
  const Authjwt = (req, res, next) => {
    
    const token = req?.cookies?.jwt;
   
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

iporouter.get('/getid',isAuth,Authjwt, async (req, res) => {
    res.json(await getId());
})

iporouter.get('/getallipos',isAuth,Authjwt, async (req, res) => {
    res.json(await getallIpo());
})

iporouter.get('/getactiveipos',isAuth,Authjwt, async (req, res) => {
    res.json(await getActiveIpos());
})

iporouter.post('/iposub',isAuth,Authjwt,async(req,res)=>{
    const {ipo_id,userid}=req.body;
    console.log("ipo_id is:",ipo_id,"and userid is ",userid);
    
 })
 
iporouter.get('/singleipo/:componyid',isAuth,Authjwt,async(req,res)=>{
     const {componyid}=req.params;
     const singleipo=await ipoModel.findOne({companyId:componyid})
    
     res.json({success: true,singleipo:singleipo})
     
  })
 
iporouter.get('/getipo',isAuth,Authjwt,async(req,res)=>{
         const ipo=await ipoModel.find();
         res.json({ success: true,ipo: ipo })
  })

iporouter.post('/addipo',isAuth,Authjwt, async (req, res) => {

    const {
        companyId,
        companyName,
        companySymbol,
        companyLogo,
        companyShares,
        companyValuepershare,
        companyMinimumSlotSize,
        companyMaximumSlotSize,
        companyMaximumSlotsAllowed,
        companyValuation,
        companyStartdate,
        companyEnddate,
        companyDescription
    } = req.body;

    console.log(req.body)
    console.log(companyMaximumSlotsAllowed);



    const save = await ipoModel({
        companyId: companyId,
        companyName: companyName,
        companySymbol: companySymbol,
        companyLogo: companyLogo,
        companyShares: companyShares,
        companyValuepershare: companyValuepershare,
        companyMinimumSlotSize: companyMinimumSlotSize,
        companyMaximumSlotSize: companyMinimumSlotSize,
        companyMaximumSlotsAllowed: companyMaximumSlotsAllowed,
        companyValuation: companyShares * companyValuepershare,
        companyStartdate: companyStartdate,
        companyEnddate: companyEnddate,
        companyDescription: companyDescription
    }).save();

    const updateid = await ipoCounterModel.findOneAndUpdate({ '$inc': { 'ipo_id': 1 } });
    console.log(updateid);
    console.log("Saved");

    res.send(true)

})



module.exports = iporouter;