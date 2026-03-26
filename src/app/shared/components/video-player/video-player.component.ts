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
        const videoId = this.extractYoutubeId(this.videoUrlRaw);
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    }

    private extractYoutubeId(url: string): string | null {
        if (!url) return null;

        // Formato: youtube.com/watch?v=ID
        const watchMatch = url.match(/[?&]v=([^&]+)/);
        if (watchMatch) return watchMatch[1];

        // Formato: youtu.be/ID
        const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
        if (shortMatch) return shortMatch[1];

        // Formato: youtube.com/embed/ID
        const embedMatch = url.match(/embed\/([^?&]+)/);
        if (embedMatch) return embedMatch[1];

        return null;
    }
}