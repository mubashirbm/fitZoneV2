const { ObjectID } = require('bson');
const { query, Router } = require('express');
const express = require('express');
const flash = require('flash');
const { Db } = require('mongodb');
const { response, request } = require('../app');
const { adminHomepage, adminLogin, adminPOstLogin, adminSignUp, adminPostSignUp, postAddProduct, viewProduct, editProduct, postEditProduct, deleteProduct, viewUser, category, addCategory, deleteCategory, categoryProduct, logout } = require('../controllers/adminController');
const adminController = require('../controllers/adminController');
const { addProduct, blockUser, unblockUser } = require('../Helpers/adminHelpers');
const adminHelpers = require('../Helpers/adminHelpers');
const router = express.Router();
const adminhelpers = require('../Helpers/adminHelpers')
const categoryHelpers = require('../Helpers/categoryhelpers')
const multer=require('multer')
/* GET admin listing. */

/* For Product Images  */
var fileStorageEngine = multer.diskStorage({

  destination: (req, file, cb) => {
    console.log("000000000000000000000000000000000000");
    cb(null, './public/product-Images')
  },
  filename: (req, file, cb) => {
    console.log(file,"file");
    cb(null, Date.now() + '--' + file.originalname)
  }
})

var upload = multer({ storage: fileStorageEngine })



const adminVerified = ((req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
})


// HOMEPAGE
router.get('/', adminVerified, adminController.adminHomepage)



//LOGIN
router.get('/login', adminController.adminLogin)
router.post('/login', adminController.adminPOstLogin)

// SIGNUP 
router.get('/signup', adminController.adminSignUp)
router.post('/signup', adminController.adminPostSignUp)

// PRODUCT PAGE
router.get('/add-product', adminVerified, adminController.addProduct)
// router.post('/add-product',upload.array('Image', 3), adminController.postAddProduct)
router.post('/add-product',adminVerified, upload.array('image', 3),adminController.postAddProduct)
router.get('/view-products', adminVerified, adminController.viewProduct)
router.get('/edit-product/:id', adminVerified, adminController.editProduct)
router.post('/edit-product/:id',upload.array('image', 3), adminController.postEditProduct)
router.get('/delete-product/:id', adminVerified,adminController.deleteProduct)

// USER MANAGEMENT
router.get('/view-user', adminVerified, adminController.viewUser)
router.get('/block-user/:id', adminVerified, adminController.blockUser)
router.get('/unblock-user/:id', adminVerified, adminController.unblockUser)

// CATEGORY
router.get('/category', adminVerified, adminController.category)
router.post('/add-category', adminController.addCategory)
router.get('/delete-category/:id', adminVerified, adminController.deleteCategory)

// Categorized Products
router.get('/category-product/:category', adminVerified, adminController.categoryProduct)

// ORDER MANAGEMENT
router.get('/view-order',adminVerified,adminController.viewOrder)
router.get('/ViewOrderdProducts/:id',adminController.viewAdminOrderProduct)
router.get('/cancelOrder/:id',adminController.cancelOrder)
router.get('/changeStatus/:id/:status',adminController.changeStatus)

router.get('/coupon',adminController.viewCoupon)
router.get('/add-coupon',adminController.addCoupon)
router.post('/add-coupon',adminController.postAddCoupon)
router.get('/delete-coupon/:id',adminController.deleteCoupon)

//BANNER
router.get('/banner',adminController.banner)
router.post('/add-banner',adminController.postAddBanner)
router.get('/delete-banner/:id',adminController.deletebanner)
router.get('/edit-banner/:id',adminController.editBanner)
router.post('/edit-banner',adminController.postEditBanner)

// REPORT
router.get('/report',adminController.salesReport)

// LOGOUT    
router.get('/adminlogout', adminVerified, adminController.logout)


/* For Admin Error Page */
router.use(function (req, res, next) {
  next(createError(404));
});

// router.use(function (err, req, res, next) {
//   console.log("admin error route handler")
//   res.status(err.status || 500);
//   res.render('admin/admin-error',{layout:'error'});
// });




module.exports = router;
