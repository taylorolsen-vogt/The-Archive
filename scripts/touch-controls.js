// scripts/touch-controls.js
// Minimal, predictable mobile-first camera controls:
// - 1 finger drag: orbit around target (yaw/pitch)
// - 2 finger pinch: zoom (radius)
//
// Works with Three.js camera and a target (THREE.Vector3).
// No dependencies on OrbitControls.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
}

function getTouches(e) {
    // Support Pointer Events (preferred) AND Touch Events fallback.
    if (e.touches) return Array.from(e.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    // PointerEvents: we track pointers ourselves (handled in closure below).
    return null;
}

export function attachTouchControls({
    canvas,
    camera,
    target,
    initialRadius = null,      // if null, computed from current camera position
    minRadius = 1.5,
    maxRadius = 60.0,
    rotateSpeed = 0.005,       // radians per pixel
    zoomSpeed = 0.005,         // scale factor per pixel of pinch delta
    minPolar = 0.15,           // radians; prevents flipping over poles
    maxPolar = Math.PI - 0.15, // radians
    onChange = null            // callback when camera updated (e.g., requestRender)
}) {
    if (!canvas || !camera || !target) {
        throw new Error("attachTouchControls: canvas, camera, and target are required.");
    }

    // Compute initial spherical coords from camera→target.
    const offset = new THREE.Vector3().subVectors(camera.position, target);
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(offset);

    if (initialRadius != null) spherical.radius = initialRadius;

    spherical.radius = clamp(spherical.radius, minRadius, maxRadius);
    spherical.phi = clamp(spherical.phi, minPolar, maxPolar);

    // Internal pointer tracking (Pointer Events path).
    const active = new Map(); // pointerId -> {x,y}
    let mode = "none";        // "orbit" | "pinch"
    let lastOrbit = null;     // {x,y}
    let lastPinch = null;     // {dist, centerX, centerY}

    function applyCameraFromSpherical() {
        // Convert spherical back to camera position around target.
        const newOffset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(target).add(newOffset);
        camera.lookAt(target);
        if (onChange) onChange();
    }

    function beginOrbit(x, y) {
        mode = "orbit";
        lastOrbit = { x, y };
    }

    function orbitTo(x, y) {
        const dx = x - lastOrbit.x;
        const dy = y - lastOrbit.y;
        lastOrbit = { x, y };

        // Yaw (theta) around vertical axis, Pitch (phi) up/down.
        spherical.theta -= dx * rotateSpeed;
        spherical.phi = clamp(spherical.phi - dy * rotateSpeed, minPolar, maxPolar);

        applyCameraFromSpherical();
    }

    function pinchStateFromTwoPoints(p0, p1) {
        const cx = (p0.x + p1.x) * 0.5;
        const cy = (p0.y + p1.y) * 0.5;
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const dist = Math.hypot(dx, dy);
        return { dist, cx, cy };
    }

    function beginPinch(p0, p1) {
        mode = "pinch";
        lastPinch = pinchStateFromTwoPoints(p0, p1);
    }

    function pinchTo(p0, p1) {
        const now = pinchStateFromTwoPoints(p0, p1);
        const dd = now.dist - lastPinch.dist;
        lastPinch = now;

        // Zoom: decrease radius when fingers move apart (dd > 0)
        const scale = 1.0 - dd * zoomSpeed;
        spherical.radius = clamp(spherical.radius * scale, minRadius, maxRadius);

        applyCameraFromSpherical();
    }

    // -------- Pointer Events (best for modern iOS/Android) --------
    function onPointerDown(e) {
        // Only accept primary touches/pen. Ignore right click mouse, etc.
        if (e.pointerType === "mouse") return;

        canvas.setPointerCapture(e.pointerId);
        active.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // Prevent page scroll/zoom.
        e.preventDefault();

        if (active.size === 1) {
            const p = active.values().next().value;
            beginOrbit(p.x, p.y);
        } else if (active.size === 2) {
            const pts = Array.from(active.values());
            beginPinch(pts[0], pts[1]);
        } else {
            mode = "none";
        }
    }

    function onPointerMove(e) {
        if (!active.has(e.pointerId)) return;
        if (e.pointerType === "mouse") return;

        active.set(e.pointerId, { x: e.clientX, y: e.clientY });
        e.preventDefault();

        if (active.size === 1 && mode === "orbit") {
            const p = active.values().next().value;
            orbitTo(p.x, p.y);
        } else if (active.size === 2) {
            const pts = Array.from(active.values());
            pinchTo(pts[0], pts[1]);
        }
    }

    function onPointerUp(e) {
        if (e.pointerType === "mouse") return;

        active.delete(e.pointerId);
        e.preventDefault();

        if (active.size === 1) {
            const p = active.values().next().value;
            beginOrbit(p.x, p.y);
        } else {
            mode = "none";
            lastOrbit = null;
            lastPinch = null;
        }
    }

    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    canvas.addEventListener("pointermove", onPointerMove, { passive: false });
    canvas.addEventListener("pointerup", onPointerUp, { passive: false });
    canvas.addEventListener("pointercancel", onPointerUp, { passive: false });

    // Safety: if browser sends a gesture event, prevent it.
    canvas.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("gesturechange", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("gestureend", e => e.preventDefault(), { passive: false });

    // Initial apply to normalize.
    applyCameraFromSpherical();

    // Provide a detach function (good hygiene).
    return function detach() {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
    };
}
