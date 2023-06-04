const { set } = require("mongoose")
const { tradeIdModel } = require("../models/counters")

const buyQueue = []

const sellQueue = []

const getTradeId = async () => {
    const result = await tradeIdModel.find({});
    return result[0].trade_id;
}

const incrementTradeId = async (previous) => {
    const result = await tradeIdModel.findOneAndUpdate({ 'trade_id': previous }, { '$inc': { 'trade_id': 1 } });
    return 200;
}

const recordBuyOrder = async (stock_id, customer_id, quantity, tradetype, price) => {

    const tradeId = await getTradeId();

    const buyorder = await buyModel({
        tradeId: tradeId,
        customerId: customer_id,
        stockId: stock_id,
        tradePrice: price,
        tradeType: tradetype,
        tradeQty: quantity
    }).save();

    await incrementTradeId(tradeId);

    return 200;
}

//buyArrays

const bADA = []
const bREL = []
const bTATA = []


//sell Arrays 
const sADA = []
const sREL = []
const sTATA = []


const stockMap = new Map();
stockMap.set('ADA', [[], []]);
stockMap.set('REL', [[], []]);
stockMap.set('TATA', [[], []]);


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



const buyOrder = (data) => {
    const { stockId } = data;
    const stock = stockMap.get(stockId);
    stock[0].push(data);
    console.log(stockMap.get(stockId));
}

const sellOrder = (data) => {
    const { stockId } = data;
    const stock = stockMap.get(stockId);
    stock[1].push(data);
    console.log(stockMap.get(stockId));
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

const matchOrder = () => {
    const stocks = ['ADA', 'REL', 'TATA']

    stocks.forEach((stock) => {
        const stockArr = stockMap.get(stock);
        const buy = stockArr[0][0];

        if (buy) {
            for (var i = 0; i < stockArr[1].length; i++) {
                const sell = stockArr[1][i];

                //check if price limit is same
                if (buy.priceLimit >= sell.priceLimit) {
                    var clearingPrice = (buy.priceLimit + sell.priceLimit) / 2;

                    if (buy.shares < sell.shares) {
                        sell.shares -= buy.shares;


                    }
                }
            }
        }


    })
}

// const matchOrder = () => {
//     const list = ['ADA', 'REL', 'TATA'];

//     list.map((stock) => {

//         ('b' + stock).push()

//         switch (stock) {
//             case 'ADA':
//                 const buy = bADA.splice(0, 10);
//                 const sell = sADA.splice(0, 10)


//         }
//     })
// }

module.exports = {
    getTradeId,
    incrementTradeId,
    recordBuyOrder,
    buyOrder,
    sellOrder

}