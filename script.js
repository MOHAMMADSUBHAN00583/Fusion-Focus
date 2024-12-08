document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const size = 4;
    let board = [];
    let currentScore = 0;
    const currentScoreElem = document.getElementById('current-score');

    // Get the high score from local storage or set it to 0 if not found
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('high-score');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over');

    // Sound effects
    const moveSound = new Audio('move.mp3');
    const mergeSound = new Audio('merge.mp3');
    const gameOverSound = new Audio('gameover.mp3');
    const winSound = new Audio('win.mp3');

    // Function to update the score
    function updateScore(value) {
        currentScore += value;
        currentScoreElem.textContent = currentScore;
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }

    // Function to restart the game
    function restartGame() {
        currentScore = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    // Function to initialize the game
    function initializeGame() {
        board = [...Array(size)].map(e => Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    // Function to render the game board on the UI
    function renderBoard() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value;
                const currentValue = board[i][j];
                if (currentValue !== 0) {
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    if (currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')) {
                        cell.classList.add('merged-tile');
                        mergeSound.play();  // Play sound on merge
                    }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        // Cleanup animation classes
        setTimeout(() => {
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('merged-tile', 'new-tile');
            });
        }, 300);
    }

    // Function to place a random tile on the board
    function placeRandom() {
        const available = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile');
        }
    }

    // Function to move the tiles based on arrow key input
    function move(direction) {
        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = [...Array(size)].map((_, i) => board[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++) {
                    if (board[i][j] !== newColumn[i]) {
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < size; i++) {
                const row = board[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                for (let j = 0; j < size; j++) {
                    if (board[i][j] !== newRow[j]) {
                        hasChanged = true;
                        board[i][j] = newRow[j];
                    }
                }
            }
        }
        if (hasChanged) {
            placeRandom();
            renderBoard();
            if (isGameOver()) {
                gameOverSound.play();
                gameOverElem.style.display = 'flex';
            }
        }
    }

    // Transform the row or column by merging tiles
    function transform(arr, isUpOrLeft) {
        const newArr = arr.filter(num => num > 0);
        const result = [];
        for (let i = 0; i < newArr.length; i++) {
            if (newArr[i] === newArr[i + 1]) {
                result.push(newArr[i] * 2);
                updateScore(newArr[i] * 2);
                i++;
            } else {
                result.push(newArr[i]);
            }
        }
        return isUpOrLeft ? result.concat(Array(size - result.length).fill(0)) : Array(size - result.length).fill(0).concat(result);
    }

    // Check if the game is over
    function isGameOver() {
        return !board.some(row => row.includes(0)) && !board.some((row, i) => row.some((value, j) => {
            const neighbors = [
                [i - 1, j],
                [i + 1, j],
                [i, j - 1],
                [i, j + 1]
            ];
            return neighbors.some(([x, y]) => x >= 0 && x < size && y >= 0 && y < size && board[x][y] === value);
        }));
    }

    // Handle key events for movement
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            move(e.key);
        }
    });

    // Toggle theme between light and dark
    const toggleThemeButton = document.getElementById('toggle-theme');
    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleThemeButton.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });

    // Restart button functionality
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    // Initialize game
    initializeGame();
});
