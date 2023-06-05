const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const UserSession = require('../models/SessionModel');
const userModel = require('../models/User');
const app = express();
const io = new Server({ cors: { origin: 'http://localhost:5173' } });
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cors());
const loginrouter = express.Router();



loginrouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("hello");
  const user = await userModel.find({ "email": email });

  const session = await UserSession.find({ "email": email });

  if (user[0]?.userStatus == 1) {

    if (user[0]?.email == email && bcrypt.compareSync(password, user[0].password)) {

      req.session.isAuth = true;
      req.session.email = email;
      req.session.userId = user[0].userId;

      const token = jwt.sign({ 'email': email }, 'my-secret-key')
      const sessionmod = await UserSession.findOneAndUpdate({ "email": email }, { "jwt_id": token })
      const passwordHash = bcrypt.hashSync(password, 10);

      res.cookie('jwt', token, { httpOnly: true, expires: 0 })

      res.json({ success: true, message: "Login SuccessFully" })


    } else {
      res.json({ success: false, message: "Invalid Creadential" })
    }
  }
  else {
    res.json({ success: false, message: "Please Verify Your Email" })
  }
})

loginrouter.get('/logout', async (req, res) => {
  req.session.destroy();
  res.clearCookie("jwt");
  res.json({ success: true, message: "You Are Loged Out" })
})



module.exports = loginrouter;