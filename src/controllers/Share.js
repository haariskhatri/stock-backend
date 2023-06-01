const shareModel = require("../models/share");
const { getId, incrementId } = require("./Ipo");

const getSharePrice = async (shareId) => {
    return await shareModel.find({ 'shareId': shareId }).select('sharePrice');
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