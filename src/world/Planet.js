// Planet.js - Reusable planet class with texture, rotation, and orbit
import * as THREE from 'three';
import { PLANET_DATA } from './PlanetData.js';

export class Planet {
    constructor(scene, planetKey, loader, options = {}) {
        this.scene = scene;
        this.key = planetKey;
        this.data = PLANET_DATA[planetKey];
        this.options = options;
        this.loader = loader;

        // Orbital properties
        this.orbitRadius = (this.data.orbitRadius || 0) * 149.6;
        this.orbitSpeed = (this.data.orbitSpeed || 0) * 1e-5;
        this.orbitalAngle = Math.random() * Math.PI * 2; // Random starting position

        // Physical properties
        this.mass = this.data.mass || 1;
        this.radius = this.data.radius || 1;

        // Rotation properties
        this.rotationPeriod = this.data.rotationPeriod || 24 * 3600; // Default to Earth day
        this.rotationSpeed = 2 * Math.PI / this.rotationPeriod; // radians per second
        this.axialTilt = this.data.axialTilt || 0;
        this.rotationAngle = 0;

        // Visual properties
        this.scaleFactor = options.scaleFactor || 0.0001; // Scale down for visual purposes
        this.visualScale = options.visualScale || 100; // Scale up for visibility

        // Create the planet mesh
        this.createMesh();

        // Initialize position
        this.updatePosition(0); // Initial position
    }

    createMesh() {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(
            this.radius * this.scaleFactor * this.visualScale,
            32,  // width segments
            32   // height segments
        );

        // Start with a colored material, textures will be loaded asynchronously
        this.material = new THREE.MeshStandardMaterial({
            color: this.data.color || 0xffffff,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.name = `planet-${this.key}`;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Add cloud layer for Earth if applicable
        if (this.data.cloudTexture) {
            this.createCloudLayer();
        }

        // Add ring system if applicable (like Saturn)
        if (this.data.hasRings && this.data.ringTexture) {
            this.createRingSystem();
        }
    }

    createCloudLayer() {
        // Create a slightly larger sphere for clouds
        const cloudGeometry = new THREE.SphereGeometry(
            this.radius * this.scaleFactor * this.visualScale * 1.01, // 1% larger
            32,
            32
        );

        this.cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        this.clouds = new THREE.Mesh(cloudGeometry, this.cloudMaterial);
        this.mesh.add(this.clouds);
    }

    createRingSystem() {
        // Create ring geometry (simplified as a flat cylinder)
        const innerRadius = this.radius * this.scaleFactor * this.visualScale * 1.2;
        const outerRadius = this.radius * this.scaleFactor * this.visualScale * 2.5;

        const ringGeometry = new THREE.RingGeometry(
            innerRadius,
            outerRadius,
            64,  // radial segments
            32   // tangential segments
        );

        this.ringMaterial = new THREE.MeshStandardMaterial({
            color: this.data.color || 0xcccccc,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        this.rings = new THREE.Mesh(ringGeometry, this.ringMaterial);
        this.rings.rotation.x = Math.PI / 2; // Make it horizontal

        // Apply axial tilt to rings
        this.rings.rotation.z = this.axialTilt;

        this.mesh.add(this.rings);
    }

    async loadTextures() {
        if (!this.loader) return;

        try {
            if (this.data.texture) {
                const map = await this.loader.loadTexture(this.data.texture, `${this.key}_map`).catch(() => null);
                if (map) {
                    this.material.map = map;
                    this.material.color.setHex(0xffffff); // Reset color to white so texture shows fully
                    this.material.needsUpdate = true;
                }
            }

            if (this.data.normalMap) {
                const normalMap = await this.loader.loadTexture(this.data.normalMap, `${this.key}_normal`).catch(() => null);
                if (normalMap) {
                    this.material.normalMap = normalMap;
                    this.material.needsUpdate = true;
                }
            }

            if (this.data.specularMap) {
                const specularMap = await this.loader.loadTexture(this.data.specularMap, `${this.key}_specular`).catch(() => null);
                if (specularMap) {
                    this.material.roughnessMap = specularMap;
                    this.material.needsUpdate = true;
                }
            }

            if (this.data.cloudTexture && this.cloudMaterial) {
                const cloudMap = await this.loader.loadTexture(this.data.cloudTexture, `${this.key}_cloud`).catch(() => null);
                if (cloudMap) {
                    this.cloudMaterial.map = cloudMap;
                    this.cloudMaterial.needsUpdate = true;
                }
            }

            if (this.data.hasRings && this.data.ringTexture && this.ringMaterial) {
                const ringMap = await this.loader.loadTexture(this.data.ringTexture, `${this.key}_ring`).catch(() => null);
                if (ringMap) {
                    this.ringMaterial.map = ringMap;
                    this.ringMaterial.needsUpdate = true;
                }
            }
        } catch (e) {
            console.warn(`Error loading textures for planet ${this.key}:`, e);
        }
    }

    updatePosition(deltaTime) {
        // Update orbital position
        this.orbitalAngle += this.orbitSpeed * deltaTime;

        // Calculate position in orbit (assuming circular orbit for simplicity)
        const x = Math.cos(this.orbitalAngle) * this.orbitRadius;
        const z = Math.sin(this.orbitalAngle) * this.orbitRadius;

        this.mesh.position.set(x, 0, z);

        // Update rotation (self-rotation)
        this.rotationAngle += this.rotationSpeed * deltaTime;
        this.mesh.rotation.y = this.rotationAngle;

        // Apply axial tilt
        this.mesh.rotation.x = this.axialTilt;

        // Rotate clouds if they exist
        if (this.clouds) {
            this.clouds.rotation.y += 0.001 * deltaTime; // Clouds move slightly faster
        }

        // Rotate rings if they exist
        if (this.rings) {
            this.rings.rotation.y += 0.0005 * deltaTime; // Rings rotate slowly
        }
    }

    // Alias so the animate() loop in init.js, which calls planet.update(deltaTime)
    // (matching the convention used by Sun, asteroidBelt, saturnRings, spacecraft),
    // works correctly.
    update(deltaTime) {
        this.updatePosition(deltaTime);
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    getMass() {
        return this.mass;
    }

    getRadius() {
        return this.radius;
    }

    getMesh() {
        return this.mesh;
    }

    dispose() {
        // Dispose of geometry and material
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(m => m.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }

            // Dispose of clouds
            if (this.clouds) {
                if (this.clouds.geometry) this.clouds.geometry.dispose();
                if (this.clouds.material) this.clouds.material.dispose();
            }

            // Dispose of rings
            if (this.rings) {
                if (this.rings.geometry) this.rings.geometry.dispose();
                if (this.rings.material) this.rings.material.dispose();
            }

            this.scene.remove(this.mesh);
        }
    }
}