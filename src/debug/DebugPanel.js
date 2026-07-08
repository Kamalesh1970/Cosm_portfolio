// DebugPanel.js - Tweakpane debugging interface for development
import { Pane } from 'tweakpane';
import { G, SUN_MASS_SCALED, PLANET_RADII, ORBIT_SPEEDS, ASTEROID_BELT, PHYSICS, SHIP } from '../physics/constants.js';

export class DebugPanel {
    constructor(options = {}) {
        this.options = {
            expanded: true,
            ...options
        };

        this.pane = null;
        this.controllers = {};
        this.initialized = false;

        // Only create in development
        if (import.meta.env.DEV) {
            this.init();
        }
    }

    init() {
        if (this.initialized) return;

        // Create the pane
        this.pane = new Pane({
            title: 'Solar System Debug',
            expanded: this.options.expanded
        });

        // Add folders for different systems
        this.addPhysicsFolder();
        this.addRenderingFolder();
        this.addShipFolder();
        this.addAudioFolder();

        this.initialized = true;
    }

    addPhysicsFolder() {
        const physicsFolder = this.pane.addFolder({ title: 'Physics' });

        // Gravitational constant
        physicsFolder.addBinding({ G }, 'G', {
            min: 0,
            max: 10,
            step: 0.001
        }).on('change', (v) => {
            // Update gravity engine would happen here
            console.log('G changed to:', G);
        });

        // Sun mass
        physicsFolder.addBinding({ sunMass: SUN_MASS_SCALED }, 'sunMass', {
            min: 0,
            max: 10000,
            step: 1
        }).on('change', (v) => {
            console.log('Sun mass changed to:', v);
        });

        // Physics timestep
        physicsFolder.addBinding(PHYSICS, 'fixedTimeStep', {
            min: 1 / 120,
            max: 1 / 30,
            step: 0.001
        }).on('change', (v) => {
            console.log('Physics timestep changed to:', v);
        });
    }

    addRenderingFolder() {
        const renderFolder = this.pane.addFolder({ title: 'Rendering' });

        // Bloom settings
        const bloomParams = {
            bloomStrength: 1.5,
            bloomRadius: 0.4,
            bloomThreshold: 0.8
        };

        renderFolder.addBinding(bloomParams, 'bloomStrength', {
            min: 0,
            max: 5,
            step: 0.1
        }).on('change', (v) => {
            console.log('Bloom strength changed to:', v);
        });

        renderFolder.addBinding(bloomParams, 'bloomRadius', {
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', (v) => {
            console.log('Bloom radius changed to:', v);
        });

        renderFolder.addBinding(bloomParams, 'bloomThreshold', {
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', (v) => {
            console.log('Bloom threshold changed to:', v);
        });

        // Star count
        renderFolder.addBinding({ starCount: 5000 }, 'starCount', {
            min: 1000,
            max: 20000,
            step: 1000
        }).on('change', (v) => {
            console.log('Star count changed to:', v);
        });
    }

    addShipFolder() {
        const shipFolder = this.pane.addFolder({ title: 'Spacecraft' });

        // Thrust power
        shipFolder.addBinding(SHIP, 'thrustForce', {
            min: 0,
            max: 20000,
            step: 100
        }).on('change', (v) => {
            console.log('Thrust force changed to:', v);
        });

        // Drag
        shipFolder.addBinding(SHIP, 'drag', {
            min: 0.9,
            max: 0.999,
            step: 0.001
        }).on('change', (v) => {
            console.log('Drag changed to:', v);
        });

        // Boost multiplier
        shipFolder.addBinding(SHIP, 'boostMultiplier', {
            min: 1,
            max: 10,
            step: 0.1
        }).on('change', (v) => {
            console.log('Boost multiplier changed to:', v);
        });

        // Max speed
        shipFolder.addBinding(SHIP, 'maxSpeed', {
            min: 100,
            max: 5000,
            step: 50
        }).on('change', (v) => {
            console.log('Max speed changed to:', v);
        });
    }

    addAudioFolder() {
        const audioFolder = this.pane.addFolder({ title: 'Audio' });

        // Master volume
        audioFolder.addBinding({ masterVolume: 1.0 }, 'masterVolume', {
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (v) => {
            // Would update audio manager volume
            console.log('Master volume changed to:', v);
        });

        // Engine volume
        audioFolder.addBinding({ engineVolume: 0.4 }, 'engineVolume', {
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (v) => {
            console.log('Engine volume changed to:', v);
        });

        // Ambient volume
        audioFolder.addBinding({ ambientVolume: 0.2 }, 'ambientVolume', {
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (v) => {
            console.log('Ambient volume changed to:', v);
        });
    }

    // Update a specific value
    setValue(path, value) {
        // Implementation would depend on how we store references to controllers
        // For now, we'll just log
        console.log(`Setting ${path} to ${value}`);
    }

    // Get current value
    getValue(path) {
        // Implementation would depend on how we store references to controllers
        return null;
    }

    // Show/hide the panel
    setVisible(visible) {
        if (!this.pane) return;

        if (visible) {
            this.pane.containerElement.style.display = 'block';
        } else {
            this.pane.containerElement.style.display = 'none';
        }
    }

    // Toggle visibility
    toggle() {
        if (!this.pane) return;

        const isVisible = this.pane.containerElement.style.display !== 'none';
        this.setVisible(!isVisible);
    }

    // Dispose and clean up
    dispose() {
        if (this.pane) {
            this.pane.dispose();
            this.pane = null;
        }

        this.controllers = {};
        this.initialized = false;
    }
}

// Export a singleton instance for development use
export const debugPanel = null;