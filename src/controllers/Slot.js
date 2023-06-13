const ipoModel = require('../models/ipo');
const { slotModel, slotIdModel } = require('../models/slot')
const ipomapsModel = require('../models/ipomaps');
const { getIpoById } = require('./Ipo');

const getMaximumSlotsAllowed = async (ipo_id) => {
    return (await ipoModel.findOne({ companyId: ipo_id }).select({ _id: 0, companyMaximumSlotsAllowed: 1 })).companyMaximumSlotsAllowed;
}

const getSlotsFilledbyCustomer = async (customerId, ipoId) => {
    return (await ipomapsModel.findOne({ customerId: customerId, ipoId: ipoId }).select({ _id: 0, slotAmount: 1 }))
}

const checkifUserExists = async (customerId, ipoId) => {
    return Boolean(await ipomapsModel.findOne({ customerId: customerId, ipoId: ipoId }))
}

//get all slots for ipo
const getIpoSlots = async (id) => {
    return await slotModel.find({ 'ipoId': id });
}

//get total shares in ipo
const getTotalSlots = async (id) => {

    if (id === null) {
        return 0;
    }
    else {
        const result = (await ipoModel.findOne({ 'companyId': id }))
        return result.companyShares;

    }

}



//get subscribed shares
const getSubscribed = async (id) => {
    const result = await getIpoSlots(id);
    var subscribed = 0;
    result.forEach(ele => {
        subscribed += ele.slotAmount;
    });
    return subscribed;
}



const checkSubscription = async (id) => {
    const actual = await getTotalSlots(id);
    const subscribed = await getSubscribed(id);

    if (subscribed === actual.ac) {
        return 'perfect';
    }
    else if (subscribed > actual) {
        return 'over';
    }
    else {
        return 'under';
    }
}


const getslotId = async () => {
    const result = await slotIdModel.find({});
    return result[0].slot_id;
}

const incrementSlotId = async (id) => {
    return await slotIdModel.updateOne({ 'slot_id': id }, { '$inc': { 'slot_id': 1 } })
}


const checkIfIpoExists = async (ipoId) => {
    return Boolean(await ipoModel.findOne({ companyId: ipoId }));
}

const addSlot = async (customerId, ipoId, slotAmount) => {


    const ipo = await getIpoById(ipoId);


    if (ipo === null) {
        return `ipo doesn't exist`;
    }

    // else if (slotsOwned + (slotAmount * slotNumber) >= companyMaximumSlotsAllowed) {
    //     return 'slot limit exceeded';
    // }

    else {
        const userExists = await slotModel.findOne({ 'customerId': customerId, 'ipoId': ipoId });

        if (userExists != null) { //this means user exists , if yes , then just add slot amount to user
            if (userExists.slotAmount + slotAmount > ipo.companySlotSize * ipo.companyMaximumSlotsAllowed) {
                return 'limit exceeded';
            }
            else {
                await slotModel.findOneAndUpdate({ 'customerId': customerId, 'ipoId': ipoId }, { '$inc': { 'slotAmount': slotAmount } })
                return 'added to existing';
            }
        }

        else {


            const slotid = await getslotId();

            if (slotAmount > ipo.companySlotSize * ipo.companyMaximumSlotsAllowed) {
                return 'greater than limit';
            }

            const addslot = await slotModel({
                slotId: slotid,
                customerId: customerId,
                ipoId: ipoId,
                slotAmount: slotAmount,
                slotSize: ipo.companySlotSize,
                ipoPrice: ipo.companyValuepershare
            }).save();
            await incrementSlotId(slotid);
            console.log('stockId', slotid)
            return 'new slot added';
        }
    }
}

module.exports = {
    addSlot,
    getIpoSlots,
    getTotalSlots,
    getSubscribed,
    checkSubscription,
    getslotId,
    incrementSlotId

}
