const { getIpoById } = require("./Ipo");
const { getIpoSlots, getTotalSlots, getSubscribed, checkSubscription } = require("./Slot");
const { addStocktoUser, debitBalance } = require("./User");


//add share to market
//remove from ipo

const allocateIpo = async (id) => {
    const status = await checkSubscription(id);
    const ipo = await getIpoById(id);

    //add ipo to shares and remove from ipo

    if (status == 'perfect') {
        const users = await getIpoSlots(id);
        users.forEach(async (ele) => {
            await debitBalance(ele.customerId, ele.slotAmount * ipo.companyValuepershare);
            await addStocktoUser(ele.customerId, ele.companySymbol, ele.slotAmount);
        });

    }
}

module.exports = allocateIpo;