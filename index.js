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
const userrouter = require('./src/routes/userrouter');
const iporouter = require('./src/routes/iporouter');
const traderouter = require('./src/routes/traderouter')


const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

app.use(express.json());
app.use(cors());

app.use('/user', userrouter);
app.use('/ipo', iporouter);
app.use('/trade', traderouter);







app.post('/slotrequest', async (req, res) => {
    const { slotId, customerId, ipoId, slotAmount, slotNumber } = req.body;


    const newSlot = await addSlot(slotId, customerId, ipoId, slotAmount, slotNumber);
    res.json(newSlot)


})



app.get('/check', async (req, res) => {

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


