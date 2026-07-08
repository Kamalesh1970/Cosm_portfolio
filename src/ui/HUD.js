// HUD.js - Upgraded space-age HUD showing navigation, telemetry, AI assistant messages, and exploration database.
import * as THREE from 'three';

export class HUD {
    constructor(options = {}) {
        this.options = {
            showSpeed: true,
            showCompass: true,
            showControls: true,
            ControlsTimeout: 3000,
            ...options
        };
        
        this.element = null;
        this.speedElement = null;
        this.compassElement = null;
        this.controlsElement = null;
        this.lastActivityTime = Date.now();
        this.controlsVisible = true;
        
        this.explorationManager = null; // Set dynamically after creation
        this.dbOpen = false;

        this.createElements();
        this.setupEventListeners();
    }
    
    createElements() {
        // Inject keyframe blink animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink-red {
                0% { opacity: 0.2; box-shadow: 0 0 5px rgba(255,0,0,0.2); }
                50% { opacity: 1; box-shadow: 0 0 25px rgba(255,0,0,0.8); }
                100% { opacity: 0.2; box-shadow: 0 0 5px rgba(255,0,0,0.2); }
            }
            @keyframes screen-static-glow {
                0% { opacity: 0.85; }
                50% { opacity: 0.95; }
                100% { opacity: 0.85; }
            }
            .hud-glass {
                background: rgba(15, 23, 42, 0.4);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
            }
            .hud-text-glow {
                color: #e2e8f0;
                text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
            }
            .db-item {
                border-bottom: 1px solid rgba(255,255,255,0.08);
                padding: 8px 0;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
            }
        `;
        document.head.appendChild(style);

        // Create main container
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.top = '20px';
        this.element.style.left = '20px';
        this.element.style.color = '#e2e8f0';
        this.element.style.fontFamily = "'Courier New', Courier, monospace";
        this.element.style.fontSize = '13px';
        this.element.style.zIndex = '9990';
        this.element.style.pointerEvents = 'none'; // Click-through by default
        
        // Speed display
        if (this.options.showSpeed) {
            this.speedElement = document.createElement('div');
            this.speedElement.id = 'hud-speed';
            this.speedElement.className = 'hud-glass hud-text-glow';
            this.speedElement.style.marginBottom = '12px';
            this.speedElement.style.pointerEvents = 'auto';
            this.speedElement.innerHTML = '<strong>Speed:</strong> 0 m/s';
            this.element.appendChild(this.speedElement);
        }
        
        // Compass / direction indicator
        if (this.options.showCompass) {
            this.compassElement = document.createElement('div');
            this.compassElement.id = 'hud-compass';
            this.compassElement.className = 'hud-glass';
            this.compassElement.style.marginBottom = '12px';
            this.compassElement.style.width = '64px';
            this.compassElement.style.height = '64px';
            this.compassElement.style.position = 'relative';
            this.compassElement.style.border = '2px solid rgba(76, 201, 240, 0.5)';
            this.compassElement.style.borderRadius = '50%';
            this.compassElement.style.pointerEvents = 'auto';
            this.element.appendChild(this.compassElement);
            
            // North indicator
            const north = document.createElement('div');
            north.style.position = 'absolute';
            north.style.top = '4px';
            north.style.left = '50%';
            north.style.width = '4px';
            north.style.height = '10px';
            north.style.backgroundColor = '#f72585';
            north.style.transform = 'translateX(-50%)';
            this.compassElement.appendChild(north);
            
            // Direction indicator
            this.directionIndicator = document.createElement('div');
            this.directionIndicator.style.position = 'absolute';
            this.directionIndicator.style.top = '50%';
            this.directionIndicator.style.left = '50%';
            this.directionIndicator.style.width = '3px';
            this.directionIndicator.style.height = '22px';
            this.directionIndicator.style.backgroundColor = '#4cc9f0';
            this.directionIndicator.style.transformOrigin = 'center bottom';
            this.directionIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
            this.compassElement.appendChild(this.directionIndicator);
        }

        // Alien Signal decoder indicator
        this.alienDecoder = document.createElement('div');
        this.alienDecoder.id = 'hud-alien-decoder';
        this.alienDecoder.className = 'hud-glass';
        this.alienDecoder.style.cssText = `
            margin-top: 12px; display: none; padding: 10px; width: 150px;
            border: 1px solid #00ff66; background: rgba(0, 50, 20, 0.4);
        `;
        this.alienDecoder.innerHTML = `
            <div style="font-weight:bold;color:#00ff66;font-size:10px;margin-bottom:6px;letter-spacing:1px;">DECODING PROBE...</div>
            <div style="width:100%;height:6px;background:rgba(0,255,102,0.2);border-radius:3px;overflow:hidden;">
                <div id="hud-static-bar" style="width:0%;height:100%;background:#00ff66;"></div>
            </div>
        `;
        this.element.appendChild(this.alienDecoder);
        
        // Controls hint
        if (this.options.showControls) {
            this.controlsElement = document.createElement('div');
            this.controlsElement.id = 'hud-controls';
            this.controlsElement.className = 'hud-glass hud-text-glow';
            this.controlsElement.style.position = 'fixed';
            this.controlsElement.style.bottom = '20px';
            this.controlsElement.style.left = '50%';
            this.controlsElement.style.transform = 'translateX(-50%)';
            this.controlsElement.style.fontSize = '12px';
            this.controlsElement.style.textAlign = 'center';
            this.controlsElement.style.pointerEvents = 'auto';
            this.controlsElement.innerHTML = `
                <div>W/S: Accelerate/Reverse &nbsp;&nbsp; A/D: Steer &nbsp;&nbsp; Q/E: Roll</div>
                <div>Shift: Boost &nbsp;&nbsp; Space: Decelerate/Brake</div>
            `;
            this.element.appendChild(this.controlsElement);
        }

        // Singularity warning label (Black Hole)
        this.singularityWarning = document.createElement('div');
        this.singularityWarning.id = 'hud-singularity-warning';
        this.singularityWarning.style.cssText = `
            position: fixed; top: 110px; left: 50%; transform: translateX(-50%);
            background: rgba(180, 10, 10, 0.9); border: 2px solid #ff0000;
            color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 6px;
            font-size: 15px; display: none; z-index: 9999; pointer-events: none;
            animation: blink-red 1s infinite;
        `;
        this.singularityWarning.innerHTML = `⚠️ DANGER: EVENT HORIZON CLOSE ⚠️<br><span style="font-size:11px;font-weight:normal;color:#ff8888;">SINGULARITY GRAVITATIONAL PULL ACTIVE</span>`;
        document.body.appendChild(this.singularityWarning);

        // Subtitles Overlay (AI Assistant speech)
        this.subtitlePanel = document.createElement('div');
        this.subtitlePanel.id = 'hud-subtitle';
        this.subtitlePanel.style.cssText = `
            position: fixed; bottom: 85px; left: 50%; transform: translateX(-50%);
            background: rgba(10, 17, 30, 0.9); border: 1.5px solid #4cc9f0;
            color: #4cc9f0; padding: 14px 28px; border-radius: 6px; font-size: 13px;
            max-width: 650px; text-align: center; pointer-events: none;
            opacity: 0; transition: opacity 0.5s ease; z-index: 9999;
            box-shadow: 0 0 20px rgba(76, 201, 240, 0.3); line-height: 1.5;
        `;
        document.body.appendChild(this.subtitlePanel);

        // Screen Flash Overlay (Solar Flare)
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.id = 'hud-flash-overlay';
        this.flashOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: orange; z-index: 9997; pointer-events: none;
            opacity: 0; transition: opacity 0.4s ease;
        `;
        document.body.appendChild(this.flashOverlay);

