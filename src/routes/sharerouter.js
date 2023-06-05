const { Router } = require("express");
const { getSharePrice, addShare, getTopShares, getShare, getAllShares } = require("../controllers/Share");

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

sharerouter.get('/getshares', (req, res) => {
    return getAllShares().then((data) => {
        res.json(data);
    })
})

sharerouter.get('/gettopshares', (req, res) => {
    getTopShares().then((data) => {
        res.json(data);
    })
})

sharerouter.post('/getshare', (req, res) => {
    const shareId = req.body.shareId;
    console.log(shareId);
    getShare(shareId).then((data) => {
        res.json(data);
    })
})

sharerouter.post('/addShare', async (req, res) => {
    const { shareName, shareSymbol, sharePrice, shareQty, description, category } = req.body;


    try {
        const newshare = await addShare(shareName, shareSymbol, sharePrice, shareQty, description, category);
        res.sendStatus(newshare, 'success');
    } catch (error) {
        res.sendStatus(400, error);
    }
})

module.exports = sharerouter;