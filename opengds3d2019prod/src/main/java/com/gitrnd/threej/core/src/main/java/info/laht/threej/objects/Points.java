/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.objects;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.Material;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.PointsMaterial;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.util.*;
import org.apache.commons.lang3.tuple.*;

/**

 @author laht
 */
public class Points extends Object3D {
    
    public final String type = "Points";

    public BufferGeometry geometry;
    public Material material;

    public Points() {
        this(new BufferGeometry(), new PointsMaterial(
             new ImmutablePair<>("color", new Color().random().multiply(new Color().set("#ffffff"))))
        );
    }

    public Points(BufferGeometry geometry, Material material) {
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

        double threshold = (double) raycaster.params.points.get("threshold");

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

        double localThreshold = threshold / ((this.scale.x() + this.scale.y() + this.scale.z()) / 3);
        double localThresholdSq = localThreshold * localThreshold;
        Vector3d position = new Vector3d();

        BufferAttribute index = geometry.index;
        Map<String, BufferAttribute> attributes = geometry.attributes;
        List<Number> positions = attributes.get("positions").array;

        if (index != null) {

            List<Number> indices = index.array;

            for (int i = 0, il = indices.size(); i < il; i++) {

                int a = indices.get(i).intValue();
                position.fromArray(positions, a * 3);
                testPoint(raycaster, ray, intersects, position, a, localThresholdSq);

            }

        }
        else {

            for (int i = 0, l = positions.size() / 3; i < l; i++) {

                position.fromArray(positions, i * 3);
                testPoint(raycaster, ray, intersects, position, i, localThresholdSq);

            }

        }

    }
    
     private void testPoint(RayCaster raycaster, Ray ray, List<RayCastHit> intersects, Vector3d point, int index, double localThresholdSq) {
        double rayPointDistanceSq = ray.distanceSqToPoint(point);

        if (rayPointDistanceSq < localThresholdSq) {

            Vector3d intersectPoint = ray.closestPointToPoint(point, null);
            intersectPoint.applyMatrix4(matrixWorld);

            double distance = raycaster.ray.origin.distanceTo(intersectPoint);

            if (distance < raycaster.near || distance > raycaster.far) {
                return;
            }

            RayCastHit hit = new RayCastHit();
            hit.distance = distance;
            hit.point = intersectPoint.copy();
            hit.index = index;
            hit.object = this;

            intersects.add(hit);

        }
    }
     
    @Override
     public Points copy() {
         return (Points) new Points(geometry, material).copy(this);
     }


}
