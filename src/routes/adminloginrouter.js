const express = require('express');
const cors = require('cors');

const { Server } = require('socket.io');
const ipoModel = require('../models/ipo');
const ipomapsModel = require('../models/ipomaps');
const userModel = require('../models/User');
const { debitBalance, addStocktoUser } = require('../controllers/User');
const shareModel = require('../models/share');
const { addShare } = require('../controllers/Share');
const { decreaseIpo, getIpoUser, decreaseSlot,getcomponyshare } = require('../controllers/Ipo');
const app = express();


app.use(express.json());
app.use(cors());

const adminloginrouter = express.Router();
const isAuth = (req, res, next) => {
  if (req?.session?.isAuth) {
    next()
  }
  else {
    res.json({ success: false, message: "Session Is Expires Login Again" })
  }
}

const Authjwt = (req, res, next) => {
  const token = req?.cookie?.jwt;
  if (token) {
    jwt.verify(token, 'my-secret-key', (err, decode) => {
      if (err) {
        res.json({ success: false, message: err })
      }
      else {
        req.user = decode
        next();
      }
    })
  }
  else {
    res.json({ success: false, message: "Login Fisrt Please" })
  }
}

adminloginrouter.get('/admincompony', isAuth, Authjwt, async (req, res) => {
  const data = ipoModel.find();

})

adminloginrouter.get('/cancelipo/:companyId', isAuth, Authjwt, async (req, res) => {
  const data = ipoModel.findOneAndDelete({companyId:req.params.companyId});
  res.json({ success: true, message: "Ipo Canceled" })


})

adminloginrouter.get('/allocation_slot/:componyId', async (req, res) => {


  const componyId = req.params.componyId
  var users = await ipomapsModel.find({ ipoId: componyId })
  const ipos = await ipoModel.findOne({ companyId: componyId })
  var companyShares = ipos.companyShares;
  var minimumshare = ipos.companyMinimumSlotSize;
  var valuepershare = ipos.companyValuepershare;

  const slot = companyShares / minimumshare;//20

  var sum = 0;
  users.map(ele => {
    sum += ele.slotAmount;
  })

  console.log(sum / minimumshare);


  if ((sum / minimumshare) < slot) {

    console.log("Under Subscriber");
    users.map(async (u) => {
      const balance = u.slotAmount * valuepershare
      await debitBalance(u.customerId, balance)
      await addStocktoUser(u.customerId, ipos.companySymbol, u.slotAmount)
      await decreaseIpo(componyId, u.slotAmount)
    })

    await addShare(ipos.companyName, ipos.companySymbol, ipos.companyValuepershare, ipos.companyShares, ipos.companyDescription, "Manufacture")
    await ipoModel.findOneAndDelete({ companyId: req.params.componyId })

  } else {

    var count = ipos.companyShares;//20
    console.log("Over Subscriber");
    while (count > 0) {
      console.log(count); // Print count
    
      // Fetch users data only if count is greater than zero
      if (count > 0) {
        console.log("enter counter");
        await getIpoUser(componyId).then(async (data) => {
          const users = data;
    
          if (users.length > 0) {
            // Process users data
            for (const u of users) {
              console.log("after");
              console.log("User", users);
              console.log("Under Map");
              const balance = minimumshare * valuepershare;
            

                  await debitBalance(u.customerId, balance);
                  await addStocktoUser(u.customerId, ipos.companySymbol, minimumshare);
                  await decreaseSlot(u.customerId, componyId, minimumshare);
                  await decreaseIpo(componyId, minimumshare)
    
        
                  console.log("Company Function");
                  count -= minimumshare;
                  console.log("Map In: " + count);
                
            }
            return;
          } else {
            // No more users available, exit the loop
            count = 0;
          }
        });
      }
    }
    // while (count > 0) {
    //   console.log(count);//30
    //   await getIpoUser(componyId).then((data) => {
    //     users = data
    //   }).then(async()=>{
    //     for (const u of users) {
    //       console.log("after");
    //       console.log("User", users);
    //       console.log("Under Map");
    //       const balance = minimumshare * valuepershare;

    //       await debitBalance(u.customerId, balance);
    //       await addStocktoUser(u.customerId, ipos.companySymbol, minimumshare);
    //       await decreaseSlot(u.customerId, componyId, minimumshare);

    //       console.log("Company Function");
    //       count -= minimumshare;
    //       console.log("Map In: " + count);
    //     }
        // users.map(async (u) => {
        //     if (count > 0) {
        //     console.log("after");
        //     console.log("User", users);
            
        //     console.log("Under Map");
        //     const balance = minimumshare * valuepershare
            
        //     debitBalance(u.customerId, balance).then(() => {

        //       addStocktoUser(u.customerId, ipos.companySymbol, minimumshare).then(() => {
                
        //         decreaseSlot(u.customerId,componyId,minimumshare).then((data) => {
        //           console.log("Compny Function");
        //           count -= minimumshare;
        //           console.log("Map In: " + count);
        //       })
        //     })
        //   })
        //   // await decreaseIpo(componyId, minimumshare)
          
        // }
        // })
    //})
      //}

    console.log("exit while");
    await addShare(ipos.companyName, ipos.companySymbol, ipos.companyValuepershare, ipos.companyShares, ipos.companyDescription, "Manufacture")
    await ipoModel.findOneAndDelete({ companyId: req.params.componyId })

  }
  res.json({ success: true, message: "Slot Allocated" })
})


module.exports = adminloginrouter;