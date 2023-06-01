const express = require('express');
const { ipoCounterModel } = require('../models/counters');
const ipoModel = require('../models/ipo');
const { getallIpo, getActiveIpos, getId } = require('../controllers/Ipo');

const iporouter = express.Router();



iporouter.get('/getid', async (req, res) => {
    res.json(await getId());
})

iporouter.get('/getallipos', async (req, res) => {
    res.json(await getallIpo());
})

iporouter.get('/getactiveipos', async (req, res) => {
    res.json(await getActiveIpos());
})

iporouter.post('/addipo', async (req, res) => {

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



module.exports = iporouter;