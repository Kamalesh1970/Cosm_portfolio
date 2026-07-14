// ExplorationManager.js - Manages hidden objects, achievements, alien signals, black holes, space station, and AI companion.
import * as THREE from 'three';
import { PLANET_DATA } from '../world/PlanetData.js';

export class ExplorationManager {
    constructor(scene, spacecraft, camera, hud, contentPanel) {
        this.scene = scene;
        this.spacecraft = spacecraft;
        this.camera = camera;
        this.hud = hud;
        this.contentPanel = contentPanel;

        // Exploration state database
        this.discoveries = {
            planetsVisited: {},     // planetKey: true
            satellitesFound: {},    // satelliteId: true
            alienSignalDecoded: false,
            spaceStationDocked: false,
            blackHoleEscaped: false,
            secretMoonDiscovered: false,
            consoleUnlocked: false,
            voiceLogsCollected: 0,
            portalEntered: false
        };

        // Total exploration counts
        this.totalSecrets = 18; // 8 planets, 4 satellites, alien signal, space station, black hole, secret moon, dev console, destroyed ship
        
        // Lists of entities
        this.satellites = [];
        this.easterEggs = [];
        this.projectiles = []; // for meteor showers
        this.voiceLogs = this.createVoiceLogsData();
        this.currentVoiceLogIndex = 0;

        // Sound configuration (synthesized speech via SpeechSynthesis)
        this.speechEnabled = 'speechSynthesis' in window;
        this.lastSpeakTime = 0;

        // Timing variables
        this.eventTimer = 0;
        this.solarFlareActive = false;

        // Initialize all subsystems
        this.initSatellites();
        this.initAlienSignal();
        this.initBlackHole();
        this.initSecretMoon();
        this.initSpaceStation();
        this.initDestroyedShip();
        this.initEasterEggs();
        this.initDynamicEvents();

        // Introduce the AI Assistant
        setTimeout(() => {
            this.speakAI("Welcome back, Commander Kamalesh. Systems initialized. Fly close to celestial bodies or explore uncharted space to discover secrets.");
        }, 1500);
    }

