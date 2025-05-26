// Sudoku Grid and Controls
const grid = document.getElementById('sudoku-grid');
const difficultySelector = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');
const moveHistory = [];
const redoHistory = [];

let currentSolution = '';
let timerInterval;
let seconds = 0;

// Timer Functions
function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        let mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        let secs = (seconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `⏱ ${mins}:${secs}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Puzzle Data
const puzzles = {
    easy: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    medium: '600300700008004000070020090500000800030700010000960002090050070002100800003006000',
    hard: '300020500000800060010500000700005200040010000000600300000700040060009008000000002',
};

const solutions = {
    easy: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
    medium: '645381792138274659279526391514639827326758914987162435891457263762193848453826171',
    hard: '387124569524893761619576428736945218248317956951682347193758642862439175475261893',
};

// Generate Puzzle
function generatePuzzle(difficulty) {
    currentSolution = solutions[difficulty];
    return randomizeClues(puzzles[difficulty], difficulty);
}

function randomizeClues(puzzle, difficulty) {
    const clueCounts = { easy: 65, medium: 50, hard: 35 };
    const totalCells = 81;
    const clues = clueCounts[difficulty];
    let puzzleArray = puzzle.split('');

    for (let i = 0; i < totalCells; i++) {
        if (Math.random() > clues / totalCells) {
            puzzleArray[i] = '0';
        }
    }
    return puzzleArray.join('');
}

// Generate Grid
function generateGrid(puzzle) {
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('td');
            const value = puzzle[i * 9 + j];
            cell.textContent = value !== '0' ? value : '';
            cell.contentEditable = value === '0';
            if (value === '0') {
                cell.classList.add('user-input');
                cell.addEventListener('input', handleInput);
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

// Handle Input
function handleInput(event) {
    const cell = event.target;
    if (!/^[1-9]$/.test(cell.innerText)) {
        cell.innerText = '';
        alert('Enter a valid number (1-9)');
    } else {
        moveHistory.push({ cell, prevValue: '', newValue: cell.innerText });
        redoHistory.length = 0;
        checkRowCompletion(cell);
        checkColumnCompletion(cell);
    }
}

// Row/Column Check
function checkRowCompletion(cell) {
    const rowIndex = cell.parentElement.rowIndex;
    const cells = [...grid.rows[rowIndex].cells];
    if (cells.every(c => /^[1-9]$/.test(c.textContent))) {
        showPopup(`🎉 Row ${rowIndex + 1} Completed!`);
    }
}

function checkColumnCompletion(cell) {
    const colIndex = cell.cellIndex;
    const cells = [...grid.querySelectorAll(`td:nth-child(${colIndex + 1})`)];
    if (cells.every(c => /^[1-9]$/.test(c.textContent))) {
        showPopup(`🎉 Column ${colIndex + 1} Completed!`);
    }
}

// Popup Function
function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h2>${message}</h2>
            <button class="popup-close">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    popup.querySelector('.popup-close').addEventListener('click', () => popup.remove());
}

// Undo/Redo
document.getElementById('undo').addEventListener('click', () => {
    const last = moveHistory.pop();
    if (last) {
        redoHistory.push(last);
        last.cell.innerText = last.prevValue;
    }
});

document.getElementById('redo').addEventListener('click', () => {
    const last = redoHistory.pop();
    if (last) {
        moveHistory.push(last);
        last.cell.innerText = last.newValue;
    }
});

// Hint
document.getElementById('hint').addEventListener('click', () => {
    const cells = [...grid.querySelectorAll('td')];
    const emptyCells = cells.filter(c => c.textContent === '');
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = cells.indexOf(randomCell);
        randomCell.textContent = currentSolution[index];
        randomCell.style.backgroundColor = '#f0e68c';
        setTimeout(() => (randomCell.style.backgroundColor = ''), 1000);
    } else {
        alert('No empty cells for hints!');
    }
});

// Validate Puzzle
document.getElementById('validate').addEventListener('click', () => {
    const cells = [...grid.querySelectorAll('td')];
    let isValid = true;

    cells.forEach((cell, i) => {
        if (cell.textContent !== currentSolution[i]) {
            cell.style.backgroundColor = '#ffcccc';
            isValid = false;
        } else {
            cell.style.backgroundColor = '#ccffcc';
        }
    });

    setTimeout(() => cells.forEach(c => (c.style.backgroundColor = '')), 2000);

    if (isValid) {
        showLevelCompletedPopup();
    } else {
        alert('Some cells are incorrect!');
    }
});

// Level Complete
function showLevelCompletedPopup() {
    showPopup('🎉 Level Completed!');
    stopTimer();
}

// New Game
document.getElementById('new-game').addEventListener('click', () => {
    const diff = difficultySelector.value;
    generateGrid(generatePuzzle(diff));
    startTimer();
});

// Restart
document.getElementById('restart').addEventListener('click', () => {
    const diff = difficultySelector.value;
    generateGrid(generatePuzzle(diff));
    startTimer();
});

// Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-toggle').textContent =
        document.body.classList.contains('dark-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
});



// Start default game
generateGrid(generatePuzzle('easy'));
startTimer();

fetch(`/api/games/${gameId}/complete`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ timeTaken: secondsElapsed })
});

fetch('/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    difficulty: selectedDifficulty,
    puzzle: puzzleString,
    theme: 'light'
  })
});


