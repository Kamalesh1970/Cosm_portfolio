// main.js - Entry point for the Solar System Explorer
import { SceneManager } from './core/SceneManager.js';
import { Loader } from './core/Loader.js';
import { AudioManager } from './audio/AudioManager.js';
import { DebugPanel } from './debug/DebugPanel.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { init } from './init.js';

async function main() {
    // Initialize core systems
    let sceneManager;
    try {
        sceneManager = new SceneManager();
    } catch (e) {
        // SceneManager constructor throws if WebGL is unavailable —
        // the fallback message is already displayed, so just bail.
        console.error('SceneManager init failed:', e);
        return;
    }

    const loader = new Loader();
    const audioManager = new AudioManager();
    const debugPanel = null;
    const stats = import.meta.env.DEV ? new Stats() : null;

    if (stats) {
        stats.dom.style.position = 'fixed';
        stats.dom.style.top = '0';
        stats.dom.style.left = '0';
        stats.dom.style.zIndex = '10000';
        document.body.appendChild(stats.dom);
    }

    // ── "D" key toggles FPS counter visibility ──
    let statsVisible = true;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            if (stats) {
                statsVisible = !statsVisible;
                stats.dom.style.display = statsVisible ? 'block' : 'none';
            }
        }
    });

    // Start the game
    await init({ sceneManager, loader, audioManager, debugPanel, stats });

    // Start the game loop
    sceneManager.start();
}

// Start the app when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}