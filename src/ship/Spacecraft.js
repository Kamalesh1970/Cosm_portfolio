// Spacecraft.js - Spacecraft model and properties
import * as THREE from 'three';

export class Spacecraft {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            scale: 1.0,
            ...options
        };
        
        // Physics properties (will be set by physics system)
        this.mass = 1000; // kg
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.thrustForce = 5000; // N
        this.drag = 0.985; // per frame
        
        // Visual representation
        this.createVisual();
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    createVisual() {
        // For now, we'll create a simple geometric representation
        // In the final version, this would load a GLTF model
        const group = new THREE.Group();
        
        // Main body (elongated capsule)
        const bodyGeometry = new THREE.CapsuleGeometry(1, 2, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2; // Point forward along Z
        group.add(body);
        
        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x2288ff,
            transparent: true,
            opacity: 0.8
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0, 1.2);
        group.add(cockpit);
        
        // Engines
        const engineGeometry = new THREE.ConeGeometry(0.4, 1, 8);
        const engineMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444
        });
        
        const engine1 = new THREE.Mesh(engineGeometry, engineMaterial);
        engine1.position.set(-1.2, 0, 0);
        engine1.rotation.z = Math.PI / 2;
        group.add(engine1);
        
        const engine2 = new THREE.Mesh(engineGeometry, engineMaterial);
        engine2.position.set(1.2, 0, 0);
        engine2.rotation.z = Math.PI / 2;
        group.add(engine2);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(0.1, 4, 1);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.6,
            roughness: 0.3
        });
        
        const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing1.position.set(0, 1, 0);
        group.add(wing1);
        
        const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing2.position.set(0, -1, 0);
        group.add(wing2);
        
        this.mesh = group;
        this.mesh.name = 'spacecraft';
        this.mesh.scale.set(this.options.scale, this.options.scale, this.options.scale);
        
        // Store references to parts for effects
        this.parts = {
            body: body,
            cockpit: cockpit,
            engines: [engine1, engine2],
            wings: [wing1, wing2]
        };
    }
    
    // Load actual GLTF model (to be implemented when model is available)
    async loadModel(modelPath) {
        // This would use GLTFLoader to load an actual spacecraft model
        // For now, we'll use the geometric representation
        console.log(`Would load model from ${modelPath}`);
        // Implementation would go here when we have the actual model
    }
    
    update(deltaTime, input, keysPressed) {
        // Handle Brake
        if (keysPressed['Space']) {
            this.drag = 0.95; // Stronger drag for braking
        } else {
            this.drag = 0.985; // Normal drag
        }
        
        // Apply drag to velocity
        this.velocity.multiplyScalar(this.drag);
        
        // Handle Boost
        const thrustMultiplier = keysPressed['ShiftLeft'] || keysPressed['ShiftRight'] ? 3.0 : 1.0;
        
        // Apply thrust based on input (W/S)
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
        
        if (keysPressed['KeyW']) {
            // Forward thrust
            this.velocity.addScaledVector(forward, this.thrustForce * thrustMultiplier * deltaTime / this.mass);
        }
        if (keysPressed['KeyS']) {
            // Backward thrust
            this.velocity.addScaledVector(forward, -this.thrustForce * 0.5 * deltaTime / this.mass);
        }
        
        // Apply rotation based on input
        // Pitch (up/down) - Arrow keys only so it doesn't conflict with W/S thrust
        if (keysPressed['ArrowUp']) {
            this.mesh.rotateX(-0.05 * deltaTime * 60); // Pitch down
        }
        if (keysPressed['ArrowDown']) {
            this.mesh.rotateX(0.05 * deltaTime * 60); // Pitch up
        }
        
        // Yaw (left/right) - A/D or Arrow Left/Right
        if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
            this.mesh.rotateY(0.05 * deltaTime * 60); // Yaw left
        }
        if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
            this.mesh.rotateY(-0.05 * deltaTime * 60); // Yaw right
        }
        
        // Roll (Q/E)
        if (keysPressed['KeyQ']) {
            this.mesh.rotateZ(0.05 * deltaTime * 60); // Roll left
        }
        if (keysPressed['KeyE']) {
            this.mesh.rotateZ(-0.05 * deltaTime * 60); // Roll right
        }
        
        // Update position
        this.mesh.position.addScaledVector(this.velocity, deltaTime);
        
        // Sync to physics engine if available
        if (this.options.rapierWorld) {
            this.options.rapierWorld.setLinearVelocity(this.mesh, this.velocity);
            this.options.rapierWorld.updateRigidBodyFromThree(this.mesh);
        }
        
        // Update visual effects (engine glow, etc.)
        this.updateVisualEffects(deltaTime, keysPressed);
    }
    
    updateVisualEffects(deltaTime, keysPressed) {
        // Engine glow based on thrust
        const isThrusting = keysPressed['KeyW'] || keysPressed['ArrowUp'];
        
        // Pulse engine intensity
        const engineGlow = Math.sin(performance.now() * 0.01) * 0.5 + 0.5;
        
        // This would affect emissive properties or particle effects
        // For now, we'll just log it
        // if (isThrusting) {
        //     console.log(`Thrusting: ${engineGlow}`);
        // }
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getQuaternion() {
        return this.mesh.quaternion.clone();
    }
    
    getForwardVector() {
        return new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
    }
    
    getUpVector() {
        return new THREE.Vector3(0, 1, 0).applyQuaternion(this.mesh.quaternion);
    }
    
    getRightVector() {
        return new THREE.Vector3(1, 0, 0).applyQuaternion(this.mesh.quaternion);
    }
    
    dispose() {
        // Dispose of geometries and materials
        this.mesh.traverse((object) => {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
        
        this.scene.remove(this.mesh);
    }
}