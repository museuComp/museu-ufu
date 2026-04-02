import Game from './Game.js';
import { initAudio } from './SoundHelper.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

let lastTime = 0;
let isTabActive = true;

// Referências das Telas
const mainMenu = document.getElementById('main-menu');
const startMenu = document.getElementById('start-menu');
const uiLayer = document.getElementById('ui-layer');
const hudControls = document.getElementById('hud-controls');
const creditsModal = document.getElementById('credits-modal');
const victoryScreen = document.getElementById('victory-screen');

function toggleMobileControls(show) {
    const isTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const controls = document.getElementById('mobile-controls');
    
    if (show && isTouchScreen) {
        controls.style.display = 'block';
    } else {
        controls.style.display = 'none';
    }
}

// BOTÕES DO MENU PRINCIPAL
document.getElementById('btn-start-game').addEventListener('click', () => {
    initAudio(); 
    mainMenu.style.display = 'none';
    startMenu.style.display = 'flex'; 
});

document.getElementById('btn-museum-link').addEventListener('click', () => {
    window.open('https://museu.facom.ufu.br/home', '_blank'); 
});

document.getElementById('btn-credits').addEventListener('click', () => {
    creditsModal.style.display = 'flex';
});

document.getElementById('btn-close-credits').addEventListener('click', () => {
    creditsModal.style.display = 'none';
});

// Função para iniciar audio
function primeAudio() {
    initAudio();
    // Toca um som muito rápido, muito agudo e inaudível (volume quase zero)
    const osc = window.AudioContext ? new window.AudioContext().createOscillator() : null;
    if (osc) {
        osc.frequency.value = 20000; // som inaudivel
        const gain = osc.context.createGain();
        gain.gain.value = 0.0001; // Volume praticamente zero
        osc.connect(gain);
        gain.connect(osc.context.destination);
        osc.start(0);
        osc.stop(osc.context.currentTime + 0.01); // Duração de 10 milissegundos
    }
}

// BOTÕES DE SELEÇÃO DE PERSONAGEM 
document.getElementById('btn-girl').addEventListener('click', () => {
    primeAudio();
    startGame('girl');
});
document.getElementById('btn-boy').addEventListener('click', () => {
    primeAudio();
    startGame('boy');
});

// BOTÃO DA CURIOSIDADE
document.getElementById('btn-next-room').addEventListener('click', () => {
    document.getElementById('curiosity-modal').style.display = 'none';
    game.nextRoom();
});

// BOTÕES DE NAVEGAÇÃO DURANTE O JOGO (HUD)
document.getElementById('btn-restart-game').addEventListener('click', () => {
    uiLayer.style.display = 'none'; 
    hudControls.style.display = 'none'; // <--- Desliga o HUD
    startMenu.style.display = 'flex'; 
    toggleMobileControls(false); 
});

document.getElementById('btn-exit-to-main').addEventListener('click', () => {
    uiLayer.style.display = 'none'; 
    hudControls.style.display = 'none'; // Desliga o HUD
    startMenu.style.display = 'none'; 
    mainMenu.style.display = 'flex'; 
    toggleMobileControls(false); 
});

// BOTÕES DA TELA DE VITÓRIA
document.getElementById('btn-play-again').addEventListener('click', () => {
    victoryScreen.style.display = 'none';
    startMenu.style.display = 'flex'; 
    toggleMobileControls(false); 
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
    victoryScreen.style.display = 'none';
    mainMenu.style.display = 'flex'; 
    toggleMobileControls(false); 
});

// Função que inicia a partida
function startGame(characterType) {
    startMenu.style.display = 'none';
    uiLayer.style.display = 'block';
    hudControls.style.display = 'flex'; // Liga o HUD
    game.start(characterType); 
    toggleMobileControls(true); 
}

// Otimização de Abas 
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isTabActive = false;
    } else {
        isTabActive = true; 
        lastTime = performance.now(); 
    }
});

// Loop Principal
function gameLoop(timestamp) {
    if (!isTabActive) {
        requestAnimationFrame(gameLoop);
        return;
    }

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    game.update(deltaTime); 
    game.draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);