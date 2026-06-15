import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';

/** Initialize Cloudinary SDK with environment credentials */
export function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

/** Upload a file buffer to Cloudinary and return the URL + public ID */
export async function uploadFile(
  fileBuffer: Buffer,
  folder: string = 'task-attachments'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      )
      .end(fileBuffer);
  });
}

/** Delete a file from Cloudinary by its public ID */
export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
