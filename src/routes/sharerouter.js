const { Router } = require("express");
const { getSharePrice } = require("../controllers/Share");

const sharerouter = Router();

sharerouter.get('/shareprice', async (req, res) => {
    res.json(await getSharePricerice(1));
})

sharerouter.post('/addShare', async (req, res) => {
    const { shareId, sharePrice, shareQty } = req.body;

    try {

    } catch (error) {
        res.sendStatus(400, error);
    }
})

module.exports = sharerouter;