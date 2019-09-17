/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.controls;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;

/**

 @author laht
 */
public class OrbitControls {

    private final Camera camera;

    public Vector3d target;

    public double minDistance, maxDistance; //perspective
    public double minZoom, maxZoom; //ortho

    private double minPolarAngle, maxPolarAngle;
    private double minAzimuthAngle, maxAzimuthAngle;

    public double dampingFactor;
    public double rotateSpeed;
    public double zoomSpeed;
    public double keyPanSpeed;
    public double autoRotateSpeed;

    public boolean enabled;
    public boolean autoRotate;
    public boolean enableDamping;
    public boolean enableRotate;
    public boolean enableZoom;
    public boolean enablePan;

    public OrbitControls(Camera camera) {
        this.camera = camera;

        this.target = new Vector3d();

        this.enabled = true;

        // How far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Double.POSITIVE_INFINITY;

        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Double.POSITIVE_INFINITY;

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0.0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = Double.NEGATIVE_INFINITY; // radians
        this.maxAzimuthAngle = Double.POSITIVE_INFINITY; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;

        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 1.0;

        // Set to false to disable panning
        this.enablePan = true;
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    }

    public void update() {
        
        Vector3d offset = new Vector3d();
        Quaterniond quat = new Quaterniond().setFromUnitVectors(camera.up, new Vector3d(0, 1, 0));

        Quaterniond quatInverse = quat.copy().inverse();

        Vector3d position = camera.position;

        offset.copy(position).sub(target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (autoRotate && state == State.NONE) {

            rotateLeft(getAutoRotationAngle());

        }

        spherical.theta.add(sphericalDelta.theta);
        spherical.phi.add(sphericalDelta.phi);

        // restrict theta to be between desired limits
        spherical.theta.set(Math.max(minAzimuthAngle, Math.min(maxAzimuthAngle, spherical.theta.inRadians())), Angle.Representation.RAD);

        // restrict phi to be between desired limits
        spherical.phi.set(Math.max(minPolarAngle, Math.min(maxPolarAngle, spherical.phi.inRadians())), Angle.Representation.RAD);

        spherical.makeSafe();

        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(minDistance, Math.min(maxDistance, spherical.radius));

        // move target to panned location
        target.add(panOffset);

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(target).add(offset);

        camera.lookAt(target);

        if (enableDamping) {

            sphericalDelta.theta.scale(1 - dampingFactor);
            sphericalDelta.phi.scale(1 - dampingFactor);

        }
        else {

            sphericalDelta.set(0, new Angle(), new Angle());

        }

        scale = 1;
        panOffset.set(0, 0, 0);

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        if (zoomChanged
            || lastPosition.distanceToSquared(camera.position) > EPS
            || 8 * (1 - lastQuaternion.dot(camera.quaternion)) > EPS) {

//            dispatchEvent(changeEvent);
            lastPosition.copy(camera.position);
            lastQuaternion.copy(camera.quaternion);
            zoomChanged = false;

        }

    }

    private enum State {
        NONE, ROTATE, DOLLY, PAN
    }

    private State state = State.NONE;

    private double EPS = 0.000001;

    // current position in spherical coordinates
    Spherical spherical = new Spherical();
    Spherical sphericalDelta = new Spherical();

    private final Vector3d lastPosition = new Vector3d();
    private final Quaterniond lastQuaternion = new Quaterniond();

    double scale = 1;
    Vector3d panOffset = new Vector3d();
    boolean zoomChanged = false;

    Vector2d rotateStart = new Vector2d();
    Vector2d rotateEnd = new Vector2d();
    Vector2d rotateDelta = new Vector2d();

    Vector2d panStart = new Vector2d();
    Vector2d panEnd = new Vector2d();
    Vector2d panDelta = new Vector2d();

    Vector2d dollyStart = new Vector2d();
    Vector2d dollyEnd = new Vector2d();
    Vector2d dollyDelta = new Vector2d();

    private Angle getAutoRotationAngle() {
        return new Angle(2 * Math.PI / 60 / 60 * autoRotateSpeed, Angle.Representation.RAD);
    }

    private double getZoomScale() {
        return Math.pow(0.95, zoomSpeed);
    }

    private void rotateLeft(Angle angle) {
        sphericalDelta.theta.sub(angle);
    }

    private void rotateUp(Angle angle) {
        sphericalDelta.phi.sub(angle);
    }

    private void panLeft(double distance, Matrix4d objectMatrix) {

        Vector3d v = new Vector3d();
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiply(-distance);

        panOffset.add(v);

    }

    private void panUp(double deltaX, double deltaY) {
        Vector3d offset = new Vector3d();

        if (camera instanceof PerspectiveCamera) {
            // perspective
            Vector3d position = camera.position;
            offset.copy(position).sub(target);
            double targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((((PerspectiveCamera) camera).fov / 2) * Math.PI / 180.0);

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
//            panLeft(2 * deltaX * targetDistance / element.clientHeight, camera.matrix);
//            panUp(2 * deltaY * targetDistance / element.clientHeight, camera.matrix);
        }
        else if (camera instanceof OrthographicCamera) {

            // orthographic
            OrthographicCamera cam = (OrthographicCamera) camera;
//            panLeft(deltaX * (cam.right - cam.left) / cam.zoom / element.clientWidth, cam.matrix);
//            panUp(deltaY * (cam.top - cam.bottom) / cam.zoom / element.clientHeight, cam.matrix);

        }

    }

}
