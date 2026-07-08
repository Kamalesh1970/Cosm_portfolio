# Solar System Explorer - Interactive 3D Portfolio

An interactive 3D web portfolio that doubles as a personal portfolio. The user spawns in a spacecraft at the edge of a realistic, physically-simulated solar system (Sun + 8 planets, orbiting under real Newtonian gravity, plus an asteroid belt). The user pilots the ship in full 3D (pitch/yaw/roll) using keyboard controls, flying between planets. Each planet represents a portfolio section (About, Projects, Skills, Experience, Education, Contact, Achievements, Blog — 8 planets + Sun for a Hero/Intro).

## Features

- Realistic 3D solar system with physically accurate orbital mechanics
- Full 3D spacecraft flight controls (pitch/yaw/roll)
- Cinematic planet arrival sequences with GSAP animations
- HTML content panels for portfolio sections
- Asteroid belt with physical collisions using Rapier physics
- Bloom post-processing and vignette effects
- Responsive design with mobile fallback
- Loading screen with progress indicator
- Developer debug panel with Tweakpane

## Technology Stack

- **3D Engine**: Three.js (r16x+)
- **Physics**: @dimforge/rapier3d (WASM-based)
- **Build Tool**: Vite
- **Post-processing**: Three.js EffectComposer with UnrealBloomPass
- **Audio**: Howler.js
- **Styling**: Stylus (CSS preprocessor)
- **Debugging**: Tweakpane

## File Structure

```
solar-system-explorer/
├── index.html
├── package.json
├── vite.config.js
├── scripts/
│   └── compress.js
├── public/
│   ├── textures/
│   ├── models/
│   └── audio/
├── src/
│   ├── main.js
│   ├── core/
│   │   ├── SceneManager.js
│   │   ├── Clock.js
│   │   ├── Loader.js
│   │   └── InputManager.js
│   ├── physics/
│   │   ├── GravityEngine.js
│   │   ├── RapierWorld.js
│   │   └── constants.js
│   ├── world/
│   │   ├── Sun.js
│   │   ├── Planet.js
│   │   ├── PlanetData.js
│   │   ├── Starfield.js
│   │   ├── AsteroidBelt.js
│   │   └── SaturnRings.js
│   ├── ship/
│   │   ├── Spacecraft.js
│   │   ├── FlightController.js
│   │   └── ChaseCamera.js
│   ├── interaction/
│   │   ├── ProximityDetector.js
│   │   ├── ArrivalSequence.js
│   │   └── CameraRig.js
│   ├── ui/
│   │   ├── LoadingScreen.js
│   │   ├── HUD.js
│   │   ├── ContentPanel.js
│   │   └── styles.styl
│   ├── audio/
│   │   └── AudioManager.js
│   └── debug/
│       └── DebugPanel.js
└── README.md
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/solar-system-explorer.git
   cd solar-system-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview the production build**
   ```bash
   npm run preview
   ```

## Usage

- **Controls**:
  - Arrow keys / WASD: Movement
  - Q/E: Roll left/right
  - Shift: Boost thrust
  - Space: Brake
  - R: Reset position
  
- **Navigation**:
  - Fly near a planet to trigger the arrival sequence
  - The camera will detach and perform a cinematic fly-around
  - Content panel will fade in with the planet's portfolio section
  - Click "Return to Ship" to exit the sequence

- **Debugging**:
  - Press F12 to open browser dev tools
  - The debug panel is available in development mode
  - Use Tweakpane to adjust physics and rendering parameters

## Project Structure

### Core Systems
- **SceneManager**: Manages Three.js scene, renderer, and animation loop
- **Clock**: Fixed-timestep game loop for consistent physics
- **Loader**: Asset loading with progress tracking
- **InputManager**: Keyboard input tracking for continuous movement

### Physics Systems
- **GravityEngine**: Custom Newtonian N-body gravity simulation
- **RapierWorld**: Physics engine for ship-asteroid collisions
- **Constants**: Physical constants and tuning values

### World Objects
- **Sun**: Emissive mesh with bloom effect
- **Planet**: Reusable planet class with textures, rotation, and orbit
- **Starfield**: Procedural starfield using Points
- **AsteroidBelt**: Instanced rendering with Rapier physics
- **SaturnRings**: Special ring system for Saturn

### Ship Systems
- **Spacecraft**: 3D model with physics properties
- **FlightController**: Full 3D flight controls with quaternion orientation
- **ChaseCamera**: Smooth third-person camera following the ship

### Interaction Systems
- **ProximityDetector**: Detects when spacecraft is near planets
- **ArrivalSequence**: Cinematic camera fly-around using GSAP
- **CameraRig**: Manages different camera modes (chase, cinematic, etc.)

### UI Components
- **LoadingScreen**: Progress bar while loading assets
- **HUD**: Minimal heads-up display showing speed and controls
- **ContentPanel**: Glassmorphism-style HTML overlay for portfolio content
- **DebugPanel**: Development tools for tuning physics and rendering

## Portfolio Content

Each planet represents a section of your portfolio. The content is defined in `PlanetData.js`. To add your own content:

1. Edit `PlanetData.js` and add your content for each planet
2. Replace the placeholder images in `/public/textures/` with your own
3. Replace the spacecraft model in `/public/models/spacecraft.glb` with your own

## Performance

- Target 60 FPS on mid-range laptops
- Uses InstancedMesh for asteroid belt rendering
- Frustum culling is enabled by default
- Texture compression is handled by the `compress.js` script

## License

MIT License# Cosm_portfolio
