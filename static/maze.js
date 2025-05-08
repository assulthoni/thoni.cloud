const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const MAZE_ROWS = 12;
const MAZE_COLS = 12;
const CELL_SIZE = 40;
const PLAYER_SIZE = 36;
const PLAYER_IMG_SRC = '/static/Odd-Eye-Flappy-Bird.png';

// Simple maze: 0 = path, 1 = wall
function generateMaze(rows, cols) {
  // Ensure odd dimensions for proper maze structure
  if (rows % 2 === 0) rows++;
  if (cols % 2 === 0) cols++;
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function carve(r, c) {
    maze[r][c] = 0;
    const dirs = shuffle([
      [0, 2], [0, -2], [2, 0], [-2, 0]
    ]);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
        maze[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  }
  carve(1, 1);
  // Place goal at farthest open cell from start (bottom right)
  let goalRow = rows - 2, goalCol = cols - 2;
  while (maze[goalRow][goalCol] !== 0 && (goalRow > 1 || goalCol > 1)) {
    if (goalCol > 1) goalCol--;
    else if (goalRow > 1) goalRow--;
    else break;
  }
  maze[goalRow][goalCol] = 2;
  return maze;
}
let MAZE = generateMaze(MAZE_ROWS, MAZE_COLS);
// 2 = goal

let player = { row: 1, col: 1, x: 0, y: 0 };
let playerImg = new window.Image();
let gameWon = false;

function drawMaze() {
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (MAZE[r][c] === 1) {
        ctx.fillStyle = '#444';
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (MAZE[r][c] === 2) {
        ctx.fillStyle = '#5ee432';
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', c * CELL_SIZE + CELL_SIZE/2, r * CELL_SIZE + CELL_SIZE/2 + 6);
      }
    }
  }
}

function drawPlayer() {
  ctx.drawImage(
    playerImg,
    player.col * CELL_SIZE + (CELL_SIZE - PLAYER_SIZE) / 2,
    player.row * CELL_SIZE + (CELL_SIZE - PLAYER_SIZE) / 2,
    PLAYER_SIZE,
    PLAYER_SIZE
  );
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawPlayer();
}

function canMove(row, col) {
  return MAZE[row][col] !== 1;
}

function checkGoal() {
  if (MAZE[player.row][player.col] === 2) {
    gameWon = true;
    document.getElementById('mazeGoal').textContent = 'Congratulations! You reached the goal!';
  }
}

function movePlayer(dr, dc) {
  if (gameWon) return;
  const newRow = player.row + dr;
  const newCol = player.col + dc;
  if (newRow >= 0 && newRow < MAZE_ROWS && newCol >= 0 && newCol < MAZE_COLS && canMove(newRow, newCol)) {
    player.row = newRow;
    player.col = newCol;
    render();
    checkGoal();
  }
}

document.addEventListener('keydown', e => {
  if (gameWon) return;
  if (e.code === 'ArrowUp') movePlayer(-1, 0);
  else if (e.code === 'ArrowDown') movePlayer(1, 0);
  else if (e.code === 'ArrowLeft') movePlayer(0, -1);
  else if (e.code === 'ArrowRight') movePlayer(0, 1);
});

function resetMaze() {
  MAZE = generateMaze(MAZE_ROWS, MAZE_COLS);
  player = { row: 1, col: 1, x: 0, y: 0 };
  gameWon = false;
  render();
  document.getElementById('mazeGoal').textContent = 'Reach the green GOAL! Use arrow keys to move.';
}

document.getElementById('resetMazeBtn').addEventListener('click', resetMaze);
playerImg.src = PLAYER_IMG_SRC;
playerImg.onload = function() {
  render();
  document.getElementById('mazeGoal').textContent = 'Reach the green GOAL! Use arrow keys to move.';
};