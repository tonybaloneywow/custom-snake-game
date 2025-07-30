// Game board settings
const blockSize = 50;
const appleSize = 41.66;
const rows = 15;
const cols = 28;
let board, context;

// Speeds
let baseSpeed = 1000/15; // Current speed (12 FPS)
let speedMultiplier = 1; // Normal speed
let speedBoostEndTime = 0; // When speed boost ends

// Game state variables
let replayButton, score = 0;
let invertedControls = false, gameInterval, gameOver = false;
let snakeX = blockSize * 5, snakeY = blockSize * 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [], foodX, foodY;
let currentDirection = null, nextDirection = null;

const appleTypes = [
    {
        name: "normal",
        image: "./Apples/normal.png",
        effect: () => {},
        points: 1,
        weight: 0.4
    },
    {
        name: "sour",
        image: "./Apples/sour.png",
        effect: () => {}, // Does nothing
        points: 0,
        weight: 0.1
    },
    {
        name: "lightning",
        image: "./Apples/lightning.png",
        effect: () => {
            speedMultiplier = 1.5;
            speedBoostEndTime = Date.now() + 5000;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, baseSpeed / speedMultiplier);
        },
        points: 1,
        weight: 0.2
    },
    {
        name: "frozen",
        image: "./Apples/frozen.png",
        effect: () => {
            speedMultiplier = 0.65; // 0.65x speed
            speedBoostEndTime = Date.now() + 7000; // 10 seconds duration
            clearInterval(gameInterval);
            gameInterval = setInterval(update, baseSpeed / speedMultiplier);
        },
        points: 1,
        weight: 0.2
    },
    {
        name: "rotten",
        image: "./Apples/rotten.png",
        effect: () => {
            invertedControls = true;
            setTimeout(() => {
                invertedControls = false;
            }, 3000);
        },
        points: 1,
        weight: 0.5
    }
    
];

let currentApple = appleTypes[0];

// Snake Head
const snakeHeadImg = new Image();
snakeHeadImg.src = './Snake/Head.png';

// Background Images
const mapImages = [
    './BGS/Lava.png',
    './BGS/Crossroads.png',
    './BGS/Space.png',
    './BGS/Ice.png',
    './BGS/Summer.png'
];
let currentMap = '';
const backgroundImage = new Image();

// Initialize game
window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d");
    
    // Disable image smoothing
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    
    document.addEventListener("keydown", changeDirection);
    board.style.cursor = 'none';
    document.getElementById('gameOverPopup').style.pointerEvents = 'auto';

    replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", resetGame);

    resetGame();
};

function update() {
    if (gameOver) return;

    checkSpeedBoost();

    // Apply buffered direction when grid-aligned
    if (nextDirection && snakeX % blockSize === 0 && snakeY % blockSize === 0) {
        applyDirectionChange();
    }

    // Draw background
    context.drawImage(backgroundImage, 0, 0, board.width, board.height);

    // Draw apple
    const appleImg = new Image();
appleImg.src = currentApple.image;
const appleOffsetX = Math.round((blockSize - appleSize)/2);
const appleOffsetY = Math.round((blockSize - 50)/2);

// Special case for lightning apple
if (currentApple.name === "lightning") {
    // Draw at full block size
    context.drawImage(appleImg, foodX, foodY, blockSize, blockSize);
} else {
    // Original drawing with offsets for other apples
    context.drawImage(appleImg, foodX + appleOffsetX, foodY + appleOffsetY, appleSize, 50);
}

    // Apple collision
    if (snakeX === foodX && snakeY === foodY) {
        currentApple.effect();
        score += currentApple.points;
        
        // Only grow for these apple types
        if (currentApple.name === "normal" || 
            currentApple.name === "lightning" || 
            currentApple.name === "frozen") {
            snakeBody.unshift([snakeX, snakeY]);
        }

        // no sour apple here cuz no grow..

        placeFood();
    }

    // Update snake body
    if (velocityX !== 0 || velocityY !== 0) {
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i-1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }
    }

    // Move snake head
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    // Check collisions
    checkWallCollision();
    checkSelfCollision();

    // Draw snake body
    context.fillStyle = "#4C7AF2";
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }
    
    // Draw snake head
    drawSnakeHead(snakeX, snakeY);
} // This closing brace was missing

    // Update snake body
    if (velocityX !== 0 || velocityY !== 0) {
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i-1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }
    }

    // Move snake head
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    // Check collisions
    checkWallCollision();
    checkSelfCollision();

    // Draw snake body
    context.fillStyle = "#4C7AF2";
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }
    
    // Draw snake head
    drawSnakeHead(snakeX, snakeY);


