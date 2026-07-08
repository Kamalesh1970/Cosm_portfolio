// Clock.js - Fixed-timestep game loop for consistent physics
export class Clock {
    constructor() {
        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;
        this.deltaTime = 0;
        this.running = false;
    }
    
    start() {
        this.startTime = performance.now();
        this.oldTime = this.startTime;
        this.running = true;
    }
    
    stop() {
        this.running = false;
    }
    
    getDelta() {
        if (!this.running) return 0;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.oldTime) / 1000; // Convert to seconds
        this.oldTime = currentTime;
        this.elapsedTime += this.deltaTime;
        
        return this.deltaTime;
    }
    
    getElapsedTime() {
        return this.elapsedTime;
    }
}