export default class Player {
    constructor(gameWidth, gameHeight, type) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 40;
        this.height = 50;
        
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight - 100;
        
        this.speed = 0.3; 
        this.type = type;
    }

    update(input, deltaTime) {
        // Trava de segurança: impede que o boneco teletransporte se você mudar de aba
        if (!deltaTime) deltaTime = 16;
        if (deltaTime > 100) deltaTime = 100;

        const velocity = this.speed * deltaTime;

        if (input.isMovingUp()) this.y -= velocity;
        if (input.isMovingDown()) this.y += velocity;
        if (input.isMovingLeft()) this.x -= velocity;
        if (input.isMovingRight()) this.x += velocity;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.gameWidth) this.x = this.gameWidth - this.width;
        if (this.y < 290) this.y = 290; 
        if (this.y + this.height > this.gameHeight) this.y = this.gameHeight - this.height;
    }

    draw(ctx) {
        const cx = this.x + this.width / 2; 
        const ty = this.y; 

        const skin = '#c68642';
        const hair = this.type === 'girl' ? '#552200' : '#4e342e';
        const shirt = this.type === 'girl' ? '#4caf50' : '#1976d2'; 
        const pants = this.type === 'girl' ? '#4caf50' : '#3e2723'; 
        const shoes = '#3e2723';

        // Cabeça
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.arc(cx, ty + 12, 14, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'girl') {
            // Cabelo Menina (Franja e Rabo de Cavalo)
            ctx.fillStyle = hair;
            ctx.beginPath();
            ctx.arc(cx, ty + 8, 15, Math.PI, 0);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(cx + 16, ty + 18, 7, 12, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();

            // Vestido 
            ctx.fillStyle = shirt;
            ctx.beginPath();
            ctx.moveTo(cx - 10, ty + 24);
            ctx.lineTo(cx + 10, ty + 24);
            ctx.lineTo(cx + 20, ty + 50); 
            ctx.lineTo(cx - 20, ty + 50);
            ctx.fill();

            // Pernas e botas
            ctx.fillStyle = skin;
            ctx.fillRect(cx - 8, ty + 50, 6, 10);
            ctx.fillRect(cx + 2, ty + 50, 6, 10);
            ctx.fillStyle = shoes;
            ctx.fillRect(cx - 10, ty + 56, 10, 6);
            ctx.fillRect(cx, ty + 56, 10, 6);

        } else {
            // Cabelo Menino
            ctx.fillStyle = hair;
            ctx.beginPath();
            ctx.arc(cx, ty + 8, 15, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(cx - 15, ty + 7, 30, 9); 

            // Camisa 
            ctx.fillStyle = shirt;
            ctx.fillRect(cx - 14, ty + 24, 28, 20);

            // Calça e Botas
            ctx.fillStyle = pants;
            ctx.fillRect(cx - 12, ty + 44, 10, 14);
            ctx.fillRect(cx + 2, ty + 44, 10, 14);
            
            ctx.fillStyle = shoes;
            ctx.fillRect(cx - 14, ty + 52, 14, 6);
            ctx.fillRect(cx, ty + 52, 14, 6);
        }

        // Braços 
        ctx.fillStyle = shirt;
        ctx.fillRect(cx - 20, ty + 26, 8, 14);
        ctx.fillRect(cx + 12, ty + 26, 8, 14);
        
        ctx.fillStyle = skin;
        ctx.fillRect(cx - 20, ty + 40, 8, 6);
        ctx.fillRect(cx + 12, ty + 40, 8, 6);
    }
    
    getBounds() {
        return {
            x: this.x - 10, 
            y: this.y,
            width: this.width + 20,
            height: this.height + 10
        };
    }
}