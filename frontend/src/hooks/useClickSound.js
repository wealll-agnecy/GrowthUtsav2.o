import { useEffect, useRef } from 'react';

/**
 * Global Click Sound System (Production Hardened)
 * Author: Antigravity
 */
const CLICK_SOUND_URL = 'https://www.soundjay.com/buttons/button-16.mp3'; // Professional UI Click

export const useClickSound = () => {
    const audioRef = useRef(null);

    useEffect(() => {
        console.log('📡 [SOUND_SYSTEM]: Initializing global audio listener...');
        
        // Preload sound
        const audio = new Audio(CLICK_SOUND_URL);
        audio.preload = 'auto';
        audio.volume = 0.8; // Increased volume for clarity
        audioRef.current = audio;

        const handleInteraction = (e) => {
            const target = e.target;
            
            // Detection Logic
            const checkInteractivity = (el) => {
                if (!el || el === document.body) return false;
                
                const tag = el.tagName;
                const role = el.getAttribute('role');
                const cursor = window.getComputedStyle(el).cursor;

                if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return true;
                if (['button', 'link', 'menuitem', 'tab'].includes(role)) return true;
                if (cursor === 'pointer') return true;
                
                return checkInteractivity(el.parentElement);
            };

            if (checkInteractivity(target)) {
                if (audioRef.current) {
                    console.log('🔊 [SOUND_SYSTEM]: Play Triggered');
                    // Reset and play
                    audioRef.current.currentTime = 0;
                    const playPromise = audioRef.current.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn('⚠️ [SOUND_SYSTEM]: Autoplay blocked or interrupted', error.message);
                        });
                    }
                }
            }
        };

        // Attach listeners for both touch and mouse
        document.addEventListener('click', handleInteraction, true);
        
        return () => {
            document.removeEventListener('click', handleInteraction, true);
        };
    }, []);
};
