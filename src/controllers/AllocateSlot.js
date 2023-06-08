const ipoModel = require("../models/ipo");
const shareModel = require("../models/share");
const { getIpoById } = require("./Ipo");
const { addShare } = require("./Share");
const { getIpoSlots, getTotalSlots, getSubscribed, checkSubscription } = require("./Slot");
const { addStocktoUser, debitBalance } = require("./User");


//add share to market
//remove from ipo

const stopIpo = async (id) => {
    return await ipoModel.deleteOne({ 'companyId': id });
}

const addIpotoMarket = async (id) => {

    const ipo = await getIpoById(id);

    await addShare(
        ipo.companyName,
        ipo.companySymbol,
        ipo.companyValuepershare,
        ipo.companyShares,
        ipo.companyDescription,
        'Stocks'
    )

    return 'ipo added to market'
}

const allocateIpo = async (id) => {
    const status = await checkSubscription(id);
    const ipo = await getIpoById(id);
    const users = await getIpoSlots(id);
    const totalshares = ipo.companyShares;


    //add ipo to shares and remove from ipo

    if (status == 'perfect') {
        users.forEach(async (ele) => {
            await debitBalance(ele.customerId, ele.slotAmount * ipo.companyValuepershare);
            await addStocktoUser(ele.customerId, ele.companySymbol, ele.slotAmount);

        });
    }

}

module.exports = { allocateIpo, stopIpo, addIpotoMarket };