// GravityEngine.js - Newtonian N-body gravity simulation
import * as THREE from 'three';
import { G, SUN_MASS_SCALED, PLANET_RADII, PHYSICS } from './constants.js';

export class GravityEngine {
    constructor(bodies) {
        this.bodies = bodies; // Array of bodies with mass, position, velocity
        this.G = G;
        this.sunMass = SUN_MASS_SCALED;
        this.minDistanceSq = PHYSICS.minDistanceSq;
    }
    
    // Update positions and velocities based on gravitational forces
    update(deltaTime) {
        // Apply gravity from sun to all bodies
        for (const body of this.bodies) {
            if (!body || !body.mass) continue;
            
            // Skip the sun itself (it's assumed to be stationary at origin)
            if (body.isSun) continue;
            
            // Calculate gravitational force from sun
            const force = this.calculateGravitationalForce(
                body.position,
                body.mass,
                new THREE.Vector3(0, 0, 0), // Sun at origin
                this.sunMass
            );
            
            // F = m * a, so a = F/m
            const acceleration = force.clone().divideScalar(body.mass);
            
            // Symplectic Euler integration: update velocity first
            body.velocity.addScaledVector(acceleration, deltaTime);
            
            // Then update position using new velocity
            body.position.addScaledVector(body.velocity, deltaTime);
        }
    }
    
    // Calculate gravitational force between two bodies
    calculateGravitationalForce(position1, mass1, position2, mass2) {
        const force = new THREE.Vector3();
        
        // Direction from body1 to body2
        force.subVectors(position2, position1);
        
        const distanceSquared = force.lengthSq();
        // Clamp minimum distance to prevent infinite force
        const clampedDistanceSquared = Math.max(distanceSquared, this.minDistanceSq);
        
        // Newton's law of universal gravitation: F = G * m1 * m2 / r^2
        const forceMagnitude = (this.G * mass1 * mass2) / clampedDistanceSquared;
        
        // Normalize direction and apply magnitude
        force.normalize().multiplyScalar(forceMagnitude);
        
        return force;
    }
    
    // Calculate orbital velocity for a circular orbit at given radius
    calculateOrbitalVelocity(radius, centralMass = this.sunMass) {
        return Math.sqrt((this.G * centralMass) / Math.max(radius, this.minDistanceSq));
    }
    
    // Add a body to the simulation
    addBody(body) {
        this.bodies.push(body);
    }
    
    // Remove a body from the simulation
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }
    
    // Update the sun's mass (for tuning)
    setSunMass(mass) {
        this.sunMass = mass;
    }
    
    // Update gravitational constant (for tuning)
    setG(newG) {
        this.G = newG;
    }
}