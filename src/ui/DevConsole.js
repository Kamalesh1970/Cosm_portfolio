// DevConsole.js - Hidden Developer Console overlay triggered via key sequence
import * as THREE from 'three';
import { PLANET_DATA } from '../world/PlanetData.js';

export class DevConsole {
    constructor(sceneManager, explorationManager, rapierWorld, asteroidBelt) {
        this.sceneManager = sceneManager;
        this.explorationManager = explorationManager;
        this.rapierWorld = rapierWorld;
        this.asteroidBelt = asteroidBelt;
        this.isOpen = false;
        
        this.createElements();
        this.setupKeyListeners();
    }

    createElements() {
        this.element = document.createElement('div');
        this.element.id = 'dev-console';
        this.element.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; width: 380px; height: 340px;
            background: rgba(10, 15, 25, 0.95); color: #00ff66; border: 1.5px solid #00ff66;
            border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-size: 13px;
            padding: 15px; box-shadow: 0 0 20px rgba(0, 255, 102, 0.3); display: none;
            z-index: 10000; flex-direction: column; overflow: hidden;
            backdrop-filter: blur(10px);
        `;

        this.element.innerHTML = `
            <div style="border-bottom: 1.5px solid #00ff66; padding-bottom: 6px; margin-bottom: 10px; font-weight: bold; display: flex; justify-content: space-between;">
                <span>⚙ COMMANDER CONSOLE V1.0</span>
                <span id="close-console-btn" style="cursor:pointer;color:#ff5555;">[X]</span>
            </div>
            
            <div style="font-size: 11px; margin-bottom: 8px; color: #888;">
                Key: \` (Tilde) to open. Type commands or use buttons:
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 10px;">
                <button class="console-btn" data-cmd="gravity">Toggle Gravity</button>
                <button class="console-btn" data-cmd="bloom">Toggle Bloom</button>
                <button class="console-btn" data-cmd="wireframe">Toggle Wireframe</button>
                <button class="console-btn" data-cmd="fps">Toggle FPS</button>
                <button class="console-btn" data-cmd="freecam">Free Camera</button>
                <button class="console-btn" data-cmd="reset">Reset Ship</button>
                <button class="console-btn" data-cmd="asteroid">Spawn Asteroid</button>
                <button class="console-btn" data-cmd="teleport venus">Teleport Venus</button>
                <button class="console-btn" data-cmd="teleport earth">Teleport Earth</button>
                <button class="console-btn" data-cmd="teleport station">Teleport Station</button>
                <button class="console-btn" data-cmd="teleport alien">Teleport Alien Probe</button>
                <button class="console-btn" data-cmd="teleport blackhole">Teleport Black Hole</button>
            </div>

            <div id="console-logs" style="flex-grow: 1; overflow-y: auto; background: #070a10; border: 1px solid #113322; border-radius: 4px; padding: 6px; font-size: 11px; color: #88ff88; margin-bottom: 10px;">
                * Console systems standing by...<br>
            </div>

            <div style="display: flex;">
                <span style="align-self: center; margin-right: 5px;">&gt;</span>
                <input type="text" id="console-input" style="flex-grow: 1; background: transparent; border: none; border-bottom: 1px solid #00ff66; color: #00ff66; font-family: inherit; font-size: 13px; outline: none;" placeholder="help" />
            </div>
        `;

        // Inject button styles
        const style = document.createElement('style');
        style.textContent = `
            .console-btn {
                background: #0d1a15; border: 1px solid #00cc55; color: #00ff66;
                padding: 4px; border-radius: 4px; font-family: inherit; font-size: 11px;
                cursor: pointer; transition: all 0.2s;
            }
            .console-btn:hover {
                background: #00ff66; color: #000000;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(this.element);

        // Bind interactive elements
        this.element.querySelectorAll('.console-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                this.executeCommand(cmd);
            });
        });

        this.input = this.element.querySelector('#console-input');
        this.logs = this.element.querySelector('#console-logs');

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) {
                    this.log(`&gt; ${cmd}`);
                    this.executeCommand(cmd);
                    this.input.value = '';
                }
            }
        });

        this.element.querySelector('#close-console-btn').addEventListener('click', () => {
            this.toggle();
        });
    }

    setupKeyListeners() {
        document.addEventListener('keydown', (e) => {
            // Tilde key triggers console
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.element.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) {
            this.input.focus();
            this.log("* Developer mode active.");
            
            // Mark console as unlocked in progress tracker
            if (this.explorationManager) {
                this.explorationManager.discoveries.consoleUnlocked = true;
            }
        }
    }

    log(text) {
        const div = document.createElement('div');
        div.innerHTML = text;
        this.logs.appendChild(div);
        this.logs.scrollTop = this.logs.scrollHeight;
    }

    executeCommand(commandLine) {
        const parts = commandLine.toLowerCase().split(' ');
        const main = parts[0];
        const arg = parts[1];

        switch(main) {
            case 'help':
                this.log("Commands: help, gravity [on/off], bloom [val], wireframe, fps, reset, teleport [planet/station/alien/blackhole], spawn, orbit [speed], debug");
                break;
            case 'gravity':
                if (this.rapierWorld && this.rapierWorld.world) {
                    const currentG = this.rapierWorld.world.gravity;
                    const isZero = currentG.x === 0 && currentG.y === 0 && currentG.z === 0;
                    if (isZero && arg !== 'off') {
                        this.rapierWorld.world.gravity = { x: 0, y: -9.81, z: 0 };
                        this.log("Gravity ENABLED (0, -9.81, 0)");
                    } else {
                        this.rapierWorld.world.gravity = { x: 0, y: 0, z: 0 };
                        this.log("Gravity DISABLED (0, 0, 0)");
                    }
                } else {
                    this.log("Physics subsystem unavailable.");
                }
                break;
            case 'bloom':
                if (this.sceneManager && this.sceneManager.composer) {
                    const passes = this.sceneManager.composer.passes;
                    // UnrealBloomPass is usually index 1
                    const bloom = passes.find(p => p.strength !== undefined);
                    if (bloom) {
                        bloom.strength = bloom.strength > 0 ? 0 : 1.5;
                        this.log(`Bloom strength set to ${bloom.strength}`);
                    }
                } else {
                    this.log("Composer pass unavailable.");
                }
                break;
            case 'wireframe':
                this.sceneManager.scene.traverse(node => {
                    if (node.isMesh && node.material) {
                        node.material.wireframe = !node.material.wireframe;
                    }
                });
                this.log("Toggled scene wireframe.");
                break;
            case 'fps':
                const statsEl = document.querySelector('div[style*="z-index: 10000"]');
                if (statsEl) {
                    const isHidden = statsEl.style.display === 'none';
                    statsEl.style.display = isHidden ? 'block' : 'none';
                    this.log(`FPS Monitor ${isHidden ? 'visible' : 'hidden'}`);
                } else {
                    this.log("Stats panel element not found.");
                }
                break;
            case 'reset':
                if (this.explorationManager && this.explorationManager.spacecraft) {
                    this.explorationManager.spacecraft.velocity.set(0, 0, 0);
                    this.explorationManager.spacecraft.mesh.position.set(0, 0, -100);
                    this.log("Spacecraft reset to default coordinate [0, 0, -100]");
                }
                break;
            case 'orbit':
                const speed = parseFloat(arg) || 1.0;
                PLANET_DATA.earth.orbitSpeed = 29800 * speed;
                this.log(`Tuned Earth orbit speed factor: ${speed}`);
                break;
            case 'spawn':
                if (arg === 'asteroid') {
                    this.log("Cheated: Spawning meteor shower!");
                    if (this.explorationManager) this.explorationManager.triggerMeteorShower();
                } else {
                    this.log("Cheated: Spawning AI helper probe!");
                    // Spawn simple helper sphere
                    const geom = new THREE.SphereGeometry(2, 8, 8);
                    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true });
                    const helper = new THREE.Mesh(geom, mat);
                    const shipPos = this.explorationManager.spacecraft.getPosition();
                    helper.position.set(shipPos.x + 10, shipPos.y, shipPos.z + 10);
                    this.sceneManager.scene.add(helper);
                }
                break;
            case 'teleport':
                if (!this.explorationManager || !this.explorationManager.spacecraft) {
                    this.log("Spacecraft reference unavailable.");
                    break;
                }
                const ship = this.explorationManager.spacecraft;
                let targetPos = new THREE.Vector3(0, 0, -100);
                let locName = "Home";

                if (arg === 'mercury') { targetPos.set(0, 0, -200); locName = "Mercury"; }
                else if (arg === 'venus') { targetPos.set(0, 0, -400); locName = "Venus"; }
                else if (arg === 'earth') { targetPos.set(0, 0, -600); locName = "Earth"; }
                else if (arg === 'mars') { targetPos.set(0, 0, -900); locName = "Mars"; }
                else if (arg === 'jupiter') { targetPos.set(0, 0, -1500); locName = "Jupiter"; }
                else if (arg === 'saturn') { targetPos.set(0, 0, -2200); locName = "Saturn"; }
                else if (arg === 'station') { targetPos.copy(this.explorationManager.spaceStation.position).addScalar(40); locName = "Research Station"; }
                else if (arg === 'alien') { targetPos.copy(this.explorationManager.alienSignal.position).addScalar(40); locName = "Alien Signal Source"; }
                else if (arg === 'blackhole') { targetPos.copy(this.explorationManager.blackHole.position).addScalar(200); locName = "Black Hole Boundary"; }
                else {
                    this.log("Teleport locations: mercury, venus, earth, mars, jupiter, saturn, station, alien, blackhole");
                    break;
                }

                ship.velocity.set(0, 0, 0);
                ship.mesh.position.copy(targetPos);
                this.log(`Teleported to ${locName}.`);
                break;
            default:
                this.log(`Unknown command: "${main}". Type "help" for a list of commands.`);
        }
    }
}
