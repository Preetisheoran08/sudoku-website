// Sound Effects
const invalidMoveSound = new Audio('sounds/wrong.mp3');
const completeSound = new Audio('sounds/complete (1).mp3');
const hintSound = new Audio('sounds/hint.mp3');
const validMoveSound = new Audio('sounds/correct.mp3'); // Added if you missed valid move sound

// Sudoku Grid and Controls
const grid = document.getElementById('sudoku-grid');
const difficultySelector = document.getElementById('difficulty');
const moveHistory = [];
const redoHistory = [];

// Sudoku Puzzle Definitions (with randomized clues)
function generatePuzzle(difficulty) {
    const allPuzzles = {
        easy: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
        medium: '600300700008004000070020090500000800030700010000960002090050070002100800003006000',
        hard: '300020500000800060010500000700005200040010000000600300000700040060009008000000002',
    };

    let puzzle = allPuzzles[difficulty];
    puzzle = randomizeClues(puzzle, difficulty); // Randomize clues based on difficulty
    return puzzle;
}

function randomizeClues(puzzle, difficulty) {
    const clueCounts = { easy: 65, medium: 50, hard: 35 };
    const totalCells = 81;
    const clues = clueCounts[difficulty];
    let puzzleArray = puzzle.split('');

    for (let i = 0; i < totalCells; i++) {
        if (Math.random() > clues / totalCells) {
            puzzleArray[i] = '0'; // Remove value (empty)
        }
    }
    return puzzleArray.join('');
}

// Populate Sudoku Grid
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

// Handle User Input
function handleInput(event) {
    const cell = event.target;
    if (!/^[1-9]$/.test(cell.innerText)) {
        cell.innerText = '';
        invalidMoveSound.play();
        alert('Enter a valid number (1-9)');
    } else {
        moveHistory.push({ cell, prevValue: '', newValue: cell.innerText });
        redoHistory.length = 0;
        validMoveSound.play();
        checkRowCompletion(cell);  // Check for row completion after every input
        checkColumnCompletion(cell);  // Check for column completion after every input
    }
}

// Check if a row is completed
function checkRowCompletion(cell) {
    const rowIndex = cell.parentElement.rowIndex;
    const cells = [...grid.rows[rowIndex].cells];
    const isComplete = cells.every(cell => cell.textContent !== '');
    if (isComplete) {
        showRowCompletionPopup(rowIndex + 1);
    }
}

// Check if a column is completed
function checkColumnCompletion(cell) {
    const colIndex = cell.cellIndex;
    const cells = [...grid.querySelectorAll(`td:nth-child(${colIndex + 1})`)];
    const isComplete = cells.every(cell => cell.textContent !== '');
    if (isComplete) {
        showColumnCompletionPopup(colIndex + 1);
    }
}

// Show pop-up for row completion
function showRowCompletionPopup(rowNumber) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    const content = document.createElement('div');
    content.classList.add('popup-content');
    content.innerHTML = `
        <h2>🎉 Row ${rowNumber} Completed!</h2>
        <button id="close-popup">Close</button>
    `;
    popup.appendChild(content);
    document.body.appendChild(popup);

    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
    });
}

// Show pop-up for column completion
function showColumnCompletionPopup(colNumber) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    const content = document.createElement('div');
    content.classList.add('popup-content');
    content.innerHTML = `
        <h2>🎉 Column ${colNumber} Completed!</h2>
        <button id="close-popup">Close</button>
    `;
    popup.appendChild(content);
    document.body.appendChild(popup);

    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
    });
}

// Undo Move
document.getElementById('undo').addEventListener('click', () => {
    const lastMove = moveHistory.pop();
    if (lastMove) {
        redoHistory.push(lastMove);
        lastMove.cell.innerText = lastMove.prevValue;
    }
});

// Redo Move
document.getElementById('redo').addEventListener('click', () => {
    const lastRedo = redoHistory.pop();
    if (lastRedo) {
        moveHistory.push(lastRedo);
        lastRedo.cell.innerText = lastRedo.newValue;
    }
});

// Hint Feature
document.getElementById('hint').addEventListener('click', () => {
    const difficulty = difficultySelector.value;
    const solution = solutions[difficulty];
    const cells = [...grid.querySelectorAll('td')];
    const emptyCells = cells.filter((cell) => cell.textContent === '');
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = cells.indexOf(randomCell);
        randomCell.textContent = solution[index];
        randomCell.style.backgroundColor = '#f0e68c';
        setTimeout(() => (randomCell.style.backgroundColor = ''), 1000);
        hintSound.play();
    } else {
        alert('No empty cells to provide hints!');
    }
});

// Validation
document.getElementById('validate').addEventListener('click', () => {
    const difficulty = difficultySelector.value;
    const solution = solutions[difficulty];
    const cells = [...grid.querySelectorAll('td')];
    let isValid = true;

    cells.forEach((cell, index) => {
        if (cell.textContent !== solution[index]) {
            cell.style.backgroundColor = '#ffcccc';
            isValid = false;
        } else {
            cell.style.backgroundColor = '#ccffcc';
        }
    });

    setTimeout(() => cells.forEach((cell) => (cell.style.backgroundColor = '')), 2000);

    if (isValid) {
        completeSound.play();
        showLevelCompletedPopup(); // 👉 Show the Level Completed Popup when solved
    } else {
        alert('Some cells are incorrect.');
    }
});

// New Game Button
document.getElementById('new-game').addEventListener('click', () => {
    const difficulty = difficultySelector.value;
    generateGrid(generatePuzzle(difficulty));
});

// Restart Button
document.getElementById('restart').addEventListener('click', () => {
    const difficulty = difficultySelector.value;
    generateGrid(generatePuzzle(difficulty));
});

// Dark/Light Mode Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const mode = document.body.classList.contains('dark-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
    document.getElementById('theme-toggle').textContent = mode;
});

// 👉 Level Completed Popup
function showLevelCompletedPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');

    const content = document.createElement('div');
    content.classList.add('popup-content');
    content.innerHTML = `
        <h2>🎉 Level Completed!</h2>
        <button id="close-popup">Close</button>
    `;

    popup.appendChild(content);
    document.body.appendChild(popup);

    document.getElementById('close-popup').addEventListener('click', () => {
        popup.remove();
    });

    // Save Game State (optional, bonus)
    fetch('http://localhost:5000/api/games/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 'user123',
            difficulty: difficultySelector.value,
            puzzle: '', // If you want to store final puzzle you can pass it here
            theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        })
    })
    .then(response => response.json())
    .then(data => console.log('New game saved:', data))
    .catch(err => console.error('Error saving new game:', err));
}
