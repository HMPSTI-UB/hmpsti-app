"use server"

import { v2 as cloudinary } from 'cloudinary';
import { auth } from "@/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'assets/hmpsti/pameran' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image"));
        } else {
          resolve({ secure_url: result.secure_url });
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}
