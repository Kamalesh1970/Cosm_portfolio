// CameraRig.js - Manages different camera modes (chase, cinematic, etc.)
import * as THREE from 'three';

export class CameraRig {
    constructor(camera, options = {}) {
        this.camera = camera;
        this.options = {
            smoothness: 0.1,      // Smoothing factor for transitions
            ...options
        };
        
        this.mode = 'free'; // free, chase, cinematic, orbital
        this.target = null;
        this.offset = new THREE.Vector3(0, 5, -10); // Default chase cam offset
        this.targetOffset = new THREE.Vector3(0, 2, 0); // Look at offset
        
        // Smooth transition properties
        this.targetPosition = this.camera.position.clone();
        this.targetQuaternion = this.camera.quaternion.clone();
        
        // Bind methods
        this.update = this.update.bind(this);
    }
    
    setChaseMode(target, offset = null, lookAtOffset = null) {
        this.mode = 'chase';
        this.target = target;
        if (offset) this.offset.copy(offset);
        if (lookAtOffset) this.targetOffset.copy(lookAtOffset);
    }
    
    setCinematicMode() {
        this.mode = 'cinematic';
        this.target = null;
    }
    
    setOrbitalMode(target, radius = 50, height = 20) {
        this.mode = 'orbital';
        this.target = target;
        this.orbitalRadius = radius;
        this.orbitalHeight = height;
        this.orbitalAngle = 0;
    }
    
    setFreeMode() {
        this.mode = 'free';
        this.target = null;
    }
    
    update(deltaTime) {
        switch (this.mode) {
            case 'chase':
                this.updateChaseMode(deltaTime);
                break;
            case 'orbital':
                this.updateOrbitalMode(deltaTime);
                break;
            case 'cinematic':
                // Handled by ArrivalSequence
                break;
            case 'free':
            default:
                // No automatic movement
                break;
        }
        
        // Smoothly interpolate current state toward target state
        this.smoothTransition(deltaTime);
    }
    
    updateChaseMode(deltaTime) {
        if (!this.target) return;
        
        // Get target's position and orientation
        const targetPos = this.target.getPosition ? 
                         this.target.getPosition() : 
                         this.target.position;
        const targetQuat = this.target.getQuaternion ? 
                          this.target.getQuaternion() : 
                          this.target.quaternion;
        
        if (!targetPos || !targetQuat) return;
        
        // Calculate desired camera position
        // Convert offset from local to world space
        const offsetWorld = new THREE.Vector3(
            this.offset.x,
            this.offset.y,
            this.offset.z
        ).applyQuaternion(targetQuat);
        
        this.targetPosition.copy(targetPos).add(offsetWorld);
        
        // Calculate where to look at
        const lookAtPoint = new THREE.Vector3(
            this.targetOffset.x,
            this.targetOffset.y,
            this.targetOffset.z
        ).applyQuaternion(targetQuat).add(targetPos);
        
        // Point camera at lookAtPoint
        this.targetQuaternion.copy(
            new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().lookAt(
                    this.targetPosition, // camera position
                    lookAtPoint,         // look at point
                    new THREE.Vector3(0, 1, 0) // up vector
                )
            )
        );
    }
    
    updateOrbitalMode(deltaTime) {
        if (!this.target) return;
        
        const targetPos = this.target.getPosition ? 
                         this.target.getPosition() : 
                         this.target.position;
        
        if (!targetPos) return;
        
        // Update orbital angle
        this.orbitalAngle += 0.5 * deltaTime; // Adjust speed as needed
        
        // Calculate orbital position
        const x = targetPos.x + Math.cos(this.orbitalAngle) * this.orbitalRadius;
        const y = targetPos.y + this.orbitalHeight;
        const z = targetPos.z + Math.sin(this.orbitalAngle) * this.orbitalRadius;
        
        this.targetPosition.set(x, y, z);
        
        // Look at target
        this.targetQuaternion.copy(
            new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().lookAt(
                    this.targetPosition, // camera position
                    targetPos,           // look at point
                    new THREE.Vector3(0, 1, 0) // up vector
                )
            )
        );
    }
    
    smoothTransition(deltaTime) {
        // Smoothly interpolate position
        this.camera.position.lerp(this.targetPosition, 1 - Math.exp(-this.options.smoothness * 60 * deltaTime));
        
        // Smoothly interpolate rotation (spherical linear interpolation)
        THREE.Quaternion.slerp(
            this.camera.quaternion,
            this.targetQuaternion,
            this.camera.quaternion,
            1 - Math.exp(-this.options.smoothness * 60 * deltaTime)
        );
        
        // Ensure quaternion stays normalized
        this.camera.quaternion.normalize();
    }
    
    // Immediately set camera position and orientation (no smoothing)
    snapTo(targetPosition, targetQuaternion) {
        this.camera.position.copy(targetPosition);
        this.camera.quaternion.copy(targetQuaternion);
        this.targetPosition.copy(targetPosition);
        this.targetQuaternion.copy(targetQuaternion);
    }
    
    getCurrentPosition() {
        return this.camera.position.clone();
    }
    
    getCurrentQuaternion() {
        return this.camera.quaternion.clone();
    }
    
    lookAtPoint(point) {
        // Immediately point camera at a point
        this.camera.lookAt(point);
        this.targetQuaternion.copy(this.camera.quaternion);
    }
    
    dispose() {
        this.target = null;
    }
}