        // Mission DB Button
        this.dbBtn = document.createElement('div');
        this.dbBtn.id = 'hud-db-btn';
        this.dbBtn.className = 'hud-glass hud-text-glow';
        this.dbBtn.style.cssText = `
            position: fixed; top: 20px; right: 20px; font-weight: bold;
            color: #4cc9f0; border-color: #4cc9f0; cursor: pointer;
            pointer-events: auto; z-index: 9999;
        `;
        this.dbBtn.textContent = "Mission Database: 0%";
        document.body.appendChild(this.dbBtn);

        // Mission Database Drawer (Sidebar)
        this.dbDrawer = document.createElement('div');
        this.dbDrawer.id = 'hud-db-drawer';
        this.dbDrawer.style.cssText = `
            position: fixed; top: 0; right: -360px; width: 340px; height: 100%;
            background: rgba(10, 15, 30, 0.95); border-left: 2.5px solid #4cc9f0;
            z-index: 9998; transition: right 0.4s ease; padding: 25px;
            overflow-y: auto; pointer-events: auto; color: white;
            box-shadow: -5px 0 25px rgba(0,0,0,0.8);
            font-family: 'Courier New', Courier, monospace;
        `;
        this.dbDrawer.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px; border-bottom:2px solid #4cc9f0; padding-bottom:8px;">
                <span style="font-weight:bold;color:#4cc9f0;font-size:15px;">💾 MISSION DATA RECORDS</span>
                <span id="hud-db-close" style="cursor:pointer;color:#ff5555;">[X]</span>
            </div>
            
