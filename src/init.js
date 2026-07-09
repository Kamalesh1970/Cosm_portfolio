// init.js - Main initialization function that sets up all systems
import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { Loader } from './core/Loader.js';
import { InputManager } from './core/InputManager.js';
import { Clock } from './core/Clock.js';
import { GravityEngine } from './physics/GravityEngine.js';
import { RapierWorld } from './physics/RapierWorld.js';
import { Spacecraft } from './ship/Spacecraft.js';
import { FlightController } from './ship/FlightController.js';
import { ChaseCamera } from './ship/ChaseCamera.js';
import { Sun } from './world/Sun.js';
import { Planet } from './world/Planet.js';
import { PLANET_DATA } from './world/PlanetData.js';
import { Starfield } from './world/Starfield.js';
import { AsteroidBelt } from './world/AsteroidBelt.js';
import { SaturnRings } from './world/SaturnRings.js';
import { ProximityDetector } from './interaction/ProximityDetector.js';
import { ArrivalSequence } from './interaction/ArrivalSequence.js';
import { CameraRig } from './interaction/CameraRig.js';
import { HUD } from './ui/HUD.js';
import { ContentPanel } from './ui/ContentPanel.js';
import { LoadingScreen } from './ui/LoadingScreen.js';
import { AudioManager } from './audio/AudioManager.js';
import { DebugPanel } from './debug/DebugPanel.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// Exploration & Debug imports
import { ExplorationManager } from './core/ExplorationManager.js';
import { DevConsole } from './ui/DevConsole.js';

