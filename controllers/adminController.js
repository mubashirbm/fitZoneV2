const { ObjectID } = require('bson');
const { query } = require('express');
const express = require('express');
const flash = require('flash');
const { Db } = require('mongodb');
const { response, request } = require('../app');
const adminHelpers = require('../Helpers/adminHelpers');
const userhelpers = require('../Helpers/userHelpers')
const router = express.Router();
const adminhelpers = require('../Helpers/adminHelpers')
const categoryHelpers = require('../Helpers/categoryhelpers')
const fs = require('fs')
const path = require('path');
const cartHelpers = require('../Helpers/cartHelpers');


module.exports = {
  adminHomepage: async(req, res, next) => {
    try {
      let admin = req.session.admin
    console.log(admin)
    let categories = await adminHelpers.getCategoryNames()
    let totalRevenue= await adminHelpers.totalRevenue()
    let totalUsers=await adminHelpers.allUsersCount()
    let totalOrders=await adminHelpers.totalOrderscount()
    let totalProducts=await adminhelpers.totalproductCount()
    let orderstatus=await adminHelpers.orderstatusGraph()
    let ordercanceled=await adminHelpers.ordercanceled()
    let monthlyRevenue = await adminHelpers.getMonthlySalesBarGraph()
    let codRevenue = await adminHelpers.getPaymentTypeMonthlyRevenue("Cash On Delivery")
    let onlineRevenue = await adminHelpers.getPaymentTypeMonthlyRevenue("Razor Pay")
    console.log(codRevenue,'codRevenue');
    console.log(onlineRevenue,'onlineRevenue');
    
    let categRevenues = []
    
    for(let i=0;i<categories.length;i++){
      var revenue = await adminHelpers.categoryRevenue(categories[i])
      categRevenues.push(revenue)
     console.log(revenue,'revenue');
    }
    console.log(monthlyRevenue,"monthly Revenue");
    console.log(categRevenues,'cateRevenuefdfd');
    console.log(orderstatus,'orderStatus');
    console.log(totalRevenue,'totalRevenue',totalUsers,'totalUsers',totalOrders,'totalOrders',totalProducts,'totalProducts',ordercanceled,'ordercanceled');
    if (admin) {
    totalRevenue === 0 ? totalRevenue = 0 : totalRevenue = totalRevenue.totalRevenue
      res.render('admin/index', { layout: "adminLayout",admin,categRevenues,codRevenue,onlineRevenue, monthlyRevenue,categories,totalRevenue,totalUsers,totalOrders,totalProducts,orderstatus,ordercanceled })
    } else {
      console.log('11')
      res.redirect('/login')
    }
      
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  },

  adminLogin: (req, res,next) => {
    try {
      console.log('22')
      res.render('admin/admin-login', { layout: 'adminlog' , 'logErr': req.session.logErr})
      req.session.logErr = false
    } catch (error) {
      next(error)
    }
 
  },

  adminPOstLogin: (req, res,next) => {
    try {
      adminhelpers.doLogin(req.body).then((response) => {
        req.session.logErr = false
        console.log(console)
        if (response.status) {
          req.session.loggedIn = true
          req.session.admin = response.admin
          console.log('33')
          res.redirect('/admin')
        } else {
          req.session.logErr = true
          console.log('44')
          res.redirect('login')
        }
      })
    } catch (error) {
      next(error)
    }
   
  },

  adminSignUp: (req, res) => {
    res.render('admin/admin-sign-up', { layout: 'adminlog' })
  },

  adminPostSignUp: (req, res) => {
    console.log(req.body)
    adminhelpers.doSignup(req.body).then((response) => {
      console.log(response)
      res.redirect('/adminlogin')
    })
  },

  addProduct: (req, res,next) => {
    try {
      categoryHelpers.getAllCategory().then((category) => {
        console.log('7777')
        res.render('admin/add-product', { category, layout: 'adminLayout' })
      })
    } catch (error) {
     next(error) 
    }
   
  },

  postAddProduct: async(req, res,next) => {
console.log("here");
    // try {
    //   console.log(req.files);
    //   adminhelpers.addProduct(req.body).then((id) => {
    //     // console.log('id')
    //     let image = req.files.image
    //     image.mv('./public/product-image/' + id + '.jpg', (err, done) => {
    //       if (!err) {
    //         res.redirect('/admin/add-product')
    //       } else {
    //         console.log(err)
    //       }
    //     })
    //   })
    // } catch (error) {
    //   next(error)
    // }
    try {
      const Images = []
      for (i = 0; i < req.files.length; i++) {
          Images[i] = req.files[i].filename
      }
      req.body.image = Images
      await adminHelpers.addProduct(req.body)
      res.redirect('/admin/add-product')
  } catch (error) {
      console.log(error);
      next(error)
  }
  
  },

  viewProduct: (req, res,next) => {
    try {
      adminhelpers.getAllProduct().then((products) => {
        console.log(products)
        categoryHelpers.getAllCategory().then((category) => {
          console.log(category);
          res.render('admin/view-products', { products, category, layout: 'adminLayout' })
        })
  
  
      })
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  },

  editProduct: async (req, res,next) => {
    try {
      let products = await adminhelpers.prodoductDetails(req.params.id)
      let category = await categoryHelpers.getAllCategory()
      res.render('admin/edit-product', { products, category, layout: 'adminLayout' })
    } catch (error) {
      next(error)
    }
  
  },

  postEditProduct: async(req, res,next) => {
    // try {
      // adminhelpers.updateProduct(req.params.id, req.body).then(() => {
      //   let id = req.params.id
      //   if (req?.files?.image) {
      //     let image = req.files.image
      //     image.mv('./public/product-image/' + id + '.jpg')
      //   }
      //   res.redirect('/admin/view-products')
      // })
    // } catch (error) {
      // next(error)
    // }

    try {
      let id = req.params.id
      const editImg = []
      for (i = 0; i < req.files.length; i++) {
          editImg[i] = req.files[i].filename
      }
      req.body.image = editImg
      var oldImage = await adminHelpers.updateProduct(id, req.body)
      if (oldImage) {
          for (i = 0; i < oldImage.length; i++) {
              var oldImagePath = path.join(__dirname, '../public/product-Images/' + oldImage[i])
              fs.unlink(oldImagePath, function (err) {
                  if (err)
                      return
              })
          }
      }
      res.redirect('/admin/view-products')
  } catch (error) {
      console.log(error);
      next(error)
  }
   
  },

  deleteProduct: (req, res,next) => {
    try {
      let productId = (req.params.id)
      adminhelpers.deleteproduct(productId).then((response) => {
        res.redirect('/admin/view-products')
  
      })
    } catch (error) {
      next(error)
    }
   
  },

  viewUser: (req, res,next) => {
    try {
      adminhelpers.getAllUsers().then((users) => {
        // console.log(users)
        res.render('admin/view-user', { users, layout: 'adminLayout' })
      })
    } catch (error) {
      next(error)
    }
    

  },

  blockUser: (req, res) => {
    adminhelpers.blockUser(req.params.id, req.body).then(() => {

      res.redirect('/admin/view-user')
    })
  },

  unblockUser: (req, res) => {
    adminhelpers.unblockUser(req.params.id, req.body).then(() => {
      console.log("fdhsfgdhsfsdf");

      res.redirect('/admin/view-user')
    })
  },

  category: (req, res ,next) => {
    try {
      let category = categoryHelpers.getAllCategory().then((category) => {
        catError = req.session.catError
        if (req.session.catError) {
          console.log('catError 1');
  
          res.render('admin/viewcategory', { category, exist: req.flash('exist'), layout: "adminlayout" })
          req.session.catError = false
        } else {
          catError = false
          // console.log('catError');
          res.render('admin/viewcategory', { category, success: req.flash('success'), layout: "adminlayout" })
        }
      })
    } catch (error) {
      next(error)
    }
   
  },

  addCategory: (req, res,next) => {
    try {
      console.log(req.body);
      categoryHelpers.addCategory(req.body).then((response) => {
        if (response.Exist) {
          req.session.catError = true
          req.flash('exist', 'This Category is already Added')
          res.redirect('/admin/category')
        } else {
          req.session.catError = false
          req.flash('success', 'Added succesfully')
          res.redirect('/admin/category')
        }
      })
    } catch (error) {
      next(error)
    }
   
  },

  deleteCategory: (req, res ,next) => {
    try {
      let category = (req.params.id)
    // console.log("category");
    console.log(category);
    categoryHelpers.deleteCategory(category).then((response) => {
      res.redirect('/admin/category')

    })
    } catch (error) {
      next(error)
    }
    
  },

  categoryProduct: (req, res ,next) => {
    try {
      let category = (req.params.category)

    console.log(category);
    adminhelpers.getCategoryProduct(category).then((products) => {
      console.log(category);
      res.render('admin/categorized-products', { products, layout: "adminlayout" })
    })

    } catch (error) {
      next(error)
    }

    
  },

  logout: (req, res) => {
    console.log('lllllllllllll')
    req.session.destroy()
    res.redirect('/admin')
  },

  viewOrder: async (req, res,next) => {
    try {
      let orders = await adminHelpers.getAllOrders()
      // console.log(orders,"orders in admin");
      res.render('admin/viewOrder', { layout: "adminlayout", orders })
    } catch (error) {
      next(error)
    }
   
  },

  cancelOrder: (req, res,next) => {
    try {
      let product = (req.params.id)
    console.log(product, 'productIddddddddddddddddddddddddddddddddddddd');
    adminHelpers.cancelOrder(product).then((response) => {
      res.redirect('/admin/order')
    })

    } catch (error) {
      next(error)
    }
    
  },

  changeStatus: (req, res) => {
    let orderId = (req.params.id)
    let status = (req.params.status)
    adminHelpers.changeStatus(orderId, status).then((response) => {
      res.redirect('/admin/order')
    })

  },

  viewCoupon: async (req, res ,next) => {
    try {
      let coupon = await adminHelpers.getAllCoupon()
    console.log(coupon, "coupon")
    res.render('admin/view-coupons', { layout: 'adminlayout', coupon })
    } catch (error) {
      next(error)
    }
    
  },

  addCoupon: (req, res ,next) => {
    try {
      res.render('admin/add-coupon', { layout: 'adminlayout' })
    } catch (error) {
      next(error)
    }

  
  },

  postAddCoupon: (req, res) => {
    console.log(req.body);
    adminHelpers.addCoupon(req.body).then(async (response) => {
      if (response.Exist) {
        req.session.couponError = true
        req.flash('exist', 'This Coupon is already Added')
        res.redirect('/admin/add-coupon')
      } else {
        req.session.couponError = false
        req.flash('success', 'Added succesfully')
        res.redirect('/admin/add-coupon')
      }
    })
  },

  deleteCoupon: (req, res) => {
    console.log(req.params.id, "paramsId");
    adminHelpers.deleteCoupon(req.params.id)
    res.redirect('/admin/coupon')
  },

  banner: async (req, res ,next) => {
    try {
      let banners = await adminHelpers.getAllBanner()
    console.log(banners, "banners")
    res.render('admin/banner', { layout: 'adminlayout', banners })
    } catch (error) {
      next(error)
    }
    
  },

  // getBanner:(req,res)=>{
  // re/s
  // },
  postAddBanner: (req, res) => {

    console.log(req.files, "files");
    console.log(req.body, "body");
    adminhelpers.addBanner(req.body).then((id) => {
      let image = req.files.image
      image.mv('./public/banner-image/' + id + '.jpg', (err, done) => {
        if (!err) {
          res.redirect('/admin/banner')
        } else {
          console.log(err)
        }
      })
    })
  },

  editBanner: async(req, res,next) => {
    try {
      console.log("edit bannessr rout");
      let banner=await adminhelpers.bannerDetails(req.params.id)
      // adminHelpers.updateBanner(banner)
      console.log(banner, "...........");
  
      res.render('admin/edit-banner', { banner, layout: 'adminLayout' })
    } catch (error) {
      next(error)
    }
   
  },

  deletebanner: (req, res) => {
    let banner = (req.params.id)
    // console.log("category");
    console.log(banner,'banner');
    adminHelpers.deletebanner(banner).then((response) => {
      res.redirect('/admin/banner')

    })
  },

  postEditBanner: (req, res) => {
    console.log("ssssssssssss");
    adminhelpers.updateBanner(req.params.id, req.body).then(() => {
      let id = req.params.id
      if (req?.files?.image) {
        let image = req.files.image
        image.mv('./public/banner-image/' + id + '.jpg')
      }
      res.redirect('/admin/banner')

    })
  },

  salesReport: async (req, res ,next) => {
    try {
      let orders = await adminHelpers.getAllOrders()
    let profit = orders.total / 10
    console.log(profit, 'profit');
    res.render('admin/salesReport', { layout: 'adminlayout', profit, orders })
    } catch (error) {
      next(error)
    }
    
  },
  viewOrderProduct: async (req, res,next) => {
    // log(11111111111111111111111111)
    console.log(req.params.id, "req.paraaaaams")
    let products = await userhelpers.getAllOrderProducts(req.params.id)
    console.log(products, 58514);
    res.render('admin/orderedProducts', { layout :'adminlayout',admin: req.session.admin, products })

  },








}
