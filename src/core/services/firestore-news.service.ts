import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Adicionamos a importação do map

export interface NewsPost {
  id?: string; 
  order?: number; // <-- 1. Adicionamos a propriedade order
  summary: {
    title: string;
    description: string;
    category: string;
    mainImage: string; 
  };
  fullContent: Array<{ type: 'title' | 'text' | 'image'; content: string }>;
  createdAt?: Date; 
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreNewsService {
  private firestore: Firestore = inject(Firestore);
  private newsCollection = collection(this.firestore, 'news'); 

  constructor() { }

  // 2. Atualizamos o getAllNews para já entregar tudo ordenado
  getAllNews(): Observable<NewsPost[]> {
    return (collectionData(this.newsCollection, { idField: 'id' }) as Observable<NewsPost[]>).pipe(
      map(news => {
        // Ordena as notícias baseado no campo 'order'. 
        // Se a notícia for antiga e não tiver 'order', assume 0.
        return news.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  getNewsById(id: string): Observable<NewsPost | undefined> {
    const newsDocRef = doc(this.firestore, `news/${id}`);
    return docData(newsDocRef, { idField: 'id' }) as Observable<NewsPost | undefined>;
  }

  addNews(news: NewsPost): Promise<any> {
    // Quando criar uma nova, também podemos garantir que ela tenha um timestamp
    const newsWithTimestamp = { ...news, createdAt: new Date() };
    return addDoc(this.newsCollection, newsWithTimestamp);
  }

  updateNews(id: string, news: Partial<NewsPost>): Promise<void> {
    const newsDocRef = doc(this.firestore, `news/${id}`);
    return updateDoc(newsDocRef, news);
  }

  deleteNews(id: string): Promise<void> {
    const newsDocRef = doc(this.firestore, `news/${id}`);
    return deleteDoc(newsDocRef);
  }
  

}