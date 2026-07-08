// Starfield.js - Procedural starfield using THREE.Points + real skybox texture
import * as THREE from 'three';
import seedrandom from 'seedrandom';

export class Starfield {
    constructor(scene, loader, options = {}) {
        this.scene = scene;
        this.loader = loader;
        this.options = {
            starCount: options.starCount || 5000,
            size: options.size || 1000, // radius of starfield sphere
            seed: options.seed || Date.now(),
            ...options
        };
        
        // Initialize random seed for reproducible starfield
        this.rng = seedrandom(this.options.seed);
        
        // Create the procedural starfield (points)
        this.createStars();
        
        // Create the skybox sphere (will receive real texture)
        this.createSkybox();
        
        // Add to scene
        this.scene.add(this.points);
        this.scene.add(this.skybox);
    }
    
    createStars() {
        const vertices = [];
        const colors = [];
        const sizes = [];
        
        const color = new THREE.Color();
        
        for (let i = 0; i < this.options.starCount; i++) {
            // Generate random point on sphere
            const phi = Math.acos(2 * this.rng() - 1);
            const theta = 2 * Math.PI * this.rng();
            
            const x = this.options.size * Math.sin(phi) * Math.cos(theta);
            const y = this.options.size * Math.sin(phi) * Math.sin(theta);
            const z = this.options.size * Math.cos(phi);
            
            vertices.push(x, y, z);
            
            // Random star colour temperature (bluish-white to warm-white)
            const hue = this.rng() * 0.15;          // 0 – 0.15 (red → yellow-ish)
            const sat = this.rng() * 0.3;            // low saturation → almost white
            const brightness = 0.3 + 0.7 * Math.pow(this.rng(), 2.5);
            color.setHSL(hue, sat, brightness);
            
            colors.push(color.r, color.g, color.b);
            
            // Size based on brightness (brighter = slightly larger)
            const size = 0.5 + brightness * 1.5;
            sizes.push(size);
        }
        
        // Create buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        this.points = new THREE.Points(geometry, material);
        this.points.name = 'starfield';
        this.points.frustumCulled = false; // Prevent culling when looking away
    }
    
    /**
     * Create a large background sphere that will display the
     * real Milky Way / deep-space texture (equirectangular).
     */
    createSkybox() {
        const geometry = new THREE.SphereGeometry(
            this.options.size * 1.5, // Slightly larger than the star points
            64,
            32
        );
        
        this.skyboxMaterial = new THREE.MeshBasicMaterial({
            color: 0x111122,         // Very dark blue-black tint until texture loads
            side: THREE.BackSide,    // Render on the inside of the sphere
            depthWrite: false
        });
        
        this.skybox = new THREE.Mesh(geometry, this.skyboxMaterial);
        this.skybox.name = 'skybox';
        this.skybox.renderOrder = -1; // Render behind everything
    }
    
    /**
     * Asynchronously load the real Milky Way / stars texture.
     */
    async loadTextures() {
        if (!this.loader) return;
        
        try {
            const texture = await this.loader.loadTexture('/textures/starfield.jpg', 'starfield_map');
            if (texture && this.skyboxMaterial) {
                this.skyboxMaterial.map = texture;
                this.skyboxMaterial.color.setHex(0xffffff); // Full brightness with texture
                this.skyboxMaterial.needsUpdate = true;
            }
        } catch (e) {
            console.warn('Error loading starfield texture:', e);
        }
    }
    
    update(deltaTime) {
        // Optional: slow rotation of starfield for parallax effect
        // this.points.rotation.y += 0.0001 * deltaTime;
    }
    
    dispose() {
        if (this.points) {
            if (this.points.geometry) this.points.geometry.dispose();
            if (this.points.material) this.points.material.dispose();
            this.scene.remove(this.points);
        }
        if (this.skybox) {
            if (this.skybox.geometry) this.skybox.geometry.dispose();
            if (this.skybox.material) {
                if (this.skybox.material.map) this.skybox.material.map.dispose();
                this.skybox.material.dispose();
            }
            this.scene.remove(this.skybox);
        }
    }
}