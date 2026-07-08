// ProximityDetector.js - Detects when spacecraft is near a planet to trigger arrival sequence
import * as THREE from 'three';

export class ProximityDetector {
    constructor(spacecraft, planets, options = {}) {
        this.spacecraft = spacecraft;
        this.planets = planets; // Array of planet objects
        this.options = {
            arrivalDistance: 30, // Distance to trigger arrival
            checkInterval: 100,  // Check every 100ms (for performance)
            ...options
        };
        
        this.lastCheckTime = 0;
        this.isDetecting = true;
        this.nearestPlanet = null;
        this.nearestDistance = Infinity;
        this.lastVisitedPlanet = null; // Prevent triggering arrival continuously on the same planet
        
        // Bind methods
        this.update = this.update.bind(this);
    }
    
    update(deltaTime) {
        if (!this.isDetecting) return;
        
        // Throttle checks for performance
        this.lastCheckTime += deltaTime * 1000; // Convert to milliseconds
        if (this.lastCheckTime < this.options.checkInterval) {
            return;
        }
        this.lastCheckTime = 0;
        
        this.checkProximity();
    }
    
    checkProximity() {
        if (!this.spacecraft) return;
        
        const shipPos = this.spacecraft.getPosition ? 
                       this.spacecraft.getPosition() : 
                       this.spacecraft.position;
        
        if (!shipPos) return;
        
        let closestPlanet = null;
        let minDistance = Infinity;
        
        for (const planet of this.planets) {
            if (!planet) continue;
            
            const planetPos = planet.getPosition ? 
                             planet.getPosition() : 
                             planet.position;
            
            if (!planetPos) continue;
            
            const distance = shipPos.distanceTo(planetPos);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPlanet = planet;
            }
        }
        
        this.nearestPlanet = closestPlanet;
        this.nearestDistance = minDistance;
        
        // If we move far enough away from the last visited planet, reset it
        if (this.lastVisitedPlanet && minDistance > this.options.arrivalDistance * 2.0) {
            this.lastVisitedPlanet = null;
            console.log("Cleared last visited planet proximity constraint.");
        }
        
        // Check if we're close enough to trigger arrival
        if (closestPlanet && minDistance < this.options.arrivalDistance) {
            this.onPlanetApproach(closestPlanet, minDistance);
            
            // Trigger cinematic arrival sequence only if we haven't visited it recently
            if (closestPlanet !== this.lastVisitedPlanet) {
                this.lastVisitedPlanet = closestPlanet;
                this.setDetectionEnabled(false); // Stop checking while sequence plays
                
                console.log(`Triggering spacecraft-arrival event for planet: ${closestPlanet.name || closestPlanet.key}`);
                const arrivalEvent = new CustomEvent('spacecraft-arrival', {
                    detail: {
                        planet: closestPlanet,
                        distance: minDistance
                    }
                });
                window.dispatchEvent(arrivalEvent);
            }
        }
    }
    
    onPlanetApproach(planet, distance) {
        // Dispatch approach event for minor UI indicators (such as sound chime)
        const event = new CustomEvent('planetApproach', {
            detail: {
                planet: planet,
                distance: distance
            }
        });
        window.dispatchEvent(event);
    }
    
    getNearestPlanet() {
        return this.nearestPlanet;
    }
    
    getNearestDistance() {
        return this.nearestDistance;
    }
    
    setDetectionEnabled(enabled) {
        this.isDetecting = enabled;
    }
    
    resumeDetection() {
        this.setDetectionEnabled(true);
    }
    
    setArrivalDistance(distance) {
        this.options.arrivalDistance = distance;
    }
    
    dispose() {
        this.planets = [];
        this.spacecraft = null;
        this.lastVisitedPlanet = null;
    }
}