const ipoModel = require("../models/ipo");
const { normalizeDate } = require("./utiity");


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


module.exports = { getallIpo, getActiveIpos }


