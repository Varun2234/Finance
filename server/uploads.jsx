const multer = require('multer');
const path = require('path');

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

// A filter to allow only specific image types
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!'); // Send an error if the file is not an image
  }
}

// Initialize upload variable
const upload = multer({
  storage: storage,
  // Set file size limit (e.g., 1MB)
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('receipt'); // 'receipt' is the field name for the file in the form

module.exports = upload;
