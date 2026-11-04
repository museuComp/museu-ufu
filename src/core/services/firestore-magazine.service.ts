import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { limit, orderBy, query } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Magazine {
  id?: string;
  order?: number;

  title: string;
  coverImageUrl: string;
  year: number;
  pages: string[];
  pdfUrl: string;

  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreMagazineService {

  private readonly firestore: Firestore = inject(Firestore);
  private readonly magazinesCollection = collection(this.firestore, 'magazines');

  constructor() {}

  getAllMagazines(): Observable<Magazine[]> {
    return (collectionData(this.magazinesCollection, { idField: 'id' }) as Observable<Magazine[]>).pipe(
      map(magazines => {
        return magazines.sort((a, b) => (a.order || 0) - (b.order || 0));
      })
    );
  }

  getLimitedMagazines(l: number): Observable<Magazine[]> {
    const q = query(
      this.magazinesCollection,
      orderBy('order', 'asc'),
      limit(l)
    );

    return collectionData(q, { idField: 'id' }) as Observable<Magazine[]>;
  }

  getMagazineById(id: string): Observable<Magazine | undefined> {
    const magazineDocRef = doc(this.firestore, `magazines/${id}`);

    return docData(magazineDocRef, { idField: 'id' }) as Observable<Magazine | undefined>;
  }

  addMagazine(magazine: Magazine): Promise<any> {
    const magazineWithTimestamp = {
      ...magazine,
      createdAt: new Date()
    };

    return addDoc(this.magazinesCollection, magazineWithTimestamp);
  }

  updateMagazine(id: string, magazine: Partial<Magazine>): Promise<void> {
    const magazineDocRef = doc(this.firestore, `magazines/${id}`);

    return updateDoc(magazineDocRef, magazine);
  }

  deleteMagazine(id: string): Promise<void> {
    const magazineDocRef = doc(this.firestore, `magazines/${id}`);

    return deleteDoc(magazineDocRef);
    }

} 