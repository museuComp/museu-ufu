const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

// função para acordar o áudio com o clique do mouse
export function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration) {
    if (!audioCtx) initAudio(); // Segurança extra

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type; 
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

export function playSuccessSound() {
    playTone(659.25, 'square', 0.1); 
    setTimeout(() => playTone(880.00, 'square', 0.2), 100); 
}

export function playErrorSound() {
    playTone(150, 'sawtooth', 0.3); 
}

export function playWinSound() {
    playTone(440, 'square', 0.1);
    setTimeout(() => playTone(554.37, 'square', 0.1), 150);
    setTimeout(() => playTone(659.25, 'square', 0.1), 300);
    setTimeout(() => playTone(880, 'square', 0.5), 450);
}