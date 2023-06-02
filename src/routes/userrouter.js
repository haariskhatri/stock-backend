const express = require('express');
const addUser = require('../controllers/User');

const userrouter = express.Router();

userrouter.get('/getuserdetail', async (req, res) => {

})

userrouter.post('/addUser', async (req, res) => {
    const { userName, userFullname } = req.body;

    const newUser = await addUser(userName, userFullname);
    res.json(newUser);
})



module.exports = userrouter;
