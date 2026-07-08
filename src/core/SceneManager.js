// SceneManager.js - Manages the Three.js scene, renderer, and animation loop
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Clock } from './Clock.js';

/**
 * Check if the browser supports WebGL2 (preferred) or WebGL1.
 * Returns true if a context can be created; false otherwise.
 */
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGL2RenderingContext && canvas.getContext('webgl2') ||
            window.WebGLRenderingContext && canvas.getContext('webgl')
        );
    } catch (e) {
        return false;
    }
}

/**
 * Show an on-screen error when WebGL is unavailable.
 */
function showWebGLFallback(container) {
    const msg = document.createElement('div');
    msg.id = 'webgl-fallback';
    msg.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #0d1117; color: #e6edf3; display: flex; flex-direction: column;
        align-items: center; justify-content: center; z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center; padding: 2rem;
    `;
    msg.innerHTML = `
        <h1 style="font-size:2rem;margin-bottom:1rem;color:#f85149;">⚠ WebGL Not Available</h1>
        <p style="font-size:1.1rem;max-width:600px;line-height:1.6;color:#8b949e;">
            Your browser or GPU doesn't support WebGL — this 3D experience requires it to run.<br><br>
            <strong>Try:</strong> Chrome, Firefox, or Edge with hardware acceleration enabled.<br>
            On Chrome: <code style="background:#161b22;padding:2px 6px;border-radius:4px;">chrome://settings</code> → 
            Search "hardware acceleration" → Enable it → Restart.
        </p>
    `;
    // Hide any loading screens
    const loadingEl = document.getElementById('loading-screen');
    if (loadingEl) loadingEl.style.display = 'none';
    
    document.body.appendChild(msg);
}

export class SceneManager {
    constructor() {
        // ── WebGL support check ──────────────────────────────────
        if (!isWebGLAvailable()) {
            showWebGLFallback(document.getElementById('app'));
            throw new Error('WebGL is not supported in this browser/GPU.');
        }

        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            50000  // Large far plane for distant planets
        );

        // ── Renderer: explicit WebGLRenderer, high-performance ──
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        
        // ── Log WebGL context version once (for verification) ────
        const gl = this.renderer.getContext();
        if (gl) {
            const version = gl.getParameter(gl.VERSION);
            console.log(`%c🖥 WebGL context: ${version}`, 'color:#4cc9f0;font-weight:bold');
        }
        
        // Post-processing
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        
        // Bloom effect for sun and emissive objects
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        
        // Vignette shader
        const vignetteShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "offset": { value: 1.0 },
                "darkness": { value: 1.8 }
            },
            vertexShader: `varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader: `uniform float offset;
                uniform float darkness;
                varying vec2 vUv;
                uniform sampler2D tDiffuse;
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float dx = vUv.x - 0.5;
                    float dy = vUv.y - 0.5;
                    float dist = sqrt(dx*dx + dy*dy);
                    float fade = smoothstep(0.5, offset, dist);
                    gl_FragColor = vec4(color.rgb * (1.0 - fade * darkness), color.a);
                }`
        };
        this.vignettePass = new ShaderPass(vignetteShader);
        this.vignettePass.renderToScreen = true;
        this.composer.addPass(this.vignettePass);
        
        // Camera setup
        this.camera.position.set(0, 10, 20);
        
        // Lighting
        this.ambientLight = new THREE.AmbientLight(0x222222, 0.3);
        this.scene.add(this.ambientLight);
        
        // Resize handling
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Game loop
        this.clock = new Clock();
        this.isRunning = false;
        
        // Append renderer to DOM
        document.getElementById('app').appendChild(this.renderer.domElement);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.clock.start();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        this.clock.stop();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const delta = this.clock.getDelta();
        
        // Update scene (physics, animations, etc.) would go here
        // This will be called from the main game loop
        
        // Render
        this.composer.render();
        
        // Request next frame
        requestAnimationFrame(() => this.animate());
    }
    
    // Methods for other systems to interact with the scene
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
    
    getCamera() {
        return this.camera;
    }
    
    getScene() {
        return this.scene;
    }
}