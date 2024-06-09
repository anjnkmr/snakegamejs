const BOARD_CLASS = 'level-board';
const SNAKE_HEAD_ID = 'snake-head';
const SNAKE_BODY_CLASS = 'snake-body';
const SNAKE_FOOD_ID = 'snake-food';
const PAUSE_BUTTON_CLASS = 'pause-button';
const RESUME_BUTTON_CLASS = 'resume-button';
const RESTART_BUTTON_CLASS = 'restart-button';
const SCORE_SELECTOR = '.game-metrics-container .score-container .score';

const SNAKE_PART_SIZE = 20;
let score = 0;
let startTime = new Date();

const board = document.querySelector(`.${BOARD_CLASS}`);

const boardDimensions = board.getBoundingClientRect();
const boardWidth = Math.floor(boardDimensions.width / SNAKE_PART_SIZE) * SNAKE_PART_SIZE;
const boardHeight = Math.floor(boardDimensions.height / SNAKE_PART_SIZE) * SNAKE_PART_SIZE;

// Fixing dimensions of the board to avoid issues with screen resizing
fixBoardDimensions(boardWidth, boardHeight); 

// Random position for the snake
let randomX = Math.floor(Math.random() * (boardWidth / SNAKE_PART_SIZE)) * SNAKE_PART_SIZE;
let randomY = Math.floor(Math.random() * (boardHeight / SNAKE_PART_SIZE)) * SNAKE_PART_SIZE;

if (randomX <= SNAKE_PART_SIZE * 5) {
    randomX = SNAKE_PART_SIZE * 5;
}
if (randomY <= SNAKE_PART_SIZE * 5) {
    randomY = SNAKE_PART_SIZE * 5;
}


const setGameButtonsVisibility = (state) => {
    const pauseButton = document.querySelector(`.${PAUSE_BUTTON_CLASS}`);
    const resumeButton = document.querySelector(`.${RESUME_BUTTON_CLASS}`);
    const restartButton = document.querySelector(`.${RESTART_BUTTON_CLASS}`);

    if (pauseButton) {
        pauseButton.style.display = state === 'running' ? 'inline-block' : 'none';
    }

    if (resumeButton) {
        resumeButton.style.display = state === 'paused' ? 'inline-block' : 'none';
    }

    if (restartButton) {
        restartButton.style.display = state === 'paused' ? 'inline-block' : 'none';
    }
};

let movementIntervalId = null;
let currentDirection = 'right';
let currentGameState = 'running';

// Creating the snake
const snake = createSnake(randomX, randomY);
startGame();



function createSnake(x, y) {
    const snake = {
        head: createSnakeHead(SNAKE_HEAD_ID, x, y),
        body: []
    };
    return snake;
}

function createSnakeHead(id, x, y) {
    const snakeHead = document.createElement('div');
    snakeHead.id = id;
    snakeHead.style.left = `${x}px`;
    snakeHead.style.top = `${y}px`;
    board.appendChild(snakeHead);
    return snakeHead;
}

function addBodyPart(withScore = false) {
    // get the last body part or the head if there is no body parts
    let lastBodyPart = snake.head;
    if (snake.body.length > 0) {
        lastBodyPart = snake.body[snake.body.length - 1];
    }

    const x = parseInt(lastBodyPart.style.left) - SNAKE_PART_SIZE;
    const y = parseInt(lastBodyPart.style.top);


    const snakeBodyPart = document.createElement('div');
    snakeBodyPart.classList.add(SNAKE_BODY_CLASS);
    snakeBodyPart.style.left = `${x}px`;
    snakeBodyPart.style.top = `${y}px`;
    board.appendChild(snakeBodyPart);
    snake.body.push(snakeBodyPart);

    if (withScore) score++;

    // update the score
    const scoreElement = document.querySelector(SCORE_SELECTOR);
    if (scoreElement) {
        // padd with zeros to make it 3 digits
        scoreElement.textContent = score.toString().padStart(3, '0');
    }
}

function fixBoardDimensions(width, height) {
    board.style.width = `${width}px`;
    board.style.height = `${height}px`;
}



function startGame() {
    for (let i = 0; i < 5; i++) {
        addBodyPart();
    }

    addInputListeners();
    // keepMoving(currentDirection);
    currentGameState = 'running';
    setGameButtonsVisibility(currentGameState);

    randomFoodGenerator();
}

function randomFoodGenerator() {
    const food = document.createElement('div');
    food.id = SNAKE_FOOD_ID;
    food.style.left = `${Math.floor(Math.random() * (boardWidth / SNAKE_PART_SIZE)) * SNAKE_PART_SIZE}px`;
    food.style.top = `${Math.floor(Math.random() * (boardHeight / SNAKE_PART_SIZE)) * SNAKE_PART_SIZE}px`;
    board.appendChild(food);
}

