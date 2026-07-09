// Sun.js - Sun object with emissive material and bloom effect
import * as THREE from 'three';
import { PLANET_DATA } from './PlanetData.js';

export class Sun {
    constructor(scene, loader) {
        this.scene = scene;
        this.loader = loader;
        this.data = PLANET_DATA.sun;
        
        // Create the sun mesh
        this.createMesh();
        
        // Add to scene
        this.scene.add(this.mesh);
        
        // Add point light for illuminating planets
        this.createLight();
    }
    
    createMesh() {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(
            this.data.radius * 0.0001, // Scale down for visual purposes
            32,  // width segments
            32   // height segments
        );
        
        // Use basic material for self-illumination effect
        this.material = new THREE.MeshBasicMaterial({
            color: this.data.color
        });
        
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = 'sun';
        
        // Position at center
        this.mesh.position.set(0, 0, 0);
    }
    
    createLight() {
        // Create point light for illumination
        // Point light at the sun's position to illuminate planets
        this.light = new THREE.PointLight(this.data.color, 2.0, 0, 2.0);
        this.light.position.set(0, 0, 0);
        this.scene.add(this.light);
        
        // Dim warm ambient so shadowed faces aren't pure black
        this.ambientLight = new THREE.AmbientLight(0x332211, 0.4);
        this.scene.add(this.ambientLight);
    }
    
    async loadTextures() {
        if (!this.loader || !this.data.texture) return;
        
        try {
            const map = await this.loader.loadTexture(this.data.texture, 'sun_map');
            if (map && this.material) {
                this.material.map = map;
                this.material.color.setHex(0xffffff); // Reset to white so texture color is authentic
                this.material.needsUpdate = true;
            }
        } catch (e) {
            console.warn('Error loading sun texture:', e);
        }
    }
    
    update(deltaTime) {
        // Optional: add slight pulsation or rotation for visual interest
        // this.mesh.rotation.y += 0.0001 * deltaTime * 60;
    }
    
    getPosition() {
        return this.mesh.position;
    }
    
    getLight() {
        return this.light;
    }
    
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.scene.remove(this.mesh);
        }
        
        if (this.light) {
            this.scene.remove(this.light);
        }
        
        if (this.ambientLight) {
            this.scene.remove(this.ambientLight);
        }
    }
}