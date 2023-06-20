const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const shareModel = require('../models/share');
const app = express();

const io = new Server({ cors: { origin: 'http://localhost:5173' } });
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());
app.use(cors());

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
    jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
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
const sharesrouter = express.Router();

sharesrouter.get('/getshares', isAuth, Authjwt, async (req, res) => {
  const shares = await shareModel.find();
  res.json({ success: true, shares: shares })
})

sharesrouter.get('/singleshares/:shareId', isAuth, Authjwt, async (req, res) => {
  const { shareId } = req.params;
  const singleshare = await shareModel.findOne({ shareId: shareId })

  res.json({ success: true, singleshare: singleshare })

})



module.exports = sharesrouter;