function touchScreenEventListner(event) {
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const head = snake.head;
    const headX = head.getBoundingClientRect().left;
    const headY = head.getBoundingClientRect().top;
    const diffX = x - headX;
    const diffY = y - headY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            keepMoving('right');
        } else {
            keepMoving('left');
        }
    } else {
        if (diffY > 0) {
            keepMoving('down');
        } else {
            keepMoving('up');
        }
    }
}
function eventListner(event) {
    switch (event.key) {
        case 'Escape':
            currentGameState === 'running' ? pauseGame() : resumeGame();
            break;
        case 'ArrowUp':
            keepMoving('up');
            break;
        case 'ArrowDown':
            keepMoving('down');
            break;
        case 'ArrowLeft':
            keepMoving('left');
            break;
        case 'ArrowRight':
            keepMoving('right');
            break;
    }
}

function addInputListeners() {
    document.addEventListener('keydown', eventListner);
    document.addEventListener('touchstart', touchScreenEventListner);
}

function keepMoving(direction) {
    if (movementIntervalId) {
        clearInterval(movementIntervalId);
    }
    if (currentGameState === 'paused') {
        return;
    }
    currentDirection = direction;
    movementIntervalId = setInterval(() => {
        moveSnake(direction);
    }, 100);
}

function moveSnake(direction) {
    const head = snake.head;
    let x = head.style.left;
    let y = head.style.top;
    switch (direction) {
        case 'up':
            y = parseInt(y) - SNAKE_PART_SIZE;
            break;
        case 'down':
            y = parseInt(y) + SNAKE_PART_SIZE;
            break;
        case 'left':
            x = parseInt(x) - SNAKE_PART_SIZE;
            break;
        case 'right':
            x = parseInt(x) + SNAKE_PART_SIZE;
            break;
    }

    // move the body parts
    let previousX = head.style.left;
    let previousY = head.style.top;

    head.style.left = `${x}px`;
    head.style.top = `${y}px`;

    snake.body.forEach((bodyPart) => {
        const tempX = bodyPart.style.left;
        const tempY = bodyPart.style.top;
        bodyPart.style.left = previousX;
        bodyPart.style.top = previousY;
        previousX = tempX;
        previousY = tempY;
    });

    detectWallCollision();
    detectFoodCollection();
    // detectSelfCollision();
}

function detectFoodCollection() {
    const head = snake.head;
    const food = document.getElementById(SNAKE_FOOD_ID);
    if (head.style.left === food.style.left && head.style.top === food.style.top) {
        board.removeChild(food);
        addBodyPart(true);
        randomFoodGenerator();
    }
}

function detectWallCollision() {
    const head = snake.head;
    if (parseInt(head.style.left) < 0 || parseInt(head.style.left) >= boardWidth) {
        endGame();
    }
    if (parseInt(head.style.top) < 0 || parseInt(head.style.top) >= boardHeight) {
        endGame();
    }
}

function detectSelfCollision() {
    const head = snake.head;
    snake.body.forEach((bodyPart) => {
        if (head.style.left === bodyPart.style.left && head.style.top === bodyPart.style.top) {
            endGame();
        }
    });
}

function endGame() {
    alert('Game Over!');
    restartGame();
}

// reset the game without reloading the page
function restartGame() {
    clearInterval(movementIntervalId);
    movementIntervalId = null;

    // remove event listeners
    document.removeEventListener('keydown', eventListner);
    document.removeEventListener('touchstart', touchScreenEventListner);

    // remove the snake from the board
    board.removeChild(snake.head);
    snake.body.forEach((bodyPart) => {
        board.removeChild(bodyPart);
    });

    // remove food
    const food = document.getElementById(SNAKE_FOOD_ID);
    if (food) {
        board.removeChild(food);
    }

    // reset the snake
    const randomX = Math.floor(Math.random() * (boardWidth / SNAKE_PART_SIZE)) * SNAKE_PART_SIZE;
    const randomY = Math.floor(Math.random() * (boardHeight / SNAKE_PART_SIZE)) * SNAKE_PART_SIZE;
    snake.head = createSnakeHead(SNAKE_HEAD_ID, randomX, randomY);
    snake.body = [];

    startGame();
}

function pauseGame() {
    clearInterval(movementIntervalId);
    movementIntervalId = null;
    
    currentGameState = 'paused';
    setGameButtonsVisibility(currentGameState);
}

function resumeGame() {
    currentGameState = 'running';
    setGameButtonsVisibility(currentGameState);
    keepMoving(currentDirection);
}
