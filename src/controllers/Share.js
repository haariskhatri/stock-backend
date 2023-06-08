const shareModel = require("../models/share");
const { getId, incrementId } = require("./Ipo");

const getSharePrice = async (shareId) => {
    const price = await shareModel.find({ 'shareId': shareId }).select({ 'sharePrice': 1, '_id': 0 });;
    return price[0].sharePrice;
}

const getAllShares = async () => {
    const allstocks = await shareModel.find({});
    return allstocks;
}

const getShareSymbol = async () => {
    return await shareModel.find({}).select({ 'shareSymbol': 1 });
}

const getsharesinit = async () => {
    const allstocks = await shareModel.find({}).select({ 'shareSymbol': 1, 'sharePrice': 1 });

    return allstocks;
}

const getPrice = async (symbol) => {
    return (await shareModel.findOne({ 'shareSymbol': symbol }).select({ 'sharePrice': 1 })).sharePrice;
}

const changePrice = async (stock, price) => {
    return await shareModel.findOneAndUpdate({ 'shareSymbol': stock }, { '$set': { 'sharePrice': price } });
}


const addShare = async (shareName, shareSymbol, sharePrice, shareQty, description, category) => {

    const shareId = await getId();

    await shareModel({
        shareId: shareId,
        shareName: shareName,
        shareSymbol: shareSymbol,
        sharePrice: sharePrice,
        shareQty: shareQty,
        description: description,
        category: category
    }).save()

    await incrementId(shareId);

    return 200;
}



const getTopShares = async () => {
    return await shareModel.find({}).sort({ sharePrice: 'desc' });
}

const getShare = (shareId) => {
    return shareModel.findOne({ 'shareId': shareId });
}

const getShareWithSymbol = async (stock) => {
    return await shareModel.findOne({ 'shareSymbol': stock });
}


module.exports = {
    getSharePrice,
    addShare,
    getAllShares,
    getTopShares,
    getShare,
    getAllShares,
    getsharesinit,
    getShareSymbol,
    getPrice,
    getShareWithSymbol,
    changePrice

}