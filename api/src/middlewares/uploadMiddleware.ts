import multer from "multer";
import { BadRequestError } from "@/utils/errors/errorCustomize";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        "Chỉ cho phép định dạng ảnh (JPG, PNG, WEBP...).",
      ) as any,
      false,
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});
