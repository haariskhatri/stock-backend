const { Router } = require("express");
const { getSharePrice, addShare } = require("../controllers/Share");

const sharerouter = Router();

sharerouter.get('/shareprice', async (req, res) => {
    res.json(await getSharePricerice(1));
})

sharerouter.post('/addShare', async (req, res) => {
    const { shareName, shareSymbol, sharePrice, shareQty } = req.body;
    console.log(req.body);

    try {
        const newshare = await addShare(shareName, shareSymbol, sharePrice, shareQty);
        res.sendStatus(newshare, 'success');
    } catch (error) {
        res.sendStatus(400, error);
    }
})

module.exports = sharerouter;