function placeFood() {
    // Select random apple type
    const totalWeight = appleTypes.reduce((sum, apple) => sum + apple.weight, 0);
    let random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const apple of appleTypes) {
        cumulativeWeight += apple.weight;
        if (random <= cumulativeWeight) {
            currentApple = apple;
            break;
        }
    }

    // Find valid position
    let validPosition = false;
    let newFoodX, newFoodY;
    let attempts = 0;
    
    while (!validPosition && attempts < 100) {
        attempts++;
        newFoodX = Math.floor(Math.random() * cols) * blockSize;
        newFoodY = Math.floor(Math.random() * rows) * blockSize;
        
        let collision = false;
        if (newFoodX === snakeX && newFoodY === snakeY) collision = true;
        
        for (let i = 0; i < snakeBody.length && !collision; i++) {
            if (newFoodX === snakeBody[i][0] && newFoodY === snakeBody[i][1]) {
                collision = true;
            }
        }
        
        if (!collision) validPosition = true;
    }
    
    foodX = validPosition ? newFoodX : 0;
    foodY = validPosition ? newFoodY : 0;
}

function applyDirectionChange() {
    if (!isValidTurn(nextDirection)) return;

    switch (nextDirection) {
        case "up": 
            velocityX = 0; 
            velocityY = -1;
            currentDirection = "up";
            break;
        case "down":
            velocityX = 0;
            velocityY = 1;
            currentDirection = "down";
            break;
        case "left":
            velocityX = -1;
            velocityY = 0;
            currentDirection = "left";
            break;
        case "right":
            velocityX = 1;
            velocityY = 0;
            currentDirection = "right";
            break;
    }
    nextDirection = null;
}

function isValidTurn(newDir) {
    return !(
        (currentDirection === "up" && newDir === "down") ||
        (currentDirection === "down" && newDir === "up") ||
        (currentDirection === "left" && newDir === "right") ||
        (currentDirection === "right" && newDir === "left")
    );
}

function changeDirection(e) {
    // First key press starts the game if not moving
    if (velocityX === 0 && velocityY === 0) {
        let key = e.code;
        
        // Apply inversion if active
        if (invertedControls) {
            key = {
                'ArrowUp': 'ArrowDown',
                'ArrowDown': 'ArrowUp',
                'ArrowLeft': 'ArrowRight',
                'ArrowRight': 'ArrowLeft',
                'KeyW': 'KeyS',
                'KeyS': 'KeyW',
                'KeyA': 'KeyD',
                'KeyD': 'KeyA'
            }[key] || key;
        }

        // Start moving based on first key press
        switch(key) {
            case "ArrowUp": case "KeyW":
                velocityX = 0; velocityY = -1; currentDirection = "up"; 
                break;
            case "ArrowDown": case "KeyS":
                velocityX = 0; velocityY = 1; currentDirection = "down"; 
                break;
            case "ArrowLeft": case "KeyA":
                velocityX = -1; velocityY = 0; currentDirection = "left"; 
                break;
            case "ArrowRight": case "KeyD":
                velocityX = 1; velocityY = 0; currentDirection = "right"; 
                break;
        }
        return;
    }

    // Buffer direction changes for smooth movement
    let key = e.code;
    
    // Apply inversion if active
    if (invertedControls) {
        key = {
            'ArrowUp': 'ArrowDown',
            'ArrowDown': 'ArrowUp',
            'ArrowLeft': 'ArrowRight',
            'ArrowRight': 'ArrowLeft',
            'KeyW': 'KeyS',
            'KeyS': 'KeyW',
            'KeyA': 'KeyD',
            'KeyD': 'KeyA'
        }[key] || key;
    }

    // Prevent 180-degree turns
    switch(key) {
        case "ArrowUp": case "KeyW":
            if (currentDirection !== "down") nextDirection = "up";
            break;
        case "ArrowDown": case "KeyS":
            if (currentDirection !== "up") nextDirection = "down";
            break;
        case "ArrowLeft": case "KeyA":
            if (currentDirection !== "right") nextDirection = "left";
            break;
        case "ArrowRight": case "KeyD":
            if (currentDirection !== "left") nextDirection = "right";
            break;
    }
}

