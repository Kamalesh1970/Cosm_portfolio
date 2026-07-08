// Loader.js - Asset loading system with progress tracking
import { LoadingManager, TextureLoader, AudioLoader, DataTexture, RGBAFormat } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Howl } from 'howler';

export class Loader {
    constructor() {
        this.manager = new LoadingManager();
        this.textureLoader = new TextureLoader(this.manager);
        this.gltfLoader = new GLTFLoader(this.manager);
        this.audioLoader = new AudioLoader(this.manager);
        
        this.items = {
            textures: {},
            models: {},
            audio: {}
        };
        
        this.totalItems = 0;
        this.loadedItems = 0;
        this.onProgressCallback = null;
        this.onLoadCallback = null;
        
        // Setup manager callbacks
        this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
            this.totalItems = itemsTotal;
            if (this.onProgressCallback) this.onProgressCallback(0, itemsTotal);
        };
        
        this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadedItems = itemsLoaded;
            if (this.onProgressCallback) {
                const progress = itemsLoaded / itemsTotal;
                this.onProgressCallback(progress, itemsTotal);
            }
        };
        
        this.manager.onLoad = () => {
            if (this.onLoadCallback) this.onLoadCallback(this.items);
        };
        
        this.manager.onError = (url) => {
            console.warn(`Failed to load: ${url}`);
            // We don't reject here because we want the loading manager to continue
        };
    }
    
    loadTexture(url, name) {
        return new Promise((resolve) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    this.items.textures[name] = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.warn(`Loader: Creating fallback texture for ${name} (${url})`);
                    // Create a 2x2 purple/black checkerboard fallback texture
                    const size = 2;
                    const data = new Uint8Array(size * size * 4);
                    for (let i = 0; i < size * size; i++) {
                        const stride = i * 4;
                        const isPurple = (i % 2 === 0) ^ (Math.floor(i / size) % 2 === 0);
                        data[stride] = isPurple ? 255 : 0;     // R
                        data[stride + 1] = 0;                  // G
                        data[stride + 2] = isPurple ? 255 : 0; // B
                        data[stride + 3] = 255;                // A
                    }
                    const fallbackTexture = new DataTexture(data, size, size, RGBAFormat);
                    fallbackTexture.needsUpdate = true;
                    this.items.textures[name] = fallbackTexture;
                    resolve(fallbackTexture);
                }
            );
        });
    }
    
    loadGLTF(url, name) {
        return new Promise((resolve) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    this.items.models[name] = gltf;
                    resolve(gltf);
                },
                undefined,
                (error) => {
                    console.warn(`Loader: GLTF load failed for ${name} (${url})`);
                    resolve(null);
                }
            );
        });
    }
    
    loadAudio(url, name) {
        return new Promise((resolve) => {
            this.audioLoader.load(
                url,
                (audioBuffer) => {
                    // Create Howler.js sound from the audio buffer
                    const sound = new Howl({
                        src: [url],
                        html5: true
                    });
                    this.items.audio[name] = sound;
                    resolve(sound);
                },
                undefined,
                (error) => {
                    console.warn(`Loader: Audio load failed for ${name} (${url})`);
                    resolve(null);
                }
            );
        });
    }
    
    onProgress(callback) {
        this.onProgressCallback = callback;
    }
    
    onLoad(callback) {
        this.onLoadCallback = callback;
    }
    
    dispose() {
        // Dispose textures
        for (const texture of Object.values(this.items.textures)) {
            if (texture && texture.dispose) texture.dispose();
        }
        
        // Dispose models
        for (const model of Object.values(this.items.models)) {
            if (model && model.scene) {
                model.scene.traverse((child) => {
                    if (child.isMesh) {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });
            }
        }
        
        // Dispose audio
        for (const sound of Object.values(this.items.audio)) {
            if (sound && sound.unload) sound.unload();
        }
        
        // Clear items
        this.items = { textures: {}, models: {}, audio: {} };
    }
}