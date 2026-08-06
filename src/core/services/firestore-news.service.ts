import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { CollectionReference, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NewsPost {
  id?: string; 
  order?: number; 
  summary: {
    title: string;
    description: string;
    category: string;
    mainImage: string;
    writer: string; 
  };
  fullContent: Array<{ type: 'title' | 'text' | 'image'; content: string; 
    imageSource?: string; imageSourceLink?: string;}>;
  createdAt?: any; 
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreNewsService {
  private newsCollection: CollectionReference<NewsPost>;

  constructor(@Inject('FIRESTORE_STANDARD') private firestore: Firestore) {
    this.newsCollection = collection(this.firestore, 'news') as CollectionReference<NewsPost>;
  }

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

  getLimitedNews(l:number): Observable<NewsPost[]> {
    const q = query(this.newsCollection, orderBy('order', 'asc'), limit(l));
    return collectionData(q, { idField: 'id' }) as Observable<NewsPost[]>
  }

  getPreviousNews(order: number): Observable<NewsPost | null> {
    const q = query(
      this.newsCollection,
      where('order', '<', order),
      orderBy('order', 'desc'),
      limit(1)
    );
    const data = (collectionData(q, { idField: 'id' }) as Observable<NewsPost[]>)
      .pipe(map(items => (items as NewsPost[])[0] ?? null));
    return data;
  }

  getNextNews(order: number): Observable<NewsPost | null>{
      const q = query(
        this.newsCollection,
        where('order', '>', order),
        orderBy('order', 'asc'),
        limit(1)
      );
      const data = (collectionData(q, { idField: 'id' }) as Observable<NewsPost[]>)
        .pipe(map(items => (items as NewsPost[])[0] ?? null));
      return data;
  }
 
  getNewsById(id: string): Observable<NewsPost | undefined> {
    const newsDocRef = doc(this.firestore, `news/${id}`);
    return docData(newsDocRef, { idField: 'id' }) as Observable<NewsPost | undefined>;
  }

  addNews(news: NewsPost): Promise<any> {
    // Quando criar uma nova, também podemos garantir que ela tenha um timestamp
    const newsWithTimestamp = { ...news, createdAt: serverTimestamp()};
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