// ChaseCamera.js - Third-person chase camera that follows the spacecraft
import * as THREE from 'three';
import { gsap } from 'gsap';

export class ChaseCamera {
    constructor(camera, target, options = {}) {
        this.camera = camera;
        this.target = target;
        this.options = {
            distance: 15,
            height: 5,
            smoothing: 0.1,
            rotationDamping: 0.1,
            verticalAngle: Math.PI / 6, // 30 degrees up
            horizontalAngle: 0, // behind the target
            ...options
        };
        
        // Camera state
        this.offset = new THREE.Vector3();
        this.desiredPosition = new THREE.Vector3();
        this.lookAtOffset = new THREE.Vector3(0, 1, 0); // Look slightly above target
        
        // Initialize camera position
        this.update(0);
    }
    
    update(deltaTime) {
        if (!this.target) return;
        
        // Get target position and orientation
        const targetPos = this.target.getPosition ? this.target.getPosition() : this.target.position;
        const targetQuat = this.target.getQuaternion ? this.target.getQuaternion() : this.target.quaternion;
        
        if (!targetPos || !targetQuat) return;
        
        // Calculate desired camera position
        // Start with offset behind the target
        this.offset.set(0, this.options.height, -this.options.distance);
        
        // Rotate offset by target's orientation
        this.offset.applyQuaternion(targetQuat);
        
        // Add to target position
        this.desiredPosition.copy(targetPos).add(this.offset);
        
        // Smoothly interpolate camera position
        if (this.options.smoothing > 0) {
            this.camera.position.lerp(this.desiredPosition, this.options.smoothing);
        } else {
            this.camera.position.copy(this.desiredPosition);
        }
        
        // Point camera at target
        const lookAtPosition = targetPos.clone().add(this.lookAtOffset);
        this.camera.lookAt(lookAtPosition);
        
        // Optional: smooth rotation
        // This would involve more complex quaternion interpolation
    }
    
    // Set camera to a specific position (for cinematic sequences)
    setPosition(position, target, duration = 1) {
        return new Promise((resolve) => {
            gsap.to(this.camera.position, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: duration,
                ease: 'power2.out',
                onComplete: resolve
            });
            
            // For lookAt, we'll store the target in a dummy object and animate that
            const currentLookAt = this.getLookAtPoint();
            const lookAtTarget = { x: currentLookAt.x, y: currentLookAt.y, z: currentLookAt.z };
            
            gsap.to(lookAtTarget, {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: duration,
                ease: 'power2.out',
                onUpdate: () => {
                    this.camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
                }
            });
        });
    }
    
    // Set camera to look at a specific point
    lookAtPoint(point, duration = 1) {
        return new Promise((resolve) => {
            const currentLookAt = this.getLookAtPoint();
            const lookAtTarget = { x: currentLookAt.x, y: currentLookAt.y, z: currentLookAt.z };
            
            gsap.to(lookAtTarget, {
                x: point.x,
                y: point.y,
                z: point.z,
                duration: duration,
                ease: 'power2.out',
                onUpdate: () => {
                    this.camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
                },
                onComplete: resolve
            });
        });
    }
    
    // Get current camera position
    getPosition() {
        return this.camera.position.clone();
    }
    
    // Get current look at point
    getLookAtPoint() {
        // This is approximate since we don't store the look target directly
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return this.camera.position.clone().add(direction.multiplyScalar(10));
    }
    
    // Reset to default position behind target
    reset() {
        this.update(0);
    }
}