const express = require('express');
const { ipoCounterModel } = require('../models/counters');
const ipoModel = require('../models/ipo');
const { getallIpo, getActiveIpos, getId, getIpo, Subscribeipo } = require('../controllers/Ipo');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');
const ipomapsModel = require('../models/ipomaps');
const { addSlot } = require('../controllers/Slot');
const { addCompany } = require('../models/company');
const multer = require('multer');
const path = require('path');


const iporouter = express.Router();

const isAuth = (req, res, next) => {
    if (req?.session?.isAuth) {
        next()
    }
    else {
        res.json({ success: false, message: "Session Is Expires Login Again" })
    }
}

const Authjwt = (req, res, next) => {

    const token = req?.cookies?.jwt;

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

iporouter.get('/getid', async (req, res) => {
    res.json(await getId());
})

iporouter.get('/getallipos', async (req, res) => {
    res.json(await getallIpo());
})

iporouter.post('/checkipo', async (req, res) => {
    const { name, stock } = req.body;
    res.json(await getIpo(name, stock));
})

iporouter.get('/getactiveipos', isAuth, Authjwt, async (req, res) => {
    res.json(await getActiveIpos());
})


iporouter.post('/addslot', async (req, res) => {
    const { customerId, ipoId, slotAmount } = req.body;
    await addSlot(customerId, ipoId, slotAmount);
    res.json('done')
})



iporouter.post('/getipo', async (req, res) => {
    console.log(req.body);
    ipoModel.findOne({ 'companyId': req.body.companyId }).then((data) => {
        res.json(data)
    })
})

iporouter.post('/getipodetail', async (req, res) => {
    ipoModel.findOne({ 'companyId': req.body.companyId }).then((data) => {
        res.json(data)
    })
})


iporouter.post('/iposub', isAuth, Authjwt, async (req, res) => {
    const { ipo_id } = req.body;

    const customerid = req.session.userId;
    console.log("Ipo is: ", ipo_id);
    const amount = await ipoModel.findOne({ companyId: ipo_id });
    await Subscribeipo(customerid, ipo_id, amount.companySlotSize)
    res.json({ success: true, message: "Subscribed Ipo" })

})

iporouter.get('/singleipo/:componyid', isAuth, Authjwt, async (req, res) => {
    const { componyid } = req.params;
    const singleipo = await ipoModel.findOne({ companyId: componyid })

    res.json({ success: true, singleipo: singleipo })

})

iporouter.get('/getipo', async (req, res) => {
    const ipo =await getActiveIpos();
    const ipodata=await ipomapsModel.find();
    res.json({ success: true, ipo: ipo,ipodata:ipodata })
})



const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'images'));
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${req.body.companySymbol}.${ext}`);

    },
});

const upload = multer({
    storage: multerStorage,
});


iporouter.post('/addipo', async (req, res) => {
    const {
        companyId,
        companyName,
        companySymbol,
        companyCategory,
        companyLogo,
        companyShares,
        companyValuepershare,
        companySlotSize,
        companyMaximumSlotsAllowed,
        companyValuation,
        companyStartdate,
        companyEnddate,
        companyDescription
    } = req.body;


    const save = await ipoModel({
        companyId: companyId,
        companyName: companyName,
        companySymbol: companySymbol,
        companyCategory: companyCategory,
        companyLogo: companyLogo,
        companyShares: companyShares,
        companyValuepershare: companyValuepershare,
        companySlotSize: companySlotSize,
        companyMaximumSlotsAllowed: companyMaximumSlotsAllowed,
        companyValuation: companyShares * companyValuepershare,
        companyStartdate: companyStartdate,
        companyEnddate: companyEnddate,
        companyDescription: companyDescription
    }).save();

    await addCompany(companyId, companyName, companySymbol, 0);

    const updateid = await ipoCounterModel.findOneAndUpdate({ '$inc': { 'ipo_id': 1 } });

    console.log("Saved");


    res.json(true);
})

iporouter.post('/uploadlogo', upload.single('companyLogo'), async (req, res) => {

    console.log(req.body)
    res.json(true);
    // try {
    //     const newFile = await File.create({
    //         name: req.body.companySymbol,
    //     });



    // } catch (error) {
    //     console.log(error);
    //     res.json(false);
    // }
})



module.exports = { iporouter, isAuth, Authjwt }