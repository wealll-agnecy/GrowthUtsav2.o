/**
 * GrowthUtsav Centralized Sound Manager
 * Provides a unified interface for system-wide notification sounds.
 */

const SOUND_URLS = {
    notification: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
    paymentSuccess: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
    success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
    reject: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    scanSuccess: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    scanDenied: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    login: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    logout: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    error: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
    delete: "https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3"
};

const audioInstances = {};

// Initialize instances
Object.entries(SOUND_URLS).forEach(([key, url]) => {
    const audio = new Audio(url);
    audio.volume = 0.4; // Subtle volume
    audioInstances[key] = audio;
});

/**
 * Play a specific system sound
 * @param {string} type - The type of sound to play (matches keys in SOUND_URLS)
 */
export const playSound = (type) => {
    // Check global mute preference
    const isMuted = localStorage.getItem('gu_sound_muted') === 'true';
    if (isMuted) return;

    const sound = audioInstances[type];
    if (sound) {
        // Reset and play
        sound.currentTime = 0;
        sound.play().catch(err => {
            // Chrome/Modern browsers block autoplay sounds until first user interaction
            console.debug(`Sound (${type}) playback deferred/blocked:`, err.message);
        });
    }
};

/**
 * Toggle global sound state
 * @returns {boolean} New mute state
 */
export const toggleSound = () => {
    const currentState = localStorage.getItem('gu_sound_muted') === 'true';
    const newState = !currentState;
    localStorage.setItem('gu_sound_muted', String(newState));
    return newState;
};
