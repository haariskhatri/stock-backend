const { ipoCounterModel } = require("../models/counters");
const ipoModel = require("../models/ipo");
const { normalizeDate } = require("./utiity");


const getId = async () => {
    const id = await ipoCounterModel.find({});
    return id[0].ipo_id;
}

const incrementId = async (present_value) => {
    await ipoCounterModel.findOneAndUpdate({ 'ipo_id': present_value }, { '$inc': { 'ipo_id': 1 } });
    return 200;
}

const getallIpo = async () => {
    const ipos = await ipoModel.find({});
    console.log(ipos)
    return ipos;
}

const getActiveIpos = async () => {
    const date = normalizeDate(new Date());

    const query = { 'companyEnddate': { '$gte': date } };
    return await ipoModel.find(query);
}



module.exports = { getId, getallIpo, getActiveIpos, incrementId }


