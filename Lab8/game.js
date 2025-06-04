const timerDisplay = document.getElementById('timerDisplay');
const gameBoard = document.getElementById('gameBoard');
const restartGameBtn = document.getElementById('restartGameBtn');
const statsTableBody = document.getElementById('statsTable').getElementsByTagName('tbody')[0];

const totalNumbers = 20;
const gameTimeLimit = 60;

let currentExpectedNumber = 1;
let timeLeft = gameTimeLimit;
let timerInterval;
let gameStats = [];
let gameIdCounter = 0;

const fontSizes = ['1.1em', '1.3em', '1.5em', '1.7em', '1.9em']; // варіанти розміру шрифту

function loadStats() {
    const storedStats = localStorage.getItem('numberGameStats');
    if (storedStats) {
        gameStats = JSON.parse(storedStats);
        gameIdCounter = gameStats.length > 0 ? Math.max(...gameStats.map(s => s.game), 0) : 0;
    }
    renderStatsTable();
}

function saveStats() {
    localStorage.setItem('numberGameStats', JSON.stringify(gameStats));
}

function getRandomTextColor() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 60; // насиченість для яскравості
    const l = Math.floor(Math.random() * 30) + 20; // світлість для видимості на білому фоні
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// алгоритм перемішування
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function populateBoard() {
    gameBoard.innerHTML = '';
    let numbersToPlace = [];
    for (let i = 1; i <= totalNumbers; i++) {
        numbersToPlace.push(i);
    }
    shuffleArray(numbersToPlace);

    numbersToPlace.forEach(num => {
        const cell = document.createElement('div');
        cell.classList.add('number-cell');
        cell.textContent = num;
        cell.dataset.value = num; // зберігаємо число в data-атрибуті

        cell.style.fontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];
        cell.style.color = getRandomTextColor();

        cell.addEventListener('click', handleNumberClick);
        gameBoard.appendChild(cell);
    });
}

function handleNumberClick(event) {
    const clickedCell = event.target;
    const clickedValue = parseInt(clickedCell.dataset.value);

    if (clickedValue === currentExpectedNumber) {
        clickedCell.classList.add('clicked-correctly');
        currentExpectedNumber++;

        if (currentExpectedNumber > totalNumbers) {
            gameWon();
        }
    } else {
        alert('Не вірна цифра');
    }
}

function initGame() {
    currentExpectedNumber = 1;
    timeLeft = gameTimeLimit;
    
    stopTimer();
    populateBoard();
    updateTimerDisplay();
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            gameOverTimeOut();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    timerDisplay.textContent = `Залишилось: ${timeLeft}`;
}

function gameOverTimeOut() {
    stopTimer();
    alert('Час вийшов! Спробуйте ще раз.');
    addStatRecord('Не завершено (час)');
}

function gameWon() {
    stopTimer();
    const timeTaken = gameTimeLimit - timeLeft;
    alert(`Вітаємо! Ви пройшли гру за ${timeTaken} с.`);
    addStatRecord(`${timeTaken} с.`);
    initGame(); // автоматичний перезапуск після перемоги
}

function addStatRecord(timeResult) {
    gameIdCounter++;
    const newStat = { game: gameIdCounter, time: timeResult };
    gameStats.push(newStat);
    
    saveStats();
    renderStatsTable();
}

function renderStatsTable() {
    statsTableBody.innerHTML = '';

    if (gameStats.length === 0) {
        const row = statsTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'Поки що немає жодної гри в історії.';
        cell.style.textAlign = 'center';
        return;
    }

    let bestTimeValue = Infinity;
    gameStats.forEach(stat => {
        if (stat.time.includes('с.')) { // перевірка на успішно завершену гру
            const time = parseInt(stat.time);
            if (time < bestTimeValue) {
                bestTimeValue = time;
            }
        }
    });
    
    const sortedStats = [...gameStats].sort((a, b) => {
        const timeAIsNumber = a.time.includes('с.');
        const timeBIsNumber = b.time.includes('с.');
        const valA = timeAIsNumber ? parseInt(a.time) : Infinity;
        const valB = timeBIsNumber ? parseInt(b.time) : Infinity;

        if (valA !== valB) return valA - valB; // сортування за часом
        return b.game - a.game; // якщо час однаковий, новіші ігри вище
    });

    sortedStats.forEach(stat => {
        const row = statsTableBody.insertRow();
        const cellGame = row.insertCell();
        const cellTime = row.insertCell();

        cellGame.textContent = `Гра ${stat.game}`;
        cellTime.textContent = stat.time;

        if (stat.time.includes('с.') && parseInt(stat.time) === bestTimeValue && bestTimeValue !== Infinity) {
            row.classList.add('best-result'); // підсвічування найкращого результату
        }
    });
}

restartGameBtn.addEventListener('click', () => {
    if (timeLeft > 0 && timeLeft < gameTimeLimit && currentExpectedNumber <= totalNumbers) {
        // якщо гра була в процесі і не завершена
        addStatRecord('Перезапущено');
    }
    stopTimer(); 
    initGame();
});

window.onload = () => {
    loadStats();
    initGame(); 
};