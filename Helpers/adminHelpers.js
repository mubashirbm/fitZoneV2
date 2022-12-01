const db = require('../confiq/connection')
const collections = require('../confiq/collections')
const bcrypt = require('bcrypt')
const { response, get } = require('../app')
const { resolve } = require('path')
const { rejects } = require('assert')
const { ObjectID } = require('bson')
const objectId = require('mongodb').ObjectId
module.exports = {

    // LOGIN

    doLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let admin = await db.get().collection(collections.ADMIN_COLLECTIONS).findOne({ Email: adminData.Email })
                if (admin) {

                    bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                        if (status) {
                            console.log("logedin");
                            response.admin = admin
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("failed");
                            resolve({ status: false })
                        }
                    })
                }
                else {
                    console.log("login failed");
                    resolve({ status: false })
                }

            } catch (error) {
                reject(error)
            }
        })
    },



    getAdminDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let adminData = await db.get().collection(collections.ADMIN_COLLECTIONS).findOne({ _id: objectId(userId) })
                resolve(adminData)
            } catch (error) {
                reject(error)
            }
        })
    },

    // PRODUCT

    getAllProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.PRODUCT_COLECTIONS).find().toArray().then((products) => {
                    resolve(products)
                })

            } catch (error) {
                reject(error)
            }


        })
    },
    getCategoryNames: () => {
        return new Promise(async (resolve, reject) => {
          let categories = await db
            .get()
            .collection(collections.CATEGORY_COLLECTIONS)
            .aggregate([
              {
                $project: {
                  _id: 0,
                  category: "$category",
                },
              },
            ])
            .toArray();
          let categoryNames = [];
          for (i = 0; i < categories.length; i++) {
            categoryNames.push(categories[i].category);
          }
          console.log(categories,'cate');
          resolve(categoryNames);
        });
      },

    getCategoryProduct: (category) => {
        return new Promise(async (resolve, reject) => {
            try {
                let catproduct = await db.get().collection(collections.PRODUCT_COLECTIONS).find({ category: category }).toArray()
                resolve(catproduct)

            } catch (error) {
                reject(error)
            }

        })
    },

    prodoductDetails: (prodId) => {
        return new Promise(async (resolve, reject) => {
            try {
               await db.get().collection(collections.PRODUCT_COLECTIONS).findOne({ _id: objectId(prodId) }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }

        })

    },

    addProduct: (product) => {
        return new Promise(async(resolve, reject) => {
            try {
                product.price = parseInt(product.price)
                product.quantity = parseInt(product.quantity)
                product.Realprice = parseInt(product.Realprice)
                let data = await db.get().collection(collections.PRODUCT_COLECTIONS).insertOne(product)
                resolve(data.insertedId)
                // db.get().collection('PRODUCT').insertOne(product).then((data) => {
                //     let id = data.insertedId.toString()
                //     resolve(id)
                // })
            } catch (error) {
                reject(error)
            }

        })
    },

    updateProduct: (prodId, editproduct) => {
        return new Promise((resolve, reject) => {
            try {
                editproduct.price = parseInt(editproduct.price)
                editproduct.quantity = parseInt(editproduct.quantity)
                editproduct.Realprice = parseInt(editproduct.Realprice)
                db.get().collection(collections.PRODUCT_COLECTIONS).updateOne({ _id: objectId(prodId) }, {
                    $set: {
                        name: editproduct.name,
                        category: editproduct.category,
                        description: editproduct.description,
                        price: editproduct.price,
                        Realprice: editproduct.Realprice
                    }
                }).then((response) => {
                    resolve(prodId)
                })
            } catch (error) {
                reject(error)
            }

        })

    },

    deleteproduct: (productId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.PRODUCT_COLECTIONS).remove({ _id: objectId(productId) }).then((response) => {
                    resolve(true)
                })
            } catch (error) {
                reject(error)
            }

        })
    },


    // USER MANAGEMENT 


    getAllUsers: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(collections.USER_COLLECTIONS).find().toArray()
                resolve(users)
            } catch (error) {
                reject(error)
            }

        })
    },

    deleteUser: (deleteid) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTIONS).remove({ _id: objectId(deleteid) }).then((response) => {
                    resolve(true)
                })

            } catch (error) {
                reject(error)
            }

        })
    },
    blockUser: (userData, user) => {
        return new Promise((resolve, reject) => {
            try {
                console.log("gggggg", userData);
                db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(userData) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }

        })
    },
    unblockUser: (userdata, user) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: objectId(userdata) }, {
                    $set: {
                        blocked: false
                    }
                }).then((response) => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }

        })
    },
    // ORDERS
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection(collections.ORDER_COLLECTION).find().toArray()

            let sortedOrders = orders.reverse()
            resolve(sortedOrders)
        })
    },
    cancelOrder: (prodId) => {


        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER_COLLECTION).
                updateOne({ _id: objectId(prodId) },
                    {
                        $set: { status: "canceled", cancelStatus: false, approved: false }
                    }
                ).then((response) => {
                    resolve(response)
                })

        })
    },
    changeStatus: (ordId, status) => {
        return new Promise(async (resolve, reject) => {
            console.log(status, 'unnakkan');
            if (status == 'Cancel Order') {
                await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) }, {

                    $set: { status: 'Canceled', cancelStatus: false, approved: false }

                }).then((response) => {
                    resolve(response)
                })
            } else if (status == 'Out For Delivery') {
                await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) }, {

                    $set: { status: 'Out for Delivery', cancelStatus: true, approved: true }

                }).then((response) => {
                    resolve(response)
                })
            } else if (status == 'Delivered') {
                await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) }, {

                    $set: { status: 'Delivered', cancelStatus: false, approved: true }

                }).then((response) => {
                    resolve(response)
                })

            } else {
                await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) }, {

                    $set: { status: 'Shipped', cancelStatus: true, approved: true }

                }).then((response) => {
                    resolve(response)
                })
            }

        })
    },
    getAllCoupon: () => {
        return new Promise((resolve, reject) => {
            let coupon = db.get().collection(collections.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    addCoupon: (admindata) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(admindata.name);
                admindata.name = admindata.name.toUpperCase()
                admindata.Minimum_Purchase = parseInt(admindata.Minimum_Purchase)
                admindata.Discount = parseInt(admindata.Discount)
                admindata.status=true
                let couponExist = await db.get().collection(collections.COUPON_COLLECTION).findOne(({ name: admindata.name }))
                if (couponExist) {
                    resolve({ Exist: true })
                    console.log("true");
                } else {
                    db.get().collection(collections.COUPON_COLLECTION).insertOne(admindata)

                    resolve({ Exist: false })
                    console.log("false");
                }
            } catch (error) {
                reject(error)

            }

        })
    },
    deleteCoupon: (couponId) => {
        console.log(couponId, "coupon Id");
        return new Promise((resolve, reject) => {
            db.get().collection(collections.COUPON_COLLECTION).deleteOne({ _id: ObjectID(couponId) })
            resolve()
        })
    },
    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
            resolve(banner)

        })

    },
    addBanner: (banner) => {
        return new Promise((resolve, reject) => {
            db.get().collection('BANNER').insertOne(banner).then((data) => {
                let id = data.insertedId.toString()
                resolve(id)
            })

        })
    },
    updateBanner: (bannerId, editbanner) => {
        console.log(bannerId,"banner id",editbanner,"editbanner");
        return new Promise((resolve, reject) => {
            try {


                db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) }, {
                    $set: {
                        main_heading: editbanner.main_heading,
                        sub_heading: editbanner.sub_heading
                    }
                }).then((response) => {
                    resolve(bannerId)
                })
            } catch (error) {
                reject(error)
            }

        })

    },
    bannerDetails: (bannerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collections.BANNER_COLLECTION).findOne({ _id: objectId(bannerId) }).then((response) => {
                    resolve(response)
                    // console.log(resolve, "resolve");
                })
            } catch (error) {
                reject(error)
            }

        })

    },
    deletebanner: (bannerId) => {
        return new Promise((resolve, reject) => {

            try {
                db.get().collection(collections.BANNER_COLLECTION).remove({ _id: objectId(bannerId) }).then((response) => {
                    resolve(true)
                })
            } catch (error) {
                reject(error)

            }
        })
    },



    totalRevenue: () => {
        return new Promise(async (resolve, reject) => {
           console.log("helo");
            try {
                // let totalrevenue=0
                let totalrevenue = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { status: "Delivered" }  
                    },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$total' }
                        }
                    }
                ]).toArray()
                //   console.log(totalrevenue,"tottall revenuee");
                console.log(totalrevenue[0],'total revenue aggregation');
                totalrevenue.length === 0 ? resolve(totalrevenue = 0): resolve(totalrevenue[0])
                    // totalrevenue = 0
                    
                
                // resolve(totalrevenue[0])

            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },

    allUsersCount: () => {
        return new Promise((resolve, reject) => {
            try {
                let totalusers = db.get().collection(collections.USER_COLLECTIONS).find().count()
                resolve(totalusers)
            } catch (error) {
                reject(error)
            }
        })
    },
    totalOrderscount: () => {
        return new Promise((resolve, reject) => {
            try {
                totalOrders = db.get().collection(collections.ORDER_COLLECTION).find().count()
                resolve(totalOrders)
            } catch (error) {
                reject(error)
            }
        })
    },
    totalproductCount: () => {
        return new Promise((resolve, reject) => {
            try {
                totalProducts = db.get().collection(collections.PRODUCT_COLECTIONS).find().count()
                resolve(totalProducts)
            } catch (error) {
                reject(error)
            }
        })
    },

    // GRAPH
    orderstatusGraph: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderStatus = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { cancelStatus: true }
                    },
                    {
                        $group: { _id: "$status", count: { $sum: 1 } }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }]).toArray()
                console.log(orderStatus, 'orderStatusss');
                resolve(orderStatus)

            } catch (error) {
                reject(error)
            }
        })
    },
    ordercanceled: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const cancelStatus = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { cancelStatus: false }
                    },
                    {
                        $group: { _id: "$status", count: { $sum: 1 } }
                    }
                ]).toArray()
                resolve(cancelStatus)
            } catch (error) {
                reject(error)
            }
        })
    },
    categoryRevenue: (categName) => {
        return new Promise(async (resolve, reject) => {
          let categoryRevenue = await db
            .get()
            .collection(collections.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { status: "Delivered" },
              },
              {
                $unwind: "$products",
              },
              {
                $lookup: {
                  from: collections.PRODUCT_COLECTIONS,
                  localField: "products.item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  category: "$product.category",
                  quantity: "$products.quantity",
                  prodPrice: "$product.price",
                  total: {
                    $multiply: ["$products.quantity", "$product.price"],
                  },
                }
              },
              {
                $match: {
                  category: categName,
                }
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                }
              },
            ])
            .toArray();
          let totalCategRevenue = 0;
          for (i = 0; i <= categoryRevenue.length - 1; i++) {
            totalCategRevenue += categoryRevenue[i].total;
          }
          resolve(totalCategRevenue);
          console.log(totalCategRevenue,'totalCategory');
        //   console.log(totalCategRevenue,"categ revenue")
        });
      },
    //   getMonthlySalesBarGraph: () => {
    //     return new Promise(async(resolve, reject) => {
    //       let today = new Date();
    //       let before = new Date(today.getTime() - 250 * 24 * 60 * 60 * 1000).toLocaleString();
    //       console.log(today,'.........',before);
    //       let monthlySales = await db
    //         .get()
    //         .collection(collections.ORDER_COLLECTION)
    //         .aggregate([
    //           {
    //             $match: {
    //               status: "Delivered",
    //               Date: {
    //                 $gte: before,
    //                 $lte: today.toLocaleString(),
    //               },
    //             }, 
    //           },
    //           {
    //             $project: {
    //               _id:0,
    //               Date: 1,
    //               total: 1,
    //             },
    //           },
    //           {     
    //             $group: {       
    //                 _id: {
    //                     Date: "$Date",
    //                 },
    //                 total:{
    //                     $sum:"$total"
    //                 }
    //             }
    //           }
    //         ])
    //         .toArray();
    //         console.log(monthlySales,'monthlySales');
    //         resolve(monthlySales)
           
    //     });
    //   },


      getMonthlySalesBarGraph: () => {
        return new Promise(async(resolve, reject) => {
          let today = new Date();
          let before = new Date(today.getTime() - 250 * 24 * 60 * 60 * 1000);
          let monthlySales = await db
            .get()
            .collection(collections.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {
                  status: "Delivered",
                  Date: {
                    $gte: before,
                    $lte: today,
                  },
                },
              },
              {
                $project: {
                  _id:0,
                  Date: 1,
                  total: 1,
                },
              },
              {
                $group: {
                  _id: {
                    Date: { $dateToString: { format: "%m-%Y", date: "$Date" } },
                  },
                  monthlySales: { $sum: "$total" },
                },
              }
            ])
            .toArray();
            console.log(monthlySales,'monthly Sales');
            resolve(monthlySales)
        });
      },


      getPaymentTypeMonthlyRevenue : (paymentMode)=>{
        console.log(paymentMode,'payment Mode')
        return new Promise(async(resolve, reject) => {
          let today = new Date();
          let before = new Date(today.getTime() - 250 * 24 * 60 * 60 * 1000).toLocaleString();
          let paymentTypeRevenue = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
              $match: {
                status: "Delivered",
                Date: {
                  $gte: before,
                  $lte: today.toLocaleString(),
                },
                paymentMethod:paymentMode
              },
            },
            {
              $project: {
                _id:0,
                Date: 1,
                total: 1,
              },
            },
            {
              $group: {
                _id: {
                  Date:'$Date',
                },
                monthlySales: { $sum: "$total" },
              },
            },
            {
              $sort:{
                _id:1
            }
            }
          ]).toArray()
          console.log(paymentTypeRevenue,"paymentTypeRevenueeee");
          resolve(paymentTypeRevenue)
        })
      }



}






