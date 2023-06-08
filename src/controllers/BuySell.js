const { set } = require("mongoose")
const { tradeIdModel } = require("../models/counters")
const { getShares, addStocktoUser, debitStock, getUserBalance, debitBalance, creditBalance, getusershare } = require("./User")
const { addTrade } = require("../models/trades")
const { assert } = require('assert')
const { getAllShares, getShareSymbol, increasePrice, decreasePrice, changePrice } = require("./Share")
const { log } = require("console")
const { sendMail } = require("./Mail")



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
    console.log('set')

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
    if (match === true) {
        return { 'added': 1, 'matched': 1, 'stock': stockId }
    }
    else {
        return { 'added': 1, 'matched': 0, 'stock': stockId }
    }

}

const sellOrder = async (data) => {
    const { stockId } = data;
    const stock = stockMap.get(stockId);
    console.log('stock down')
    console.log(stock);


    const usershares = await getusershare(data.userId, stockId);

    if (usershares < data.shares) {
        return { 'added': 0, 'matched': 0 };
    }
    else {

        stock[1].push(data);

        const match = await matchOrder(stockId);
        if (match === true) {
            return { 'added': 1, 'matched': 1, 'stock': stockId }
        }
        else {
            return { 'added': 1, 'matched': 0, 'stock': stockId }
        }
    }
}

const getStockMap = (stock) => {
    return stockMap.get(stock);
}


const matchOrder = async (stock) => {



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
                    return false;
                }

                else {

                    if (sell.price <= buy.price) {
                        if (buy.shares < sell.shares) {

                            if (await getShares(sell.userId, sell.stockId) < buy.shares) {
                                return false;
                            }
                            else {
                                await changePrice(sell.stockId, sell.price)
                                console.log('stock : ', sell.stock, 'price : ', sell.price);
                                await debitStock(sell.userId, sell.stockId, buy.shares);
                                await debitBalance(buy.userId, buy.shares * sell.price);
                                await addStocktoUser(buy.userId, sell.stockId, buy.shares);
                                await creditBalance(sell.userId, buy.shares * sell.price)

                                const id = await addTrade(buy.userId, sell.userId, buy.stockId, buy.shares, sell.price);
                                sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * sell.price);
                                sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', buy.shares * sell.price);
                                sell.shares -= buy.shares;
                                buyarr.splice(buyIndex, 1);
                                console.log('matched');

                                return true;

                            }
                        }

                        if (buy.shares === sell.shares) {
                            if (await getShares(sell.userId, sell.stock) < buy.shares) {
                                return false;
                            }
                            else {
                                await changePrice(sell.stockId, sell.price)
                                await debitStock(sell.userId, sell.stockId, buy.shares);
                                await debitBalance(buy.userId, buy.shares * sell.price);
                                await addStocktoUser(buy.userId, sell.stockId, buy.shares);
                                await creditBalance(sell.userId, buy.shares * sell.price);


                                const id = await addTrade(buy.userId, sell.userId, buy.stockId, buy.shares, sell.price);
                                sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * sell.price);
                                sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', buy.shares * sell.price);
                                buyarr.splice(buyIndex, 1)
                                sellarr.splice(i, 1);
                                console.log('matched');

                                return true;
                            }
                        }

                        if (buy.shares > sell.shares) {
                            return false;
                        }


                    }

                    if (buy.price === sell.price) {


                        if (buy.shares < sell.shares) {

                            if (await getShares(sell.userId, sell.stockId) < buy.shares) {
                                return false;
                            }
                            else {
                                await changePrice(sell.stockId, sell.price)
                                await debitStock(sell.userId, sell.stockId, buy.shares);
                                await debitBalance(buy.userId, buy.shares * buy.price);
                                await addStocktoUser(buy.userId, sell.stockId, buy.shares);
                                await creditBalance(sell.userId, buy.shares * buy.price)
                                const id = await addTrade(buy.userId, sell.userId, buy.stockId, buy.shares, buy.price);
                                sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * buy.price);
                                sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', buy.shares * buy.price);
                                sell.shares -= buy.shares;
                                buyarr.splice(buyIndex, 1);
                                console.log('matched');

                                return true;

                            }
                        }

                        if (buy.shares === sell.shares) {
                            if (await getShares(sell.userId, sell.stock) < buy.shares) {
                                return false;
                            }
                            else {
                                await changePrice(sell.stockId, sell.price)
                                await debitStock(sell.userId, sell.stockId, buy.shares);
                                await debitBalance(buy.userId, buy.shares * buy.price);
                                await addStocktoUser(buy.userId, sell.stockId, buy.shares);
                                await creditBalance(sell.userId, buy.shares * buy.price)
                                const id = await addTrade(buy.userId, sell.userId, buy.stockId, buy.shares, buy.price);
                                sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * buy.price);
                                sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', sell.shares * sell.price);
                                buyarr.splice(buyIndex, 1)
                                sellarr.splice(i, 1);
                                console.log('matched');
                                return true;
                            }
                        }

                        if (buy.shares > sell.shares) {
                            return false;
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
    setstockmap,
    getStockMap


}