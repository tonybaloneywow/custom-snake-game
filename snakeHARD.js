// Game board settings
const blockSize = 50;
const appleSize = 41.66;
const rows = 15;
const cols = 28;
let board, context;

// Replay Button
let replayButton;

// Game objects
const appleImage = new Image();
appleImage.src = './Apples/normal.png';

// Snake Head
const snakeHeadImg = new Image();
snakeHeadImg.src = './Snake/Head.png';

// Background Image (Canvas)
const mapImages = [
    './BGS/Lava.png',
    './BGS/Crossroads.png',
    './BGS/Space.png',
    './BGS/Ice.png',
    './BGS/Summer.png'
];
let currentMap = '';
const backgroundImage = new Image();

let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

let velocityX = 0;
let velocityY = 0;

let snakeBody = [];
let foodX, foodY;
let gameOver = false;

// Movement control - now more responsive
let currentDirection = null;
let nextDirection = null;
const turnDelay = 0; // No cooldown for instant turns



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
    
    placeFood();
    document.addEventListener("keydown", changeDirection);
    setInterval(update, 1000/12); // Increased to 10 FPS for smoother movement

    // Force hide cursor on canvas
    board.style.cursor = 'none';
    
    // Ensure game over popup can be clicked
    document.getElementById('gameOverPopup').style.pointerEvents = 'auto';

    // Set up replay button
    replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", resetGame);

    resetGame();

};

function update() {
    if (gameOver) return;

    // Apply buffered direction immediately when grid-aligned
    if (nextDirection && snakeX % blockSize === 0 && snakeY % blockSize === 0) {
        applyDirectionChange();
    }

    context.drawImage(backgroundImage, 0, 0, board.width, board.height);


    const appleWidth = 41.66;
    const appleHeight = 50;
    
    context.drawImage(
        appleImage,
        foodX + (blockSize - appleWidth)/2,
        foodY + (blockSize - appleHeight)/2,
        appleWidth,
        appleHeight
    );

    if (!(snakeX === foodX && snakeY === foodY)) {
        const appleOffset = (blockSize - appleSize) / 2;
        context.drawImage(
            appleImage,
            foodX + appleOffset,
            foodY + appleOffset,
            appleSize,
            appleSize
        );
    }

    // Check food collision
    if (snakeX === foodX && snakeY === foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood(); // Get new apple position immediately
    }

    // Update snake body
    if (velocityX !== 0 || velocityY !== 0) { // Only move if started
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
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

    // Draw snake
    context.fillStyle = "#4C7AF2";
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }
    
    // Draw rotated head
    drawSnakeHead(snakeX, snakeY);
}

function applyDirectionChange() {
    // Prevent 180° turns
    if (!isValidTurn(nextDirection)) return;

    switch (nextDirection) {
        case "up": velocityX = 0; velocityY = -1; break;
        case "down": velocityX = 0; velocityY = 1; break;
        case "left": velocityX = -1; velocityY = 0; break;
        case "right": velocityX = 1; velocityY = 0; break;
    }
    currentDirection = nextDirection;
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
    // First key press starts the game
    if (velocityX === 0 && velocityY === 0) {
        // Start moving in the pressed direction
        switch(e.code) {
            case "ArrowUp": case "KeyW":
                velocityX = 0; velocityY = -1; currentDirection = "up"; return;
            case "ArrowDown": case "KeyS":
                velocityX = 0; velocityY = 1; currentDirection = "down"; return;
            case "ArrowLeft": case "KeyA":
                velocityX = -1; velocityY = 0; currentDirection = "left"; return;
            case "ArrowRight": case "KeyD":
                velocityX = 1; velocityY = 0; currentDirection = "right"; return;
        }
    }

    // Buffer the direction change
    switch(e.code) {
        case "ArrowUp": case "KeyW":
            if (currentDirection !== "down") nextDirection = "up"; break;
        case "ArrowDown": case "KeyS":
            if (currentDirection !== "up") nextDirection = "down"; break;
        case "ArrowLeft": case "KeyA":
            if (currentDirection !== "right") nextDirection = "left"; break;
        case "ArrowRight": case "KeyD":
            if (currentDirection !== "left") nextDirection = "right"; break;
    }
}

// ... (keep existing checkWallCollision, checkSelfCollision, endGame, placeFood functions)
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

function endGame() {
    gameOver = true;
    
    document.body.style.cursor = 'default';

    // Show your image popup
    const popup = document.getElementById("gameOverPopup");
    const gameOverImg = document.getElementById("gameOverImage");
    
    // Set your image source (use your existing image path)
    gameOverImg.src = './Screens/GameOver.png'; // Update this to your exact image filename
    
    // Center the popup on screen
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
    
    // Load random map
    loadRandomMap();
    
    // Place new food
    placeFood();
    
    // Hide cursor again
    document.body.style.cursor = 'none';
    board.style.cursor = 'none';
    
    // Redraw the initial state
    // Note: We need to wait for the new background image to load
    backgroundImage.onload = function() {
        update();
    };
}

function placeFood() {
    let validPosition = false;
    let newFoodX, newFoodY;
    
    // Keep trying random positions until we find a valid one
    while (!validPosition) {
        newFoodX = Math.floor(Math.random() * cols) * blockSize;
        newFoodY = Math.floor(Math.random() * rows) * blockSize;
        
        // Check if this position collides with snake head
        const headCollision = (newFoodX === snakeX && newFoodY === snakeY);
        
        // Check if this position collides with any snake body segment
        let bodyCollision = false;
        for (let i = 0; i < snakeBody.length; i++) {
            if (newFoodX === snakeBody[i][0] && newFoodY === snakeBody[i][1]) {
                bodyCollision = true;
                break;
            }
        }
        
        // If no collisions, we found a valid position
        if (!headCollision && !bodyCollision) {
            validPosition = true;
        }
    }
    
    foodX = newFoodX;
    foodY = newFoodY;
}

// Function causes snake turn movement
function drawSnakeHead(x, y) {
    if (!snakeHeadImg.complete) {
        // Fallback if image not loaded
        context.fillRect(x, y, blockSize, blockSize);
        return;
    }

    context.save(); // Save current canvas state
    context.translate(x + blockSize/2, y + blockSize/2); // Move to center of head

    // Calculate rotation angle based on velocity
    let angle = 0;
    if (velocityX === 1) angle = 0;         // Right
    if (velocityX === -1) angle = Math.PI;   // Left
    if (velocityY === -1) angle = -Math.PI/2; // Up
    if (velocityY === 1) angle = Math.PI/2;   // Down

    context.rotate(angle); // Apply rotation
    context.drawImage(
        snakeHeadImg,
        -blockSize/2, -blockSize/2, // Draw from center
        blockSize, blockSize
    );
    context.restore(); // Restore canvas state
} 

// Add to your game variables
const eatSound = document.getElementById('eatSound');
eatSound.volume = 1.0; // Adjust volume (0.0 to 1.0)

// Modify your apple collision code
function checkAppleCollision() {
    if (snakeX === foodX && snakeY === foodY) {
        // Play eating sound
        eatSound.currentTime = 0;
    }
}

function loadRandomMap() {
    // Randomly select a map
    const randomIndex = Math.floor(Math.random() * mapImages.length);
    currentMap = mapImages[randomIndex];
    backgroundImage.src = currentMap;
}