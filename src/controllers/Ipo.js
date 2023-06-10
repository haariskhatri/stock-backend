const { ipoCounterModel } = require("../models/counters");
const ipoModel = require("../models/ipo");
const ipomapsModel = require("../models/ipomaps");
const { normalizeDate } = require("./utiity");


const getId = async () => {
    const id = await ipoCounterModel.find({});
    return id[0].ipo_id;
}

const getIpoById = async (id) => {
    return await ipoModel.findOne({ 'companyId': id });
}



const incrementId = async (present_value) => {
    await ipoCounterModel.findOneAndUpdate({ 'ipo_id': present_value }, { '$inc': { 'ipo_id': 1 } });
    return 200;
}

const getallIpo = async () => {
    const ipos = await ipoModel.find({});
    return ipos;
}

const getIpo = async (name, stock) => {
    const cname = Boolean(await ipoModel.findOne({ 'companyName': name }))
    const symbol = Boolean(await ipoModel.findOne({ 'companySymbol': stock }))

    return (cname && symbol);
}



const getActiveIpos = async () => {
    const date = normalizeDate(new Date());

    const query = { 'companyEnddate': { '$gte': date } };
    return await ipoModel.find(query);
}

const Subscribeipo = async (customerId, ipoId, amount) => {
    const checkUserExists = await ipomapsModel.find({ customerId: customerId, ipoId: ipoId })
    console.log(checkUserExists);
    if (checkUserExists.length !== 0) {
        await ipomapsModel.findOneAndUpdate({ customerId: customerId, ipoId: ipoId }, { '$inc': { 'slotAmount': amount } })
        return 200;
    } else {
        const ipo = new ipomapsModel({ customerId: customerId, ipoId: ipoId, slotAmount: amount })
        await ipo.save();
        return 200;

    }
}

const decreaseIpo = async (companyId, amount) => {
    await ipoModel.findOneAndUpdate({ companyId: companyId }, { '$inc': { 'companyShares': - amount } })

    return 200;
}

const getIpoUser = async (ipoId) => {
    const getIpo = await ipomapsModel.find({ ipoId: ipoId, 'slotAmount': { $gt: 1 } })
    return getIpo;
}

// getIpoUser(47).then((data)=>{
//     console.log(data.length);
// })
const decreaseSlot = async (customerId, ipoId, minimumshare) => {
    const getIposlot = ipomapsModel.updateOne({ customerId: customerId, ipoId: ipoId }, { '$inc': { 'slotAmount': - minimumshare } })
    return getIposlot;
}

const checkiposlot = async (customerId, ipoId) => {
    const getslot = ipomapsModel.findOne({ customerId: customerId, ipoId: ipoId })
    return getslot;
}

const getcomponyshare = (companyId) => {
    const getcomponyshare = ipoModel.findOne({ companyId: companyId });
    return getcomponyshare;
}



module.exports = { getId, getIpoById, getallIpo, getActiveIpos, incrementId, Subscribeipo, decreaseIpo, getIpoUser, decreaseSlot, checkiposlot, getcomponyshare }


