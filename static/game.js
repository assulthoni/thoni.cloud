const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const BIRD_IMG_SRC = '/static/Odd-Eye-Flappy-Bird.png';
const BIRD_WIDTH = 48;
const BIRD_HEIGHT = 48;
const GRAVITY = 0.5;
const FLAP = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;

let birdY, birdV, pipes, score, gameOver, birdImg, animationId, birdAngle;

function resetGame() {
  birdY = canvas.height / 2 - BIRD_HEIGHT / 2;
  birdV = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  birdAngle = 0;
  scoreEl.textContent = 'Score: 0';
  restartBtn.style.display = 'none';
  spawnPipe();
  if (animationId) cancelAnimationFrame(animationId);
  loop();
}

function spawnPipe() {
  const topHeight = Math.random() * (canvas.height - PIPE_GAP - 120) + 40;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + PIPE_GAP
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(60 + BIRD_WIDTH / 2, birdY + BIRD_HEIGHT / 2);
  ctx.rotate(birdAngle);
  ctx.drawImage(birdImg, -BIRD_WIDTH / 2, -BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT);
  ctx.restore();
}

function drawPipes() {
  ctx.fillStyle = '#5ee432';
  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.bottom, PIPE_WIDTH, canvas.height - pipe.bottom);
  });
}

function checkCollision() {
  // Ground or ceiling
  if (birdY < 0 || birdY + BIRD_HEIGHT > canvas.height) return true;
  // Pipes
  for (let pipe of pipes) {
    if (
      60 + BIRD_WIDTH > pipe.x &&
      60 < pipe.x + PIPE_WIDTH &&
      (birdY < pipe.top || birdY + BIRD_HEIGHT > pipe.bottom)
    ) {
      return true;
    }
  }
  return false;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Bird physics
  birdV += GRAVITY;
  birdY += birdV;
  // Bird angle logic
  if (birdV < 0) {
    birdAngle = Math.max(-0.5, birdAngle - 0.1);
  } else {
    birdAngle = Math.min(1.2, birdAngle + 0.04);
  }
  drawBird();
  // Pipes logic
  pipes.forEach(pipe => { pipe.x -= PIPE_SPEED; });
  if (pipes.length && pipes[0].x + PIPE_WIDTH < 0) pipes.shift();
  if (pipes.length < 2 && pipes[pipes.length-1].x < canvas.width - 200) spawnPipe();
  drawPipes();
  // Score
  pipes.forEach(pipe => {
    if (!pipe.passed && pipe.x + PIPE_WIDTH < 60) {
      score++;
      pipe.passed = true;
      scoreEl.textContent = 'Score: ' + score;
    }
  });
  // Collision
  if (checkCollision()) {
    gameOver = true;
    restartBtn.style.display = 'block';
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 20);
    return;
  }
  animationId = requestAnimationFrame(loop);
}

function flap() {
  if (!gameOver) {
    birdV = FLAP;
    birdAngle = -0.5;
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') flap();
});
canvas.addEventListener('mousedown', flap);
restartBtn.addEventListener('click', resetGame);

// Load bird image and start game
birdImg = new window.Image();
birdImg.src = BIRD_IMG_SRC;
birdImg.onload = resetGame;