const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');

const addUser = require('./src/controllers/User')

const slotModel = require('./src/models/slot')
const ipomapsModel = require('./src/models/ipomaps');
const ipoModel = require('./src/models/ipo')

const { slotCounterModel, ipoCounterModel, userIdModel } = require('./src/models/counters')

const { addSlot } = require('./src/controllers/Slot')

const http = require('http');
const { Server } = require('socket.io');
const { log } = require('console');

const { getMaximumSlotsAllowed, getSlotsFilledbyCustomer, checkifUserExists } = require('./src/controllers/Slot');


const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

app.use(express.json());
app.use(cors());


app.get('/getid', async (req, res) => {
    const id = await ipoCounterModel.find({});

    res.json({ id: id[0].ipo_id })
})



app.post('/slotrequest', async (req, res) => {
    const { slotId, customerId, ipoId, slotAmount, slotNumber } = req.body;


    const newSlot = await addSlot(slotId, customerId, ipoId, slotAmount, slotNumber);
    res.json(newSlot)


})


app.post('/addipo', async (req, res) => {

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


app.get('/check', async (req, res) => {

})

app.post('/addUser', async (req, res) => {
    const { userName, userFullname } = req.body;

    const newUser = await addUser(userName, userFullname);
    res.json(newUser);
})


server.listen(4000, () => {
    console.log("Listening");
    mongoose.connect('mongodb+srv://root:Haaris8785@cluster0.walzl.mongodb.net/stock')
    console.log("Mongoose Connected");
})

io.on('connection', (socket) => {
    console.log("user connected");
    socket.emit('message', { message: "Hello from server" })
})


