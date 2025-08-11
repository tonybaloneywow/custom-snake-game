document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('menuPlayButton');
    const settingsButton = document.getElementById('settingsButton');
    const gamePopup = document.getElementById('gamePopup');
    const settingsPopup = document.getElementById('settingsPopup');
    const exitButton = document.getElementById('exitButton');
    const exitSettingsButton = document.getElementById('exitSettingsButton');

    // Preload popup images
    const popupImg = new Image();
    popupImg.src = './Pop-Ups/Difficulty.png';
    document.getElementById('popupImage').src = popupImg.src;

    const settingsPopupImg = new Image();
    settingsPopupImg.src = './Pop-Ups/SettingsMenu.png'; // Replace with your settings image
    document.getElementById('settingsPopupImage').src = settingsPopupImg.src;

    // Play Button → Difficulty Pop-Up
    playButton.addEventListener('click', function() {
        gamePopup.style.display = 'flex';
    });

    // Settings Button → Settings Pop-Up
    settingsButton.addEventListener('click', function() {
        settingsPopup.style.display = 'flex';
    });

    // Exit Buttons
    exitButton.addEventListener('click', function() {
        gamePopup.style.display = 'none';
    });

    exitSettingsButton.addEventListener('click', function() {
        settingsPopup.style.display = 'none';
    });
});

// Sound Functions (Keep existing)
let playButtonSound = () => new Audio("Sounds/ButtonClick.mp3").play();
let playDifficultySound = () => new Audio("Sounds/DifficultyClick.mp3").play();

// Prevent right-click
document.addEventListener('contextmenu', event => event.preventDefault());

