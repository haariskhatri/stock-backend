const { ipoCounterModel } = require("../models/counters");
const ipoModel = require("../models/ipo");
const { normalizeDate } = require("./utiity");


const getId = async () => {
    const id = await ipoCounterModel.find({});
    return id[0].ipo_id;
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



module.exports = { getId, getallIpo, getActiveIpos }


