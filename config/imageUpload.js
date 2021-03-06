// Media files handler
const multer = require('multer');
const fs = require('fs');
const mime = require('mime');


// Base64 Image handler
const uploadImage = (req, res, next) => {

    if (req.body.photo) {

        let matches = req.body.photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let response = {};

        if (matches) {
            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.data = Buffer.from(matches[2], 'base64');
            let decodedImg = response;
            let imageBuffer = decodedImg.data;
            let type = decodedImg.type;
            let extension = mime.getExtension(type);
            let fileName = new Date().toISOString() + req._id + "image." + extension;
            try {
                fs.writeFileSync("./uploads/" + fileName, imageBuffer, 'utf8');

            } catch (e) {
                next(e);
            }
            req.body.photo = 'uploads/' + fileName;
        }
    }


    next();
};

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        // Random string for image name
        let randomString = Math.random().toString(36).substr(2, 5);
        callback(null, new Date().toISOString() + randomString + file.originalname);
    }
});

// Фильтр для обработки входной картинки
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        //null - вместо него может быть сообщение об ошибке
        callback(null, true);
    } else {
        req.fileValidationError = 'Wrong mimetype, only JPG and PNG files accepted';
        return callback(null, false, new Error('Wrong mimetype, only JPG/PNG files accepted'));
    }
};


const multerUpload = multer({
    storage: storage,
    fileFilter: fileFilter

});


module.exports = {
    fileImageHandler: multerUpload,
    base64ImageHandler: uploadImage
}
