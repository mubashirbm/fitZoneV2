const db = require('../confiq/connection')
const collections = require('../confiq/collections')
const bcrypt = require('bcrypt')
const { response, get } = require('../app')
const { ObjectId } = require('mongodb')
const { resolve } = require('path')
const objectId = require('mongodb').ObjectId




module.exports = {


    addToWishlist: (product, userId) => {
        // console.log(product,userId)
        return new Promise(async (resolve, reject) => {
            try {
                console.log("fsdgffdfgh");

                let userExist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
                console.log('userexist');
                // console.log(userExist);

                if (userExist) {


                    let productIndex = await userExist.products.findIndex(proid => proid == product)
                    console.log(productIndex);
                    console.log(userExist.products);
                    if (productIndex != -1) {
                        resolve({ exist: true })
                    } else {
                        db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {
                                $push: { products: ObjectId(product) }
                            })
                        resolve({ exist: false })
                    }
                } else {
                    let wishObj = {
                        user: ObjectId(userId),
                        products: [ObjectId(product)]
                    }
                    console.log("wishobj");
                    // console.log(wishObj);

                    db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishObj)
                    resolve({ exist: false })
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    wishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userExist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
                if (userExist) {
                    let wishcart = await db.get().collection(collections.WISHLIST_COLLECTION)
                        .aggregate([{ $match: { user: ObjectId(userId) } },
                        {
                            $lookup: {
                                from: collections.PRODUCT_COLECTIONS,
                                let: { productList: '$products' },
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', '$$productList']
                                        }
                                    }
                                }],
                                as: 'Items'
                            }
                        }]).toArray()


                    resolve(wishcart[0].Items)
                } else {
                    resolve({ Empty: true })
                }
                // console.log(wishcart);

                // console.log((products));

            } catch (error) {
                reject(error)

            }


        })
    },
    removeWishlist: (product, user) => {
        // console.log(product, user);
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: ObjectId(user) }, { $pull: { products: ObjectId(product) } }
                ).then(() => {
                    resolve(true)
                })

            } catch (error) {
                reject(error)
            }

        })
    },


    // CART



    addToCart: (prodtId, userId) => {
        let prObj = {
            item: ObjectId(prodtId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let prodDetails = await db.get().collection(collections.PRODUCT_COLECTIONS).findOne({ _id: ObjectId(prodtId) })
                console.log(prodDetails, 'dasffasdssda');
                prObj.price = prodDetails.price
                let userCartExist = await db.get().collection(collections.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                console.log(prObj, 'kjjksadsHello kannapi');
                console.log(userCartExist);
                if (userCartExist) {
                    console.log('userexist');
                    // resolve({exist:true})
                    let prodExist = await userCartExist.products.findIndex(product => product.item == prodtId)
                    console.log(prodExist);

                    if (prodExist != -1) {
                        console.log(prObj, 'if side');
                            resolve({ exist: true })
                        } else {
                            db.get().collection(collections.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                                {
                                    $push: { products: prObj }
                                })
                            resolve({ exist: false })

                    }
                    // console.log(userExist.products);


                } else {
                    console.log(prObj, 'else side');
                    let cartObj = {
                        user: ObjectId(userId),
                        products: [prObj]
                    }
                    console.log("CARTobj");
                    // console.log(cartObj);

                    db.get().collection(collections.CART_COLLECTION).insertOne(cartObj)
                    resolve({ exist: false })
                }

            } catch (error) {
                reject(error)
            }

        })
    },


    cartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collections.CART_COLLECTION)
                    .aggregate([
                        {
                            $match: { user: ObjectId(userId) }
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
                                item: 1, quantity: 1, product: 1, price: 1, total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
                            }
                        }
                        // {
                        //     $project:{place
                        //         total:{$sum:{$multiply:['$quantity','$product.price']}}
                        //     }
                        // }

                    ]).toArray()
                // console.log("inside cart");
                // console.log(cartItems,"cartitems");


                console.log(cartItems, "caaart111111111111111111111111111111111111111")
                resolve(cartItems)

            } catch (error) {
                reject(error)
            }
        })
    },
    singleProductPrice: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collections.CART_COLLECTION)
                    .aggregate([
                        {
                            $match: { user: ObjectId(userId) }
                        },
                        {
                            $unwind: '$products'
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
                                price: 1
                            }
                        }
                        // {
                        //     $project:{
                        //         total:{$sum:{$multiply:['$quantity','$product.price']}}
                        //     }
                        // }

                    ]).toArray()
                // console.log("inside cart");
                // console.log(cartItems,"cartitems");

                let price = cartItems.price
                console.log(cartItems, "single Price product aggregation")
                resolve(price)

            } catch (error) {
                reject(error)
            }
        })
    },
    removeFromCart: (productDetail) => {
        // let cart=parseInt(productDetail.cart)
        // let product=parseInt(productDetail.item)
        // console.log(productDetail.cart, "prodetails");
        // console.log("product",pr.oductDetail.cart);
        return new Promise(async (resolve, reject) => {

            try {
                await db.get().collection(collections.CART_COLLECTION).
                    updateOne({ _id: ObjectId(productDetail.cart) },
                        {
                            $pull: { products: { item: ObjectId(productDetail.product) } }
                        }
                    ).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }

        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (cart) {
                    count = cart.products.length
                    resolve(count)
                    console.log(count, 1111111);
                }
                resolve()


            } catch (error) {
                reject(error)
            }

        }

        )
    },
    changeProductQuantity: (proDetails) => {
        // console.log(proDetails, "Prodetails");
        let count = parseInt(proDetails.count)
        console.log(count);
        return new Promise(async (resolve, reject) => {

            try {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(proDetails.cart), 'products.item': ObjectId(proDetails.product) },
                        {
                            $inc: { 'products.$.quantity': -count }
                        }
                    ).then((count) => {
                        resolve(count)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    cartTotalAmount: (userId) => {
        console.log(userId)
        let Total = null
        return new Promise(async (resolve, reject) => {
            try {
                Total = await db.get().collection(collections.CART_COLLECTION)
                    .aggregate([
                        {
                            $match: { user: ObjectId(userId) }
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
                            $project: {
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: ["$quantity", { $toInt: '$product.price' }] } }
                            }
                        }

                    ]).toArray()
                // console.log(Total[0].total,"totals");
                resolve(Total[0].total)
                // console.log(cartItems[0].product)


            } catch (error) {
                reject(error)
            }

        })
    },
    getcartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                //  console.log(userId,"get cart product");
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                // console.log(cart,"cartttttttttttttttttttttttttttttttttt");
                resolve(cart.products)
            } catch (error) {
                reject(error)
            }

        })

    },

    getcartsingleProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                //  console.log(userId,"get cart product");
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                // console.log(cart,"cartttttttttttttttttttttttttttttttttt");
                resolve(cart.price)
            } catch (error) {
                reject(error)
            }

        })

    },
    getCartTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db
                .get()
                .collection(collections.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity",
                        },
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLECTIONS,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ["$product.price", "$quantity"] } },
                        },
                    },
                ])
                .toArray();
            resolve(total[0]);
        });
    },
    getProductDetails: (prodId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let prodDetails = await db.get().collection(collections.PRODUCT_COLECTIONS).findOne({ _id: ObjectId(prodId) })
                resolve(prodDetails)
            } catch (error) {
                reject(error)
            }
        })
    },

}
