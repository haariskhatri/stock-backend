const { set } = require("mongoose")
const { tradeIdModel } = require("../models/counters")
const { getShares, addStocktoUser, debitStock, getUserBalance, debitBalance, creditBalance } = require("./User")
const { addTrade } = require("../models/trades")
const { assert } = require('assert')
const { getAllShares, getShareSymbol } = require("./Share")
const { log } = require("console")
const sendMail = require("./Mail")



// const getTradeId = async () => {
//     const result = await tradeIdModel.find({});
//     return result[0].trade_id;
// }

const incrementTradeId = async (previous) => {
    const result = await tradeIdModel.findOneAndUpdate({ 'trade_id': previous }, { '$inc': { 'trade_id': 1 } });
    return 200;
}

// const recordBuyOrder = async (stock_id, customer_id, quantity, tradetype, price) => {

//     const tradeId = await getTradeId();

//     const buyorder = await buyModel({
//         tradeId: tradeId,
//         customerId: customer_id,
//         stockId: stock_id,
//         tradePrice: price,
//         tradeType: tradetype,
//         tradeQty: quantity
//     }).save();

//     await incrementTradeId(tradeId);

//     return 200;
// }




const stockMap = new Map();


const setstockmap = async () => {
    const symbols = await getShareSymbol();
    await symbols.map(ele => {
        stockMap.set(ele.shareSymbol, [[], []])
    })
    console.log(stockMap);
    return 200;
}

// const buyOrder = (data) => {
//     const { stockId } = data;

//     switch (stockId) {
//         case 'ADA':
//             bADA.push(data);
//             console.log(bADA[0]);
//             break;
//         case 'REL':
//             bREL.push(data);
//             console.log(bREL[0]);
//             break;
//         case 'TATA':
//             bTATA.push(data);
//             console.log(bTATA[0]);
//             break;

//     }
// }



const buyOrder = async (data) => {
    const { stockId } = data;
    const stock = stockMap.get(stockId);
    stock[0].push(data);
    const match = await matchOrder(stockId);
    console.log(stock);
    console.log(data);
    return { 'added': 1, 'match': match }

}

const sellOrder = async (data) => {
    const { stockId } = data;
    const stock = stockMap.get(stockId);
    stock[1].push(data);
    const match = await matchOrder(stockId);
    console.log(log);
    return { 'added': 1, 'match': match }
}

// const sellOrder = (data) => {
//     const { stockId } = data;

//     switch (stockId) {
//         case 'ADA':
//             sADA.push(data);
//             console.log(sADA[0]);
//             break;
//         case 'REL':
//             sREL.push(data);
//             console.log(sREL[0]);
//             break;
//         case 'TATA':
//             sTATA.push(data);
//             console.log(sTATA[0]);
//             break;

//     }
// }



// const matchOrder = () => {
//     const stocks = ['ADA', 'REL', 'TATA']

//     stocks.forEach(async (stock) => {
//         const stockArr = stockMap.get(stock);
//         const buy = stockArr[0][0];

//         if (buy) {
//             for (var i = 0; i < stockArr[1].length; i++) {
//                 const sell = stockArr[1][i];

//                 //check if price limit is same
//                 if (buy.priceLimit >= sell.priceLimit) {

//                     if (userbalance >= buy.shares * buy.priceLimit) {

//                         var clearingPrice = (buy.priceLimit + sell.priceLimit) / 2;

//                         if (buy.shares < sell.shares) {
//                             //if buy shares is small than sell shares
//                             //partially sell the shares 
//                             const userbalance = await getUserBalance(buy.customerId);
//                             const sellershares = await getShares(sell.userId, sell.stock);

//                             if (userbalance >= buy.shares * buy.priceLimit) {
//                                 if (sellershares >= sell.shares) {
//                                     sell.shares -= buy.shares;
//                                     await addStocktoUser(buy.userId, buy.stock, buy.shares);
//                                     await debitStock(sell.userId, sell.stock, buy.shares);
//                                     await addTrade(buy.userId, sell.userId, buy.stock, buy.shares);
//                                     console.log('Trade Succesful')
//                                 }
//                             }

//                             //else
//                             //check whether the user has the required balance 
//                             //check whether the seller has the required shares 

//                             //debit the amount from buyer,
//                             //debit the seller with shares 
//                             //credit the amount
//                             // credit the buyer with the shares

//                         }


//                     }
//                     else {
//                         console.log("Nothing");
//                     }
//                 }
//             }
//         }


