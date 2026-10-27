const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Mobil tam ekran ayarı
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let isGameOver = false;
let gameSpeed = 5;

// Şerit ayarları (3 şerit)
const laneWidth = canvas.width / 3;
const lanes = [laneWidth / 2, laneWidth * 1.5, laneWidth * 2.5];
let currentLane = 1; // Başlangıçta orta şerit

// Oyuncu (Kahve Bardağı)
const player = {
    x: lanes[currentLane],
    y: canvas.height - 100,
    width: 40,
    height: 60,
    color: "#d4a373"
};

// Engeller ve Ödüller
let obstacles = [];
let collectibles = [];

function spawnEntity() {
    let laneIndex = Math.floor(Math.random() * 3);
    let type = Math.random() > 0.3 ? 'obstacle' : 'collectible';
    
    let entity = {
        x: lanes[laneIndex],
        y: -50,
        width: 30,
        height: 30,
        type: type,
        color: type === 'obstacle' ? "#5c4033" : "#fefae0" // Engel: Koyu, Ödül: Açık
    };
    
    if (type === 'obstacle') obstacles.push(entity);
    else collectibles.push(entity);
}

// Dokunmatik ve Fare Kontrolleri (Mobilde sağa/sola dokunma)
window.addEventListener("touchstart", (e) => {
    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2 && currentLane > 0) {
        currentLane--; // Sola geç
    } else if (touchX > canvas.width / 2 && currentLane < 2) {
        currentLane++; // Sağa geç
    }
    player.x = lanes[currentLane];
});

function drawPlayer() {
    ctx.fillStyle = player.color;
    // Basit bir kahve bardağı çizimi
    ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
    // Kapak
    ctx.fillStyle = "white";
    ctx.fillRect(player.x - (player.width/2) - 5, player.y - 10, player.width + 10, 10);
}

function updateEntities() {
    // Engeller
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += gameSpeed;
        ctx.fillStyle = obstacles[i].color;
        ctx.fillRect(obstacles[i].x - obstacles[i].width/2, obstacles[i].y, obstacles[i].width, obstacles[i].height);
        
        // Çarpışma kontrolü
        if (obstacles[i].y + obstacles[i].height > player.y &&
            obstacles[i].x === player.x) {
            gameOver();
        }
    }
    
    // Ödüller (Şeker Küpleri / Kahve Çekirdekleri)
    for (let i = 0; i < collectibles.length; i++) {
        collectibles[i].y += gameSpeed;
        ctx.fillStyle = collectibles[i].color;
        ctx.beginPath();
        ctx.arc(collectibles[i].x, collectibles[i].y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Toplama kontrolü
        if (collectibles[i].y + collectibles[i].height > player.y && collectibles[i].x === player.x) {
            score += 10;
            document.getElementById("score").innerText = score;
            collectibles.splice(i, 1);
            i--;
            
            // Hızlanma
            if(score % 50 === 0) gameSpeed += 0.5;
        }
    }
}

function gameOver() {
    isGameOver = true;
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = score;
}

function resetGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    collectibles = [];
    currentLane = 1;
    player.x = lanes[currentLane];
    document.getElementById("score").innerText = score;
    document.getElementById("gameOverScreen").style.display = "none";
    gameLoop();
}

let frameCount = 0;
function gameLoop() {
    if (isGameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Yolu çiz (Şerit çizgileri)
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(laneWidth, 0); ctx.lineTo(laneWidth, canvas.height);
    ctx.moveTo(laneWidth * 2, 0); ctx.lineTo(laneWidth * 2, canvas.height);
    ctx.stroke();

    drawPlayer();
    updateEntities();
    
    frameCount++;
    if (frameCount % 60 === 0) {
        spawnEntity(); // Saniyede bir nesne üret
    }
    
    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
gameLoop();
