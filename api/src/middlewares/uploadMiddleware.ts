import multer from "multer";
import { BadRequestError } from "@/utils/errors/errorCustomize";

import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Chỉ cho phép định dạng ảnh (JPG, PNG, WEBP...)."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});
