const multer = require('multer')

//set storage

var imageStorage  = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'public/multer-images/product-images')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'--' + file.originalname)
    }
})

const upload = multer({storage:imageStorage})

module.exports = upload