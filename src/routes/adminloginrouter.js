const express = require('express');
const cors = require('cors');

const { Server } = require('socket.io');
const ipoModel = require('../models/ipo');
const ipomapsModel = require('../models/ipomaps');
const userModel = require('../models/User');
const { debitBalance, addStocktoUser } = require('../controllers/User');
const shareModel = require('../models/share');
const { addShare } = require('../controllers/Share');
const { decreaseIpo, getIpoUser, decreaseSlot, getcomponyshare } = require('../controllers/Ipo');
const { allocateIpo } = require('../controllers/AllocateSlot');
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

const checkadmin = (req, res, next) => {
  if (req.session.email == 'kishan.dave@minddeft.net') {
    next()
  } else {
    res.json({ success: false, message: "Only Admin Can Access" })

  }
}

adminloginrouter.get('/admincompony', checkadmin, async (req, res) => {
  const ipo = ipoModel.find();
  res.json({ success: true, ipo: ipo })
})


adminloginrouter.get('/logout', async (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: "You Are Loged Out" })
})


adminloginrouter.get('/cancelipo/:companyId', checkadmin, async (req, res) => {
  const data = ipoModel.findOneAndDelete({ companyId: req.params.companyId });
  res.json({ success: true, message: "Ipo Canceled" })


})

adminloginrouter.get('/checkadmin', checkadmin, async (req, res) => {

  res.json({ success: true, message: "Admin" })

})



adminloginrouter.get('/allocation_slot/:componyId', checkadmin, async (req, res) => {


  const componyId = req.params.componyId
  var users = await ipomapsModel.find({ ipoId: componyId })
  const ipos = await ipoModel.findOne({ companyId: componyId })
  var companyShares = ipos.companyShares;
  var minimumshare = ipos.companySlotSize;
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
    var unique = [];

    while (count > 0) {
      console.log(count);

      if (count > 0) {
        console.log("enter counter");
        await getIpoUser(componyId).then(async (data) => {
          const users = data;

          if (users.length > 0) {
            // Process users data
            for (const u of users) {
              if (count > 0) {
                if(u.userBalance >=(minimumshare * valuepershare))
                {

                  console.log("check For unique");
                  if (unique.includes(u.customerId)) {
                    console.log("Not Unique ",u.customerId);
                  } else {
                    console.log("Id is in else : ",u.customerId);
                    unique.push(u.customerId)
                    
                   
                    //console.log("User", users);
                    console.log("Under Map");
                    const balance = minimumshare * valuepershare;
  
  
                    await debitBalance(u.customerId, balance);
                    await addStocktoUser(u.customerId, ipos.companySymbol, minimumshare);
                    await decreaseSlot(u.slotId, componyId, minimumshare);
                    //await decreaseIpo(u._id, minimumshare)
                    unique.push(u.customerId);
                   
                    count -= minimumshare;
                    console.log("Map In: " + count);
                  }
                }

              }

            }

            unique=[];
          } else {

            count = 0;
          }
        });
      }
    }
   

    console.log("exit while");
   await addShare(ipos.companyName, ipos.companySymbol, ipos.companyValuepershare, ipos.companyShares, ipos.companyDescription, "Manufacture")
    await ipoModel.findOneAndDelete({ companyId: req.params.componyId })

  }
  res.json({ success: true, message: "Slot Allocated" })
})
// adminloginrouter.get('/allocation_slot/:componyId',checkadmin,async(req,res)=>{
//   const ipo_id=req.params.componyId;
//   const result=await allocateIpo(ipo_id);
//   res.json({message:result})
// })


module.exports = adminloginrouter;