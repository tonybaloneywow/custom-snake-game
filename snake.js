//board
var blockSize = 50;
var appleSize = 41.66;
var rows = 15;
var cols = 28;
var board;
var context;

const appleImage = new Image();
appleImage.src = './Apples/apple.png';

// context.onload = function(){
//     context.drawImage(appleImage, 50, 20, 150, 40)
// }


//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var  foodX;
var foodY;

var gameOver = false;

appleImage.onload = function() {
    appleLoaded = true;
}

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;

    placeFood();
    document.addEventListener("keyup", changeDirection);
    // update();
    setInterval(update, 1000/8.5); //100 milliseconds


}

function update() {
    if (gameOver) return;

    // Clear canvas
    context.fillStyle = "#A2D149";
    context.fillRect(0, 0, board.width, board.height);

    // Draw apple (with anti-aliasing disabled)
    context.imageSmoothingEnabled = false;
    context.drawImage(appleImage, foodX, foodY, appleSize, blockSize);

    // Check if snake ate food
    if (snakeX === foodX && snakeY === foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
    }

    // Update snake body positions
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // Move snake head
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    // Border collision detection (all four walls)
    if (snakeX < 0 || snakeX >= cols * blockSize || 
        snakeY < 0 || snakeY >= rows * blockSize) {
        endGame("Game Over - Hit the wall!");
        return;
    }

    // Draw snake head and body
    context.fillStyle = "#4C7AF2";
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Self-collision detection
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            endGame("Game Over - Ate yourself!");
            break;
        }
    }
}

// Add this helper function outside update():
function endGame(message) {
    gameOver = true;
    alert(message);
    // Optional: Add restart button logic here later
}

function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }
    if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }
    if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// function drawApple( x, y){
//     console.log(x);
//     console.log(y);
//     context.drawImage(appleImage, foodX, foodY, blockSize, blockSize)
// }

function placeFood() {
    //0-1) *cols -> (0-19.99999) -> (0-19) * 25
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
    // drawApple(foodX, foodY);
 
}