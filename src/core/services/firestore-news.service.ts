import { Injectable, inject, Inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { limit, orderBy, query, where, CollectionReference } from 'firebase/firestore';
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
  fullContent: Array<{ type: 'title' | 'text' | 'image'; content: string; imageSource?: string; imageSourceLink?: string; }>;
  createdAt?: Date; 
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreNewsService {
  private newsCollection: CollectionReference<NewsPost>;

  constructor(@Inject('FIRESTORE_STANDARD') private firestore: Firestore) {
    this.newsCollection = collection(this.firestore, 'news') as CollectionReference<NewsPost>;
  }

  // Busca todas as personalidades
  getAllPersonalities(): Observable<NewsPost[]> {
    return collectionData(this.newsCollection, { idField: 'id' }).pipe(
      map(personalities => {
        return personalities.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  // Busca somente notícias
  getNews(): Observable<NewsPost[]> {
    const q = query(
      this.newsCollection,
      where('summary.category', '!=', 'Personalidades'),
      orderBy('summary.category')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(news => {
        return news.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  // Busca somente personalidades
  getPersonalities(): Observable<NewsPost[]> {
    const q = query(
      this.newsCollection,
      where('summary.category', '==', 'Personalidades'),
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(news => {
        return news.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  getLimitedPersonalities(l: number): Observable<NewsPost[]> {
    const q = query(
      this.newsCollection,
      where('summary.category', '==', 'Personalidades')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(news => {
        return news.sort((a, b) => (a.order || 0) - (b.order || 0))
          .slice(0, l);
      })
    );
  }

  getLimitedNews(l: number): Observable<NewsPost[]> {
    const q = query(
      this.newsCollection,
      where('summary.category', '!=', 'Personalidades'),
      orderBy('summary.category'),
      limit(l)
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(news => {
        return news.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  getPreviousNews(order: number): Observable<NewsPost | null> {
    const q = query(
      this.newsCollection,
      where('order', '<', order),
      orderBy('order', 'desc'),
      limit(15)
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(items =>
        items.find(item => item.summary.category !== 'Personalidades') ?? null
      )
    );
  }

  getNextNews(order: number): Observable<NewsPost | null> {
    const q = query(
      this.newsCollection,
      where('order', '>', order),
      orderBy('order', 'asc'),
      limit(15)
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(items =>
        items.find(item => item.summary.category !== 'Personalidades') ?? null
      )
    );
  }
 
  getNewsById(id: string): Observable<NewsPost | undefined> {
    const newsDocRef = doc(this.firestore, `news/${id}`);
    return docData(newsDocRef, { idField: 'id' }) as Observable<NewsPost | undefined>;
  }

  addNews(news: NewsPost): Promise<any> {
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