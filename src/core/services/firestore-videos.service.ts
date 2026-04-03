import { Inject, Injectable } from "@angular/core";
import { addDoc, collectionData, docData, Firestore } from "@angular/fire/firestore";
import { collection, deleteDoc, doc, limit, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators'; // <-- Importação necessária para a ordenação

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
    createdAt?: any; // Mantido genérico para aceitar o serverTimestamp
    order?: number;  // Adicionado para salvar a posição do arrastar e soltar
};

@Injectable({
    providedIn: 'root'
})
export class FirestoreVideosService {
    private videosCollection;
    
    // RESTAURADO: Usando o seu token específico para não quebrar a conexão
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
        // ADICIONADO: O pipe e map para ordenar os vídeos automaticamente
        return (collectionData(this.videosCollection, {idField: 'id'}) as Observable<Video[]>).pipe(
            map(videos => {
                return videos.sort((a, b) => (a.order || 0) - (b.order || 0));
            })
        );
    }

    getLimitedVideos(l:number): Observable<Video[]> {
        const q = query(this.videosCollection, orderBy('order','asc'), limit(l));
        return collectionData(q as any, { idField: 'id' }) as Observable<Video[]>
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