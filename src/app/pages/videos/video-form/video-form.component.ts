import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';

interface ContentItem {
  id: string;
  type: 'title' | 'text' | 'image';
  content: string;
}


@Component({
  selector: 'app-video-form',
  templateUrl: './video-form.component.html',
  styleUrls: ['./video-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    DragDropModule
  ]
})
export class VideoFormComponent implements OnInit {
  videoForm: FormGroup;
  editMode = false;
  videoId: string | null = null;
  fullContent: ContentItem[] = [];
  coverFileName: string | null = null;

  categories = [
    'Vídeo-Documentário',
    'Entrevista',
    'Educativo',
    'Institucional',
    'Cobertura de Evento',
    'Outro'
  ];

  private firestoreVideosService = inject(FirestoreVideosService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.videoForm = this.fb.group({
      // Campos para a versão resumida (box)
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      videoUrl: ['', [Validators.required, Validators.minLength(3)]],
      coverUrl: [''],
      description: [''],
      contributors: [''],
      guests: ['']
    });
  }


  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');
    if (this.videoId) {
        this.editMode = true;

        this.firestoreVideosService.getVideoById(this.videoId).subscribe(videoData => {
            if (videoData) {
                this.videoForm.patchValue({
                    title: videoData.summary.title,
                    category: videoData.summary.category,
                    coverUrl: videoData.summary.coverUrl,
                    videoUrl: videoData.videoUrl,
                    description: videoData.description,
                    contributors: videoData.contributors?.join(',') || '',
                    guests: videoData.guests?.join(',') || '',
                });

                this.coverFileName = videoData.summary.coverUrl ? 'Imagem Carregada' : null;
            }
            else {
                console.error('Vídeo para edição não encontrada');
                this.router.navigate(['/videos']);
            }
        });
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.videoForm.valid)  return;

    if (!this.videoForm.value.coverUrl) {
      alert('Imagem de capa não selecionada');
      return;
    }


    try {
      if(this.editMode && this.videoId) {
        const coverUrl = this.videoForm.value.coverUrl;
        const videoData: Partial<Video> = {
            summary: {
                title: this.videoForm.value.title,
                coverUrl: coverUrl,   // URL pública
                category: this.videoForm.value.category
            },
            videoUrl: this.videoForm.value.videoUrl,
            description: this.videoForm.value.description,
            contributors: this.videoForm.value.contributors
              ? this.videoForm.value.contributors.split(',')
              : [],
            guests: this.videoForm.value.guests
              ? this.videoForm.value.guests.split(',')
              : [],
            createdAt: Date.now()
        };

        await this.firestoreVideosService.updateVideoPost(this.videoId, videoData);
        this.router.navigate(['/dashboard']);
        return;
      }

      const videoData: Video = {
        summary: {
            title: this.videoForm.value.title,
            coverUrl: this.videoForm.value.coverUrl,   // URL pública
            category: this.videoForm.value.category
        },
        videoUrl: this.videoForm.value.videoUrl,
        description: this.videoForm.value.description,
        contributors: this.videoForm.value.contributors
          ? this.videoForm.value.contributors.split(',')
          : [],
        guests: this.videoForm.value.guests
          ? this.videoForm.value.guests.split(',')
          : []
      };

    console.log('Form Value:', this.videoForm.value);
    console.log('Data to Firestore:', JSON.stringify(videoData, null, 2));

     const docRef = await this.firestoreVideosService.addVideoPost(videoData);
     console.log('✅ Documento salvo com ID:', docRef.id);
    
    this.router.navigate(['/dashboard']);
  } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
  }
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.videoForm.get('coverUrl')?.setErrors({ invalidType: true });
      this.coverFileName = 'Erro: Tipo não suportado';
      return;
    }

    if (file.size > 500000) { // ~500KB
      alert('Imagem muito grande (máx 500KB)');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      this.videoForm.patchValue({
        coverUrl: base64
    });

    this.coverFileName = file.name;
  };

  reader.readAsDataURL(file);
}

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
