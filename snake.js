document.getElementById('startGameBtn').addEventListener('click', function() {
    // Hide the start button and display the game canvas
    document.getElementById('startGameBtn').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameOverPopup').style.display = 'none'; // Hide the game over popup

    // Start the Snake game when the button is clicked
    startSnakeGame();
});

function startSnakeGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Initialize audio elements
    const bgm = document.getElementById('bgm');
    const eatSound = document.getElementById('eatSound');
    const gameOverSound = document.getElementById('gameOverSound');

    // Get audio settings from local storage or use defaults
    const bgmEnabled = localStorage.getItem('bgmEnabled') === 'true';
    const sfxEnabled = localStorage.getItem('sfxEnabled') === 'true';
    const bgmVolume = parseFloat(localStorage.getItem('bgmVolume')) || 1;
    const sfxVolume = parseFloat(localStorage.getItem('sfxVolume')) || 1;

    // Set the volume for background music and sound effects
    bgm.volume = bgmVolume;
    eatSound.volume = sfxVolume;
    gameOverSound.volume = sfxVolume;

    // Play background music if enabled
    if (bgmEnabled) {
        bgm.loop = true;
        bgm.play().catch(error => {
            console.log("Error playing BGM:", error);
        });
    }

    const box = 20;
    const canvasSize = 400;
    let snake = [{x: Math.floor(canvasSize / 2 / box) * box, y: Math.floor(canvasSize / 2 / box) * box}];
    let food = generateFood();
    let score = 0;
    let direction = null;  // No initial direction until user input
    let game;

    // Snake head and body images
    const headUp = document.getElementById('headUp');
    const headLeft = document.getElementById('headLeft');
    const headDown = document.getElementById('headDown');
    const headRight = document.getElementById('headRight');
    const bodyImg = document.getElementById('bodyImg');

    // Control snake direction based on keyboard input
    document.addEventListener('keydown', directionControl);

    function directionControl(event) {
        if (event.key === 'a' && direction !== "RIGHT") direction = "LEFT";
        if (event.key === 'w' && direction !== "DOWN") direction = "UP";
        if (event.key === 'd' && direction !== "LEFT") direction = "RIGHT";
        if (event.key === 's' && direction !== "UP") direction = "DOWN";
    }

    // Generate food in a random position within the game area
    function generateFood() {
        let foodX, foodY;
        do {
            foodX = Math.floor(Math.random() * (canvasSize / box)) * box;
            foodY = Math.floor(Math.random() * (canvasSize / box)) * box;
        } while (
            foodX < box || foodX >= canvasSize - box ||
            foodY < box || foodY >= canvasSize - box
        );
        return {x: foodX, y: foodY};
    }

    function draw() {
        // Clear the canvas for each new frame
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        // Draw the game boundary
        ctx.strokeStyle = "#FF0000"; // Red border
        ctx.lineWidth = 35; // Border thickness
        ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2); // Draw boundary

        // Draw the food
        ctx.fillStyle = "#FF5722"; // Food color
        ctx.fillRect(food.x, food.y, box, box); // Food position

        // Draw the snake (head and body)
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                // Draw the snake's head based on direction
                if (direction === 'UP') {
                    ctx.drawImage(headUp, snake[i].x, snake[i].y, box, box);
                } else if (direction === 'LEFT') {
                    ctx.drawImage(headLeft, snake[i].x, snake[i].y, box, box);
                } else if (direction === 'DOWN') {
                    ctx.drawImage(headDown, snake[i].x, snake[i].y, box, box);
                } else if (direction === 'RIGHT') {
                    ctx.drawImage(headRight, snake[i].x, snake[i].y, box, box);
                }
            } else {
                // Draw the snake's body
                ctx.drawImage(bodyImg, snake[i].x, snake[i].y, box, box);
            }
        }

        // Get the snake's current head position
        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        // Move the snake based on the direction
        if (direction) {
            if (direction === "LEFT") snakeX -= box;
            if (direction === "UP") snakeY -= box;
            if (direction === "RIGHT") snakeX += box;
            if (direction === "DOWN") snakeY += box;
        }

        // Check if the snake eats the food
        if (snakeX === food.x && snakeY === food.y) {
            score++;
            if (sfxEnabled) eatSound.play(); // Play eating sound effect
            food = generateFood(); // Generate new food
            document.getElementById('scoreDisplay').innerHTML = "Score: " + score; // Update score display
        } else {
            snake.pop(); // Remove the last snake segment if no food is eaten
        }

        let newHead = {x: snakeX, y: snakeY};

        // Detect collision with walls (game over)
        if (newHead.x < 0 || newHead.y < 0 || newHead.x > canvasSize - box || newHead.y > canvasSize - box) {
            gameOver();
            return;
        }

        // Detect collision with the snake's body (game over)
        if (collision(newHead, snake.slice(1))) { // Avoid checking collision with the head
            gameOver();
            return;
        }

        // Add new head to the snake
        snake.unshift(newHead);
    }

    // Game over function to stop the game and show the popup
    function gameOver() {
        clearInterval(game); // Stop the game
        if (bgmEnabled) bgm.pause(); // Pause background music
        if (sfxEnabled) gameOverSound.play(); // Play game over sound

        // Show game over popup and display final score
        document.getElementById('gameOverPopup').style.display = 'block';
        document.getElementById('gameOverScore').innerHTML = "Final Score: " + score;

        // Hide canvas and bring back start button
        document.getElementById('gameCanvas').style.display = 'none';
    }

    // Collision detection for snake body
    function collision(head, array) {
        for (let i = 0; i < array.length; i++) {
            if (head.x === array[i].x && head.y === array[i].y) {
                return true;
            }
        }
        return false;
    }

    // Run the game loop at 100ms interval
    game = setInterval(draw, 100);
}

// Function to close the game over popup and restart
function closeGameOverPopup() {
    document.getElementById('gameOverPopup').style.display = 'none';
    document.getElementById('startGameBtn').style.display = 'block'; // Show start button again
}
