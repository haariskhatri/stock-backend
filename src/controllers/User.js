// const { userIdModel } = require('../models/counters');
const userModel = require('../models/User')
const { userIdModel } = require('../models/counters');

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

const addUser = async (
    userName,
    userFullName
) => {
    const userId = await getUserId();

    const newuser = userModel({
        userId: userId,
        userName: userName,
        userFullName: userFullName,
        userBalance: 0,
        userOrders: [],
        userPortfolio: [],
        userStatus: 1,
        created: (new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate())
    })

    const added = newuser.save().then((user) => {
        return 200;
    }).catch((error) => {
        return 400;
    })


    const incrementId = userIdModel.findOneAndUpdate({ user_id: userId }, { '$inc': { 'user_id': 1 } });
    const incremented = incrementId.exec().then((incremented) => {
        return 200;
    })
        .catch((err) => {
            return 400;
        })

    return incremented && added;

}

module.exports = addUser;