//     })
// }

// list = [ada , rel]
// ada = 

//list of stocks
// everytime buy request comes you have to run the match order function
// if buy request matches , execute it , else put it in array
//if sell request  comes , check the buy array for match and when the match is encountered , execute it 
// terminate
// 



const matchOrder = async (stock) => {

    // const data = {
    //     socketId: '0',
    //     stockId: 'ADA',
    //     userId: 4,
    //     shares: 10,
    //     price: 100
    // }
    // const data2 = {
    //     socketId: '0',
    //     stockId: 'ADA',
    //     userId: 3,
    //     shares: 10,
    //     price: 100
    // }

    // buyOrder(data)
    // buyOrder(data)
    // sellOrder(data2)
    // sellOrder(data2)

    const actualStock = stockMap.get(stock);
    const buyarr = actualStock[0];
    const sellarr = actualStock[1];

    if (buyarr.length === 0 || sellarr.length === 0) {
        return;
    }

    else {


        buyarr.forEach(async (buy, buyIndex) => {
            for (var i = 0; i < sellarr.length; i++) {

                const sell = sellarr[i];

                if (await getUserBalance(buy.userId) < buy.shares * buy.price || buy.userId === sell.userId) {
                    console.log('Invalid');
                    return 0;
                }

                else {

                    if (buy.price === sell.price) {


                        if (buy.shares < sell.shares) {

                            if (await getShares(sell.userId, sell.stockId) < buy.shares) {
                                return 0;
                            }
                            else {

                                await debitStock(sell.userId, sell.stockId, buy.shares);
                                await debitBalance(buy.userId, buy.shares * buy.price);
                                await addStocktoUser(buy.userId, sell.stockId, buy.shares);
                                await creditBalance(sell.userId, buy.shares * buy.price)
                                const id = await addTrade(buy.userId, sell.userId, buy.stockId, buy.shares, buy.price);
                                sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * buy.price);
                                sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', buy.shares * buy.price);
                                sell.shares -= buy.shares;
                                buyarr.splice(buyIndex, 1);
                                return 200;

                            }
                        }

                        if (buy.shares === sell.shares) {
                            if (await getShares(sell.userId, sell.stock) < buy.shares) {
                                return 0;
                            }
                            else {
                                await debitStock(sell.userId, sell.stockId, buy.shares);
                                await debitBalance(buy.userId, buy.shares * buy.price);


                                await addStocktoUser(buy.userId, sell.stockId, buy.shares);
                                await creditBalance(sell.userId, buy.shares * buy.price)
                                const id = await addTrade(buy.userId, sell.userId, buy.stockId, buy.shares, buy.price);
                                sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * buy.price);
                                sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', sell.shares * sell.price);
                                buyarr.splice(buyIndex, 1)
                                sellarr.splice(i, 1);
                                return 200;
                            }
                        }

                        if (buy.shares > sell.shares) {
                            return 0;
                        }

                    }
                }
            }
        });
    }

    // if (await getUserBalance(buy.userId) < buy.price * buy.shares || buy.userId === sell.userId) {
    //     console.log('Invalid');
    //     return;
    // }

    // else {

    //     if (buy.price === sell.price) {


    //         if (buy.shares < sell.shares) {

    //             if (await getShares(sell.userId, sell.stock) < buy.shares) {
    //                 return;
    //             }
    //             else {
    //                 await debitStock(sell.userId, sell.stock, buy.shares);
    //                 await addStocktoUser(buy.userId, sell.stock, buy.shares);
    //                 await addTrade(buy.userId, sell.userId, buy.stock, buy.shares, buy.price);
    //                 ADA[0].shift();
    //                 console.log(ADA);
    //             }
    //         }

    //         if (buy.shares === sell.shares) {
    //             if (await getShares(sell.userId, sell.stock) < buy.shares) {
    //                 return;
    //             }
    //             else {
    //                 await debitStock(sell.userId, sell.stock, buy.shares);
    //                 await addStocktoUser(buy.userId, sell.stock, buy.shares);
    //                 await addTrade(buy.userId, sell.userId, buy.stock, buy.shares, buy.price);
    //                 ADA[0].shift();
    //                 ADA[1].shift();
    //                 console.log(ADA);
    //             }
    //         }

    //         if (buy.shares > sell.shares) {
    //             return;
    //         }

    //     }
    // }
}

module.exports = {

    incrementTradeId,
    buyOrder,
    sellOrder,
    matchOrder,
    setstockmap


}