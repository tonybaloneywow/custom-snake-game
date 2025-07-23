document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('menuPlayButton');
    const popup = document.getElementById('gamePopup');
    const exitButton = document.getElementById('exitButton');
    
    // Preload the popup image
    const popupImg = new Image();
    popupImg.src = './Pop-Ups/Difficulty.png';
    document.getElementById('popupImage').src = popupImg.src;

    playButton.addEventListener('click', function() {
        popup.style.display = 'flex';
    });
    
    // Exit button functionality
    exitButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });
});