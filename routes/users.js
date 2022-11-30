const express = require('express');
const { response } = require('../app');
const router = express.Router();
const userhelpers = require('../Helpers/userHelpers')
const adminHelpers = require('../Helpers/adminHelpers');
const otphelpers = require('../Helpers/otphelper')
const { blockUser } = require('../Helpers/adminHelpers');
const { Db } = require('mongodb');
const categoryhelpers = require('../Helpers/categoryhelpers');
const cartHelpers = require('../Helpers/cartHelpers');
const session = require('express-session');
const { wishlistProducts } = require('../Helpers/cartHelpers');
const userController = require('../controllers/userController');
const { BANNER_COLLECTION } = require('../confiq/collections');




const userVerified = (async (req, res, next) => {
  if (req.session.user) {
    let user = await userhelpers.getUserDetails(req.session.user._id)
    if (user.blocked) {
      req.session.loggedIn = false
      req.session.user = null
      res.redirect('/login')
    } else {
      next()
    }
  } else {
    res.redirect('/login')
  }
})


/* GET home page. */
router.get('/', userController.homepage)

// signup
router.get('/signup', userController.signUp)
router.post('/signup', userController.postSignup)

// OTP
router.get('/otp', userController.otp)
router.post('/otp', userController.postOtp)

// LOGIN
router.get('/login', userController.login)
router.post('/login', userController.postLogin)

// Home
router.get('/home', userController.home)

// CART  
router.get('/cart', userVerified, userController.cart)
router.get('/add-cart/:id', userController.addCart)
router.post('/remove-cart', userController.removeCart)
router.post('/change-product-quantity', userController.changeQuantity)

// CHECKOUT
router.get('/checkout', userVerified, userController.checkout)
// router.get('/checkot/:id', userVerified, userController.)
router.post('/checkout/:total', userController.postCheckout)
router.post('/verify-payment',userController.verifyPayment)
router.get('/conformation',userVerified, userController.confirm)
router.get('/viewOrders',userVerified, userController.viewOrder)
router.get('/viewOrderProducts/:id',userVerified, userController.viewOrderProduct)
router.get('/sample',userController.sample)
router.get('/cancelOrder/:id',userVerified,userController.cancelOrder)


router.get('/invoice/:id',userController.invoice)


// shop
router.get('/shop', userController.shop)
router.get('/category-shop/:category', userController.categoryShop)
router.get('/product_details/:id', userController.productDetails)

//WISHLIST
router.get('/wishlist', userVerified, userController.wishlist)
router.get('/add-wishlist/:id', userController.addwishlist)
router.delete('/remove-wishlist/:id', userController.removeWishlist)

// USER PROFILE
router.get('/user-profile',userVerified, userController.userProfile)

//ADDRESS

router.get('/Address',userVerified,userController.address)
router.post('/addAddress',userController.addAddress)
router.get('/remove-address/:id',userVerified,userController.removeAddress)
router.post('/get-edit-address', userController.getEditAddress)

//COUPON
router.post('/apply-coupon',userController.applycoupon)


// LOGOUT
router.get('/logout', userController.logout)

module.exports = router;
