const shareModel = require("../models/share")

const getSharePrice = async (shareId) => {
    return await shareModel.find({ 'shareId': shareId }).select('sharePrice');
}

const addShare = async (shareName, shareSymbol, sharePrice, shareQty) => {

    const shareId = await axios.get('htt')

    shareModel({
        shareId: 
    })
}

module.exports = { getSharePrice }