import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  console.log("Testing Cloudinary upload with:");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("API Key:", process.env.CLOUDINARY_API_KEY);
  console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "****" : "MISSING");

  try {
    // Create a 1x1 pixel transparent PNG base64 for testing
    const tinyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    
    const result = await cloudinary.uploader.upload(tinyBase64, {
      folder: "villamarket/test"
    });
    console.log("Upload success:", result.secure_url);
  } catch (error) {
    console.error("\n--- EXACT CLOUDINARY ERROR ---");
    console.error(error);
  }
}

testUpload();
