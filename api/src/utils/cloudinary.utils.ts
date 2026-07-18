import cloudinary from "@/config/cloudinary";

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folderName: string,
  publicId?: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: publicId,
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve((result as any).secure_url);
      },
    );
      uploadStream.end(fileBuffer);
  });
};