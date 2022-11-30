const db = require('../confiq/connection')
const collections = require('../confiq/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const { USER_COLLECTIONS } = require('../confiq/collections')
const otphelper = require('./otphelper')
const { ObjectID } = require('bson')
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { resolve } = require('path')
const { nextTick } = require('process')


var instance = new Razorpay({
    key_id: 'rzp_test_9SAVgysPcKxaYF',
    key_secret: 'ppQS9yYcL4mBDWedNInNZ4pR',
});
module.exports = {

    // doSignup: (userData,otp) => {
    //     return new Promise(async (resolve, reject) => {
    //         let emailexist = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
    //         if (!emailexist) {
    //             userData.Password = await bcrypt.hash(userData.Password, 10)
    //             db.get().collection(collections.USER_COLLECTIONS).insertOne(userData).then((data) => {
    //                 if (data) {
    //                     // data.emailexist = false
    //                     console.log(data, 'data');
    //                     resolve(data)
    //                     console.log("email not exist")
    //                 }
    //             })
    //         } else {
    //             console.log("emailexist");
    //             resolve( {emailexist: true} )
    //         }

    //     }
    //     )

    // },



    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                userData.Password = await bcrypt.hash(userData.Password, 10)
                db.get().collection(collections.USER_COLLECTIONS).insertOne(userData).then((data) => {
                    if (data) {
                        data.emailexist = false
                        console.log(data, 'data');
                        resolve(data)
                        console.log("email not exist")
                    } else {
                        console.log('otp loggin failed')
                        resolve('signup Error')
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    },


    verifyUser: (userData) => {
        console.log(userData, "userdata");
        return new Promise(async (resolve, reject) => {
            try {
                let userexist = await db.get().collection(collections.USER_COLLECTIONS).findOne(({ $or: [{ Email: userData.Email }, { Phone: userData.Number }] }))
                if (!userexist) {
                    resolve({ userexist: false })

                } else {
                    console.log("emailexist");
                    resolve({ userexist: true })
                }

            } catch (error) {
                reject(error)

            }


        }
        )
    },
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userData = await db.get().collection(collections.USER_COLLECTIONS).findOne({ _id: objectId(userId) })
                resolve(userData)
            } catch (error) {
                reject(error)
            }
        })
    },
    address: (address) => {
        console.log(address, "address");
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collections.ADDRESS_COLLECTION).insertOne(address)
                resolve()
            } catch (error) {
                nextTick(error)

            }
        })
    },
    getAddress: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {

            let address = await db.get().collection(collections.USER_COLLECTIONS).find({ _id: objectId(userId) })
            resolve(address)
        })
    },
    getAddress: (userId, addId) => {
        console.log(userId, addId, "aaaaaaaaaaaaaaaaaaa");
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.get().collection(collections.USER_COLLECTIONS).aggregate([
                    {
                        $match: {
                            _id: objectId(userId)
                        }
                    },
                    {
                        $unwind: '$address'
                    },
                    {
                        $project: { address: 1 }
                    },
                    {
                        $match: { 'address._addressId': addId }

                    }
                ]).toArray()
                resolve(address[0])
                console.log(address, "result addres");
            } catch (error) {
                reject(error)
            }
        })
    },




    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
                if (user) {
                    console.log(user, "user came");
                    if (user.blocked) {
                        resolve({ status: false })
                        console.log('blocked user');
                    } else {
                        bcrypt.compare(userData.Password, user.Password).then((status) => {
                            if (status) {
                                console.log("logedin");
                                response.user = user
                                response.status = true
                                resolve(response)
                            } else {
                                console.log("failed")
                                resolve({ status: false })
                            }
                        })
                    }
                }
                else {
                    resolve({ status: false })
                }

            } catch (error) {
                reject(error)
            }

        })
    },
    placeOrder: (order, product, total,price) => {
        console.log(order,"ORDERS in PLACE ORDER,");
       console.log( product,'product');
       console.log( price,'totalllllllllllllllllllllllllllllllll');
        
        return new Promise((resolve, reject) => {
            // console.log(order,'...................,',order.userId,'......................');
            total=parseInt(total)
            // price=parseInt(order.price)
            try {
                let status = order.method === 'Cash On Delivery' ? 'placed' : 'pending'
                
                let orderObj = {
                    Date: new Date(),
                    orderDetails: {
                        name: order.name,
                        phone: order.number,
                        email: order.email,
                        state: order.state,
                        house_No: order.house,
                        area: order.area,
                        city: order.city,
                        pinCode: order.pin
                    },
                    userId: objectId(order.userId),
                    paymentMethod: order.method,
                    products: product,
                    price:price,
                    total: total,
                    profit:total/10,
                    status: status,
                    cancelStatus:true,
                    approved:true
                   
                    


                }

                db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    
                        console.log(response, "this order");
                        resolve(response.insertedId)
                        // db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(order.userId)}).then((response)=>{
                        //              resolve()
                                
                                
                        //     })
                    })
                

            } catch (error) {
                reject(error)
            }
            // console.log(order,product,total,"order,product,totalssss");


        })
    },
    removeOrderedProduct:(id)=>{
        console.log(id ,'......ffffffffffff........');
        return new Promise((resolve,reject)=>{
console.log({ user: objectId(id.userId,"user: objectId(id.userId")});
            console.log("inside delete ordered productS");
            db.get().collection(collections.CART_COLLECTION).deleteOne({user: objectId(id.userId)}).then((response)=>{
                
                resolve()  
       })
        })

    },
    getOrderDetails: (userId) => {
        console.log(userId, "dsaaaaaaaaa");
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: objectId(userId) })
                console.log(orders, "dddddddaaaaaaaaaaaaaaaaaattttttttttaaaaaaaa");
                resolve(orders)



            } catch (error) {
                reject(error)
            }

        })
        // console.log(data);
        // resolve(data)


    },
    getAllOrderDetails: (userId) => {
        // console.log(userId, "dsaaaaaaaaa");
        return new Promise(async (resolve, reject) => {

            try {
                let orderss = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
                // console.log(orderss, "dddddddaaaaaaaaaaaaaaaaaattttttttttaaaaaaaa");
                let orders = orderss.reverse()
                console.log(orders,'orders ');
                resolve(orders)

            } catch (error) {
                reject(error)
            }

        })
        // console.log(data);
        // resolve(data)


    },
    // getOrderedProducts:(user)=>{
    //     return new Promise((resolve,reject)=>{
    //         let products=db.get().collection(collections.ORDER_COLLECTION).find({userId:objectId(user)})
    //     })
    // },
    getAllOrderProducts: (user) => {
        // console.log(user, "usercaaaam");
        return new Promise(async (resolve, rteject) => {
            try {
                products = await db.get().collection(collections.ORDER_COLLECTION)
                    .aggregate([
                        {
                            $match: { _id: ObjectID(user) }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                    item: '$products.item',
                                    quantity: '$products.quantity',
                                    price:'$products.price'
                            }

                        },
                        {
                            $lookup: {
                                from: collections.PRODUCT_COLECTIONS,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },price:1
                            }
                        }
                        // {
                        //     $group: {
                        //         _id: null,
                        //         total: { $sum: { $multiply: ["$quantity", { $toInt: '$product.price' }] } }
                        //     }
                        // }

                    ]).toArray()
                console.log(products, " product>>>>productsssss");
                resolve(products)
            } catch (error) {
                resolve(error)
            }

            // console.log(cartItems[0].product)

        })
    },
    generateRazorpay: (userId, total) => {
        // console.log(userId, total, "ppppppaaaaaaaaaaaaaarrrrrrrrrrrrrraaaaaaaaa");
        return new Promise((resolve, reject) => {

            try {
                var options = {
                    amount: total * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + userId
                };
                instance.orders.create(options, function (err, orders) {
                    if (err) {
                        console.log(err, "error");
                    } else {
                        resolve(orders)
                        // console.log(orders, "order");
                    }
                });
            } catch (error) {
                reject(error)
            }




        })
    },
    verifyPayment: (details) => {
        console.log(details, "thiss");
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');

                let hmac = crypto.createHmac('sha256', 'ppQS9yYcL4mBDWedNInNZ4pR')

                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                    console.log("0000000000000000000000000000000000000000000000");
                } else {
                    reject()
                }

            } catch (error) {
                reject(error)
            }

        })
    },
    changeOrderStatus: (orderId) => {
        console.log(orderId, "orderId");
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    })
                resolve()
            } catch (error) {
                reject(error)
            }

        })

    },
    addAddress: (address, userId) => {
        const { v4: uuidv4 } = require('uuid');

        const addresId = uuidv4()
        let addressObject = {
            _addressId: addresId,
            name: address.name,
            phone: address.number,
            email: address.email,
            state: address.state,
            house_No: address.house,
            area: address.area,
            city: address.city,
            pinCode: address.pin
        }
        return new Promise(async (resolve, reject) => {
            let userExist = await db.get().collection(collections.USER_COLLECTIONS).findOne({ _id: objectId(userId) })
            console.log('userexist');
            if (userExist) {
                db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(userId) },
                    {
                        $push: { address: addressObject }
                    })
                resolve({ exist: false })
            } else {
                db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(userId) }, { $set: { address: addressObject } })
                resolve()

            }
        })
    },
    removeAddress: (addId, userId) => {
        console.log(addId, "addressdetails");
        console.log(userId, "userdetails");
        // console.log("product",pr.oductDetail.cart);
        return new Promise(async (resolve, reject) => {

            try {
                let response = await db.get().collection(collections.USER_COLLECTIONS).
                    updateOne({ _id: objectId(userId) },
                        {
                            $pull: {
                                address: { _addressId: addId }
                            }
                        }
                    )
                console.log(response, 'jkhsjkdhads');
            } catch (error) {
                reject(error)
            }

        })
    },
    applycoupon: (coupon, user) => {
        let userId = objectId(user)
        return new Promise(async (resolve, reject) => {
            let code = await db.get().collection(collections.COUPON_COLLECTION).findOne({ code: coupon })
            if (code && code.status) {
                // code.status =false
                db.get().collection(collections.COUPON_COLLECTION).updateOne({code:coupon},{$set:{status:false}})
                console.log(code,'code.........');
                let time = new Date()
                let string = time.toJSON().slice(0, 10)
                console.log(code.Expire_Date, "expire date");
                if (string >= code.Expire_Date) {
                    resolve({ expired: true })
                } else {
                    console.log('else');
                    let user = await db.get().collection(collections.COUPON_COLLECTION).findOne({ code: coupon, user: { $in: [objectId(userId)] } })
                    if (user) {
                        resolve({ used: true })
                    } else {
                        resolve(code)
                    }
                }
            } else {
                resolve({ notAvailable: true })
            }
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLECTIONS,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, proTotal: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
                        }
                    }

                ]).toArray()
                resolve(orderProduct)
            } catch (error) {
                reject(error)
            }

        })
    },
    getSingleOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
                resolve(order)
            } catch (error) {
                reject(error)
            }

        })
    },
           
}



