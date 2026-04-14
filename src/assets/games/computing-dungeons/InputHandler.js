export default class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            w: false, a: false, s: false, d: false
        };

        // Teclado (PC)
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = false;
        });

        // Chama os botões virtuais
        this.setupMobileControls();
    }

    setupMobileControls() {
        // Função para ligar um botão na tela a uma tecla do PC
        const mapBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            // Toque na tela (Celular)
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[key] = true; }, {passive: false});
            btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[key] = false; }, {passive: false});
            
            // Clique do mouse (Para testar os botões virtuais pelo PC)
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); this.keys[key] = true; });
            btn.addEventListener('mouseup', (e) => { e.preventDefault(); this.keys[key] = false; });
            btn.addEventListener('mouseleave', (e) => { e.preventDefault(); this.keys[key] = false; });
        };

        mapBtn('btn-up', 'ArrowUp');
        mapBtn('btn-down', 'ArrowDown');
        mapBtn('btn-left', 'ArrowLeft');
        mapBtn('btn-right', 'ArrowRight');
    }

    isMovingUp() { return this.keys.ArrowUp || this.keys.w; }
    isMovingDown() { return this.keys.ArrowDown || this.keys.s; }
    isMovingLeft() { return this.keys.ArrowLeft || this.keys.a; }
    isMovingRight() { return this.keys.ArrowRight || this.keys.d; }
}