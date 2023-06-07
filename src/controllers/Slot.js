const ipoModel = require('../models/ipo');
const slotModel = require('../models/slot')
const ipomapsModel = require('../models/ipomaps');

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
    return await ipomapsModel.find({ 'ipoId': id });
}

//get total shares in ipo
const getTotalSlots = async (id) => {
    const result = (await ipoModel.findOne({ 'companyId': id }))
    return { 'shares': result.companyShares, 'price': result.companyValuepershare }
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

    if (subscribed === actual) {
        return 'perfect';
    }
    else if (subscribed > actual) {
        return 'over';
    }
    else {
        return 'under';
    }
}




const checkIfIpoExists = async (ipoId) => {
    return Boolean(await ipoModel.findOne({ companyId: ipoId }));
}

const addSlot = async (slotId, customerId, ipoId, slotAmount, slotNumber) => {



    const slotsAllowed = await getMaximumSlotsAllowed(ipoId);
    const slotsOwned = await getSlotsFilledbyCustomer(customerId, ipoId);
    const ipoExists = await checkIfIpoExists(ipoId);

    if (!ipoExists) {
        return `ipo doesn't exist`;
    }

    else if (slotsOwned + (slotAmount * slotNumber) >= slotsAllowed) {
        return 'slot limit exceeded';
    }

    else {
        const addslot = await slotModel({
            slotId: slotId,
            customerId: customerId,
            ipoId: ipoId,
            slotAmount: slotAmount,
            slotNumber: slotNumber
        }).save();

        const userExists = await checkifUserExists(customerId, ipoId);


        if (userExists == false) {
            const addnew = await ipomapsModel({
                customerId: customerId,
                ipoId: ipoId,
                slotAmount: (slotAmount * slotNumber)
            }).save();

            return 'done';

        }

        else {

            await ipomapsModel.findOneAndUpdate({
                customerId: customerId,
                ipoId: ipoId
            },
                { '$inc': { 'slotAmount': slotAmount * slotNumber } }
            )

            return 'done';

        }
    }
}

module.exports = {
    addSlot,
    getIpoSlots,
    getTotalSlots,
    getSubscribed,
    checkSubscription
}