            <div style="font-size:12px;color:#888;margin-bottom:15px;line-height:1.4;">
                Commander Kamalesh's flight achievements and personal recordings log.
            </div>

            <div style="margin-bottom:20px;">
                <div style="font-weight:bold;margin-bottom:4px;font-size:13px;display:flex;justify-content:space-between;">
                    <span>System Explored:</span>
                    <span id="db-percentage-text">0%</span>
                </div>
                <div style="width:100%;height:10px;background:#222;border-radius:5px;overflow:hidden;border:1px solid #444;">
                    <div id="db-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#4cc9f0,#f72585);transition:width 0.4s;"></div>
                </div>
            </div>

            <h4 style="color:#f72585;margin:20px 0 10px 0;font-size:13px;border-bottom:1px solid #f72585;">PORTFOLIO RECORDINGS</h4>
            <div id="db-planets-list"></div>

            <h4 style="color:#ffb703;margin:20px 0 10px 0;font-size:13px;border-bottom:1px solid #ffb703;">COLLECTED SATELLITES</h4>
            <div id="db-sats-list"></div>

            <h4 style="color:#00ff66;margin:20px 0 10px 0;font-size:13px;border-bottom:1px solid #00ff66;">COSMIC ANOMALIES</h4>
            <div id="db-anomalies-list"></div>

