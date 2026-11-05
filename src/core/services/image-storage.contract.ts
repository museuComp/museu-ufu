import { InjectionToken } from '@angular/core';

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

export const IMAGE_STORAGE =
  new InjectionToken<ImageStorageService>('IMAGE_STORAGE');
