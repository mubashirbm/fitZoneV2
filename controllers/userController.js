const adminHelpers = require('../Helpers/adminHelpers')
const otphelpers = require('../Helpers/otphelper')
const userhelpers = require('../Helpers/userHelpers')
const cartHelpers = require('../Helpers/cartHelpers')
const categoryhelpers = require('../Helpers/categoryhelpers')
const { response } = require('../app');



module.exports = {


  sample: (req, res) => {
    res.render('user/sample', { user: req.session.user })
  },

  homepage: async (req, res, next) => {
    try {
      console.log("came to /");
      let user = req.session.user
      let cartcount = null
      console.log("1");
      await adminHelpers.getAllProduct().then(async (products) => {
        await adminHelpers.getAllBanner().then(async (banner) => {
          console.log(products, "product getting");
          if (req.session.user) {
            cartcount = await cartHelpers.getCartCount(user._id)
          }
          console.log(cartcount, "here");
          res.render('user/home', { user, products, cartcount, banner })
        })
      })


    } catch (error) {
      console.log(error);
      next(error)
    }


  },
  signUp: (req, res) => {
    try {
      console.log("2");
      res.render('user/signup', { 'signupErr': req.session.signupErr })
      req.session.signupErr = false

    } catch (error) {
      console.log(error);
      next(error)
    }

  },
  postSignup: (req, res) => {
    try {
      console.log('100');
      // console.log(req.body, "req.body");
      userhelpers.verifyUser(req.body).then((response) => {
        console.log('200');
        console.log("response");
        // console.log(response)
        if (response.userexist) {
          console.log('300');
          req.session.signupErr = true
          res.redirect('/signup')
        } else {
          otphelpers.doSms(req.body)
          console.log('400');
          req.session.user1 = req.body
          console.log('500');
          res.redirect('/otp')
        }

      }
      )

    } catch (error) {
      console.log(error)
      next(error)

    }

  },

  otp: (req, res, next) => {
    try {
      res.render('user/otp', { 'signupErr': req.session.signupErr })
      req.session.signupErr = false

    } catch (error) {
      console.log(error)
      next(error)
    }

  },

  postOtp: async (req, res, next) => {
    try {
      console.log(req.session.user1, 'kkkkkllljjj');
      let result = await otphelpers.otpVerify(req.body, req.session.user1)
      console.log('600');
      if (result) {
        console.log('700');
        console.log(result)
        console.log('result')
        let log = await userhelpers.doSignup(req.session.user1)
        console.log('800');

        res.redirect('/login')
      } else {
        req.session.signupErr = true
        res.redirect('/signup')
      }

    } catch (error) {
      console.log(error)
      next(error)

    }


  },

  login: (req, res, next) => {
    try {
      console.log("4");
      if (req.session.userloggedIn) {
        console.log("44");
        res.redirect('/')
      } else {
        console.log("444");
        res.render('user/login', { 'logErr': req.session.logErr })
        console.log("4444");
        req.session.logErr = false
      }

    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  postLogin: (req, res, next) => {
    try {
      userhelpers.doLogin(req.body).then((response) => {
        // console.log(console)
        if (response.status) {
          req.session.userloggedIn = true
          req.session.user = response.user
          console.log("5");
          res.redirect('/')
          console.log(("redirected"));
        } else {
          req.session.logErr = true
          console.log("6");
          res.redirect('/login')
        }
      })
    } catch (error) {
      console.log(error)
      next(error)
    }

  },

  home: (req, res, next) => {
    try {
      console.log("7");
      res.redirect('/')

    } catch (error) {
      console.log(error)
      next(error)
    }

  },

  cart: async (req, res, next) => {
    try {
      let empty = true
      let Total = 0
      await cartHelpers.cartProducts(req.session.user._id).then(async (products) => {
        // console.log(products, "gfyuhldkhflfdj;kdskfdk");
        if (products.length > 0) {
          Total = await cartHelpers.cartTotalAmount(req.session.user._id)
          // console.log(Total, "total in cart");
          empty = false
        }
        if (req.session.user) {
          cartcount = await cartHelpers.getCartCount(req.session.user._id)
          // console.log(products,"products");
        }
        res.render('user/cart', { user: req.session.user, cartcount, empty, products, Total })
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  addCart: (req, res, next) => {
    try {
      console.log('userVerified');

      if (req.session.user) {
        cartHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
          if (response.exist) {
            res.json({ exist: true })
          } else {
            res.json({ exist: false })
          }

        })
      } else {
        res.json({ login: true })
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  removeCart: (req, res, next) => {
    try {
      console.log('delet');
      // console.log(req.body, 'req.body');
      cartHelpers.removeFromCart(req.body).then((response) => {
        console.log('deleted');
        // console.log(response);
        res.json({ status: true })
      })
    } catch (error) {
      console.log(error)
      next(error)
    }

  },

  changeQuantity: (req, res, next) => {
    try {
      console.log("ajax recieved 54345354");
      cartHelpers.changeProductQuantity(req.body).then(async (response) => {
        //carttotal function
        response.status = true
        let total = await cartHelpers.getCartTotal(req.session.user._id)
        response.total = total.total
        res.json(response)
      })

    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  checkout: async (req, res, next) => {
    try {
      console.log("checkout");
      let products = await cartHelpers.cartProducts(req.session.user._id)

      //  let singleProductPrice = await cartHelpers.cartProducts(req.session.user._id)
      //  console.log(singleProductPrice,"single product Price");

      let total = await cartHelpers.cartTotalAmount(req.session.user._id)
      // let address=await userhelpers.getAddress
      // console.log(products,"products,total");
      res.render('user/checkout', { user: req.session.user, total, products })

    } catch (error) {
      console.log(error)
      next(error)
    }

  },

  postCheckout: async (req, res, next) => {
    try {
      // console.log(req.params.id,'address paras');
      let products = await cartHelpers.getcartProducts(req.session.user._id)


      console.log(products, '......products');
      let total = req.params.total
      // console.log(req.params.price,'tttt');
      let order = req.body
      let price = await userhelpers.getSingleOrder(req.params.id)
      // console.log(order,"order");


      await userhelpers.placeOrder(order, products, total,price).then(async (response) => {
        // console.log(req.body,"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
        orderedUser = response
        // console.log(req.body.method, "req.body.paymentMethod");
        if (req.body.method == 'Cash On Delivery') {
          // console.log("cash on de");
          res.json({ codSuccess: true })
        } else {
          // console.log("online");
          // console.log(response, total, "/////////////////////////////////////////////");
          await userhelpers.generateRazorpay(response, total).then((response) => {
            // console.log(response, 'respoooooooooooooooooo');
            res.json(response)
          })
        }
        // console.log(response, "response Id");
        // orderedUser=response
        // console.log((orderedUser, "qqqqqqqqqqqqqqqq"));
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  verifyPayment: (req, res, next) => {
    try {
      userhelpers.verifyPayment(req.body).then(() => {
        // console.log("verify  payment");
        userhelpers.changeOrderStatus(req.body['order[receipt]']).then(() => {
          console.log('23');
          res.json({ status: true })
        })
      }).catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" })
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  confirm: async (req, res, next) => {

    try {
      let order = await userhelpers.getOrderDetails(orderedUser)
      // console.log(order, "order details");
      let products = await cartHelpers.cartProducts(req.session.user._id)
      userhelpers.removeOrderedProduct(order)
      // console.log(products,"after checkout");
      // let total = await cartHelpers.cartTotalAmount(req.session.user._id)
      res.render('user/conformation', { user: req.session.user, products, order })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  viewOrder: async (req, res, next) => {
    console.log("here");
    try {
      let orders = await userhelpers.getAllOrderDetails(req.session.user._id)
      console.log(orders, "orders after placed");
      res.render('user/viewOrders', { user: req.session.user, orders })
    } catch (error) {
      console.log(error);
      next(error)

    }
  },

  viewOrderProduct: async (req, res, next) => {
    console.log(req.params.id, "req.paraaaaams")
    let products = await userhelpers.getAllOrderProducts(req.params.id)

    // console.log(products, 58514);
    res.render('user/orderedProducts', { user: req.session.user, products })

  },

  cancelOrder: (req, res) => {
    let product = (req.params.id)
    // console.log(product,'productIddddddddddddddddddddddddddddddddddddd');
    adminHelpers.cancelOrder(product).then((response) => {
      res.redirect('/viewOrders')
    })

  },

  shop: async (req, res, next) => {
    try {
      console.log(("shop"));
      // if(req.session.user){
      let cartcount = 0
      // console.log(user)


      await adminHelpers.getAllProduct().then(async (products) => {
        await categoryhelpers.getAllCategory().then(async (category) => {

          if (req.session.user) {
            console.log('entered wishlist ')
            cartcount = await cartHelpers.getCartCount(req.session.user._id)
            console.log("getting count");
          }
          res.render('user/shop', { user: req.session.user, category, products, cartcount })
        })
      })

    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  categoryShop: async (req, res, next) => {
    try {
      let cat = (req.params.category)
      let cartcount = null
      console.log((cat));
      await adminHelpers.getCategoryProduct(cat).then(async (products) => {
        await categoryhelpers.getAllCategory().then(async (category) => {
          if (req.session.user) {
            console.log('entered wishlist ')
            cartcount = await cartHelpers.getCartCount(req.session.user._id)
            console.log("getting count");
          }
          res.render('user/category-shop', { user: req.session.user, cartcount, products, category })
        })
      })

    } catch (error) {
      console.log(error);
      next(error)
    }

  },

  productDetails: (req, res, next) => {
    try {
      adminHelpers.prodoductDetails(req.params.id).then((product) => {
        // console.log(product);
        // if (req.session.user) {
        res.render('user/product_details', { product, user: req.session.user })
        // } else {
        // res.redirect('/')
        // }
      })
    } catch (error) {
      console.log(error)
      next(error)
    }

  },

  wishlist: async (req, res, next) => {
    try {
      console.log('wishlist1');
      let empty = false
      let products = await cartHelpers.wishlistProducts(req.session.user._id)
      // console.log(products);
      let cartcount = null
      if (req.session.user) {
        console.log('entered wishlist ')
        cartcount = await cartHelpers.getCartCount(req.session.user._id)
        console.log(cartcount, "getting count");
      }
      if (products.length == 0) {
        empty = true
      }
      console.log(empty, 'status of empty');
      res.render('user/wishlist', { user: req.session.user, empty, products, cartcount })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  addwishlist: (req, res, next) => {
    try {

      console.log("qqqqqqqqqqqqqqqqqqqqqq");
      if (req.session.user) {
        cartHelpers.addToWishlist(req.params.id, req.session.user._id).then((response) => {
          if (response.exist) {
            res.json({ exist: true })
          } else {
            res.json({ exist: false })
          }
        })
      } else {
        res.json({ login: true })
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  removeWishlist: (req, res, next) => {
    try {

      console.log('delet');
      // console.log(req.params.id);
      cartHelpers.removeWishlist(req.params.id, req.session.user._id).then((response) => {
        console.log('deleted');
        // console.log(response);
        res.json({ status: true })
      })
    } catch (error) {
      console.log(error);
      next(error)
    }

  },

  userProfile: async (req, res, next) => {
    try {
      let cancel = false
      console.log('entered wishlist ')
      cartcount = await cartHelpers.getCartCount(req.session.user._id)
      // address= await userhelpers.getAddress(req.session.user._id)
      // console.log(address,"address");
      // console.log(req.session.user,'Ith user aan');
      let userDetails = await userhelpers.getUserDetails(req.session.user._id)
      console.log("getting count");
      res.render('user/user-profile', { user: userDetails, cartcount })

    } catch (error) {
      console.log(error);
      next(error)
    }
  },


  address: (req, res) => {
    res.render('user/address', { user: req.session.user })
  },

  addAddress: (req, res, next) => {
    try {
      let address = userhelpers.addAddress(req.body, req.session.user._id)
      // console.log(address);
      res.redirect('/user-Profile')
    } catch (error) {
      next(error)
      console.log(error)

    }
  },
  removeAddress: (req, res) => {
    user = (req.session.user._id)
    address = (req.params.id)
    //  user=req.session.user._id

    //  console.log(address,"address,user");
    userhelpers.removeAddress(address, user)

    res.redirect('/user-profile')
  },

  logout: (req, res) => {
    req.session.destroy()
    res.redirect('/')
  },
  getEditAddress: async (req, res, next) => {
    try {
      let user = req.body.userId
      let addresId = req.body.addressId
      // console.log(req.body);
      let response = await userhelpers.getAddress(user, addresId)
      res.json(response)
    } catch (error) {
      console.log(error);
      next(error)
    }
  },
  applycoupon: async (req, res) => {
    console.log('heeeeerrrrrrrrrreeeeeeeeee');
    // console.log(req.body);
    let coupon = req.body.couponName
    let user = req.body.userId
    // console.log(req.body);
    // console.log(coupon,'coo');
    // console.log(user,'uuu');

    let response = await userhelpers.applycoupon(coupon, user)
    // console.log(response,'response');
    if (response.code) {
      req.session.code = response.code
    }
    res.json(response)
  },
  invoice: async (req, res, next) => {
    try {
        let products = await userhelpers.getOrderProducts(req.params.id)
        let order = await userhelpers.getSingleOrder(req.params.id)
        res.render('user/user-Invoice', { products, order })
    } catch (error) {
        console.log(error);
        next(error)
    }
},
}