function applyDirectionChange() {
    // Only change direction when aligned to grid
    if (snakeX % blockSize === 0 && snakeY % blockSize === 0) {
        if (!isValidTurn(nextDirection)) return;

        switch(nextDirection) {
            case "up": 
                velocityX = 0; velocityY = -1; 
                currentDirection = "up";
                break;
            case "down":
                velocityX = 0; velocityY = 1;
                currentDirection = "down";
                break;
            case "left":
                velocityX = -1; velocityY = 0;
                currentDirection = "left";
                break;
            case "right":
                velocityX = 1; velocityY = 0;
                currentDirection = "right";
                break;
        }
        nextDirection = null;
    }
}

function checkWallCollision() {
    if (snakeX < 0 || snakeX >= cols * blockSize || 
        snakeY < 0 || snakeY >= rows * blockSize) {
        endGame("Game Over - Hit the wall!");
    }
}

function checkSelfCollision() {
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            endGame("Game Over - Ate yourself!");
            break;
        }
    }
}

function endGame(message) {
    gameOver = true;
    document.body.style.cursor = 'default';

    const popup = document.getElementById("gameOverPopup");
    const gameOverImg = document.getElementById("gameOverImage");
    gameOverImg.src = './Screens/GameOver.png';
    popup.style.display = "block";
}

function resetGame() {
    document.getElementById("gameOverPopup").style.display = "none";
    
    // Reset game state
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    gameOver = false;
    currentDirection = null;
    nextDirection = null;
    invertedControls = false;
    score = 0;
    
    // Clear existing interval
    if (gameInterval) clearInterval(gameInterval);
    
    // Load random map
    loadRandomMap();
    
    // Place new food
    placeFood();
    
    // no inverted at reset
    invertedControls = false;


    speedMultiplier = 1;
    speedBoostEndTime = 0;

    // Hide cursor again
    document.body.style.cursor = 'none';
    board.style.cursor = 'none';
    
    // Start new game loop
    gameInterval = setInterval(update, baseSpeed / speedMultiplier);
}

function drawSnakeHead(x, y) {
    if (!snakeHeadImg.complete) {
        context.fillRect(x, y, blockSize, blockSize);
        return;
    }

    context.save();
    context.translate(x + blockSize/2, y + blockSize/2);

    let angle = 0;
    if (velocityX === 1) angle = 0;
    if (velocityX === -1) angle = Math.PI;
    if (velocityY === -1) angle = -Math.PI/2;
    if (velocityY === 1) angle = Math.PI/2;

    context.rotate(angle);
    context.drawImage(
        snakeHeadImg,
        -blockSize/2, -blockSize/2,
        blockSize, blockSize
    );
    context.restore();
}

function loadRandomMap() {
    const randomIndex = Math.floor(Math.random() * mapImages.length);
    currentMap = mapImages[randomIndex];
    backgroundImage.src = currentMap;
}

function checkSpeedBoost() {
    if (speedMultiplier !== 1 && Date.now() > speedBoostEndTime) {
        speedMultiplier = 1; // Reset to normal speed
        clearInterval(gameInterval);
        gameInterval = setInterval(update, baseSpeed / speedMultiplier);
    }
}