export async function init({ sceneManager, loader, audioManager, debugPanel, stats }) {
    console.group('Solar System Explorer Initialization');

    // ==========================================
    // STAGE 1: CORE SYSTEMS & LOADING SCREEN
    // ==========================================
    console.groupCollapsed('Stage 1: Core Systems');
    let loadingScreen, clock, inputManager, camera;
    try {
        loadingScreen = new LoadingScreen({ text: 'Loading Solar System Explorer...' });
        loadingScreen.show();

        let progressFired = false;

        loader.onProgress((progress) => {
            progressFired = true;
            if (typeof loadingScreen.setProgress === 'function') {
                loadingScreen.setProgress(progress * 100);
            }
        });

        loader.onLoad(() => {
            console.log('All assets loaded via LoadingManager.');
            loadingScreen.hide();
        });

        clock = new Clock();
        inputManager = new InputManager();
        camera = sceneManager.getCamera();
        console.log('Core systems initialized successfully.');
    } catch (error) {
        console.error('Stage 1 failed:', error);
        if (loadingScreen) loadingScreen.showError('Error in Core Systems initialization.');
        throw error;
    }
    console.groupEnd();

    // ==========================================
    // STAGE 2: PHYSICS
    // ==========================================
    console.groupCollapsed('Stage 2: Physics Engine');
    let gravityEngine, rapierWorld;
    try {
        gravityEngine = new GravityEngine([]);
        rapierWorld = new RapierWorld();
        await rapierWorld.init();
        loadingScreen.setProgress(10);
        console.log('Physics engine initialized successfully.');
    } catch (error) {
        console.error('Stage 2 failed:', error);
        loadingScreen.showError('Physics engine failed to load.');
        throw error;
    }
    console.groupEnd();

    // ==========================================
    // STAGE 3: SUN, PLANETS, TEXTURES
    // ==========================================
    console.groupCollapsed('Stage 3: Planets and Textures');
    let sun, planets = {}, planetLoadPromises = [];
    try {
        sun = new Sun(sceneManager.getScene(), loader);
        planetLoadPromises.push(sun.loadTextures()); // Asynchronously load sun textures

        const planetKeys = Object.keys(PLANET_DATA).filter(key => key !== 'sun');
        for (const key of planetKeys) {
            planets[key] = new Planet(sceneManager.getScene(), key, loader);
            sceneManager.getScene().add(planets[key].getMesh());

            planetLoadPromises.push(planets[key].loadTextures());

            gravityEngine.addBody({
                mass: PLANET_DATA[key].mass,
                position: planets[key].getPosition(),
                velocity: new THREE.Vector3(0, 0, 0),
                isSun: false,
                key: key
            });
        }

        loadingScreen.setProgress(20);
        console.log(`Loading textures for Sun and ${planetKeys.length} planets...`);
        const planetResults = await Promise.allSettled(planetLoadPromises);

        planetResults.forEach((result, i) => {
            if (result.status === 'rejected') {
                console.warn(`Planet texture ${i} failed:`, result.reason);
            }
        });

        loadingScreen.setProgress(60);
        console.log('Planetary bodies generated and textures loaded.');
    } catch (error) {
        console.error('Stage 3 failed:', error);
        loadingScreen.showError('Error building planetary system.');
        throw error;
    }
    console.groupEnd();

    // ==========================================
    // STAGE 4: STARS, ASTEROIDS, RINGS
    // ==========================================
    console.groupCollapsed('Stage 4: Cosmic Elements');
    let starfield, asteroidBelt, saturnRings;
    try {
        starfield = new Starfield(sceneManager.getScene(), loader, { starCount: 8000, size: 2000 });
        asteroidBelt = new AsteroidBelt(sceneManager.getScene(), rapierWorld, loader);

        saturnRings = planets.saturn ? new SaturnRings(sceneManager.getScene(), loader, {
            innerRadius: planets.saturn.radius * 0.0001 * 100 * 1.2,
            outerRadius: planets.saturn.radius * 0.0001 * 100 * 2.5
        }) : null;

        const cosmicPromises = [];
        cosmicPromises.push(asteroidBelt.loadTextures());
        if (saturnRings) cosmicPromises.push(saturnRings.loadTextures());
        if (starfield.loadTextures) cosmicPromises.push(starfield.loadTextures());
        await Promise.allSettled(cosmicPromises);

        loadingScreen.setProgress(80);
        console.log('Cosmic elements generated.');
    } catch (error) {
        console.error('Stage 4 failed:', error);
    }
    console.groupEnd();

    // ==========================================
    // STAGE 5: SPACECRAFT, CAMERA RIG, HUD, AUDIO
    // ==========================================
    console.groupCollapsed('Stage 5: Player Systems & UI');
    let spacecraft, chaseCamera, cameraRig, proximityDetector, arrivalSequence, hud, contentPanel;
    let explorationManager, devConsole;
    try {
        spacecraft = new Spacecraft(sceneManager.getScene());
        spacecraft.mesh.position.set(0, 0, -100);

        const shipBody = rapierWorld.createRigidBody(spacecraft.mesh, {
            mass: 1000,
            linearDamping: 0.01,
            angularDamping: 0.01
        });

        rapierWorld.createCollider(spacecraft.mesh, {
            type: 'capsule',
            radius: 1,
            height: 4
        }, { density: 10 });

        chaseCamera = new ChaseCamera(camera, spacecraft, {
            distance: 20,
            height: 8,
            smoothing: 0.1
        });

        cameraRig = new CameraRig(camera);
        cameraRig.setChaseMode(spacecraft,
            new THREE.Vector3(0, 8, -20),
            new THREE.Vector3(0, 2, 0)
        );

        proximityDetector = new ProximityDetector(spacecraft, Object.values(planets), {
            arrivalDistance: 30
        });

        arrivalSequence = new ArrivalSequence(sceneManager.getScene(), camera, {
            orbitRadius: 40,
            orbitHeight: 15,
            duration: 3.5
        });

        hud = new HUD({
            showSpeed: true,
            showCompass: true,
            showControls: true,
            ControlsTimeout: 3000
        });

        contentPanel = new ContentPanel({
            width: 400,
            animationDuration: 0.5
        });

        // Initialize Exploration Manager and Developer Console
        explorationManager = new ExplorationManager(
            sceneManager.getScene(),
            spacecraft,
            camera,
            hud,
            contentPanel
        );
        hud.explorationManager = explorationManager;

        devConsole = new DevConsole(
            sceneManager,
            explorationManager,
            rapierWorld,
            asteroidBelt
        );

        // Initialize Audio safely
        await audioManager.init().catch(e => console.warn('Audio Init Error (Ignored):', e));

        audioManager.loadSound('engine-thrust', '/audio/engine-hum.mp3', { loop: true, volume: 0.3 });
        audioManager.loadSound('ambient-space', '/audio/ambient-space.mp3', { loop: true, volume: 0.2 });
        audioManager.loadSound('arrival-chime', '/audio/arrival-chime.mp3', { loop: false, volume: 0.5 });

        try {
            audioManager.playAmbientMusic();
        } catch (e) { console.warn('Autoplay prevented:', e); }

        // UI Events
        window.addEventListener('spacecraft-arrival', (event) => {
            const { planet } = event.detail;
            arrivalSequence.start(planet, () => {
                const planetData = PLANET_DATA[planet.key];
                if (planetData) {
                    contentPanel.show(planetData.contentHTML, planetData.sectionTitle);
                }
                setTimeout(() => proximityDetector.resumeDetection(), 1000);
            });
        });

        window.addEventListener('planetApproach', (event) => {
            const { distance } = event.detail;
            if (distance < 10 && !audioManager.isPlaying('arrival-chime')) {
                audioManager.playArrivalChime();
            }
        });

        document.addEventListener('click', (e) => {
            if (contentPanel.isVisible &&
                !contentPanel.element.contains(e.target) &&
                !contentPanel.closeButton.contains(e.target)) {
                contentPanel.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && contentPanel.isVisible) {
                contentPanel.hide();
            }
        });

        loadingScreen.setProgress(95);
        console.log('Player systems, UI and audio initialized.');
    } catch (error) {
        console.error('Stage 5 failed:', error);
        loadingScreen.showError('Failed to initialize player systems.');
        throw error;
    }
    console.groupEnd();

    // ==========================================
    // STAGE 6: GAME LOOP
    // ==========================================
    console.groupCollapsed('Stage 6: Game Loop');
    let lastTime = 0, accumulator = 0;
    const fixedTimeStep = 1 / 60;

    function animate(timestamp) {
        if (!sceneManager.isRunning) return;

        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        inputManager.update();
        if (stats) stats.begin();

        accumulator += deltaTime;
        while (accumulator >= fixedTimeStep) {
            gravityEngine.update(fixedTimeStep);
            rapierWorld.step(fixedTimeStep);
            accumulator -= fixedTimeStep;
        }

        sun.update(deltaTime);
        for (const planet of Object.values(planets)) {
            planet.update(deltaTime);
        }
        if (asteroidBelt) asteroidBelt.update(deltaTime);
        if (saturnRings && planets.saturn) {
            saturnRings.update(deltaTime, planets.saturn.getPosition(), planets.saturn.getMesh().rotation.y);
        }

        spacecraft.update(deltaTime, inputManager, inputManager.keys);
        chaseCamera.update(deltaTime);
        cameraRig.update(deltaTime);
        proximityDetector.update(deltaTime);
        hud.update(spacecraft, proximityDetector.getNearestPlanet());

        // Update secrets exploration system
        if (explorationManager) {
            explorationManager.update(deltaTime, planets);

            // Update meteor projectiles
            if (explorationManager.projectiles) {
                for (let i = explorationManager.projectiles.length - 1; i >= 0; i--) {
                    const p = explorationManager.projectiles[i];
                    p.timer += deltaTime;
                    p.mesh.position.addScaledVector(p.velocity, deltaTime);

                    // Dispose older meteors
                    if (p.timer > 6.0) {
                        sceneManager.getScene().remove(p.mesh);
                        p.mesh.geometry.dispose();
                        p.mesh.material.dispose();
                        explorationManager.projectiles.splice(i, 1);
                    }
                }
            }
        }

        sceneManager.composer.render();
        if (stats) stats.end();

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    clock.start();

    loadingScreen.setProgress(100);
    loadingScreen.hide();

    console.log('Game loop started successfully.');
    console.groupEnd();

    console.groupEnd(); // End Main Initialization Group

    return {
        sceneManager, loader, inputManager, clock, gravityEngine, rapierWorld,
        sun, planets, starfield, asteroidBelt, saturnRings, spacecraft, chaseCamera,
        cameraRig, proximityDetector, arrivalSequence, hud, contentPanel, audioManager,
        debugPanel, stats, explorationManager, devConsole
    };
}