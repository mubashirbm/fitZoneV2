
const multer = require('multer')

//set storage

var imageStorage  = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'public/multer-images/category-images')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'--' + file.originalname)
    }
})

const uploadCategory = multer({storage:imageStorage})

module.exports = uploadCategory