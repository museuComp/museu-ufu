import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';
import { NavigationService } from '@app/services/navigation.service';

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
  coverFileName: string | null = null;

  // Variáveis para validação de imagem
  readonly MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB em bytes
  coverImageError: string | null = null;

  categories = [
    'Vídeo-Documentário',
    'Entrevista',
    'Educativo',
    'Institucional',
    'Cobertura de Evento',
    'Outro'
  ];

  private firestoreVideosService = inject(FirestoreVideosService);
  readonly nav = inject(NavigationService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      videoUrl: ['', [Validators.required, Validators.minLength(3)]],
      coverUrl: ['', Validators.required],
      writer: ['', Validators.required],          // Novo campo: Redator
      coverSource: [''],                          // Novo campo: Fonte da Capa
      coverSourceLink: [''],                      // Novo campo: Link da Fonte
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
            writer: (videoData.summary as any).writer || '',
            coverSource: (videoData.summary as any).coverSource || '',
            coverSourceLink: (videoData.summary as any).coverSourceLink || '',
            contributors: videoData.contributors?.join(', ') || '',
            guests: videoData.guests?.join(', ') || '',
          });

          this.coverFileName = videoData.summary.coverUrl ? 'Imagem Carregada' : null;
        } else {
          console.error('Vídeo para edição não encontrado');
          this.router.navigate([this.nav.route('dashboard/videos')]);
        }
      });
    }
  }

  onSubmit(): void {
    // Marcamos tudo como tocado para exibir erros caso clique em salvar sem preencher
    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      return;
    }

    const formValue = this.videoForm.value;

    const videoData: Partial<Video> = {
      summary: {
        title: formValue.title,
        coverUrl: formValue.coverUrl,
        category: formValue.category,
        writer: formValue.writer,                     // Salvando o redator
        coverSource: formValue.coverSource || '',     // Salvando texto da fonte
        coverSourceLink: formValue.coverSourceLink || '' // Salvando link da fonte
      } as any,
      videoUrl: formValue.videoUrl,
      description: formValue.description,
      contributors: formValue.contributors ? formValue.contributors.split(',').map((s: string) => s.trim()) : [],
      guests: formValue.guests ? formValue.guests.split(',').map((s: string) => s.trim()) : []
    };

    if (this.editMode && this.videoId) {
      videoData.createdAt = Date.now();

      this.firestoreVideosService.updateVideoPost(this.videoId, videoData)
        .then(() => {
          this.router.navigate([this.nav.route('dashboard/videos')]);
        })
        .catch(error => console.error('Erro ao atualizar vídeo:', error));
    } else {
      this.firestoreVideosService.addVideoPost(videoData as Video)
        .then(docRef => {
          console.log('✅ Documento salvo com ID:', docRef.id);
          this.router.navigate([this.nav.route('dashboard/videos')]);
        })
        .catch(error => console.error('Erro ao criar vídeo:', error));
    }

    this.router.navigate([this.nav.route('dashboard/videos')]);
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.coverImageError = null; // Reseta o erro anterior

    if (file) {
      // VALIDAÇÃO: Tamanho máximo (1MB)
      if (file.size > this.MAX_IMAGE_SIZE) {
        this.coverImageError = 'A imagem excede o tamanho máximo permitido de 1MB.';
        input.value = ''; // Limpa o input
        this.videoForm.get('coverUrl')?.setErrors({ 'maxSize': true });
        return;
      }

      // VALIDAÇÃO: Tipo de arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.coverImageError = 'Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.';
        input.value = ''; // Limpa o input
        this.videoForm.get('coverUrl')?.setErrors({ 'invalidType': true });
        return;
      }

      // Se passou nas validações, converte para Base64
      const reader = new FileReader();
      reader.onload = () => {
        this.videoForm.patchValue({ coverUrl: reader.result as string });
        this.coverFileName = file.name;
        this.videoForm.get('coverUrl')?.setErrors(null);
      };
      reader.readAsDataURL(file);
    }
  }

  cancel(): void {
    this.router.navigate([this.nav.route('dashboard/videos')]);
  }
}