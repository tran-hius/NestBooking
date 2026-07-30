export interface IUploadService {
  uploadImage(fileBuffer: Buffer, folderName: string, publicId?: string): Promise<string>;
  deleteImage(publicId: string): Promise<void>;
}
