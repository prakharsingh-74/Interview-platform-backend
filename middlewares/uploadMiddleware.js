const multer = require("multer");

//conifgure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
},
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

//file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); //accept file
    } else {
        cb(new Error("only .jpeg, .png and .jpg formats are allowed"), false); //reject file
    }
}

const upload = multer({storage, fileFilter});
module.exports=upload;