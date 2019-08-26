/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.objects;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.LineBasicMaterial;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.Material;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.util.*;
import org.apache.commons.lang3.tuple.*;

/**

 @author laht
 */
public class Line extends Object3D {

    public BufferGeometry geometry;
    public Material material;
    
    public String type = "Line";

    public Line() {
        this(new BufferGeometry(), new LineBasicMaterial(
             new ImmutablePair<>("color", new Color().random().multiply(new Color().set("#ffffff"))))
        );
    }

    public Line(BufferGeometry geometry, Material material) {
        this.geometry = geometry;
        this.material = material;
    }
    
    public IGeometry getGeometry() {
        return geometry;
    }

    @Override
    public void raycast(RayCaster raycaster, List<RayCastHit> intersects) {

        Matrix4d inverseMatrix = new Matrix4d();
        Ray ray = new Ray();
        Sphere sphere = new Sphere();

        double precision = raycaster.linePrecision;
        double precisionSq = precision * precision;

        if (geometry.boundingSphere == null) {
            geometry.computeBoundingSphere();
        }

        sphere.copy(geometry.boundingSphere);
        sphere.applyMatrix4(matrixWorld);

        if (!raycaster.ray.intersectsSphere(sphere)) {
            return;
        }

        inverseMatrix.getInverse(matrixWorld);
        ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

        Vector3d vStart = new Vector3d();
        Vector3d vEnd = new Vector3d();
        Vector3d interSegment = new Vector3d();
        Vector3d interRay = new Vector3d();
        int step = (this instanceof LineSegments) ? 2 : 1;

        BufferAttribute index = geometry.index;
        Map<String, BufferAttribute> attributes = geometry.attributes;
        List<Number> positions = attributes.get("position").array;

        if (index != null) {

            List<Number> indices = index.array;

            for (int i = 0, l = indices.size() - 1; i < l; i += step) {

                int a = indices.get(i).intValue();
                int b = indices.get(i + 1).intValue();

                vStart.fromArray(positions, a * 3);
                vEnd.fromArray(positions, b * 3);

                double distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

                if (distSq > precisionSq) {
                    continue;
                }

                interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

                double distance = raycaster.ray.origin.distanceTo(interRay);

                if (distance < raycaster.near || distance > raycaster.far) {
                    continue;
                }

                RayCastHit hit = new RayCastHit();
                hit.distance = distance;
                hit.point = interSegment.copy().applyMatrix4(this.matrixWorld);
                hit.index = i;
                hit.object = this;

                intersects.add(hit);

            }

        }
        else {

            for (int i = 0, l = positions.size() / 3 - 1; i < l; i += step) {

                vStart.fromArray(positions, 3 * i);
                vEnd.fromArray(positions, 3 * i + 3);

                double distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

                if (distSq > precisionSq) {
                    continue;
                }

                interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

                double distance = raycaster.ray.origin.distanceTo(interRay);

                if (distance < raycaster.near || distance > raycaster.far) {
                    continue;
                }

                RayCastHit hit = new RayCastHit();
                hit.distance = distance;
                hit.point = interSegment.copy().applyMatrix4(this.matrixWorld);
                hit.index = i;
                hit.object = this;

                intersects.add(hit);

            }

        }

    }

}
