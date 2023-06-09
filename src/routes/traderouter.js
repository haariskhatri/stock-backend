const { Router } = require("express");
const { tradeModel } = require("../models/trades");

const traderouter = Router();

traderouter.get('/history', async (req, res) => {
      const userhistory = await tradeModel.find({$or:[{ buyerId:req.session.userId },{sellerId: req.session.userId}]}).sort({date:-1});
      res.json({ userhistory: userhistory, success: true });
})


traderouter.get('/sellhistory', async (req, res) => {
      const userhistory = await tradeModel.find({ sellerId: req.session.userId }).sort({date:-1});
      res.json({ userhistory: userhistory, success: true });
})

// const check=async(userId)=>{
      
//       const userhistory = await tradeModel.find()
//       return userhistory
// }

// check(13).then((data)=>{
//       console.log(data);
// })

module.exports = traderouter;