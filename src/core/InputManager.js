// InputManager.js - Keyboard input tracking
import * as THREE from 'three';
export class InputManager {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        
        // Bind event listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('blur', () => this.reset());
    }
    
    onKeyDown(event) {
        this.keys[event.code] = true;
    }
    
    onKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    reset() {
        this.keys = {};
        this.prevKeys = {};
    }
    
    update() {
        // Store previous frame's state
        this.prevKeys = { ...this.keys };
    }
    
    isPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    isJustPressed(keyCode) {
        return this.keys[keyCode] && !this.prevKeys[keyCode];
    }
    
    isJustReleased(keyCode) {
        return !this.keys[keyCode] && this.prevKeys[keyCode];
    }
    
    getMovementVector() {
        const move = new THREE.Vector3();
        
        // Forward/backward (W/S or ArrowUp/ArrowDown)
        if (this.isPressed('KeyW') || this.isPressed('ArrowUp')) move.z -= 1;
        if (this.isPressed('KeyS') || this.isPressed('ArrowDown')) move.z += 1;
        
        // Left/right (A/D or ArrowLeft/ArrowRight)
        if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) move.x -= 1;
        if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) move.x += 1;
        
        // Up/down (Space/Ctrl or Q/E for roll)
        if (this.isPressed('Space')) move.y += 1;
        if (this.isPressed('ControlLeft')) move.y -= 1;
        
        return move;
    }
    
    getRotationVector() {
        const rotate = new THREE.Vector3();
        
        // Pitch (up/down arrow or W/S for pitch)
        if (this.isPressed('ArrowUp') || this.isPressed('KeyW')) rotate.x -= 1; // Pitch down
        if (this.isPressed('ArrowDown') || this.isPressed('KeyS')) rotate.x += 1; // Pitch up
        
        // Yaw (left/right arrow or A/D for yaw)
        if (this.isPressed('ArrowLeft') || this.isPressed('KeyA')) rotate.y -= 1; // Yaw left
        if (this.isPressed('ArrowRight') || this.isPressed('KeyD')) rotate.y += 1; // Yaw right
        
        // Roll (Q/E)
        if (this.isPressed('KeyQ')) rotate.z += 1; // Roll left
        if (this.isPressed('KeyE')) rotate.z -= 1; // Roll right
        
        return rotate;
    }
    
    isBoostPressed() {
        return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
    }
    
    isBrakePressed() {
        return this.isPressed('Space'); // Space for brake
    }
    
    isResetPressed() {
        return this.isJustPressed('KeyR');
    }
}