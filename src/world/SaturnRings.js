// SaturnRings.js - Ring system for Saturn
import * as THREE from 'three';

export class SaturnRings {
    constructor(scene, loader, options = {}) {
        this.scene = scene;
        this.loader = loader;
        this.options = {
            innerRadius: 0.7,    // Relative to Saturn radius
            outerRadius: 2.2,    // Relative to Saturn radius
            segments: 64,
            textureRepeat: 8,
            ...options
        };
        
        this.createRings();
    }
    
    createRings() {
        // Create ring geometry (a flat torus segment)
        const geometry = new THREE.RingGeometry(
            this.options.innerRadius,
            this.options.outerRadius,
            this.options.segments,
            1, // thetaSegments (1 for full circle)
            0, // thetaStart
            Math.PI * 2 // thetaLength
        );
        
        // Create material with transparency
        this.material = new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        this.rings = new THREE.Mesh(geometry, this.material);
        this.rings.name = 'saturn-rings';
        
        // Rotate to match Saturn's axial tilt (26.7 degrees)
        this.rings.rotation.x = 26.7 * Math.PI / 180;
        
        // Add to scene
        this.scene.add(this.rings);
    }
    
    async loadTextures() {
        if (!this.loader) return;
        
        try {
            const ringTexture = await this.loader.loadTexture('/textures/saturn_ring.png', 'saturn_ring_map');
            if (ringTexture && this.material) {
                ringTexture.wrapS = THREE.RepeatWrapping;
                ringTexture.wrapT = THREE.RepeatWrapping;
                ringTexture.repeat.set(this.options.textureRepeat, this.options.textureRepeat);
                
                this.material.map = ringTexture;
                this.material.color.setHex(0xffffff);
                this.material.needsUpdate = true;
            }
        } catch (e) {
            console.warn('Error loading Saturn ring texture:', e);
        }
    }
    
    update(deltaTime, planetPosition, planetRotation) {
        if (this.rings) {
            // Position rings at planet's position
            this.rings.position.copy(planetPosition);
            
            // Rotate rings slowly over time
            this.rings.rotation.y += 0.0001 * deltaTime * 60;
            
            // Keep the axial tilt
            this.rings.rotation.x = 26.7 * Math.PI / 180;
        }
    }
    
    dispose() {
        if (this.rings) {
            if (this.rings.geometry) this.rings.geometry.dispose();
            if (this.rings.material) this.rings.material.dispose();
            this.scene.remove(this.rings);
        }
    }
}