            <h4 style="color:#4cc9f0;margin:20px 0 10px 0;font-size:13px;border-bottom:1px solid #4cc9f0;">VOICE LOGS</h4>
            <div id="db-voice-logs-list" style="font-size:12px;color:#88ff88;"></div>
        `;
        document.body.appendChild(this.dbDrawer);

        // Add to document
        document.body.appendChild(this.element);
    }
    
    setupEventListeners() {
        // Hide/show controls hint on mouse moving or key activity
        document.addEventListener('keydown', () => {
            this.lastActivityTime = Date.now();
            this.showControls();
        });
        
        document.addEventListener('mousemove', () => {
            this.lastActivityTime = Date.now();
            this.showControls();
        });

        // Open/Close Mission DB Drawer
        this.dbBtn.addEventListener('click', () => this.toggleDB());
        this.dbDrawer.querySelector('#hud-db-close').addEventListener('click', () => this.toggleDB());

        // Listen for AI assistant triggers
        window.addEventListener('ai-assistant-message', (e) => {
            const text = e.detail.text;
            this.subtitlePanel.textContent = text;
            this.subtitlePanel.style.opacity = '1';
            
            // Clear subtitle after 7 seconds
            if (this.subtitleTimeout) clearTimeout(this.subtitleTimeout);
            this.subtitleTimeout = setTimeout(() => {
                this.subtitlePanel.style.opacity = '0';
            }, 7000);
        });

        // Listen for Camera shake
        window.addEventListener('camera-shake', (e) => {
            const intensity = e.detail.intensity;
            if (intensity > 0) {
                // Apply slight random offset translate to parent camera container
                // We shake the camera DOM container or dispatch back. Let's shake body translate slightly
                const dx = (Math.random() - 0.5) * intensity * 0.8;
                const dy = (Math.random() - 0.5) * intensity * 0.8;
                document.body.style.transform = `translate(${dx}px, ${dy}px)`;
                
                // Singularity alert displays
                if (intensity > 4.0) {
                    this.singularityWarning.style.display = 'block';
                } else {
                    this.singularityWarning.style.display = 'none';
                }
            } else {
                document.body.style.transform = 'none';
                this.singularityWarning.style.display = 'none';
            }
        });

        // Listen for Solar Flare flash
        window.addEventListener('solar-flare-event', (e) => {
            const active = e.detail.active;
            if (active) {
                this.flashOverlay.style.opacity = '0.9';
                this.flashOverlay.style.animation = 'screen-static-glow 0.3s infinite';
            } else {
                this.flashOverlay.style.opacity = '0';
                this.flashOverlay.style.animation = 'none';
            }
        });

        // Listen for static decodings
        window.addEventListener('alien-signal-static', (e) => {
            const power = e.detail.power;
            if (power > 0) {
                this.alienDecoder.style.display = 'block';
                this.alienDecoder.querySelector('#hud-static-bar').style.width = `${power}%`;
            } else {
                this.alienDecoder.style.display = 'none';
            }
        });
    }

    toggleDB() {
        this.dbOpen = !this.dbOpen;
        this.dbDrawer.style.right = this.dbOpen ? '0' : '-360px';
        if (this.dbOpen) {
            this.updateDBDrawerContent();
        }
    }

    updateDBDrawerContent() {
        if (!this.explorationManager) return;
        const discoveries = this.explorationManager.discoveries;

        // Render Planet records
        const pList = this.dbDrawer.querySelector('#db-planets-list');
        const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        pList.innerHTML = planetKeys.map(key => {
            const visited = discoveries.planetsVisited[key] ? '✅ VISITED' : '❌ UNKNOWN';
            const color = discoveries.planetsVisited[key] ? '#00ff66' : '#888';
            return `<div class="db-item"><span>☉ ${key.toUpperCase()}</span><span style="color:${color};font-weight:bold;">${visited}</span></div>`;
        }).join('');

        // Render Satellites
        const sList = this.dbDrawer.querySelector('#db-sats-list');
        const sats = ['ISS Explorer', 'Curiosity Beacon', 'Galilean Probe', 'Cassini Tribute'];
        sList.innerHTML = sats.map(sat => {
            const found = discoveries.satellitesFound[sat] ? '📡 SIGNAL ONLINE' : '❌ SIGNAL OFFLINE';
            const color = discoveries.satellitesFound[sat] ? '#ffb703' : '#888';
            return `<div class="db-item"><span>🛰 ${sat}</span><span style="color:${color};font-weight:bold;">${found}</span></div>`;
        }).join('');

        // Render Anomalies
        const aList = this.dbDrawer.querySelector('#db-anomalies-list');
        aList.innerHTML = `
            <div class="db-item"><span>👽 Alien Signal Probe</span><span style="color:${discoveries.alienSignalDecoded ? '#00ff66':'#ff5555'}">${discoveries.alienSignalDecoded ? 'DECODED' : 'NOT DECODED'}</span></div>
            <div class="db-item"><span>🛰 Research Space Station</span><span style="color:${discoveries.spaceStationDocked ? '#00ff66':'#ff5555'}">${discoveries.spaceStationDocked ? 'DOCKED' : 'NOT DOCKED'}</span></div>
            <div class="db-item"><span>🌙 Fictional Moon Sophia</span><span style="color:${discoveries.secretMoonDiscovered ? '#00ff66':'#ff5555'}">${discoveries.secretMoonDiscovered ? 'FOUND' : 'NOT FOUND'}</span></div>
            <div class="db-item"><span>🕳 Black Hole Horizon</span><span style="color:${discoveries.blackHoleEscaped || this.explorationManager.getSecretsFoundCount() >= 13 ? '#00ff66':'#ff5555'}">${discoveries.blackHoleEscaped || this.explorationManager.getSecretsFoundCount() >= 13 ? 'ESCAPED' : 'UNEXPLORED'}</span></div>
        `;

        // Render Voice Logs
        const vList = this.dbDrawer.querySelector('#db-voice-logs-list');
        vList.innerHTML = this.explorationManager.voiceLogs.map((log, index) => {
            const unlocked = index < this.explorationManager.currentVoiceLogIndex;
            return `
                <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px dashed rgba(255,255,255,0.05);">
                    <div style="font-weight:bold;color:${unlocked ? '#4cc9f0' : '#444'};">${log.title} ${unlocked ? '🔓' : '🔒'}</div>
                    <div style="font-size:10px;color:#aaa;display:${unlocked ? 'block' : 'none'};margin-top:4px;line-height:1.3;">
                        ${log.content}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    update(spacecraft, nearestPlanet = null) {
        if (!this.element) return;
        
        // Update speed
        if (this.speedElement && spacecraft) {
            const speed = spacecraft.velocity ? spacecraft.velocity.length() : 0;
            this.speedElement.innerHTML = `<strong>Speed:</strong> ${Math.round(speed)} m/s`;
        }
        
        // Update compass
        if (this.compassElement && spacecraft && nearestPlanet) {
            this.updateCompass(spacecraft, nearestPlanet);
        }
        
        // Auto-hide controls after inactivity
        if (this.options.ControlsTimeout > 0 && this.controlsVisible) {
            const timeInactive = Date.now() - this.lastActivityTime;
            if (timeInactive > this.options.ControlsTimeout) {
                this.hideControls();
            }
        }

        // Live stats percentage updates
        if (this.explorationManager) {
            const pct = this.explorationManager.getCompletionPercentage();
            this.dbBtn.textContent = `Mission Database: ${pct}%`;
            document.getElementById('db-percentage-text').textContent = `${pct}%`;
            document.getElementById('db-progress-bar').style.width = `${pct}%`;
        }
    }
    
