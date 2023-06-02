const shareModel = require("../models/share");
const { getId, incrementId } = require("./Ipo");

const getSharePrice = async (shareId) => {
    const price = await shareModel.find({ 'shareId': shareId }).select({ 'sharePrice': 1, '_id': 0 });;
    return price[0].sharePrice;
}

const addShare = async (shareName, shareSymbol, sharePrice, shareQty) => {

    const shareId = await getId();

    await shareModel({
        shareId: shareId,
        shareName: shareName,
        shareSymbol: shareSymbol,
        sharePrice: sharePrice,
        shareQty: shareQty
    }).save()

    await incrementId(shareId);

    return 200;
}

module.exports = { getSharePrice, addShare }