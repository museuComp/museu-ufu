import {Component, inject} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutRoutingModule } from "@app/pages/about/about-routing.module";
import { NavigationService } from '@app/services/navigation.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-perfis-nav',
  imports: [AboutRoutingModule, RouterLink, TranslocoModule],
  templateUrl: './perfis-nav.component.html',
  styleUrl: './perfis-nav.component.scss'
})
export class PerfisNavComponent {
  readonly nav = inject(NavigationService);
}
