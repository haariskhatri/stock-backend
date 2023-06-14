const express = require('express');
const addUser = require('../controllers/User');
const userModel = require('../models/User');
const { getsharesinit } = require('../controllers/Share');

const userrouter = express.Router();

userrouter.get('/getuserdetail', async (req, res) => {

})

userrouter.get('/getuserbalance', async (req, res) => {

    res.json(await addUser.getUserBalance(req.session.userId));
})

userrouter.post('/addUser', async (req, res) => {
    const { userName, userFullname } = req.body;

    const newUser = await addUser(userName, userFullname);
    res.json(newUser);
})

userrouter.get('/getinvestment', async (req, res) => {
    if (req.session.userId) {

        const result = (await userModel.findOne({ 'userId': req.session.userId }).select({ 'userPortfolio': 1 })).userPortfolio;

        const totalinv = await addUser.getInvestment(req.session.userId)
        const price = await getsharesinit()

        res.json({ user: result, total: totalinv, price: price })
    }
    else {
        res.json('error')
    }
})



module.exports = userrouter;
