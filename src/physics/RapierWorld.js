// RapierWorld.js - Rapier physics world for ship and asteroid collisions
import * as RAPIER from '@dimforge/rapier3d';
import * as THREE from 'three';
import { SHIP, ASTEROID_BELT } from '../physics/constants.js';

console.log("RAPIER =", RAPIER);
console.log("RAPIER.init =", RAPIER.init);
console.log("RAPIER.World =", RAPIER.World);

export class RapierWorld {
    constructor() {
        this.RAPIER = RAPIER;
        // Store references to rigid bodies and colliders
        this.bodies = new Map(); // Maps three.js objects to Rapier rigid bodies
        this.colliders = new Map(); // Maps three.js objects to Rapier colliders
        this.world = null;

        // Contact event handling
        this.contactEventHandler = this.handleContact.bind(this);
    }

    // Initialize the physics world
    async init() {
        // Rapier is already initialized in this version.
        this.world = new RAPIER.World(
            new RAPIER.Vector3(0, 0, 0)
        );

        // We'll disable Rapier's gravity since we handle orbital gravity separately
        this.world.gravity = new RAPIER.Vector3(0, 0, 0);

        // Set up event listeners for collisions
        // Note: Rapier uses callbacks or event queues, depending on version
        // This is a simplified approach - actual implementation may vary based on Rapier version
    }

    // Create a rigid body for a three.js object
    createRigidBody(threeObject, options = {}) {
        const { mass = 0, linearDamping = 0.1, angularDamping = 0.1 } = options;

        // Rigid body description
        const rigidBodyDesc = mass > 0
            ? RAPIER.RigidBodyDesc.dynamic()
            : RAPIER.RigidBodyDesc.fixed();

        rigidBodyDesc
            .setTranslation(
                threeObject.position.x,
                threeObject.position.y,
                threeObject.position.z
            )
            .setRotation(
                threeObject.quaternion.x,
                threeObject.quaternion.y,
                threeObject.quaternion.z,
                threeObject.quaternion.w
            )
            .setLinvel(0, 0, 0)
            .setAngvel(0, 0, 0)
            .setLinvelDamping(linearDamping)
            .setAngvelDamping(angularDamping);

        if (mass > 0) {
            rigidBodyDesc.setMass(mass);
        }

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);

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
            console.warn('No rigid body found for three.js object');
            return null;
        }

        // Create collider based on shape type
        let colliderDesc;

        if (shape.type === 'sphere') {
            colliderDesc = RAPIER.ColliderDesc.ball(shape.radius)
                .setTranslation(shape.offset.x, shape.offset.y, shape.offset.z)
                .setRotation(shape.rotation.x, shape.rotation.y, shape.rotation.z, shape.rotation.w);
        } else if (shape.type === 'cuboid') {
            colliderDesc = RAPIER.ColliderDesc.cuboid(
                shape.halfSize.x,
                shape.halfSize.y,
                shape.halfSize.z
            )
                .setTranslation(shape.offset.x, shape.offset.y, shape.offset.z)
                .setRotation(shape.rotation.x, shape.rotation.y, shape.rotation.z, shape.rotation.w);
        } else if (shape.type === 'cone') {
            colliderDesc = RAPIER.ColliderDesc.cone(shape.radius, shape.height)
                .setTranslation(shape.offset.x, shape.offset.y, shape.offset.z)
                .setRotation(shape.rotation.x, shape.rotation.y, shape.rotation.z, shape.rotation.w);
        } else if (shape.type === 'cylinder') {
            colliderDesc = RAPIER.ColliderDesc.cylinder(shape.radius, shape.halfHeight)
                .setTranslation(shape.offset.x, shape.offset.y, shape.offset.z)
                .setRotation(shape.rotation.x, shape.rotation.y, shape.rotation.z, shape.rotation.w);
        } else if (shape.type === 'convexHull') {
            // For complex shapes like spacecraft
            const points = shape.points.map(p =>
                new RAPIER.Vector3(p.x, p.y, p.z)
            );
            colliderDesc = RAPIER.ColliderDesc.convexHull(points)
                .setTranslation(shape.offset.x, shape.offset.y, shape.offset.z)
                .setRotation(shape.rotation.x, shape.rotation.y, shape.rotation.z, shape.rotation.w);
        }

        // Set material properties
        colliderDesc
            .setDensity(density)
            .setFriction(friction)
            .setRestitution(restitution);

        if (sensor) {
            colliderDesc.setSensor(true);
        }

        const collider = this.world.createCollider(colliderDesc, rigidBody);

        // Store reference
        this.colliders.set(threeObject, collider);

        return collider;
    }

    // Update a rigid body's transform from three.js object
    updateRigidBodyFromThree(threeObject) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        rigidBody.setTranslation(
            threeObject.position.x,
            threeObject.position.y,
            threeObject.position.z,
            true // wake up
        );

        rigidBody.setRotation(
            threeObject.quaternion.x,
            threeObject.quaternion.y,
            threeObject.quaternion.z,
            threeObject.quaternion.w,
            true // wake up
        );
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

        const point = new RAPIER.Vector3(0, 0, 0); // Apply at center of mass
        rigidBody.addForce(force, true); // true = wake up
    }

    // Apply an impulse to a rigid body
    applyImpulse(threeObject, impulse) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        const point = new RAPIER.Vector3(0, 0, 0); // Apply at center of mass
        rigidBody.applyImpulse(impulse, true); // true = wake up
    }

    // Set linear velocity
    setLinearVelocity(threeObject, velocity) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return;

        rigidBody.setLinvel(velocity, true); // true = wake up
    }

    // Get linear velocity
    getLinearVelocity(threeObject) {
        const rigidBody = this.bodies.get(threeObject);
        if (!rigidBody) return new RAPIER.Vector3(0, 0, 0);

        return rigidBody.linvel();
    }

    // Handle collision events
    handleContact(pair) {
        // Get the colliders involved in the collision
        const collider1 = pair.collider1();
        const collider2 = pair.collider2();

        // Get the user data (references to our three.js objects)
        const userData1 = collider1.userData();
        const userData2 = collider2.userData();

        // Handle collision logic here
        // This would typically involve playing sounds, applying damage, etc.
        // For now, we'll just log it
        // console.log('Collision detected between:', userData1, userData2);
    }

    // Step the physics simulation
    step(deltaTime) {
        this.world.step();

        // Update all three.js objects from their physics bodies
        for (const [threeObject, rigidBody] of this.bodies.entries()) {
            this.updateThreeFromRigidBody(threeObject);
        }
    }

    // Clean up
    dispose() {
        // Destroy all colliders
        for (const collider of this.colliders.values()) {
            this.world.removeCollider(collider);
        }
        this.colliders.clear();

        // Destroy all rigid bodies
        for (const rigidBody of this.bodies.values()) {
            this.world.removeRigidBody(rigidBody);
        }
        this.bodies.clear();

        // Dispose the world
        // Note: Rapier's World doesn't have a explicit dispose method in some versions
        // The memory will be reclaimed when the reference is lost
    }
}

// Helper function to create collision shapes from three.js geometry
export function createColliderShapeFromGeometry(geometry) {
    // Simplified shape creation - in practice you might want to use 
    // more sophisticated methods like convex hull decomposition

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
        // For complex geometries, approximate with a sphere or box
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