import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: 'app-video-player',
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements OnInit {
    @Input("src") videoUrlRaw: string;
    @Input("title") videoTitle: string  ="Vídeo sem título";
    videoUrl: SafeUrl;

    constructor(private sanitizer: DomSanitizer) {}
    ngOnInit(): void {
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/" + this.videoUrlRaw.split("?v=")[1]);
    }
}