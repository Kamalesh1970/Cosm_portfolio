// constants.js - Physics constants and tuning values
export const G = 6.67430e-11; // Gravitational constant (real value)
export const SUN_MASS = 1.989e30; // kg
export const AU = 1.496e11; // Astronomical Unit in meters

// Scaled values for better visual experience (these would be tuned in dev)
export const SCALE = 1e-9; // Scale down the universe for visual clarity
export const SCALE_FACTOR = 1e-9; // Alternative scale factor

// Scaled masses (adjusted for visual appeal)
export const SUN_MASS_SCALED = SUN_MASS * SCALE_FACTOR;
export const MERCURY_MASS = 3.3011e23 * SCALE_FACTOR;
export const VENUS_MASS = 4.8675e24 * SCALE_FACTOR;
export const EARTH_MASS = 5.972e24 * SCALE_FACTOR;
export const MARS_MASS = 6.4171e23 * SCALE_FACTOR;
export const JUPITER_MASS = 1.898e27 * SCALE_FACTOR;
export const SATURN_MASS = 5.6834e26 * SCALE_FACTOR;
export const URANUS_MASS = 8.6810e25 * SCALE_FACTOR;
export const NEPTUNE_MASS = 1.02413e26 * SCALE_FACTOR;

// Orbit radii (in AU, then scaled)
export const ORBIT_RADII = {
    mercury: 0.387 * AU * SCALE_FACTOR,
    venus: 0.723 * AU * SCALE_FACTOR,
    earth: 1.0 * AU * SCALE_FACTOR,
    mars: 1.524 * AU * SCALE_FACTOR,
    jupiter: 5.203 * AU * SCALE_FACTOR,
    saturn: 9.537 * AU * SCALE_FACTOR,
    uranus: 19.191 * AU * SCALE_FACTOR,
    neptune: 30.069 * AU * SCALE_FACTOR
};

// Orbital velocities (calculated for circular orbits: v = sqrt(G*M/r))
export const ORBIT_SPEEDS = {
    mercury: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.mercury),
    venus: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.venus),
    earth: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.earth),
    mars: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.mars),
    jupiter: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.jupiter),
    saturn: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.saturn),
    uranus: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.uranus),
    neptune: Math.sqrt(G * SUN_MASS_SCALED / ORBIT_RADII.neptune)
};

// Planet radii (scaled for visibility)
export const PLANET_RADII = {
    mercury: 2439.7e3 * SCALE_FACTOR * 100, // Scaled up for visibility
    venus: 6051.8e3 * SCALE_FACTOR * 100,
    earth: 6371.0e3 * SCALE_FACTOR * 100,
    mars: 3389.5e3 * SCALE_FACTOR * 100,
    jupiter: 69911e3 * SCALE_FACTOR * 100,
    saturn: 58232e3 * SCALE_FACTOR * 100,
    uranus: 25362e3 * SCALE_FACTOR * 100,
    neptune: 24622e3 * SCALE_FACTOR * 100
};

// Asteroid belt properties
export const ASTEROID_BELT = {
    innerRadius: 2.2 * AU * SCALE_FACTOR,
    outerRadius: 3.2 * AU * SCALE_FACTOR,
    count: 150, // Number of asteroids
    massRange: [1e12 * SCALE_FACTOR, 1e18 * SCALE_FACTOR], // Mass range for asteroids
    sizeRange: [50, 500] // Size range in scaled units
};

// Physics settings
export const PHYSICS = {
    fixedTimeStep: 1/60, // 60 FPS physics
    velocityIterations: 10,
    positionIterations: 10,
    minDistanceSq: 1e10 // Minimum distance squared to prevent infinite force
};

// Ship properties
export const SHIP = {
    mass: 1000 * SCALE_FACTOR, // kg
    thrustForce: 5000 * SCALE_FACTOR, // N
    boostMultiplier: 3.0,
    drag: 0.985, // Per frame drag
    maxSpeed: 1000 * SCALE_FACTOR // m/s
};

// Audio settings
export const AUDIO = {
    engineVolume: 0.3,
    ambientVolume: 0.2,
    chimeVolume: 0.5
};