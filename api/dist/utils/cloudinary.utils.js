import cloudinary from "@/config/cloudinary";
export const uploadToCloudinary = async (fileBuffer, folderName, publicId) => {
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
};
export const deleteFromCloudinary = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
    });
};
