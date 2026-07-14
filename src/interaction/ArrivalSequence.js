// ArrivalSequence.js - Handles cinematic camera arrival sequence when approaching a planet
import * as THREE from 'three';
import { gsap } from 'gsap';

export class ArrivalSequence {
    constructor(scene, camera, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.options = {
            orbitRadius: 50,      // Distance from planet for camera orbit
            orbitHeight: 20,      // Height above planet's equator
            duration: 3.5,        // Duration of orbit animation in seconds
            easing: 'power2.inOut', // Easing function
            ...options
        };
        
        this._isActive = false;
        this.originalPosition = null;
        this.originalQuaternion = null;
        this.targetPlanet = null;
        
        // Bind methods
        this.update = this.update.bind(this);
    }
    
    start(planet, onComplete) {
        if (this._isActive) return;
        
        this._isActive = true;
        this.targetPlanet = planet;
        this.onComplete = onComplete;
        
        // Store original camera state
        this.originalPosition = this.camera.position.clone();
        this.originalQuaternion = this.camera.quaternion.clone();
        
        // Get planet position
        const planetPosition = planet.getPosition ? 
                              planet.getPosition() : 
                              planet.position;
        
        if (!planetPosition) {
            this.complete();
            return;
        }
        
        // Create orbital path points
        const points = this.createOrbitalPath(planetPosition);
        
        // Create a CatmullRomCurve3 for smooth interpolation
        const curve = new THREE.CatmullRomCurve3(points, true); // true = closed loop
        
        // Animate camera along the curve using a proxy object
        const proxy = { progress: 0 };
        this.originalFov = this.camera.fov; // Store before any tweens touch it
        
        gsap.to(proxy, {
            duration: this.options.duration,
            progress: 1,
            ease: this.options.easing,
            onUpdate: () => {
                const t = Math.max(0, Math.min(1, proxy.progress));
                const point = curve.getPointAt(t);
                this.camera.position.copy(point);
                
                // Always look at the planet
                this.camera.lookAt(planetPosition);
            },
            onComplete: () => {
                this.complete();
            }
        });
        
        // Also tween the camera's field of view for a dramatic effect
        gsap.to(this.camera, {
            fov: this.originalFov * 0.8, // Slightly zoom in
            duration: this.options.duration * 0.7,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: 1,
            onUpdate: () => {
                this.camera.updateProjectionMatrix();
            }
        });
    }
    
    createOrbitalPath(center) {
        const points = [];
        const numPoints = 16; // Number of points in the orbit
        
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            
            // Elliptical orbit: offset in X and Z, constant Y for height
            const x = center.x + Math.cos(angle) * this.options.orbitRadius;
            const y = center.y + this.options.orbitHeight;
            const z = center.z + Math.sin(angle) * this.options.orbitRadius;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        return points;
    }
    
    complete() {
        if (!this._isActive) return;
        
        this._isActive = false;
        
        // Smoothly return camera to original position/state
        gsap.to(this.camera.position, {
            x: this.originalPosition.x,
            y: this.originalPosition.y,
            z: this.originalPosition.z,
            duration: 1.5,
            ease: 'power2.out'
        });
        
        gsap.to(this.camera.quaternion, {
            x: this.originalQuaternion.x,
            y: this.originalQuaternion.y,
            z: this.originalQuaternion.z,
            w: this.originalQuaternion.w,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => {
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        });
        
        // Reset FOV
        gsap.to(this.camera, {
            fov: this.originalFov !== undefined ? this.originalFov : 75, // Return to original FOV
            duration: 1.0,
            ease: 'power2.out',
            onUpdate: () => {
                this.camera.updateProjectionMatrix();
            }
        });
    }
    
    cancel() {
        if (!this._isActive) return;
        
        this._isActive = false;
        
        // Kill all GSAP tweens affecting camera
        gsap.killTweensOf(this.camera.position);
        gsap.killTweensOf(this.camera.quaternion);
        gsap.killTweensOf(this.camera, { fov: true });
        
        // Snap back to original state
        this.camera.position.copy(this.originalPosition);
        this.camera.quaternion.copy(this.originalQuaternion);
        if (this.originalFov !== undefined) {
            this.camera.fov = this.originalFov;
            this.camera.updateProjectionMatrix();
        }
    }
    
    update(deltaTime) {
        // Required for loop binding, but GSAP currently drives it.
    }
    
    isActive() {
        return this._isActive;
    }
    
    dispose() {
        this.cancel();
        this.targetPlanet = null;
        this.onComplete = null;
    }
}