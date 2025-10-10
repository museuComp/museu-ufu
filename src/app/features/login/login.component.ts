import { Component, inject } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from '@shared/directives/button';
import { AlertService } from '@shared/components/alert/alert.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { FeedbackDirective } from '@shared/directives/feedback';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [InputComponent, ReactiveFormsModule, ButtonDirective, FeedbackDirective],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    router = inject(Router);
    private _alertService = inject(AlertService);
    private _authService = inject(AuthService);

    formLogin = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });

    submit() {
        if (this.formLogin.invalid) {
            this.formLogin.markAllAsTouched();
            return;
        }

        const credentials = this.formLogin.getRawValue();

        this._authService.login(credentials).subscribe({
            next: response => {
                if (response) {
                    this._alertService.clearAlerts();
                    this.router.navigate(['/dashboard']); 
                } else {
                    this._alertService.showAlert('danger', 'Usuário ou senha inválidos.', undefined, false);
                }
            },
            error: err => {
                const errorMessage = err.error?.detail || 'Usuário ou senha inválidos.';
                this._alertService.showAlert('danger', errorMessage, undefined, false);
            },
        });
    }
}