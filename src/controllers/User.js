// const { userIdModel } = require('../models/counters');
const userModel = require('../models/User')
const { userIdModel } = require('../models/counters');
const shareModel = require('../models/share');

// class User {
//     constructor(userId, userName, userFullName,) {

//         this.userName = userName,
//             this.userFullName = userFullName,
//             this.userOrders = [],
//             this.userPortfolio = [],
//             this.userStatus = 1;
//         this.createdDate = new Date().getDate() + new Date().getMonth() + new Date().getFullYear();

//         this.getUserId().then(() => {
//             console.log(this.userId);
//         })

//     }

//     async getUserId() {
//         const result = await userIdModel.find({}).lean().exec();
//         this.userId = result[0].user_id;
//     }
// }

// module.exports = User;


const getUserId = async () => {
    const result = await userIdModel.find({}).lean().exec();
    return result[0].user_id;
}

const getusershare = async (userId, stock) => {
    const result = (await userModel.findOne({ 'userId': userId }).select({ 'userPortfolio': 1 }));
    const balance = result.userPortfolio.get(stock);

    if (balance === undefined) {
        return 0;
    }
    else {
        return balance;
    }
}



const addUser = async (
    userName,
    email,
    passwordHash,
) => {

    const userId = await getUserId();

    const newuser = userModel({
        userId: userId,
        userName: userName,
        email: email,
        password: passwordHash,
        userBalance: 100000,
        userOrders: [],
        userPortfolio: [],
        userStatus: 0,
        userInvested: 0,
        created: (new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate())
    })

    const added = newuser.save().then((user) => {
        return userId;
    }).catch((error) => {
        return 400;
    })


    const incrementId = await userIdModel.findOneAndUpdate({ 'user_id': userId }, { '$inc': { 'user_id': 1 } });


    return newuser.userId;

}

const addinvestment = async (userId, amount) => {
    await userModel.findOneAndUpdate({ 'userId': userId }, { '$inc': { 'userInvested': amount } })
}

const debitinvestment = async (userId, amount) => {
    await userModel.findOneAndUpdate({ 'userId': userId }, { '$inc': { 'userInvested': - amount } })
}

const addStocktoUser = async (userId, stock, shares) => {
    const addstock = await userModel.findOneAndUpdate({ 'userId': userId }, { '$inc': { [`userPortfolio.${stock}`]: parseInt(shares) } })
    return 200;
}


const debitBalance = async (userId, amount) => {
    await userModel.updateOne({ 'userId': userId }, { '$inc': { 'userBalance': - amount } })
}

const creditBalance = async (userId, amount) => {
    await userModel.updateOne({ 'userId': userId }, { '$inc': { 'userBalance': amount } })
}

const getUserBalance = async (userId) => {

    if (!userId){
        return 0;
    }
    else{

        const result = await userModel.findOne({ 'userId': userId });
        return result.userBalance;
    }
}

const debitStock = async (userId, stock, shares) => {
    await userModel.updateOne({ 'userId': userId }, { '$inc': { [`userPortfolio.${stock}`]: (-1 * shares) } })
    return 200;
}

const getShares = async (userId, stock) => {
    const result = await userModel.findOne({ 'userId': userId })
    return result.userPortfolio.get(stock);
}

const getPrices = async () => {
    const result = [(await shareModel.find({}).select({ 'shareSymbol': 1, 'sharePrice': 1 }))];

    const prices = new Map();
    await result[0].map(ele => {
        prices.set(ele.shareSymbol, ele.sharePrice);
    })
    return prices;
}

const getInvestment = async (userId) => {

    if (userId === null) {
        return 0;
    }
    const prices = await getPrices();
    const result = (await userModel.findOne({ 'userId': userId }).select({ 'userPortfolio': 1 })).userPortfolio;
    const keys = [...result.keys()];
    var investment = 0;
    keys.map(ele => {
        const shares = result.get(ele);
        const value = prices.get(ele);
        investment += shares * value;
    })
    return investment;
}



module.exports = {
    addUser,
    getUserBalance,
    addStocktoUser,
    debitStock,
    getShares,
    debitBalance,
    creditBalance,
    getInvestment,
    getPrices,
    getusershare
};