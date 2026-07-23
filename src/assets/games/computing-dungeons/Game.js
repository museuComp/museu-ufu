import Player from './Player.js';
import InputHandler from './InputHandler.js';
import { questions } from './questions.js';
import { playSuccessSound, playErrorSound, playWinSound } from './SoundHelper.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameWidth = canvas.width;
        this.gameHeight = canvas.height;
        
        this.player = null; 
        this.input = new InputHandler();
        
        this.currentQuestionIndex = 0;
        this.gameState = 'MENU'; 
        
        this.selectedQuestions = [];
        
        this.questionEl = document.getElementById('question-text');
        this.statusEl = document.getElementById('status-msg');
        this.doorOptionsEl = document.getElementById('door-options');

        this.doors = [];
        this.setupDoors();
    }

    start(characterType) {
        this.player = new Player(this.gameWidth, this.gameHeight, characterType);
        
        this.selectedQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
        
        this.currentQuestionIndex = 0;
        this.gameState = 'PLAYING';
        this.loadQuestion();
    }

    setupDoors() {
        const doorWidth = 90;
        const spacing = this.gameWidth / 3;
        
        this.doors = [
            { x: spacing * 0.5 - doorWidth/2, y: 200, w: doorWidth, h: 120, id: 0 },
            { x: spacing * 1.5 - doorWidth/2, y: 200, w: doorWidth, h: 120, id: 1 },
            { x: spacing * 2.5 - doorWidth/2, y: 200, w: doorWidth, h: 120, id: 2 }
        ];
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.selectedQuestions.length) {
            this.gameState = 'WIN';
            playWinSound(); 
            // Mostra a Tela de Vitória em HTML e esconde o texto da pergunta
            document.getElementById('victory-screen').style.display = 'flex';
            document.getElementById('ui-layer').style.display = 'none';
            // Move o foco para o título, garantindo que o leitor de tela anuncie a vitória
            const victoryTitle = document.getElementById('victory-title');
            if (victoryTitle) victoryTitle.focus();
            return;
        }

        const q = this.selectedQuestions[this.currentQuestionIndex];
        this.questionEl.innerText = q.text;
        this.renderDoorOptions(q);
        
        this.player.x = this.gameWidth / 2 - this.player.width / 2;
        this.player.y = this.gameHeight - 100;
    }

    // Cria botões reais (não desenhados no canvas) com o texto de cada porta,
    // para que leitores de tela consigam anunciar e selecionar as alternativas.
    renderDoorOptions(q) {
        if (!this.doorOptionsEl) return;
        this.doorOptionsEl.innerHTML = '';
        this.doorOptionsEl.style.display = '';
        q.options.forEach((optionText, index) => {
            if (!optionText) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'door-answer-btn';
            btn.textContent = `Porta ${index + 1}: ${optionText}`;
            btn.setAttribute('aria-label', `Responder pela porta ${index + 1}: ${optionText}`);
            btn.addEventListener('click', () => this.checkAnswer(index));
            this.doorOptionsEl.appendChild(btn);
        });
    }

    update(deltaTime) { 
        if (this.gameState !== 'PLAYING') return;

        this.player.update(this.input, deltaTime);
        const pBounds = this.player.getBounds();

        this.doors.forEach(door => {
            if (
                pBounds.x < door.x + door.w &&
                pBounds.x + pBounds.width > door.x &&
                pBounds.y < door.y + door.h &&
                pBounds.y + pBounds.height > door.y + door.h - 20
            ) {
                this.checkAnswer(door.id);
            }
        });
    }

    checkAnswer(answerIndex) {
        if (this.gameState !== 'PLAYING') return;
        const correctIndex = this.selectedQuestions[this.currentQuestionIndex].correct;

        if (answerIndex === correctIndex) {
            playSuccessSound(); 
            this.showCuriosity(); // Chama a tela pop-up em vez de pular direto
        } else {
            playErrorSound(); 
            this.player.y += 120; 
            this.statusEl.innerText = "Resposta Incorreta!";
            this.statusEl.style.color = "#ff4444";
            setTimeout(() => { this.statusEl.innerText = ""; }, 2000);
        }
    }

    // Pausa o jogo e mostra o pop-up
    showCuriosity() {
        this.gameState = 'PAUSED'; // Impede o boneco de andar
        const q = this.selectedQuestions[this.currentQuestionIndex];
        document.getElementById('curiosity-text').innerText = q.curiosity;
        document.getElementById('curiosity-modal').style.display = 'flex';
        // Esconde as alternativas enquanto o modal estiver aberto, evitando que o
        // leitor de tela navegue até botões de uma pergunta já respondida
        if (this.doorOptionsEl) this.doorOptionsEl.style.display = 'none';
        const curiosityTitle = document.getElementById('curiosity-title');
        if (curiosityTitle) curiosityTitle.focus();
    }

    // Chamada quando o jogador clica em "Avançar"
    nextRoom() {
        this.currentQuestionIndex++;
        this.gameState = 'PLAYING'; // Libera o movimento
        this.loadQuestion();
    }

    drawEnvironment() {
        this.ctx.fillStyle = '#5c3a21'; 
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        this.ctx.strokeStyle = '#3e2723'; 
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.gameWidth; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.gameHeight);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#4a555c';
        this.ctx.fillRect(0, 0, this.gameWidth, 320);
        this.ctx.fillStyle = '#37474f';
        this.ctx.fillRect(0, 320, this.gameWidth, 15); 
    }

    drawDoor(door) {
        this.ctx.fillStyle = '#78909c';
        this.ctx.beginPath();
        this.ctx.arc(door.x + door.w/2, door.y, door.w/2 + 15, Math.PI, 0);
        this.ctx.lineTo(door.x + door.w + 15, door.y + door.h);
        this.ctx.lineTo(door.x - 15, door.y + door.h);
        this.ctx.fill();
        this.ctx.strokeStyle = '#3e2723'; 
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(door.x - 15, door.y, door.w + 30, door.h); 

        this.ctx.fillStyle = '#8d6e63';
        this.ctx.beginPath();
        this.ctx.arc(door.x + door.w/2, door.y, door.w/2, Math.PI, 0);
        this.ctx.lineTo(door.x + door.w, door.y + door.h);
        this.ctx.lineTo(door.x, door.y + door.h);
        this.ctx.fill();

        this.ctx.strokeStyle = '#5d4037';
        this.ctx.lineWidth = 2;
        for(let i=1; i<4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(door.x + (door.w/4)*i, door.y - door.w/2 + 10);
            this.ctx.lineTo(door.x + (door.w/4)*i, door.y + door.h);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#424242';
        this.ctx.fillRect(door.x, door.y + 20, door.w, 12);
        this.ctx.fillRect(door.x, door.y + door.h - 30, door.w, 12);

        this.ctx.strokeStyle = '#ffca28'; 
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(door.x + door.w/2, door.y + door.h/2 + 10, 8, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawSpeechBubble(text, x, y) {
        this.ctx.font = "bold 14px 'Courier New'";
        const textWidth = this.ctx.measureText(text).width;
        const paddingX = 15;
        const boxW = textWidth + paddingX * 2;
        const boxH = 30;
        const boxX = x - boxW / 2;
        const boxY = y - boxH - 10;

        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(boxX, boxY, boxW, boxH);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#000';
        this.ctx.strokeRect(boxX, boxY, boxW, boxH);

        this.ctx.beginPath();
        this.ctx.moveTo(x - 8, boxY + boxH);
        this.ctx.lineTo(x + 8, boxY + boxH);
        this.ctx.lineTo(x, boxY + boxH + 8);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, x, boxY + 20);
    }

    draw() {
        // limpa a tela e desenha o chão/parede da masmorra
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        this.drawEnvironment();

        // desenha as 3 portas base
        this.doors.forEach(door => {
            this.drawDoor(door);
        });

        if (this.gameState !== 'PLAYING') return;

        // Desenha as plaquinhas com o texto apenas se estiver na partida
        if (this.selectedQuestions.length > 0 && this.selectedQuestions[this.currentQuestionIndex]) {
            const currentQ = this.selectedQuestions[this.currentQuestionIndex];
            this.doors.forEach((door, index) => {
                if (currentQ.options[index]) {
                    this.drawSpeechBubble(currentQ.options[index], door.x + door.w/2, door.y - door.w/2 + 10);
                }
            });
        }

        // Desenha o jogador
        if (this.player) this.player.draw(this.ctx);
    }
}