    // AI Assistant Speech & HUD Subtitles
    speakAI(text, priority = false) {
        // Dispatch HUD event to render subtitles
        window.dispatchEvent(new CustomEvent('ai-assistant-message', { detail: { text } }));

        if (this.speechEnabled) {
            // Cancel current speaking if priority
            if (priority) {
                window.speechSynthesis.cancel();
            }
            // Debounce speech synthesis to avoid overlapping chatter
            const now = Date.now();
            if (priority || now - this.lastSpeakTime > 4000) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.pitch = 1.0;
                utterance.rate = 1.15;
                utterance.volume = 0.8;
                // Try to find a nice robotic/english voice
                const voices = window.speechSynthesis.getVoices();
                const engVoice = voices.find(v => v.lang.includes('en'));
                if (engVoice) utterance.voice = engVoice;
                
                window.speechSynthesis.speak(utterance);
                this.lastSpeakTime = now;
            }
        }
    }

    // Define Commander Kamalesh's voice logs
    createVoiceLogsData() {
        return [
            {
                title: "Log 01: The Spark",
                content: "Commander Kamalesh's Personal Log - Year 2021. 'Why AI? It started when I realized that static code just responds, but AI learns. The journey from learning Python to training neural networks opened a universe of possibilities. I want to build systems that act as cognitive extensions of humanity.'"
            },
            {
                title: "Log 02: College & Hackathons",
                content: "Commander Kamalesh's Personal Log - Year 2022. 'Hackathons are the crucible of engineering. Building a working prototype in 36 sleepless hours taught me more about fast iteration and system design than any textbook. Failure is just compressed learning.'"
            },
            {
                title: "Log 03: The Internship Wreck",
                content: "Commander Kamalesh's Personal Log - Year 2023. 'Working on production systems during internships taught me the beauty of scale. It isn't just about making it work; it is about performance, optimization, caching, and robust recovery when things break.'"
            },
            {
                title: "Log 04: The Vision",
                content: "Commander Kamalesh's Personal Log - Year 2024. 'Computer Vision and Robotics are where the digital brain meets the physical world. Developing algorithms that allow robots to navigate environments autonomously feels like breathing life into copper and silicon.'"
            },
            {
                title: "Log 05: Future Horizons",
                content: "Commander Kamalesh's Personal Log - Year 2026. 'We are building the space explorers of tomorrow. Intelligent probes, autonomous gravity-assists, agentic models. The mission is simple: keep pushing boundaries. The sky is no longer the limit.'"
            }
        ];
    }

    // 1. Hidden Satellites
    initSatellites() {
        // Orbit radii are relative to their parent planet meshes
        // We will attach them to their planet meshes so they rotate naturally!
        const satelliteData = [
            { parent: 'earth', name: 'ISS Explorer', radius: 10, speed: 0.8, color: 0x4cc9f0, fact: "Fun Fact: The ISS completes an orbit around Earth every 90 minutes, traveling at 5 miles per second!" },
            { parent: 'mars', name: 'Curiosity Beacon', radius: 8, speed: 0.5, color: 0xf72585, fact: "Inspiration: Mars holds the remnants of our curiosity. This beacon represents the rover pathing algorithms that inspire autonomous AI flight controllers." },
            { parent: 'jupiter', name: 'Galilean Probe', radius: 15, speed: 0.3, color: 0xffb703, fact: "Dev Note: Jupiter's intense gravitational field was profiled to fine-tune our physics engine's vector integrators." },
            { parent: 'saturn', name: 'Cassini Tribute', radius: 22, speed: 0.2, color: 0xff007f, fact: "Log: Sourcing Saturn's ring alpha transparency from Solar System Scope map made Cassini's grand finale render complete." }
        ];

        satelliteData.forEach((sat, i) => {
            const group = new THREE.Group();
            
            // Central core
            const coreGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
            const coreMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.1 });
            const core = new THREE.Mesh(coreGeom, coreMat);
            group.add(core);

            // Solar panels (wings)
            const wingGeom = new THREE.BoxGeometry(1.6, 0.05, 0.4);
            const wingMat = new THREE.MeshStandardMaterial({ color: 0x2233ff, emissive: 0x111166, metalness: 0.5 });
            const wing = new THREE.Mesh(wingGeom, wingMat);
            wing.position.set(0, 0, 0);
            group.add(wing);

            // Dish
            const dishGeom = new THREE.ConeGeometry(0.3, 0.2, 8);
            const dishMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const dish = new THREE.Mesh(dishGeom, dishMat);
            dish.position.set(0, 0.4, 0);
            dish.rotation.x = Math.PI / 2;
            group.add(dish);

            group.name = `sat-${sat.name}`;
            this.satellites.push({
                mesh: group,
                parentKey: sat.parent,
                name: sat.name,
                radius: sat.radius,
                speed: sat.speed,
                fact: sat.fact,
                discovered: false,
                angle: Math.random() * Math.PI * 2
            });
        });
    }

    // 2. Alien Signal
    initAlienSignal() {
        // Positioned deep in space
        const group = new THREE.Group();
        
        // Tetrahedron core
        const geom = new THREE.TetrahedronGeometry(3, 0);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00ff66,
            emissive: 0x00aa33,
            roughness: 0.1,
            metalness: 0.9
        });
        const core = new THREE.Mesh(geom, mat);
        group.add(core);

        // Outer rotating ring
        const ringGeom = new THREE.TorusGeometry(5, 0.2, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        group.add(ring);

        group.position.set(4000, 150, -4000);
        this.scene.add(group);

        this.alienSignal = {
            mesh: group,
            ring: ring,
            position: group.position.clone(),
            decoded: false
        };
    }

    // 3. Black Hole
    initBlackHole() {
        const group = new THREE.Group();

        // Event Horizon (Singularity sphere)
        const singularityGeom = new THREE.SphereGeometry(15, 32, 32);
        const singularityMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const singularity = new THREE.Mesh(singularityGeom, singularityMat);
        group.add(singularity);

        // Accretion Disk
        const diskGeom = new THREE.TorusGeometry(35, 8, 2, 64);
        const diskMat = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.75,
            wireframe: true
        });
        const disk = new THREE.Mesh(diskGeom, diskMat);
        disk.rotation.x = Math.PI / 2.5;
        group.add(disk);

        // Distant Gravitational Boundary helper
        group.position.set(0, 0, 18000);
        this.scene.add(group);

        // Particle disk flow
        const particlesGeom = new THREE.BufferGeometry();
        const positions = [];
        const count = 300;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 20 + Math.random() * 80;
            positions.push(Math.cos(angle) * r, (Math.random() - 0.5) * 5, Math.sin(angle) * r);
        }
        particlesGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const particlesMat = new THREE.PointsMaterial({ color: 0xff6600, size: 1.5, transparent: true, opacity: 0.8 });
        const particles = new THREE.Points(particlesGeom, particlesMat);
        group.add(particles);

        this.blackHole = {
            mesh: group,
            disk: disk,
            particles: particles,
            position: group.position.clone(),
            escaped: false
        };
    }

    // 4. Secret Moon
    initSecretMoon() {
        const group = new THREE.Group();

        // Moon body
        const geom = new THREE.SphereGeometry(6, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x002244,
            roughness: 0.8,
            metalness: 0.2
        });
        const body = new THREE.Mesh(geom, mat);
        group.add(body);

        // Add small orbit ring to suggest digital journal
        const ringGeom = new THREE.TorusGeometry(9, 0.05, 4, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        group.position.set(-6000, 300, 6000);
        this.scene.add(group);

        this.secretMoon = {
            mesh: group,
            body: body,
            ring: ring,
            position: group.position.clone(),
            discovered: false
        };
    }

    // 7. Space Station
    initSpaceStation() {
        const group = new THREE.Group();

        // Core Hub
        const hubGeom = new THREE.CylinderGeometry(2, 2, 10, 8);
        const hubMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
        const hub = new THREE.Mesh(hubGeom, hubMat);
        hub.rotation.x = Math.PI / 2;
        group.add(hub);

        // Rotating Rings
        const ringGeom = new THREE.TorusGeometry(6, 0.4, 8, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7 });
        const ring1 = new THREE.Mesh(ringGeom, ringMat);
        const ring2 = new THREE.Mesh(ringGeom, ringMat);
        ring1.position.z = -3;
        ring2.position.z = 3;
        group.add(ring1);
        group.add(ring2);

        // Docking Port glow
        const dockGeom = new THREE.RingGeometry(0, 1.8, 16);
        const dockMat = new THREE.MeshBasicMaterial({ color: 0x4cc9f0, side: THREE.DoubleSide });
        const dock = new THREE.Mesh(dockGeom, dockMat);
        dock.position.z = -5.1;
        group.add(dock);

        // Orbit coordinates (between Earth & Mars)
        group.position.set(-800, 50, -800);
        this.scene.add(group);

        this.spaceStation = {
            mesh: group,
            ring1: ring1,
            ring2: ring2,
            position: group.position.clone(),
            docked: false
        };
    }

    // 8. Destroyed Spaceship
    initDestroyedShip() {
        const group = new THREE.Group();

        // Broken ship pieces
        const partsCount = 5;
        this.wreckageParts = [];

        for (let i = 0; i < partsCount; i++) {
            const geom = new THREE.ConeGeometry(0.8, 3, 4);
            const mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, metalness: 0.4 });
            const piece = new THREE.Mesh(geom, mat);
            piece.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            piece.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            group.add(piece);
            this.wreckageParts.push(piece);
        }

        // Blinking red emergency beacon light
        const lightGeom = new THREE.SphereGeometry(0.3, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.beaconLight = new THREE.Mesh(lightGeom, lightMat);
        this.beaconLight.position.set(0, 0, 0);
        group.add(this.beaconLight);

        // Add real PointLight for atmospheric flash
        this.wreckPointLight = new THREE.PointLight(0xff0000, 0, 15);
        group.add(this.wreckPointLight);

        group.position.set(-2500, 100, 3000);
        this.scene.add(group);

        this.destroyedShip = {
            mesh: group,
            position: group.position.clone(),
            searched: false
        };
    }

    // 6. Easter Eggs
    initEasterEggs() {
        const eggConfigs = [
            { name: "Zero-G Rubber Duck", pos: [-500, 50, 400], color: 0xffcc00, type: 'duck' },
            { name: "Coffee Mug", pos: [200, 20, -500], color: 0xffffff, type: 'mug' },
            { name: "404 Planet Not Found Sign", pos: [1200, -100, 800], color: 0xff3366, type: 'billboard' },
            { name: "Tiny Astronaut Waving", pos: [-800, -50, -1200], color: 0xeeeeee, type: 'astronaut' },
            { name: "Tesla Roadster", pos: [-1500, 200, 1500], color: 0xaa0000, type: 'tesla' }
        ];

        eggConfigs.forEach(cfg => {
            const group = new THREE.Group();
            let mainMesh;

            if (cfg.type === 'duck') {
                // Procedural duck shape
                const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: cfg.color }));
                const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), new THREE.MeshStandardMaterial({ color: cfg.color }));
                head.position.set(0, 0.8, 0.5);
                const beak = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0xff6600 }));
                beak.position.set(0, 0.75, 1.1);
                group.add(body, head, beak);
            } else if (cfg.type === 'mug') {
                // Coffee mug
                const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12), new THREE.MeshStandardMaterial({ color: cfg.color }));
                const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 12), new THREE.MeshStandardMaterial({ color: cfg.color }));
                handle.position.set(0.5, 0, 0);
                group.add(cup, handle);
            } else if (cfg.type === 'billboard') {
                // Billboard sign
                const board = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
                const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), new THREE.MeshStandardMaterial({ color: 0x333333 }));
                stand.position.y = -2;
                group.add(board, stand);
            } else if (cfg.type === 'astronaut') {
                // Astronaut
                const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1, 4, 8), new THREE.MeshStandardMaterial({ color: cfg.color }));
                const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1 }));
                helmet.position.set(0, 0.8, 0.1);
                group.add(body, helmet);
            } else {
                // Tesla
                const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 1.2), new THREE.MeshStandardMaterial({ color: cfg.color, metalness: 0.8 }));
                const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.9), new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.8 }));
                cockpit.position.set(0, 0.4, 0);
                group.add(body, cockpit);
            }

            group.position.set(...cfg.pos);
            this.scene.add(group);

            this.easterEggs.push({
                mesh: group,
                name: cfg.name,
                discovered: false,
                position: group.position.clone()
            });
        });
    }

    // 12. Dynamic Events System
    initDynamicEvents() {
        this.dynamicEvents = {
            meteorShower: { active: false, timer: 0 },
            aurora: { active: false, timer: 0 }
        };
    }

    // Main Update Loop
    update(deltaTime, planets = {}) {
        const shipPos = this.spacecraft.getPosition();

        // 1. Orbit the Satellites around their parent planets
        this.satellites.forEach(sat => {
            const planet = planets[sat.parentKey];
            if (planet) {
                sat.angle += sat.speed * deltaTime;
                const planetPos = planet.getPosition();
                
                // Keep orbiting parent planet
                const x = planetPos.x + Math.cos(sat.angle) * sat.radius;
                const z = planetPos.z + Math.sin(sat.angle) * sat.radius;
                const y = planetPos.y + Math.sin(sat.angle * 0.5) * 2; // subtle wave

                sat.mesh.position.set(x, y, z);
                
                // Add to scene if not already added (when planets load)
                if (!sat.mesh.parent) {
                    this.scene.add(sat.mesh);
                }

                // Satellite search distance check
                const distToShip = sat.mesh.position.distanceTo(shipPos);
                if (distToShip < 50 && !sat.discovered) {
                    sat.discovered = true;
                    this.discoveries.satellitesFound[sat.name] = true;
                    this.speakAI(`Discovered satellite: ${sat.name}. Connecting telemetry.`, true);
                    this.unlockVoiceLog();
                    this.contentPanel.show(`<h3>${sat.name} Collected</h3><p>${sat.fact}</p>`, "Satellite Transmission");
                }
            }
        });

        // 2. Rotate custom bodies
        if (this.alienSignal.mesh) {
            this.alienSignal.mesh.rotation.y += 0.5 * deltaTime;
            this.alienSignal.ring.rotation.x += 0.8 * deltaTime;

            const dist = shipPos.distanceTo(this.alienSignal.position);
            // Radio static decoding logic
            if (dist < 1200) {
                const staticPower = Math.min(100, Math.round((1 - (dist / 1200)) * 100));
                window.dispatchEvent(new CustomEvent('alien-signal-static', { detail: { power: staticPower } }));

                if (dist < 80 && !this.alienSignal.decoded) {
                    this.alienSignal.decoded = true;
                    this.discoveries.alienSignalDecoded = true;
                    this.speakAI("Telemetry warning. Decoding high-gain frequency transmission. Unknown intelligence located.", true);
                    this.contentPanel.show(`
                        <h3>Decoded Alien Telemetry</h3>
                        <p style="font-size:1.2rem;font-style:italic;color:#00ff66;">"Curiosity is the strongest engine ever built."</p>
                        <p>You have located an abandoned alien scientific probe. Its core is still broadcasting a message recorded by an unknown intelligence.</p>
                    `, "Alien Signal Broadcast");
                }
            } else {
                window.dispatchEvent(new CustomEvent('alien-signal-static', { detail: { power: 0 } }));
            }
        }

        // 3. Black Hole physics
        if (this.blackHole.mesh) {
            this.blackHole.disk.rotation.z += 1.5 * deltaTime;
            this.blackHole.particles.rotation.y += 0.4 * deltaTime;

            const dist = shipPos.distanceTo(this.blackHole.position);
            if (dist < 2500) {
                // Warning notification
                const pullForce = (2500 - dist) / 5.0; // stronger closer
                const direction = new THREE.Vector3().subVectors(this.blackHole.position, shipPos).normalize();
                
                // Pull ship in
                this.spacecraft.velocity.addScaledVector(direction, pullForce * deltaTime);
                
                // Screen Camera shake simulation (trigger HUD shake event)
                const shakeIntensity = Math.min(10, (2500 - dist) / 200.0);
                window.dispatchEvent(new CustomEvent('camera-shake', { detail: { intensity: shakeIntensity } }));

                if (dist < 1500 && Math.random() < 0.005) {
                    this.speakAI("Danger! Approaching gravity singularity. Critical structural threshold reached. Escape immediately!", true);
                }

                // Event Horizon entered
                if (dist < 150) {
                    this.triggerSpaghettification();
                }
            } else {
                window.dispatchEvent(new CustomEvent('camera-shake', { detail: { intensity: 0 } }));
            }
        }

        // 4. Secret Moon logic
        if (this.secretMoon.mesh) {
            this.secretMoon.mesh.rotation.y += 0.2 * deltaTime;
            this.secretMoon.ring.rotation.y += 0.5 * deltaTime;

            const dist = shipPos.distanceTo(this.secretMoon.position);
            if (dist < 80 && !this.secretMoon.discovered) {
                this.secretMoon.discovered = true;
                this.discoveries.secretMoonDiscovered = true;
                this.speakAI("Entering digital stratosphere of the Fictional Moon Sophia. Accessing Developer's Journal.", true);
                this.contentPanel.show(`
                    <h3>The Developer's Journal</h3>
                    <p>Welcome to the uncharted moon of development. Here are Commander Kamalesh's core focus areas:</p>
                    <ul>
                        <li><strong>Next Projects:</strong> Building a fully distributed agentic workspace framework.</li>
                        <li><strong>AI Research:</strong> Real-time visual reinforcement learning algorithms for drone navigation.</li>
                        <li><strong>Robotics Idea:</strong> Integrating edge LLMs directly into robotic arm hardware for natural-language spatial instructions.</li>
                        <li><strong>Undergrad Goals:</strong> Bridge the gap between digital generative code and robotic execution.</li>
                    </ul>
                `, "Developer's Journal");
            }
        }

        // 5. Space Station logic (Docking)
        if (this.spaceStation.mesh) {
            this.spaceStation.ring1.rotation.z += 0.3 * deltaTime;
            this.spaceStation.ring2.rotation.z -= 0.3 * deltaTime;

            const dist = shipPos.distanceTo(this.spaceStation.position);
            if (dist < 80 && !this.spaceStation.docked) {
                this.spaceStation.docked = true;
                this.discoveries.spaceStationDocked = true;
                this.spacecraft.velocity.set(0, 0, 0); // Stop ship
                this.speakAI("Initiating docking protocol. Welcome to the ISS AI Research Center. Accessing research blueprints.", true);
                this.contentPanel.show(`
                    <h3>AI Research Station</h3>
                    <p>You have docked with the AI Research Hub. Active blueprints include:</p>
                    <div style="background:rgba(0,0,0,0.5);padding:10px;border-radius:5px;">
                        <h4>Hologram Blueprints:</h4>
                        <ul>
                            <li><strong>Neural Control Interfaces:</strong> Training models to interpret biosignals directly.</li>
                            <li><strong>Spatial VLM:</strong> Multi-modal vision-language models running local obstacle mappings.</li>
                            <li><strong>Project Vision:</strong> Autonomous robotic mapping with multi-spectral point clouds.</li>
                        </ul>
                    </div>
                `, "Docked with AI Research Center");
            }
        }

        // 6. Destroyed Spaceship flashing light
        if (this.destroyedShip.mesh) {
            const flash = Math.sin(performance.now() * 0.015) > 0.8;
            this.beaconLight.material.color.setHex(flash ? 0xff0000 : 0x220000);
            this.wreckPointLight.intensity = flash ? 3.0 : 0.0;

            const dist = shipPos.distanceTo(this.destroyedShip.position);
            if (dist < 80 && !this.destroyedShip.searched) {
                this.destroyedShip.searched = true;
                this.speakAI("Analyzing spacecraft wreckage. Emergency transmission downloaded.", true);
                this.unlockVoiceLog();
                this.contentPanel.show(`
                    <h3>Spaceship Wreckage Log</h3>
                    <p>Wreckage ID: Odyssey-IV. Drifting since launch in 2025.</p>
                    <blockquote style="border-left:4px solid #ff5555;padding-left:10px;font-style:italic;">
                        "The gravitational pull of the unknown is always stronger than safety. We built this ship to find what lies beyond. If you find this log, keep going."
                    </blockquote>
                `, "Spaceship Crash Log");
            }
        }

        // 7. Easter Eggs rotation & collection
        this.easterEggs.forEach(egg => {
            egg.mesh.rotation.x += 0.2 * deltaTime;
            egg.mesh.rotation.y += 0.3 * deltaTime;

            const dist = egg.mesh.position.distanceTo(shipPos);
            if (dist < 40 && !egg.discovered) {
                egg.discovered = true;
                this.speakAI(`Curiosity rewarded! Unlocked secret: ${egg.name}.`, true);
                this.contentPanel.show(`<h3>Secret Unlocked</h3><p>You found: <strong>${egg.name}</strong> drifting in zero gravity.</p>`, "Easter Egg Discovered");
            }
        });

        // 8. Planet exploration registry
        for (const key of Object.keys(planets)) {
            const planet = planets[key];
            const dist = planet.getPosition().distanceTo(shipPos);
            
            // Check planet range
            if (dist < 200 && !this.discoveries.planetsVisited[key]) {
                this.discoveries.planetsVisited[key] = true;
                this.speakAI(`Arrived at ${PLANET_DATA[key].name}. Scanning portfolio coordinates.`);
            }
        }

        // 9. Update Portal ending mechanism
        this.updatePortal(deltaTime);

        // 10. Dynamic Events update
        this.updateDynamicEvents(deltaTime);
    }

    unlockVoiceLog() {
        if (this.currentVoiceLogIndex < this.voiceLogs.length) {
            const log = this.voiceLogs[this.currentVoiceLogIndex];
            this.currentVoiceLogIndex++;
            this.discoveries.voiceLogsCollected = this.currentVoiceLogIndex;
            
            setTimeout(() => {
                this.speakAI(`Commander Kamalesh's voice log unlocked: ${log.title}`, true);
                this.contentPanel.show(`
                    <h3>${log.title}</h3>
                    <p style="font-size:1.1rem;line-height:1.6;color:#e6edf3;">${log.content}</p>
                `, "Voice Log Decoded");
            }, 3000);
        }
    }

    // Spaghettification cinematic reset sequence
    triggerSpaghettification() {
        this.speakAI("Singularity crossed! Escaping spaghettification event horizon. Resetting thrusters.", true);

        // Visual flash overlay
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: white; z-index: 9999; opacity: 1;
            transition: opacity 1.5s ease; pointer-events: none;
        `;
        document.body.appendChild(flash);
        
        // Stop spacecraft
        this.spacecraft.velocity.set(0, 0, 0);
        this.spacecraft.mesh.position.set(0, 0, -100);

        setTimeout(() => {
            flash.style.opacity = 0;
            setTimeout(() => flash.remove(), 1500);
        }, 300);
    }

    // Portal logic
    updatePortal(deltaTime) {
        // Portal only spawns near the Sun once all secrets are found!
        const totalFound = this.getSecretsFoundCount();
        if (totalFound >= this.totalSecrets && !this.portal) {
            this.spawnOriginPortal();
        }

        if (this.portal) {
            this.portal.rotation.y += 2.0 * deltaTime;
            this.portal.rotation.z += 1.0 * deltaTime;
            
            const dist = this.spacecraft.getPosition().distanceTo(this.portal.position);
            if (dist < 60 && !this.discoveries.portalEntered) {
                this.discoveries.portalEntered = true;
                this.triggerCinematicEnding();
            }
        }
    }

    spawnOriginPortal() {
        const group = new THREE.Group();
        
        // Portal center
        const torusGeom = new THREE.TorusGeometry(20, 1.5, 16, 100);
        const torusMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        const portalRing = new THREE.Mesh(torusGeom, torusMat);
        group.add(portalRing);

        // Core glow
        const coreGeom = new THREE.SphereGeometry(15, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5, wireframe: true });
        const portalCore = new THREE.Mesh(coreGeom, coreMat);
        group.add(portalCore);

        group.position.set(0, 300, 0); // Spawns above the sun
        this.scene.add(group);

        this.portal = group;
        this.speakAI("Attention Commander. An anomalous cosmic portal has opened above the Sun. Fly into it to complete the final chapter.", true);
    }

    triggerCinematicEnding() {
        window.speechSynthesis.cancel();
        
        const overlay = document.createElement('div');
        overlay.id = 'cinematic-ending';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: black; z-index: 10000; color: white; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            font-family: 'Courier New', Courier, monospace; text-align: center;
            opacity: 0; transition: opacity 3s ease;
        `;
        overlay.innerHTML = `
            <div style="max-width:800px;padding:20px;">
                <h1 style="color:#00ffff;font-size:3rem;margin-bottom:20px;">MISSION COMPLETE</h1>
                <p style="font-size:1.5rem;line-height:1.8;margin-bottom:40px;">
                    "Thank you for exploring my universe.<br>
                    Every planet represented a chapter.<br>
                    The journey has only just begun."
                </p>
                <div style="font-size:1.1rem;color:#888;">
                    Created by Kamalesh — Portfolio Complete (100%)
                </div>
                <button id="ending-restart" style="
                    margin-top: 50px; padding: 12px 30px; background: transparent;
                    border: 2px solid #00ffff; color: #00ffff; font-family: inherit;
                    font-size: 1.2rem; cursor: pointer; border-radius: 5px;
                    transition: all 0.3s;
                ">Explore Again</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Fade in
        void overlay.offsetWidth;
        overlay.style.opacity = '1';

        document.getElementById('ending-restart').addEventListener('click', () => {
            overlay.style.transition = 'opacity 1s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                window.location.reload();
            }, 1000);
        });
    }

    // Dynamic environmental triggers (comets, meteors, flares)
    updateDynamicEvents(deltaTime) {
        this.eventTimer += deltaTime;
        if (this.eventTimer > 35) { // trigger random event every 35 seconds
            this.eventTimer = 0;
            const r = Math.random();
            if (r < 0.5) {
                this.triggerMeteorShower();
            } else {
                this.triggerSolarFlare();
            }
        }
    }

    triggerMeteorShower() {
        this.speakAI("Telemetry warning. Incoming localized meteor shower detected. Deploying particle fields.", false);
        
        // Spawn meteors close to the ship flying across
        const shipPos = this.spacecraft.getPosition();
        for (let i = 0; i < 15; i++) {
            const geom = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.5);
            const mat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
            const meteor = new THREE.Mesh(geom, mat);
            
            // Random offset start
            meteor.position.set(
                shipPos.x + (Math.random() - 0.5) * 300 - 150,
                shipPos.y + (Math.random() - 0.5) * 100,
                shipPos.z + (Math.random() - 0.5) * 300 + 150
            );
            
            this.scene.add(meteor);
            
            this.projectiles.push({
                mesh: meteor,
                velocity: new THREE.Vector3(30 + Math.random() * 50, 0, -30 - Math.random() * 50),
                timer: 0
            });
        }
    }

    triggerSolarFlare() {
        this.speakAI("Caution. Solar flare activity index rising. Visual sensors overloaded.", false);
        window.dispatchEvent(new CustomEvent('solar-flare-event', { detail: { active: true } }));
        
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('solar-flare-event', { detail: { active: false } }));
        }, 4000);
    }

    // Metrics for progress calculation
    getSecretsFoundCount() {
        let count = 0;
        count += Object.keys(this.discoveries.planetsVisited).length;
        count += Object.keys(this.discoveries.satellitesFound).length;
        if (this.discoveries.alienSignalDecoded) count++;
        if (this.discoveries.spaceStationDocked) count++;
        if (this.discoveries.blackHoleEscaped || this.spacecraft.getPosition().distanceTo(this.blackHole.position) < 2000) count++;
        if (this.discoveries.secretMoonDiscovered) count++;
        if (this.discoveries.consoleUnlocked) count++;
        if (this.currentVoiceLogIndex > 0) count++;
        
        return Math.min(this.totalSecrets, count);
    }

    getCompletionPercentage() {
        return Math.round((this.getSecretsFoundCount() / this.totalSecrets) * 100);
    }
}
