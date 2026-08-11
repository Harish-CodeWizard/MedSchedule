import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    return {
      folder: 'hospital/xrays',
      format: 'png', // Convert all to PNG or keep original
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' }
      ]
    };
  },
});

export { cloudinary, storage };