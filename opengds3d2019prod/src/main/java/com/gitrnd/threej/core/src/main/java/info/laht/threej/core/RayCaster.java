/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.Camera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.OrthographicCamera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.PerspectiveCamera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Ray;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**

 @author laht
 */
public class RayCaster implements Serializable {

    private final static Logger LOG = LoggerFactory.getLogger(RayCaster.class);

    public double near, far;

    public Ray ray;
    public Params params;

    public double linePrecision = 1;

    public RayCaster(Vector3d origin, Vector3d direction, double near, double far) {
        this.near = near;
        this.far = far;

        this.ray = new Ray(origin, direction);
        this.params = new Params();
    }

    public void set(Vector3d origin, Vector3d direction) {
        this.ray.set(origin, direction);
    }

    public void setFromCamera(Vector2d coords, Camera camera) {

        if (camera instanceof PerspectiveCamera) {
            ray.origin.setFromMatrixPosition(((PerspectiveCamera) camera).matrixWorld);
            ray.direction.set(coords.x(), coords.y(), 0.5).unproject(camera).sub(ray.origin).normalize();
        }
        else if (camera instanceof OrthographicCamera) {
            OrthographicCamera cam = (OrthographicCamera) camera;
            ray.origin.set(coords.x(), coords.y(), (cam.near + cam.far) / (cam.near - cam.far)).unproject(camera); // set origin in plane of camera
            this.ray.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
        }
        else {
            LOG.error("Raycaster: Unsupported camera type.");
        }

    }

    public void intersectObject(Object3D object, RayCaster rayCaster, List<RayCastHit> intersects, boolean recursive) {
        if (!object.visible) {
            return;
        }
        object.raycast(rayCaster, intersects);

        if (recursive) {
            for (Object3D child : object.children) {
                intersectObject(child, rayCaster, intersects, recursive);
            }
        }
    }

    public List<RayCastHit> intersectObject(Object3D object, boolean recursive) {

        List<RayCastHit> intersects = new ArrayList<>();
        intersectObject(object, this, intersects, recursive);
        intersects.sort((RayCastHit o1, RayCastHit o2) -> (int) (o1.distance - o2.distance));
        return intersects;

    }

    public List<RayCastHit> intersectObjects(Object3D object, boolean recursive) {
        List<RayCastHit> intersects = new ArrayList<>();

        return intersects;
    }

    public static class Params {

        public Map<String, Object> mesh = new HashMap<>();
        public Map<String, Object> line = new HashMap<>();
        public Map<String, Object> LOD = new HashMap<>();
        public Map<String, Object> points = new HashMap<>();
        public  Map<String, Object> sprite = new HashMap<>();

        public Params() {
            points.put("threshold", 1);
        }

    }

}