    updateCompass(spacecraft, targetPlanet) {
        if (!this.compassElement || !this.directionIndicator) return;
        
        try {
            const shipPos = spacecraft.getPosition ? spacecraft.getPosition() : spacecraft.position;
            const targetPos = targetPlanet.getPosition ? targetPlanet.getPosition() : targetPlanet.position;
            if (!shipPos || !targetPos) return;
            
            const direction = new THREE.Vector3().subVectors(targetPos, shipPos).normalize();
            const shipForward = spacecraft.getForwardVector ? spacecraft.getForwardVector() : new THREE.Vector3(0, 0, -1);
            
            const shipForward2D = new THREE.Vector2(shipForward.x, shipForward.z);
            const targetDirection2D = new THREE.Vector2(direction.x, direction.z);
            
            const angle = Math.atan2(
                targetDirection2D.cross(shipForward2D),
                targetDirection2D.dot(shipForward2D)
            );
            
            this.directionIndicator.style.transform = `translateX(-50%) rotate(${angle}rad)`;
        } catch (error) {
            console.debug('Compass update error:', error);
        }
    }
    
    showControls() {
        if (!this.controlsElement) return;
        this.controlsElement.style.opacity = '0.9';
        this.controlsVisible = true;
        this.lastActivityTime = Date.now();
    }
    
    hideControls() {
        if (!this.controlsElement) return;
        this.controlsElement.style.opacity = '0.25';
        this.controlsVisible = false;
    }
    
    setVisibility(visible) {
        if (!this.element) return;
        this.element.style.display = visible ? 'block' : 'none';
        this.dbBtn.style.display = visible ? 'block' : 'none';
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        if (this.subtitlePanel && this.subtitlePanel.parentNode) this.subtitlePanel.parentNode.removeChild(this.subtitlePanel);
        if (this.singularityWarning && this.singularityWarning.parentNode) this.singularityWarning.parentNode.removeChild(this.singularityWarning);
        if (this.dbBtn && this.dbBtn.parentNode) this.dbBtn.parentNode.removeChild(this.dbBtn);
        if (this.dbDrawer && this.dbDrawer.parentNode) this.dbDrawer.parentNode.removeChild(this.dbDrawer);
        if (this.flashOverlay && this.flashOverlay.parentNode) this.flashOverlay.parentNode.removeChild(this.flashOverlay);
        
        this.element = null;
        this.speedElement = null;
        this.compassElement = null;
        this.controlsElement = null;
    }
}