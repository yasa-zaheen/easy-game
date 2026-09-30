const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 120;
const FOOD_COUNT = 3;

let snake, direction, nextDirection, foods, score, highScore, gameLoop, isRunning;

function init() {
  highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  highScoreEl.textContent = highScore;
  resetGame();
  showOverlay('Snake', 'Press any arrow key or WASD to start');
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  foods = spawnFoods(FOOD_COUNT);
  isRunning = false;
  clearInterval(gameLoop);
  draw();
}

function isOccupied(x, y, others = foods) {
  return (
    snake.some(segment => segment.x === x && segment.y === y) ||
    (others && others.some(f => f.x === x && f.y === y))
  );
}

function spawnFood(others = foods) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT),
    };
  } while (isOccupied(position.x, position.y, others));
  return position;
}

function spawnFoods(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(spawnFood(result));
  }
  return result;
}

function startGame() {
  if (isRunning) return;
  isRunning = true;
  hideOverlay();
  gameLoop = setInterval(tick, INITIAL_SPEED);
}

function tick() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    return gameOver();
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  const eatenIndex = foods.findIndex(f => f.x === head.x && f.y === head.y);
  if (eatenIndex !== -1) {
    score++;
    scoreEl.textContent = score;
    foods.splice(eatenIndex, 1);
    foods.push(spawnFood());
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  isRunning = false;
  clearInterval(gameLoop);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreEl.textContent = highScore;
  }

  showOverlay('Game Over', `Score: ${score}`);
}

function draw() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ef4444';
  foods.forEach(food => {
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  snake.forEach((segment, i) => {
    const shade = Math.max(40, 180 - i * 8);
    ctx.fillStyle = `rgb(34, ${shade}, 80)`;
    ctx.fillRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );
  });
}

function showOverlay(title, message) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function handleKey(e) {
  const key = e.key.toLowerCase();
  const keyMap = {
    arrowup: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const newDir = keyMap[key];
  if (!newDir) return;

  e.preventDefault();

  if (!isRunning) {
    startGame();
    return;
  }

  if (newDir.x === -direction.x && newDir.y === -direction.y) return;
  nextDirection = newDir;
}

document.addEventListener('keydown', handleKey);
restartBtn.addEventListener('click', () => {
  resetGame();
  startGame();
});

init();
