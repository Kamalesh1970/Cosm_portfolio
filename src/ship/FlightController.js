// FlightController.js - Handles 3D spacecraft flight controls
import * as THREE from 'three';

export class FlightController {
    constructor(spacecraft, inputManager, options = {}) {
        this.spacecraft = spacecraft;
        this.inputManager = inputManager;
        this.options = {
            rotationSpeed: 2.0, // radians per second
            thrustPower: 20.0,  // force multiplier
            boostMultiplier: 3.0,
            drag: 0.98,
            ...options
        };
        
        // State
        this.isBoosting = false;
        this.isBraking = false;
        
        // Bind methods
        this.update = this.update.bind(this);
    }
    
    update(deltaTime) {
        // Get current input state
        const keys = this.inputManager.keys;
        
        // Handle boost
        this.isBoosting = this.inputManager.isBoostPressed();
        
        // Handle brake
        this.isBraking = this.inputManager.isBrakePressed();
        
        // Calculate thrust
        let thrustMultiplier = 1.0;
        if (this.isBoosting) {
            thrustMultiplier *= this.options.boostMultiplier;
        }
        
        // Get forward vector from spacecraft orientation
        const forward = this.spacecraft.getForwardVector();
        
        // Apply thrust based on input
        if (keys['KeyW'] || keys['ArrowUp']) {
            // Forward thrust
            const force = forward.clone()
                .multiplyScalar(this.options.thrustPower * thrustMultiplier * deltaTime);
            this.spacecraft.applyForce(force);
        }
        
        if (keys['KeyS'] || keys['ArrowDown']) {
            // Backward thrust
            const force = forward.clone()
                .multiplyScalar(-this.options.thrustPower * 0.5 * deltaTime);
            this.spacecraft.applyForce(force);
        }
        
        // Apply rotation based on input
        const rotationDelta = new THREE.Vector3();
        
        // Pitch (up/down)
        if (keys['KeyW'] || keys['ArrowUp']) {
            rotationDelta.x -= 1; // Pitch down
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            rotationDelta.x += 1; // Pitch up
        }
        
        // Yaw (left/right)
        if (keys['KeyA'] || keys['ArrowLeft']) {
            rotationDelta.y -= 1; // Yaw left
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            rotationDelta.y += 1; // Yaw right
        }
        
        // Roll (Q/E)
        if (keys['KeyQ']) {
            rotationDelta.z += 1; // Roll left
        }
        if (keys['KeyE']) {
            rotationDelta.z -= 1; // Roll right
        }
        
        // Apply rotation if there's input
        if (rotationDelta.length() > 0) {
            rotationDelta.normalize();
            rotationDelta.multiplyScalar(this.options.rotationSpeed * deltaTime);
            
            // Convert to quaternion and apply
            const deltaQuat = new THREE.Quaternion();
            deltaQuat.setFromEuler(new THREE.Euler(
                rotationDelta.x,
                rotationDelta.y,
                rotationDelta.z,
                'XYZ'
            ));
            
            // Apply to spacecraft orientation
            const currentQuat = this.spacecraft.getQuaternion();
            const newQuat = new THREE.Quaternion().copy(currentQuat).multiply(deltaQuat);
            this.spacecraft.setQuaternion(newQuat);
        }
        
        // Apply drag
        if (this.isBraking) {
            // Stronger drag when braking
            this.spacecraft.velocity.multiplyScalar(0.95);
        } else {
            // Normal drag
            this.spacecraft.velocity.multiplyScalar(this.options.drag);
        }
        
        // Update spacecraft
        this.spacecraft.update(deltaTime, this.inputManager, keys);
    }
    
    // Get current speed
    getSpeed() {
        return this.spacecraft.velocity.length();
    }
    
    // Get velocity vector
    getVelocity() {
        return this.spacecraft.velocity.clone();
    }
    
    // Set velocity (for external forces like gravity assists)
    setVelocity(velocity) {
        this.spacecraft.velocity.copy(velocity);
    }
    
    // Get position
    getPosition() {
        return this.spacecraft.getPosition();
    }
    
    // Get orientation
    getOrientation() {
        return this.spacecraft.getQuaternion();
    }
    
    // Set orientation
    setOrientation(quaternion) {
        this.spacecraft.setQuaternion(quaternion);
    }
    
    // Reset to default state
    reset() {
        this.spacecraft.velocity.set(0, 0, 0);
        this.spacecraft.position.set(0, 0, 0);
        this.spacecraft.quaternion.set(0, 0, 0, 1);
        this.isBoosting = false;
        this.isBraking = false;
    }
}