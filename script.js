const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ridimensiona canvas
canvas.width = window.innerWidth > 600? 600 : window.innerWidth - 20;
canvas.height = 300;

let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('rossaHighScore') || 0;
let gameSpeed = 5;
let baseSpeed = 5;
let frame = 0;
let ragazzi = [];

document.getElementById('highScore').textContent = highScore;

const anna = {
    x: 50,
    y: 200,
    width: 30,
    height: 40,
    dy: 0,
    grounded: true,

    jump() {
        if (this.grounded) {
            this.dy = -12;
            this.grounded = false;
        }
    },

    update() {
        if (!this.grounded) {
            this.dy += 0.6;
            this.y += this.dy;

            if (this.y >= 200) {
                this.y = 200;
                this.grounded = true;
                this.dy = 0;
            }
        }
    },

    draw() {
        // Gambe - jeans blu
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x + 8, this.y + 25, 6, 15);
        ctx.fillRect(this.x + 16, this.y + 25, 6, 15);

        // Corpo - maglia rosa
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(this.x + 6, this.y + 10, 18, 15);

        // Testa
        ctx.fillStyle = '#f4a261';
        ctx.fillRect(this.x + 8, this.y, 14, 14);

        // Capelli rossi/arancioni medi
        ctx.fillStyle = '#ff7b25';
        ctx.fillRect(this.x + 6, this.y, 18, 8);
        ctx.fillRect(this.x + 6, this.y + 2, 4, 12); // ciocca sinistra
        ctx.fillRect(this.x + 20, this.y + 2, 4, 12); // ciocca destra

        // Occhi
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 11, this.y + 6, 2, 2);
        ctx.fillRect(this.x + 17, this.y + 6, 2, 2);

        // Bocca
        ctx.fillRect(this.x + 13, this.y + 10, 4, 1);
    }
};

function drawRagazzo(x, y, width, height) {
    // Gambe - pantaloni scuri
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 4, y + 12, 5, 8);
    ctx.fillRect(x + 11, y + 12, 5, 8);

    // Corpo - maglietta
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x + 2, y, 16, 12);

    // Testa
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(x + 5, y - 10, 10, 10);

    // Capelli castani
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x + 4, y - 10, 12, 4);

    // Occhi
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 7, y - 7, 1, 1);
    ctx.fillRect(x + 12, y - 7, 1, 1);

    // Bocca
    ctx.fillRect(x + 9, y - 4, 2, 1);
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sfondo cielo
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terra
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 240, canvas.width, 60);

    // Aggiorna e disegna Anna
    anna.update();
    anna.draw();

    // Spawn ragazzi
    if (frame % 90 === 0) {
        ragazzi.push({
            x: canvas.width,
            y: 220,
            width: 20,
            height: 20
        });
    }

    // Muovi e disegna ragazzi
    for (let i = ragazzi.length - 1; i >= 0; i--) {
        ragazzi[i].x -= gameSpeed;
        drawRagazzo(ragazzi[i].x, ragazzi[i].y, ragazzi[i].width, ragazzi[i].height);

        // Collisione
        if (ragazzi[i].x < anna.x + anna.width &&
            ragazzi[i].x + ragazzi[i].width > anna.x &&
            ragazzi[i].y < anna.y + anna.height &&
            ragazzi[i].y + ragazzi[i].height > anna.y) {
            endGame();
            return;
        }

        // Rimuovi
        if (ragazzi[i].x + ragazzi[i].width < 0) {
            ragazzi.splice(i, 1);
            score++;
            document.getElementById('score').textContent = score;

            // Aumenta velocità
            if (score % 100 === 0) gameSpeed += 0.5;

            // Vittoria
            if (score >= 1000) {
                winGame();
                return;
            }
        }
    }

    frame++;
    requestAnimationFrame(gameLoop);
}

// Controlli
function handleJump(e) {
    if (e.type === 'keydown' && e.code!== 'Space') return;
    e.preventDefault();
    if (gameRunning) anna.jump();
}

document.addEventListener('keydown', handleJump);
canvas.addEventListener('touchstart', handleJump);
canvas.addEventListener('click', handleJump);

// Bottoni
document.getElementById('playBtn').addEventListener('click', startGame);
document.getElementById('retryBtn').addEventListener('click', restartGame);
document.getElementById('replayBtn').addEventListener('click', restartGame);

// Start/End
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('winScreen').style.display = 'none';
    gameRunning = true;
    score = 0;
    gameSpeed = baseSpeed;
    frame = 0;
    ragazzi = [];
    anna.y = 200;
    anna.dy = 0;
    anna.grounded = true;
    document.getElementById('score').textContent = 0;
    gameLoop();
}

function endGame() {
    gameRunning = false;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = score;

    const messages = [
        'Ti hanno beccato!',
        'Ti hanno visto!',
        'Sei stato scoperto!',
        'Non ce l\'hai fatta!',
        'Game Over!'
    ];
    document.getElementById('finalMessage').textContent = messages[Math.floor(Math.random() * messages.length)];

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('rossaHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

function winGame() {
    gameRunning = false;
    document.getElementById('winScreen').style.display = 'block';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('rossaHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

function restartGame() {
    startGame();
}

// Disegna subito il canvas vuoto con sfondo
window.addEventListener('load', () => {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 240, canvas.width, 60);
    anna.draw();
});
