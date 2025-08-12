document.addEventListener('DOMContentLoaded', function() {
    // Get all required elements
    const playButton = document.getElementById('menuPlayButton');
    const settingsButton = document.getElementById('settingsButton');
    const gamePopup = document.getElementById('gamePopup');
    const settingsPopup = document.getElementById('settingsPopup');
    const exitButton = document.getElementById('exitButton');
    const exitSettingsButton = document.getElementById('exitSettingsButton');
    const musicToggle = document.getElementById('musicToggle');
    const sfxToggle = document.getElementById('sfxToggle');

    // Preload popup images
    const popupImg = new Image();
    popupImg.src = './Pop-Ups/Difficulty.png';
    document.getElementById('popupImage').src = popupImg.src;

    const settingsPopupImg = new Image();
    settingsPopupImg.src = './Pop-Ups/SettingsMenu.png';
    document.getElementById('settingsPopupImage').src = settingsPopupImg.src;

    // Button event handlers
    playButton.addEventListener('click', function() {
        gamePopup.style.display = 'flex';
    });

    settingsButton.addEventListener('click', function() {
        settingsPopup.style.display = 'flex';
        loadToggleStates();
    });

    exitButton.addEventListener('click', function() {
        gamePopup.style.display = 'none';
    });

    exitSettingsButton.addEventListener('click', function() {
        settingsPopup.style.display = 'none';
    });

    // Load and set toggle states - FIXED LOGIC
    function loadToggleStates() {
        // Load saved settings (default to true if not set)
        const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
        
        // Set toggle states - now correctly matches visual representation
        musicToggle.checked = musicEnabled;
        sfxToggle.checked = sfxEnabled;
        
        // Initialize audio states
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            bgMusic.muted = !musicEnabled;
            if (musicEnabled) bgMusic.play().catch(() => {});
        }
    }

    // Initialize toggles
    loadToggleStates();

    // Music toggle handler - FIXED LOGIC
    musicToggle.addEventListener('change', function() {
        const isEnabled = this.checked;
        localStorage.setItem('musicEnabled', isEnabled);
        
        // Update current page's music
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            bgMusic.muted = !isEnabled;
            if (isEnabled) bgMusic.play().catch(() => {});
        }
    });

    // SFX toggle handler - FIXED LOGIC
    sfxToggle.addEventListener('change', function() {
        localStorage.setItem('sfxEnabled', this.checked);
    });
});

// Sound functions that respect SFX setting - FIXED LOGIC
function playButtonSound() {
    const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
    if (sfxEnabled) {
        const sound = document.getElementById('buttonSound');
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Button sound error:", e));
    }
}

function playDifficultySound() {
    const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
    if (sfxEnabled) {
        const sound = document.getElementById('difficultySound');
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Difficulty sound error:", e));
    }
}

// Prevent right-click
document.addEventListener('contextmenu', event => event.preventDefault());