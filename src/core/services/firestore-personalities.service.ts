import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { limit, orderBy, query, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PersonalityPost {
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
export class FirestorePersonalitiesService {
  private personalitiesCollection;

  constructor(@Inject('FIRESTORE_STANDARD') private firestore: Firestore) {
    this.personalitiesCollection = collection(this.firestore, 'personalities');
  }

  getAllPersonalities(): Observable<PersonalityPost[]> {
    return (collectionData(this.personalitiesCollection, { idField: 'id' } as any) as Observable<PersonalityPost[]>).pipe(
      map(personalities => {
        return personalities.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  // Busca limitando a quantidade
  getLimitedPersonalities(l: number): Observable<PersonalityPost[]> {
    const q = query(
      this.personalitiesCollection,
      limit(l)
    );
    
    return (collectionData(q, { idField: 'id' } as any) as Observable<PersonalityPost[]>).pipe(
      map(personalities => {
        return personalities.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  // Navegação: Personalidade Anterior
  getPreviousPersonality(order: number): Observable<PersonalityPost | null>{
    const q = query(
      this.personalitiesCollection,
      where('order', '<', order),
      orderBy('order', 'desc'),
      limit(1)
    );
    return (collectionData(q, { idField: 'id' } as any) as Observable<PersonalityPost[]>).pipe(
      map(items => items.length > 0 ? items[0] : null)
    );
  }

  // Navegação: Próxima Personalidade
  getNextPersonality(order: number): Observable<PersonalityPost | null>{
    const q = query(
      this.personalitiesCollection,
      where('order', '>', order),
      orderBy('order', 'asc'),
      limit(1)
    );
    return (collectionData(q, { idField: 'id' } as any) as Observable<PersonalityPost[]>).pipe(
      map(items => items.length > 0 ? items[0] : null)
    );
  }
 
  // Busca por ID
  getPersonalityById(id: string): Observable<PersonalityPost | undefined> {
    const docRef = doc(this.firestore, `personalities/${id}`);
    return docData(docRef, { idField: 'id' } as any) as Observable<PersonalityPost | undefined>;
  }

  addPersonality(personality: PersonalityPost): Promise<any> {
    const dataWithTimestamp = { ...personality, createdAt: new Date() };
    return addDoc(this.personalitiesCollection, dataWithTimestamp);
  }

  updatePersonality(id: string, personality: Partial<PersonalityPost>): Promise<void> {
    const docRef = doc(this.firestore, `personalities/${id}`);
    return updateDoc(docRef, personality);
  }

  deletePersonality(id: string): Promise<void> {
    const docRef = doc(this.firestore, `personalities/${id}`);
    return deleteDoc(docRef);
  }
}