// Game board settings
const blockSize = 50;
const appleSize = 41.66;
const rows = 15;
const cols = 28;
let board, context;


// Game objects
const appleImage = new Image();
appleImage.src = './Apples/normal.png';

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
    setInterval(update, 1000/10); // Increased to 10 FPS for smoother movement

    // Force hide cursor on canvas
    board.style.cursor = 'none';
    
    // Ensure game over popup can be clicked
    document.getElementById('gameOverPopup').style.pointerEvents = 'auto';
};

function update() {
    if (gameOver) return;

    // Apply buffered direction immediately when grid-aligned
    if (nextDirection && snakeX % blockSize === 0 && snakeY % blockSize === 0) {
        applyDirectionChange();
    }

    // Clear canvas
    context.fillStyle = "#A2D149";
    context.fillRect(0, 0, board.width, board.height);

    const appleWidth = 41.66;
    const appleHeight = 50;
    
    context.drawImage(
        appleImage,
        foodX + (blockSize - appleWidth)/2,
        foodY + (blockSize - appleHeight)/2,
        appleWidth,
        appleHeight
    );

    // Check food collision
    if (snakeX === foodX && snakeY === foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
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
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }
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
    
    // Optional: Click anywhere to close
    popup.onclick = function() {
        popup.style.display = "none";
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