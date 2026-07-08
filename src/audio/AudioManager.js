// AudioManager.js - Handles all audio using Howler.js
import { Howl, Howler } from 'howler';
import * as THREE from 'three';

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.listeners = {};
        this.isInitialized = false;
        
        // Audio listener (would be connected to camera in 3D audio implementation)
        this.listener = {
            position: new THREE.Vector3(0, 0, 0),
            forward: new THREE.Vector3(0, 0, -1),
            up: new THREE.Vector3(0, 1, 0)
        };
        
        // Audio context for potential Web Audio API usage
        this.audioContext = null;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Initialize Howler.js
            // Howler.js is already loaded globally
            
            // Create audio context for advanced features if needed
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            } catch (e) {
                console.warn('Web Audio API not available:', e);
            }
            
            this.isInitialized = true;
            console.log('AudioManager initialized');
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
        }
    }
    
    /**
     * Load a sound effect
     * @param {string} key - Identifier for the sound
     * @param {string} url - Path to audio file
     * @param {Object} options - Howl options
     * @returns {Howl} The loaded sound object
     */
    loadSound(key, url, options = {}) {
        if (this.sounds[key]) {
            console.warn(`Sound with key ${key} already exists, overwriting`);
            this.sounds[key].unload();
        }
        
        const soundOptions = {
            src: [url],
            loop: false,
            volume: 1.0,
            ...options
        };
        
        const sound = new Howl(soundOptions);
        this.sounds[key] = sound;
        
        return sound;
    }
    
    /**
     * Get a loaded sound
     * @param {string} key - Sound identifier
     * @returns {Howl|null} The sound object or null if not found
     */
    getSound(key) {
        return this.sounds[key] || null;
    }
    
    /**
     * Play a sound
     * @param {string} key - Sound identifier
     * @returns {Promise} Promise that resolves when sound starts playing
     */
    play(key) {
        const sound = this.getSound(key);
        if (!sound) {
            console.warn(`Sound ${key} not found`);
            return Promise.reject(new Error(`Sound ${key} not found`));
        }
        
        return new Promise((resolve, reject) => {
            const id = sound.play();
            
            if (id !== null) {
                // Sound started playing successfully
                sound.once('end', () => {
                    resolve();
                });
                resolve();
            } else {
                // Sound failed to play (likely due to autoplay restrictions)
                sound.once('playerror', () => {
                    reject(new Error(`Failed to play sound ${key} - likely due to autoplay restrictions`));
                });
                reject(new Error(`Failed to play sound ${key}`));
            }
        });
    }
    
    /**
     * Stop a sound
     * @param {string} key - Sound identifier
     */
    stop(key) {
        const sound = this.getSound(key);
        if (sound) {
            sound.stop();
        }
    }
    
    /**
     * Pause a sound
     * @param {string} key - Sound identifier
     */
    pause(key) {
        const sound = this.getSound(key);
        if (sound) {
            sound.pause();
        }
    }
    
    /**
     * Set volume for a sound
     * @param {string} key - Sound identifier
     * @param {number} volume - Volume (0-1)
     */
    setVolume(key, volume) {
        const sound = this.getSound(key);
        if (sound) {
            sound.volume(volume);
        }
    }
    
    /**
     * Set loop for a sound
     * @param {string} key - Sound identifier
     * @param {boolean} loop - Whether to loop
     */
    setLoop(key, loop) {
        const sound = this.getSound(key);
        if (sound) {
            sound.loop(loop);
        }
    }
    
    /**
     * Play ambient space music
     */
    playAmbientMusic() {
        const ambient = this.getSound('ambient-space');
        if (ambient) {
            ambient.play();
        }
    }
    
    /**
     * Stop ambient space music
     */
    stopAmbientMusic() {
        const ambient = this.getSound('ambient-space');
        if (ambient) {
            ambient.stop();
        }
    }
    
    /**
     * Play engine thrust sound (looped)
     */
    playEngineThrust() {
        const engine = this.getSound('engine-thrust');
        if (engine) {
            // Modulate volume based on thrust (would be updated in game loop)
            engine.play();
        }
    }
    
    /**
     * Stop engine thrust sound
     */
    stopEngineThrust() {
        const engine = this.getSound('engine-thrust');
        if (engine) {
            engine.stop();
        }
    }
    
    /**
     * Set engine thrust volume based on thrust level (0-1)
     * @param {number} thrustLevel - Normalized thrust amount
     */
    setEngineThrustVolume(thrustLevel) {
        const engine = this.getSound('engine-thrust');
        if (engine) {
            // Base volume + throttle effect
            const baseVolume = 0.2;
            const throttleEffect = 0.3 * thrustLevel;
            const finalVolume = Math.min(0.7, baseVolume + throttleEffect);
            engine.volume(finalVolume);
        }
    }
    
    /**
     * Play arrival chime
     */
    playArrivalChime() {
        const chime = this.getSound('arrival-chime');
        if (chime) {
            chime.play();
        }
    }
    
    /**
     * Play collision sound
     */
    playCollisionSound() {
        const collision = this.getSound('collision');
        if (collision) {
            // Add slight randomization to pitch for variety
            const rate = 0.8 + Math.random() * 0.4;
            collision.rate(rate);
            collision.play();
        }
    }
    
    /**
     * Set master volume (affects all sounds)
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        Howler.volume(volume);
    }
    
    /**
     * Get master volume
     * @returns {number} Current master volume (0-1)
     */
    getMasterVolume() {
        return Howler.volume();
    }
    
    /**
     * Mute all sounds
     */
    mute() {
        Howler.mute(true);
    }
    
    /**
     * Unmute all sounds
     */
    unmute() {
        Howler.mute(false);
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        Howler.mute(!Howler.muted());
    }
    
    /**
     * Check if muted
     * @returns {boolean} True if muted
     */
    isMuted() {
        return Howler.muted();
    }
    
    /**
     * Check if a sound is currently playing
     * @param {string} key - Sound identifier
     * @returns {boolean} True if sound is playing
     */
    isPlaying(key) {
        const sound = this.getSound(key);
        return sound ? sound.playing() : false;
    }
    
    /**
     * Get the duration of a sound
     * @param {string} key - Sound identifier
     * @returns {number} Duration in seconds
     */
    getDuration(key) {
        const sound = this.getSound(key);
        return sound ? sound.duration() : 0;
    }
    
    /**
     * Unload a sound to free memory
     * @param {string} key - Sound identifier
     */
    unload(key) {
        const sound = this.getSound(key);
        if (sound) {
            sound.unload();
            delete this.sounds[key];
        }
    }
    
    /**
     * Unload all sounds
     */
    unloadAll() {
        Object.values(this.sounds).forEach(sound => {
            sound.unload();
        });
        this.sounds = {};
    }
    
    /**
     * Set up 3D audio position (for future enhancement)
     * @param {THREE.Vector3} position - Position in 3D space
     * @param {THREE.Vector3} forward - Forward direction
     * @param {THREE.Vector3} up - Up direction
     */
    setListenerOrientation(position, forward, up) {
        if (position) this.listener.position.copy(position);
        if (forward) this.listener.forward.copy(forward);
        if (up) this.listener.up.copy(up);
        
        // In a full 3D audio implementation, we'd use PannerNode or similar
        // For now, we'll just store the values
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.unloadAll();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.sounds = {};
        this.listeners = {};
        this.isInitialized = false;
    }
}

// Default audio configuration
export const AUDIO_CONFIG = {
    // Engine sounds
    engineThrust: {
        src: '/audio/engine-hum.mp3',
        loop: true,
        volume: 0.3
    },
    
    // Ambient sounds
    ambientSpace: {
        src: '/audio/ambient-space.mp3',
        loop: true,
        volume: 0.2
    },
    
    // UI/Feedback sounds
    arrivalChime: {
        src: '/audio/arrival-chime.mp3',
        loop: false,
        volume: 0.5
    },
    
    collision: {
        src: '/audio/collision.mp3',
        loop: false,
        volume: 0.6
    },
    
    // Menu sounds (if we add a menu later)
    menuSelect: {
        src: '/audio/menu-select.mp3',
        loop: false,
        volume: 0.4
    },
    
    menuBack: {
        src: '/audio/menu-back.mp3',
        loop: false,
        volume: 0.4
    }
};