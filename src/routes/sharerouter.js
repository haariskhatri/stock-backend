const { Router } = require("express");
const { getSharePrice, addShare, getTopShares } = require("../controllers/Share");

const sharerouter = Router();
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

sharerouter.get('/shareprice', isAuth, Authjwt, async (req, res) => {
    res.json(await getSharePrice(req.body));
})

sharerouter.get('/gettopshares', (req, res) => {
    getTopShares().then((data) => {
        res.json(data);
    })
})

sharerouter.post('/addShare', isAuth, Authjwt, async (req, res) => {
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