import { inject, Injectable } from "@angular/core";
import { TranslocoService } from "@jsverse/transloco";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
    private readonly transloco = inject(TranslocoService);

    route(path:string) : string {
        const lang = this.transloco.getActiveLang();
        return `/${lang}/${path}`;
    }
}