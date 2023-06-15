const { set } = require("mongoose")
const { tradeIdModel } = require("../models/counters")
const { getShares, addStocktoUser, debitStock, getUserBalance, debitBalance, creditBalance, getusershare } = require("./User")
const { addTrade } = require("../models/trades")
const { assert, match } = require('assert')
const { getAllShares, getShareSymbol, increasePrice, decreasePrice, changePrice, getShareWithSymbol } = require("./Share")
const { log } = require("console")
const { sendMail } = require("./Mail")
const { appendPrice } = require("./Price")


const tradeUsers = new Set(); //keep track of users who have traded
const market = false;


const endMarket = () => {

}


const incrementTradeId = async (previous) => {
    const result = await tradeIdModel.findOneAndUpdate({ 'trade_id': previous }, { '$inc': { 'trade_id': 1 } });
    return 200;
}


const stockMap = new Map();


const setstockmap = async () => {
    const symbols = await getShareSymbol();
    await symbols.map(ele => {
        stockMap.set(ele.shareSymbol, [[], []])


    })
    console.log('set')

    return 200;
}


const printmap = () => {
    return stockMap;
}




const buyOrder = async (data) => {
    const { stockId } = data;
    const stock = stockMap.get(stockId);
    stock[0].push(data);




    const match = await match3(stockId);
    const map = stockMap.get(stockId);

    console.log('match3', match)
    console.log(map);
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



    const usershares = await getusershare(data.userId, stockId);

    if (usershares < data.shares) {
        return { 'added': 0, 'matched': 0, 'stock': stockId };
    }
    else {

        stock[1].push(data);

        const match = await match3(stockId);
        const map = stockMap.get(stockId);

        console.log(map);

        console.log('match3', match)
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

const match3 = async (stock) => {

    const stocks = stockMap.get(stock);
    const buyarr = stocks[0];
    const sellarr = stocks[1];

    if (buyarr.length === 0 || sellarr.length === 0) {
        return false;
    }
    else {
        const promises = buyarr.map((async (buy, Index) => {
            var remainingshare = buy.shares;
            const matching = sellarr.filter((sell) => sell.price <= buy.price)
            var matched = true;

            for (var i = 0; i < matching.length; i++) {
                const sell = matching[i];
                const userbalance = await getUserBalance(buy.userId);
                const sharebalance = await getShares(sell.userId, sell.stockId);

                if (userbalance < buy.shares * buy.price || sharebalance < sell.shares || sell.userId === buy.userId) {
                    break;
                }

                else {

                    if (buy.shares >= sell.shares) {
                        remainingshare -= sell.shares;
                        buy.shares = remainingshare;


                        await changePrice(sell.stockId, sell.price)
                        await debitStock(sell.userId, sell.stockId, sell.shares);
                        await addStocktoUser(buy.userId, sell.stockId, sell.shares);
                        await creditBalance(sell.userId, sell.shares * sell.price);
                        const id = await addTrade(buy.userId, sell.userId, sell.stockId, sell.shares, sell.price)
                        sendMail(buy.userEmail, id, 'Buy', buy.stockId, sell.shares, 'debit', sell.shares * sell.price);
                        sendMail(sell.userEmail, id, 'Sell', sell.stockId, sell.shares, 'credit', sell.shares * sell.price);
                        sellarr.splice(sellarr.indexOf(sell), 1);
                        await appendPrice(buy.stockId, [Date.now(), sell.price])
                        tradeUsers.add(buy.userId)
                        tradeUsers.add(sell.userId)
                        console.log('matched');
                        matched = true;

                        if (remainingshare == 0) {
                            buyarr.splice(buyarr.indexOf(buy), 1);
                            break;
                        }
                    }

                    //buy is smaller than sell
                    else {
                        sell.shares -= buy.shares;

                        await changePrice(sell.stockId, sell.price)
                        await debitStock(sell.userId, sell.stockId, buy.shares);
                        await addStocktoUser(buy.userId, buy.stockId, buy.shares);
                        await creditBalance(sell.userId, buy.shares * buy.price);
                        const id = await addTrade(buy.userId, sell.userId, sell.stockId, sell.shares, sell.price)
                        sendMail(buy.userEmail, id, 'Buy', buy.stockId, buy.shares, 'debit', buy.shares * buy.price);
                        sendMail(sell.userEmail, id, 'Sell', sell.stockId, buy.shares, 'credit', buy.shares * sell.price);
                        await appendPrice(buy.stockId, [Date.now(), sell.price])
                        tradeUsers.add(buy.userId)
                        tradeUsers.add(sell.userId)
                        buyarr.splice(buyarr.splice(buyarr.indexOf(buy), 1));
                        console.log('matched');
                        matched = true;
                        // break;
                    }
                }


            }

            return matched;
        }))
        await Promise.all(promises);
    }

}




const matchOrder = async (stock) => {



    const actualStock = stockMap.get(stock);
    const buyarr = actualStock[0];
    const sellarr = actualStock[1];

    if (buyarr.length === 0 || sellarr.length === 0) {
        return false;
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
    getStockMap,
    match3,
    printmap


}