const mongoose = require('mongoose');

const companySchema = mongoose.Schema({
    companyId: {
        type: Number,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companySymbol: {
        type: String,
        required: true
    },
    companyBalance: {
        type: Number,
        required: true
    }
})

const companyModel = mongoose.model('companys', companySchema);

const addCompany = async (
    companyId,
    companyName,
    companySymbol,
    companyBalance,
) => {

    return await companyModel({
        companyId: companyId,
        companyName: companyName,
        companySymbol: companySymbol,
        companyBalance: companyBalance
    }).save();

}

const creditCompany = async (id, amount) => {
    return await companyModel.findOneAndUpdate({ 'companyId': id }, { '$inc': { 'companyBalance': amount } })
}


module.exports = { companyModel, addCompany, creditCompany }