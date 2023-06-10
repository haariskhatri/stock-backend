const { creditCompany } = require("../models/company");
const ipoModel = require("../models/ipo");
const shareModel = require("../models/share");
const { getIpoById } = require("./Ipo");
const { addShare } = require("./Share");
const { getIpoSlots, getTotalSlots, getSubscribed, checkSubscription } = require("./Slot");
const { addStocktoUser, debitBalance, getUserBalance } = require("./User");


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
        ipo.companyCategory
    )



    return 'ipo added to market'
}

const allocateIpo = async (id) => {
    const status = await checkSubscription(id);
    const ipo = await getIpoById(id);
    const users = await getIpoSlots(id);
    const totalshares = ipo.companyShares;
    const ipoPrice = ipo.companyValuepershare;

    const filteredusers = [];

    for (const user of users) {
        const userBalance = await getUserBalance(user.customerId);
        const amount = user.slotAmount * ipoPrice;
        if (userBalance >= amount) {
            filteredusers.push(user);
        }
    }




    //add ipo to shares and remove from ipo

    // if (status == 'perfect') {
    //     users.forEach(async (ele) => {
    //         await debitBalance(ele.customerId, ele.slotAmount * ipo.companyValuepershare);
    //         await addStocktoUser(ele.customerId, ele.companySymbol, ele.slotAmount);

    //     });
    // }



    //if undersubscribed , add company with shares sold and not all shares
    if (status == 'under' || status == 'perfect') {
        var balance = 0;

        //check if user has balance or take them out

        await filteredusers.forEach(async (user) => {
            balance += (user.slotAmount * ipo.companyValuepershare)
            await debitBalance(user.customerId, (user.slotAmount * ipo.companyValuepershare))
            await addStocktoUser(user.customerId, ipo.companySymbol, user.slotAmount);
        });
        console.log(balance)
        await creditCompany(ipo.companyId, balance);
        await addIpotoMarket(ipo.companyId);
        await stopIpo(ipo.companyId);
        return 'allocation done'
    }

    if (status == 'over') {
        var shares = ipo.companyShares;
        console.log(shares)
        const slotSize = ipo.companySlotSize;
        const ipoPrice = ipo.companyValuepershare;



        while (shares > 0) {
            for (const user of filteredusers) {
                if (user.slotAmount === 0) {
                    continue;
                }

                else if (shares == 0) {
                    await creditCompany(ipo.companyId, ipo.companyShares * ipo.companyValuepershare)
                    await addIpotoMarket(ipo.companyId);
                    await stopIpo(ipo.companyId);
                    break;
                }
                else {

                    await debitBalance(user.customerId, ipoPrice * slotSize);
                    await addStocktoUser(user.customerId, ipo.companySymbol, slotSize);
                    user.slotAmount -= slotSize;
                    shares -= slotSize;
                }
            }
        }

    }

}



module.exports = { allocateIpo, stopIpo, addIpotoMarket };