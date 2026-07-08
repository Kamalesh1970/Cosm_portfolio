// AsteroidBelt.js - Asteroid belt with instanced rendering and Rapier physics
import * as THREE from 'three';
import seedrandom from 'seedrandom';
import { ASTEROID_BELT, PHYSICS } from '../physics/constants.js';

export class AsteroidBelt {
    constructor(scene, physicsWorld, loader, options = {}) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.loader = loader;
        this.options = {
            innerRadius: ASTEROID_BELT.innerRadius,
            outerRadius: ASTEROID_BELT.outerRadius,
            count: ASTEROID_BELT.count,
            massRange: ASTEROID_BELT.massRange,
            sizeRange: ASTEROID_BELT.sizeRange,
            seed: options.seed || Date.now(),
            ...options
        };
        
        // Initialize random seed for reproducible asteroid belt
        this.rng = seedrandom(this.options.seed);
        
        // Arrays to store asteroid data
        this.asteroids = [];
        this.meshes = [];
        this.rigidBodies = [];
        this.colliders = [];
        
        // Create the asteroid belt
        this.createAsteroidBelt();
        
        // Create instanced mesh for rendering
        this.createInstancedMesh();
    }
    
    createAsteroidBelt() {
        // Generate asteroid properties
        for (let i = 0; i < this.options.count; i++) {
            // Random position in the belt (torus distribution)
            const theta = this.rng() * 2 * Math.PI; // Angle around sun
            const phi = (this.rng() - 0.5) * 0.2;   // Small vertical spread
            const radius = this.options.innerRadius + 
                          (this.options.outerRadius - this.options.innerRadius) * this.rng();
            
            const x = Math.cos(theta) * Math.cos(phi) * radius;
            const y = Math.sin(phi) * radius;
            const z = Math.sin(theta) * Math.cos(phi) * radius;
            
            // Random size
            const sizeRange = this.options.sizeRange;
            const size = sizeRange[0] + (sizeRange[1] - sizeRange[0]) * this.rng();
            
            // Random mass (related to size)
            const massRange = this.options.massRange;
            const mass = massRange[0] + (massRange[1] - massRange[0]) * this.rng();
            
            // Random velocity (roughly orbital velocity with some variation)
            const orbitalVelocity = Math.sqrt(6.67430e-11 * 1.989e30 / Math.max(radius, 1e10)); // sqrt(G*M/r)
            const velocityFactor = 0.8 + 0.4 * this.rng(); // 0.8 to 1.2 times orbital velocity
            const vx = -Math.sin(theta) * orbitalVelocity * velocityFactor;
            const vy = 0; // Simplified - mostly in plane
            const vz = Math.cos(theta) * orbitalVelocity * velocityFactor;
            
            // Random rotation
            const rotationSpeed = (this.rng() - 0.5) * 0.02; // Slow tumble
            const rotationAxis = new THREE.Vector3(
                this.rng() - 0.5,
                this.rng() - 0.5,
                this.rng() - 0.5
            ).normalize();
            
            // Store asteroid data
            this.asteroids.push({
                position: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(vx, vy, vz),
                size: size,
                mass: mass,
                rotationSpeed: rotationSpeed,
                rotationAxis: rotationAxis,
                rotation: new THREE.Quaternion(),
                index: i
            });
        }
    }
    
    createInstancedMesh() {
        // Create a simple asteroid geometry (icosahedron for rough shape)
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        
        // Add some noise to make it more irregular
        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3(
                positionAttribute.getX(i),
                positionAttribute.getY(i),
                positionAttribute.getZ(i)
            );
            
            // Add noise
            const offset = (this.rng() - 0.5) * 0.3;
            vertex.normalize().multiplyScalar(1 + offset);
            
            positionAttribute.setX(i, vertex.x);
            positionAttribute.setY(i, vertex.y);
            positionAttribute.setZ(i, vertex.z);
        }
        positionAttribute.needsUpdate = true;
        
        // Create material
        this.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Create instanced mesh
        this.instancedMesh = new THREE.InstancedMesh(
            geometry,
            this.material,
            this.options.count
        );
        this.instancedMesh.name = 'asteroid-belt';
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Update frequently
        
        // Add to scene
        this.scene.add(this.instancedMesh);
        
        // Initialize matrix array
        this.dummy = new THREE.Object3D();
    }
    
    async loadTextures() {
        if (!this.loader) return;
        
        try {
            const texture = await this.loader.loadTexture('/textures/asteroid.jpg', 'asteroid_map');
            if (texture && this.material) {
                this.material.map = texture;
                this.material.color.setHex(0xffffff); // Reset color so texture shows normally
                this.material.needsUpdate = true;
            }
        } catch (e) {
            console.warn('Error loading asteroid texture:', e);
        }
    }
    
    update(deltaTime) {
        // Update asteroid positions and rotations
        let needsUpdate = false;
        
        for (let i = 0; i < this.asteroids.length; i++) {
            const asteroid = this.asteroids[i];
            
            // Update position based on velocity (simplified orbital motion)
            asteroid.position.x += asteroid.velocity.x * deltaTime;
            asteroid.position.y += asteroid.velocity.y * deltaTime;
            asteroid.position.z += asteroid.velocity.z * deltaTime;
            
            // Simple orbit correction to keep in roughly circular path
            // This is a simplification - real physics would be more complex
            const radius = Math.sqrt(
                asteroid.position.x * asteroid.position.x +
                asteroid.position.z * asteroid.position.z
            );
            const targetRadius = (this.options.innerRadius + this.options.outerRadius) / 2;
            
            if (radius > 0) {
                const correctionFactor = 0.001 * deltaTime;
                asteroid.position.x *= (1 - correctionFactor * (radius - targetRadius) / radius);
                asteroid.position.z *= (1 - correctionFactor * (radius - targetRadius) / radius);
            }
            
            // Update rotation
            asteroid.rotation = asteroid.rotation.multiply(
                new THREE.Quaternion().setFromAxisAngle(
                    asteroid.rotationAxis,
                    asteroid.rotationSpeed * deltaTime
                )
            );
            
            // Update instance matrix
            this.dummy.position.copy(asteroid.position);
            this.dummy.quaternion.copy(asteroid.rotation);
            this.dummy.scale.set(asteroid.size, asteroid.size, asteroid.size);
            this.dummy.updateMatrix();
            
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            this.instancedMesh.instanceMatrix.needsUpdate = true;
        }
    }
    
    // Get asteroid data for physics collision detection
    getAsteroidData() {
        return this.asteroids.map(a => ({
            position: a.position.clone(),
            size: a.size,
            mass: a.mass,
            index: a.index
        }));
    }
    
    dispose() {
        if (this.instancedMesh) {
            if (this.instancedMesh.geometry) this.instancedMesh.geometry.dispose();
            if (this.instancedMesh.material) this.instancedMesh.material.dispose();
            this.scene.remove(this.instancedMesh);
        }
        
        this.asteroids = [];
        this.meshes = [];
    }
}