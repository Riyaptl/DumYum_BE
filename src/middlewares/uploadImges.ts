
import multer from 'multer';

// Multer configuration for handling multiple file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {            
        cb(null, `uploads/${req.query.page}`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});

// Initialize Multer upload with the configured options
const upload = multer({ storage: storage });

// Middleware function to handle multiple file uploads
export const uploadImagesMiddleware = upload.array('images', 5);