// RapierWorld.js - Modernized Rapier physics integration for spacecraft & collision detection
import * as RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';

export class RapierWorld {
    constructor() {
        this.RAPIER = RAPIER;
        this.bodies = new Map(); // Maps three.js objects to Rapier rigid bodies
        this.colliders = new Map(); // Maps three.js objects to Rapier colliders
        this.world = null;
    }

    // Initialize the physics world. The WASM module is loaded automatically
    // via top-level await when this module is imported (see vite.config.js
    // wasm + top-level-await plugins), so no RAPIER.init() call is required.
    async init() {
        if (!this.world) {
            this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });
        }
        return this;
    }

    // Create a rigid body for a three.js object
    createRigidBody(threeObject, options = {}) {
        const { mass = 0, linearDamping = 0.1, angularDamping = 0.1 } = options;

        // Rigid body description: dynamic if mass > 0, otherwise fixed
        const rigidBodyDesc = mass > 0
            ? RAPIER.RigidBodyDesc.dynamic()
            : RAPIER.RigidBodyDesc.fixed();

        // Position and rotation initialization
        rigidBodyDesc
            .setTranslation(
                Number(threeObject.position.x),
                Number(threeObject.position.y),
                Number(threeObject.position.z)
            )
            .setRotation({
                x: Number(threeObject.quaternion.x),
                y: Number(threeObject.quaternion.y),
                z: Number(threeObject.quaternion.z),
                w: Number(threeObject.quaternion.w)
            })
            .setLinvel(0, 0, 0)
            .setAngvel(0, 0, 0)
            .setLinearDamping(linearDamping)
            .setAngularDamping(angularDamping);

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);

        // Set mass properties if applicable
        if (mass > 0) {
            rigidBody.setAdditionalMass(mass, true);
        }

        // Store reference
        this.bodies.set(threeObject, rigidBody);

        return rigidBody;
    }

    // Create a collider for a three.js object
    createCollider(threeObject, shape, options = {}) {
        const {
            density = 1,
            friction = 0.5,
            restitution = 0.3,
            sensor = false
        } = options;

        // Get the rigid body associated with this three.js object
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) {
            console.warn('No rigid body found for three.js object during collider creation');
            return null;
        }

        // Default offset and rotation if not defined
        const offset = shape.offset || { x: 0, y: 0, z: 0 };
        const rotation = shape.rotation || { x: 0, y: 0, z: 0, w: 1 };

        // Create collider description depending on shape type
        let colliderDesc;

        if (shape.type === 'sphere') {
            colliderDesc = RAPIER.ColliderDesc.ball(shape.radius);
        } else if (shape.type === 'cuboid') {
            colliderDesc = RAPIER.ColliderDesc.cuboid(
                shape.halfSize.x,
                shape.halfSize.y,
                shape.halfSize.z
            );
        } else if (shape.type === 'cone') {
            // Rapier 0.13.0 cone takes (halfHeight, radius)
            colliderDesc = RAPIER.ColliderDesc.cone(shape.height / 2, shape.radius);
        } else if (shape.type === 'cylinder') {
            // Rapier 0.13.0 cylinder takes (halfHeight, radius)
            colliderDesc = RAPIER.ColliderDesc.cylinder(shape.halfHeight, shape.radius);
        } else if (shape.type === 'capsule') {
            // Rapier 0.13.0 capsule takes (halfHeight, radius)
            const radius = shape.radius;
            const halfHeight = shape.halfHeight ?? Math.max(0, (shape.height ?? radius * 2) / 2 - radius);
            colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius);
        } else if (shape.type === 'convexHull') {
            // Float32Array containing flat coordinates [x0, y0, z0, x1, y1, z1, ...]
            let flatCoords;
            if (shape.points[0] instanceof THREE.Vector3 || (shape.points[0] && typeof shape.points[0].x === 'number')) {
                flatCoords = new Float32Array(shape.points.flatMap(p => [p.x, p.y, p.z]));
            } else {
                flatCoords = new Float32Array(shape.points);
            }
            colliderDesc = RAPIER.ColliderDesc.convexHull(flatCoords);
        }

        if (!colliderDesc) {
            console.warn(`RapierWorld.createCollider: unsupported shape type "${shape.type}"`);
            return null;
        }

        // Apply local translation and rotation
        colliderDesc
            .setTranslation(Number(offset.x), Number(offset.y), Number(offset.z))
            .setRotation({
                x: Number(rotation.x),
                y: Number(rotation.y),
                z: Number(rotation.z),
                w: Number(rotation.w)
            })
            .setDensity(density)
            .setFriction(friction)
            .setRestitution(restitution)
            .setSensor(sensor);

        const collider = this.world.createCollider(colliderDesc, rigidBody);

        // Store reference
        this.colliders.set(threeObject, collider);

        return collider;
    }

    // Update a rigid body's transform from three.js object
    updateRigidBodyFromThree(threeObject) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        rigidBody.setTranslation({
            x: Number(threeObject.position.x),
            y: Number(threeObject.position.y),
            z: Number(threeObject.position.z)
        }, true);

        rigidBody.setRotation({
            x: Number(threeObject.quaternion.x),
            y: Number(threeObject.quaternion.y),
            z: Number(threeObject.quaternion.z),
            w: Number(threeObject.quaternion.w)
        }, true);
    }

    // Update three.js object's transform from rigid body
    updateThreeFromRigidBody(threeObject) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        const translation = rigidBody.translation();
        const rotation = rigidBody.rotation();

        threeObject.position.set(translation.x, translation.y, translation.z);
        threeObject.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }

    // Apply a force to a rigid body
    applyForce(threeObject, force) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        rigidBody.addForce({
            x: Number(force.x),
            y: Number(force.y),
            z: Number(force.z)
        }, true);
    }

    // Apply an impulse to a rigid body
    applyImpulse(threeObject, impulse) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        rigidBody.applyImpulse({
            x: Number(impulse.x),
            y: Number(impulse.y),
            z: Number(impulse.z)
        }, true);
    }

    // Set linear velocity
    setLinearVelocity(threeObject, velocity) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        rigidBody.setLinvel({
            x: Number(velocity.x),
            y: Number(velocity.y),
            z: Number(velocity.z)
        }, true);
    }

    // Get linear velocity
    getLinearVelocity(threeObject) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return new THREE.Vector3(0, 0, 0);

        const velocity = rigidBody.linvel();
        return new THREE.Vector3(velocity.x, velocity.y, velocity.z);
    }

    // Step the physics simulation
    step(deltaTime) {
        if (!this.world) return;
        this.world.step();

        // Update all three.js objects from their physics bodies
        for (const [threeObject, rigidBody] of this.bodies.entries()) {
            this.updateThreeFromRigidBody(threeObject);
        }
    }

    // Clean up all resources
    dispose() {
        if (!this.world) return;

        // Destroy all colliders
        for (const collider of this.colliders.values()) {
            try {
                this.world.removeCollider(collider, false);
            } catch (e) {
                // Ignore error if already removed
            }
        }
        this.colliders.clear();

        this.world = null;
    }
}
        }
        this.bodies.clear();

        this.world = null;
    }
}

// Helper function to create collision shapes from three.js geometry
export function createColliderShapeFromGeometry(geometry) {
    if (geometry.isSphereGeometry) {
        return {
            type: 'sphere',
            radius: geometry.parameters.radius,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(0, 0, 0, 1)
        };
    } else if (geometry.isBoxGeometry) {
        return {
            type: 'cuboid',
            halfSize: new THREE.Vector3(
                geometry.parameters.width / 2,
                geometry.parameters.height / 2,
                geometry.parameters.depth / 2
            ),
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(0, 0, 0, 1)
        };
    } else if (geometry.isCylinderGeometry) {
        return {
            type: 'cylinder',
            radius: geometry.parameters.radiusTop,
            halfHeight: geometry.parameters.height / 2,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(0, 0, 0, 1)
        };
    } else if (geometry.isConeGeometry) {
        return {
            type: 'cone',
            radius: geometry.parameters.radius,
            height: geometry.parameters.height,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(0, 0, 0, 1)
        };
    } else {
        const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
        const size = box.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.y, size.z) / 2;

        return {
            type: 'sphere',
            radius: radius,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(0, 0, 0, 1)
        };
    }
}