import { inject, Injectable } from "@angular/core";
import { deleteObject, getDownloadURL, ref, Storage, uploadBytes } from "@angular/fire/storage";

@Injectable({
    providedIn: 'root'
})
export class FireStorageImagesService {
    private storage: Storage = inject(Storage);

    async uploadImage(file: File, folder: string): Promise<{url: string, path:string}> {
        const fileName = `${Date.now()}-${file.name}`;
        const path = `${folder}/${fileName}`;
        const storageRef = ref(this.storage, path);

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        return {url, path}
    }

    async deleteImage(path: string): Promise<void> {
        const storageRef = ref(this.storage, path);
        await deleteObject(storageRef);
    }
}