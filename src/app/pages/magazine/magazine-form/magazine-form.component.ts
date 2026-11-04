import { Component, inject, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import {
  FirestoreMagazineService,
  Magazine
} from '../../../../core/services/firestore-magazine.service';

import {
  FireStorageImagesService
} from '../../../../core/services/firestorage-images.service';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-magazine-form',
  standalone: true,
  templateUrl: './magazine-form.component.html',
  styleUrls: ['./magazine-form.component.scss'],

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})

export class MagazineFormComponent implements OnInit {

  magazineForm: FormGroup;

  isEditMode = false;
  magazineId: string | null = null;

  coverFileName: string | null = null;
  pdfFileName: string | null = null;

  coverFile: File | null = null;
  pdfFile: File | null = null;

  isSaving = false;

  submitError: string | null = null;

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  coverError: string | null = null;
  pdfError: string | null = null;

  private originalMagazine: Magazine | null = null;

  private firestoreMagazineService =
    inject(FirestoreMagazineService);

  private fireStorageImagesService =
    inject(FireStorageImagesService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {

    const currentYear = new Date().getFullYear();

    this.magazineForm = this.fb.group({

      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      year: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{4}$/),
          Validators.min(1900),
          Validators.max(currentYear + 1)
        ]
      ],

      coverImageUrl: ['', Validators.required],

      pdfUrl: ['', Validators.required]

    });

  }

  ngOnInit(): void {

    this.magazineId = this.route.snapshot.paramMap.get('id');

    if (this.magazineId) {

      this.isEditMode = true;

      this.firestoreMagazineService
        .getMagazineById(this.magazineId)
        .pipe(take(1))
        .subscribe({

          next: magazine => {

            if (magazine) {

              this.originalMagazine = magazine;

              this.magazineForm.patchValue({

                title: magazine.title,
                year: magazine.year,
                coverImageUrl: magazine.coverImageUrl,
                pdfUrl: magazine.pdfUrl

              });

              this.coverFileName = magazine.coverImageUrl
                ? 'Capa atual mantida'
                : null;

              this.pdfFileName = magazine.pdfUrl
                ? 'PDF atual mantido'
                : null;

            } else {

              this.submitError = 'Revista não encontrada.';

              this.router.navigate(['/dashboard/magazines']);

            }

          },

          error: error => {

            console.error('Erro ao carregar revista:', error);

            this.submitError =
              'Não foi possível carregar a revista.';

          }

        });

    }

  }

  onCoverChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.coverError = null;

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      this.coverFile = null;

      this.coverFileName = this.originalMagazine?.coverImageUrl
        ? 'Capa atual mantida'
        : null;

      this.coverError =
        'Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.';

      input.value = '';

      return;

    }

    if (file.size > this.MAX_FILE_SIZE) {

      this.coverFile = null;

      this.coverFileName = this.originalMagazine?.coverImageUrl
        ? 'Capa atual mantida'
        : null;

      this.coverError =
        'A capa excede o tamanho máximo de 10 MB.';

      input.value = '';

      return;

    }

    this.coverFile = file;

    this.coverFileName = file.name;

  }

  onPdfChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.pdfError = null;

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {

      this.pdfFile = null;

      this.pdfFileName = this.originalMagazine?.pdfUrl
        ? 'PDF atual mantido'
        : null;

      this.pdfError =
        'O arquivo precisa estar no formato PDF.';

      input.value = '';

      return;

    }

    if (file.size > this.MAX_FILE_SIZE) {

      this.pdfFile = null;

      this.pdfFileName = this.originalMagazine?.pdfUrl
        ? 'PDF atual mantido'
        : null;

      this.pdfError =
        'O PDF excede o tamanho máximo de 10 MB.';

      input.value = '';

      return;

    }

    this.pdfFile = file;

    this.pdfFileName = file.name;

  }

  async onSubmit(): Promise<void> {

    if (this.magazineForm.invalid || this.isSaving) {

      this.magazineForm.markAllAsTouched();

      return;

    }

    this.submitError = null;

    this.coverError = null;

    this.pdfError = null;

    if (!this.isEditMode && !this.coverFile) {

      this.coverError = 'Selecione a capa da revista.';

      return;

    }

    if (!this.isEditMode && !this.pdfFile) {

      this.pdfError = 'Selecione o PDF da revista.';

      return;

    }

    this.isSaving = true;

    let uploadedCoverPath: string | null = null;

    let uploadedPdfPath: string | null = null;

    try {

      const formValue = this.magazineForm.value;

      let coverImageUrl = formValue.coverImageUrl;

      let pdfUrl = formValue.pdfUrl;

      if (this.coverFile) {

        const coverUpload =
          await this.fireStorageImagesService.uploadImage(
            this.coverFile,
            'magazines/covers'
          );

        coverImageUrl = coverUpload.url;

        uploadedCoverPath = coverUpload.path;

      }

      if (this.pdfFile) {

        const pdfUpload =
          await this.fireStorageImagesService.uploadImage(
            this.pdfFile,
            'magazines/pdfs'
          );

        pdfUrl = pdfUpload.url;

        uploadedPdfPath = pdfUpload.path;

      }

      const magazine: Magazine = {

        title: formValue.title,

        year: Number(formValue.year),

        coverImageUrl: coverImageUrl,

        pdfUrl: pdfUrl,

        pages: this.originalMagazine?.pages ?? [],

        ...(this.originalMagazine?.order !== undefined
          ? { order: this.originalMagazine.order }
          : {})

      };

      if (this.isEditMode && this.magazineId) {

        await this.firestoreMagazineService.updateMagazine(
          this.magazineId,
          magazine
        );

      } else {

        await this.firestoreMagazineService.addMagazine(magazine);

      }

    } catch (error) {

      console.error('Erro ao salvar revista:', error);

      this.submitError =
        'Não foi possível salvar a revista. Verifique sua conexão e tente novamente.';

      if (uploadedCoverPath) {

        try {

          await this.fireStorageImagesService.deleteImage(
            uploadedCoverPath
          );

        } catch (cleanupError) {

          console.error(
            'Erro ao remover capa temporária:',
            cleanupError
          );

        }

      }

      if (uploadedPdfPath) {

        try {

          await this.fireStorageImagesService.deleteImage(
            uploadedPdfPath
          );

        } catch (cleanupError) {

          console.error(
            'Erro ao remover PDF temporário:',
            cleanupError
          );

        }

      }

      return;

    } finally {

      this.isSaving = false;

    }

    await this.router.navigate(['/dashboard/magazines']);

  }

  cancel(): void {

    this.router.navigate(['/dashboard/magazines']);

  }

}