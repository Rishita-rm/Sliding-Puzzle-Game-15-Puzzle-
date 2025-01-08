const gameBoard = document.getElementById('game-board');
const moveCounter = document.getElementById('move-counter');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const hintBtn = document.getElementById('hint-btn');
const bestMovesDisplay = document.getElementById('best-moves');
const bestTimeDisplay = document.getElementById('best-time');
const gridSizeSelector = document.getElementById('grid-size');

let gridSize = 4; // Default grid size (4x4)
let tiles = [];
let emptyTileIndex;
let moves = 0;
let timerInterval;
let timeElapsed = 0;
let isGameStarted = false;
let bestMoves = localStorage.getItem('bestMoves') || 0;
let bestTime = localStorage.getItem('bestTime') || '00:00';

// Set the best moves and time from localStorage
bestMovesDisplay.textContent = bestMoves;
bestTimeDisplay.textContent = bestTime;

// Initialize the game
function startGame() {
  // Set the grid size based on selection
  gridSize = parseInt(gridSizeSelector.value);

  // Create and shuffle tiles
  tiles = [];
  for (let i = 1; i < gridSize * gridSize; i++) {
    tiles.push(i);
  }
  tiles.push(null); // Represent the empty space

  shuffleTiles(tiles);

  // Update the empty tile index
  emptyTileIndex = tiles.indexOf(null);

  // Render the tiles on the board
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
  gameBoard.style.gridTemplateRows = `repeat(${gridSize}, 100px)`;

  tiles.forEach((tile, index) => {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile');
    if (tile === null) {
      tileElement.classList.add('empty');
    } else {
      tileElement.textContent = tile;
      tileElement.addEventListener('click', () => handleTileClick(index));
    }
    gameBoard.appendChild(tileElement);
  });

  // Reset the game state
  moves = 0;
  moveCounter.textContent = moves;
  timeElapsed = 0;
  timerDisplay.textContent = '00:00';
  isGameStarted = false;

  // Start the timer
  startTimer();
}

// Shuffle the tiles randomly
function shuffleTiles(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Handle tile click
function handleTileClick(index) {
  const tile = tiles[index];

  // Check if the clicked tile can move (adjacent to the empty space)
  if (isValidMove(index, emptyTileIndex)) {
    // Swap the clicked tile with the empty space
    tiles[emptyTileIndex] = tile;
    tiles[index] = null;

    // Update the game board
    startGame();

    // Increase move count
    moves++;
    moveCounter.textContent = moves;

    // Check if the puzzle is solved
    if (isSolved()) {
      stopTimer();
      if (moves < bestMoves || bestMoves === 0) {
        bestMoves = moves;
        localStorage.setItem('bestMoves', bestMoves);
        bestMovesDisplay.textContent = bestMoves;
      }
      if (timeElapsed < parseTime(bestTime) || bestTime === '00:00') {
        bestTime = formatTime(timeElapsed);
        localStorage.setItem('bestTime', bestTime);
        bestTimeDisplay.textContent = bestTime;
      }
      alert(`You solved the puzzle in ${moves} moves and ${formatTime(timeElapsed)}!`);
    }
  }
}

// Check if a move is valid (adjacent to the empty space)
function isValidMove(index, emptyIndex) {
  const validMoves = [
    emptyIndex - 1, emptyIndex + 1, emptyIndex - gridSize, emptyIndex + gridSize
  ];
  return validMoves.includes(index) && isAdjacent(emptyIndex, index);
}

// Check if two indices are adjacent in the grid
function isAdjacent(index1, index2) {
  const row1 = Math.floor(index1 / gridSize);
  const col1 = index1 % gridSize;
  const row2 = Math.floor(index2 / gridSize);
  const col2 = index2 % gridSize;
  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

// Check if the puzzle is solved
function isSolved() {
  return tiles.every((tile, index) => tile === null || tile === index + 1);
}

// Format time as mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Convert time string (mm:ss) to seconds
function parseTime(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Start the timer
function startTimer() {
  if (!isGameStarted) {
    timerInterval = setInterval(() => {
      timeElapsed++;
      timerDisplay.textContent = formatTime(timeElapsed);
    }, 1000);
    isGameStarted = true;
  }
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Show hint (next valid move)
function showHint() {
  const validMoves = tiles
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile, index }) => tile !== null && isValidMove(index, emptyTileIndex));

  if (validMoves.length > 0) {
    const hintTile = validMoves[0];
    alert(`Hint: Move tile ${hintTile.tile}`);
  }
}

// Restart the game
restartBtn.addEventListener('click', startGame);

// Show hint
hintBtn.addEventListener('click', showHint);

// Initialize the game
startGame();
