import cloudinary from "../../../config/cloudinary.js";
export class UploadService {
    async uploadImage(fileBuffer, folderName, publicId) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: folderName,
                public_id: publicId,
                allowed_formats: ["jpg", "png", "jpeg", "webp"],
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result?.secure_url || "");
            });
            uploadStream.end(fileBuffer);
        });
    }
    async deleteImage(publicId) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
        });
    }
}
