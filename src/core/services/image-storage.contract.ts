export interface ImageUploadResult {
  url: string;
  path: string;
}

export interface ImageStorageService {
  uploadImage(
    file: File,
    folder: string
  ): Promise<ImageUploadResult>;

  deleteImage(path: string): Promise<void>;
}
