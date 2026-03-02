import { Component, Input } from "@angular/core";
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from "@angular/material/card";
import { VideoPlayerComponent } from "@app/shared/components/video-player/video-player.component";

@Component({
    selector: 'app-video-detail',
    standalone: true,
    templateUrl: './video-detail.component.html',
    styleUrl: './video-detail.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, VideoPlayerComponent, MatCardFooter]
})
export class VideoDetailComponent{
}