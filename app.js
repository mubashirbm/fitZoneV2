const createError = require('http-errors');
require('dotenv').config()
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nocache=require('nocache')
const Swal=require('sweetalert2')
 
// const paginate = require('handlebars-paginate');


const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

const app = express();
// const fileUpload = require('express-fileupload')
const db=require('./confiq/connection')
const session=require('express-session')
const hbs=require('express-handlebars')
const flash=require('connect-flash')



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({helpers:{inc: function (value, options){return parseInt(value) +1;}},extname: 'hbs',defaultLayout: 'userLayout', layoutsDir:__dirname + '/views/layout',partialsDir:__dirname+' /views/partials/'}));



// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload())



app.use(function(req,res,next){
  res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  next();
})




//session
let oneDay=1000*60*60*24
app.use(session({secret:'key',
        cookie:{maxAge:oneDay}}))

app.use(nocache())
app.use(flash())

//Database Connection
db.connect((err)=>{
  if(err)console.log("database error"+err)
else console.log("database connected to Local");  
})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{layout:"error.hbs"});
});

module.exports = app;
