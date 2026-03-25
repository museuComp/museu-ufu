import { Inject, Injectable } from "@angular/core";
import { addDoc, collectionData, docData, Firestore } from "@angular/fire/firestore";
import { collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Observable } from "rxjs";

export interface Video {
    id?: string;
    summary: {
        title: string,
        coverUrl: string,
        category: string
    };
    videoUrl: string;
    description?: string;
    contributors?: Array<string>;
    guests?: Array<string>;
    createdAt?: number;
};

@Injectable({
    providedIn: 'root'
})
export class FirestoreVideosService {
    private videosCollection;
    
    constructor(@Inject('FIRESTORE_VIDEOS') private firestore : Firestore) {
        this.videosCollection = collection(this.firestore, 'videos');
    }  

    addVideoPost(video: Video): Promise<any> {
        const videoComplete = {
            ...video,
            createdAt: serverTimestamp()
        };

        return addDoc(this.videosCollection, videoComplete);
    }

    getAllVideos(): Observable<Video[]> {
        return collectionData(this.videosCollection, {idField: 'id'}) as Observable<Video[]>;
    }

    getVideoById(id: string): Observable<Video | undefined> {
        const video = doc(this.firestore, `videos/${id}`);

        return docData(video, {idField: 'id'}) as Observable<Video | undefined>;
    }

    updateVideoPost(id: string, video: Partial<Video>): Promise<void> {
        const videoComplete = doc(this.firestore, `videos/${id}`);

        return updateDoc(videoComplete, video);
      }
    
    deleteVideo(id: string): Promise<void> {
        const video = doc(this.firestore, `videos/${id}`);

        return deleteDoc(video);
    }
}