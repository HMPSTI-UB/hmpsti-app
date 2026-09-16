"use server"

import { v2 as cloudinary } from 'cloudinary';
import { requireUser } from "./_guards";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteImageFromCloudinary(imageUrl: string) {
  await requireUser();

  if (!imageUrl) return;

  try {
    const urlParts = imageUrl.split('/upload/');
    if (urlParts.length !== 2) {
      throw new Error("Invalid Cloudinary URL format");
    }

    const pathPart = urlParts[1];
    const withoutVersion = pathPart.replace(/^v\d+\//, '');
    const publicId = withoutVersion.substring(0, withoutVersion.lastIndexOf('.'));

    if (!publicId) {
      throw new Error("Could not extract public_id from URL");
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary API error: ${result.result}`);
    }
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    throw new Error("Gagal menghapus gambar produk di Cloudinary");
  }
}
