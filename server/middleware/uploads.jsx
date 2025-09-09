const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = './uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  // Destination for files
  destination: './uploads/',
  // Define the filename
  filename: function (req, file, cb) {
    // cb is a callback function (error, filename)
    // Create a unique filename: fieldname-timestamp.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Updated filter to allow both images and PDF files
function checkFileType(file, cb) {
  // Allowed extensions - added PDF support
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mime type - added PDF mime type
  const mimetype = /image\/(jpeg|jpg|png|gif)|application\/pdf/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only images (JPEG, JPG, PNG, GIF) and PDF files are allowed!');
  }
}

// Initialize upload variable with increased file size limit for PDFs
const upload = multer({
  storage: storage,
  // Increased file size limit to 5MB to accommodate PDF files
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('receipt'); // 'receipt' is the field name for the file in the form

module.exports = upload;