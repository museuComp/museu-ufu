import { Inject, Injectable } from "@angular/core";
import { addDoc, collectionData, docData, Firestore } from "@angular/fire/firestore";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators'; // <-- Importação necessária para a ordenação

export interface Video {
    id?: string;
    summary: {
        title: string,
        coverUrl: string,
        category: string,
        writer: string;             // Novo campo obrigatório (Atividade 6)
        coverSource?: string;       // Novo campo opcional (Atividade 6)
        coverSourceLink?: string;   // Novo campo opcional (Atividade 6)
    };
    videoUrl: string;
    description?: string;
    contributors?: Array<string>;
    guests?: Array<string>;
    createdAt?: any; 
    order?: number;  
};

@Injectable({
    providedIn: 'root'
})
export class FirestoreVideosService {
    private videosCollection;
    
    // RESTAURADO: Usando o seu token específico para não quebrar a conexão
    constructor(@Inject('FIRESTORE_STANDARD') private firestore : Firestore) {
        this.videosCollection = collection(this.firestore, 'videos');
    }  

    async addVideoPost(video: Video): Promise<any> {
        const q = query(this.videosCollection, orderBy('order', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        let nextOrder = 1; // Valor padrão se a coleção estiver vazia

        if (!querySnapshot.empty) {
            const lastVideo = querySnapshot.docs[0].data() as Video;
            // Pega o maior 'order' existente e soma 1
            nextOrder = (lastVideo.order || 0) + 1;
        }

        const videoComplete = {
            ...video,
            order: nextOrder,
            createdAt: serverTimestamp()
        };

        return addDoc(this.videosCollection, videoComplete);
    }

    getPreviousVideo(order: number): Observable<Video | null>{
        const q = query(
          this.videosCollection,
          where('order', '<', order),
          orderBy('order', 'desc'),
          limit(1)
        );
        const data = (collectionData(q as any, { idField: 'id' }) as Observable<Video[]>)   
            .pipe(map(items => (items as Video[])[0] ?? null));
        return data;
      }
    
      getNextVideo(order: number): Observable<Video | null>{
        const q = query(
          this.videosCollection,
          where('order', '>', order),
          orderBy('order', 'asc'),
          limit(1)
        );
        const data = (collectionData(q as any, { idField: 'id' }) as Observable<Video[]>)   
            .pipe(map(items => (items as Video[])[0] ?? null));

        return data;
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