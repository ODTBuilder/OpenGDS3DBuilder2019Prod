/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.objects;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.Material;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.MeshBasicMaterial;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Ray;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Triangle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.tuple.*;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/objects/Mesh.js
 *
 * @author laht
 */
public class Mesh extends Object3D {
    
    public final String type = "Mesh";

    public IGeometry geometry;
    public Material material;

    public int drawMode = Constants.TrianglesDrawMode;

    public Mesh() {
        this(new BufferGeometry(), new MeshBasicMaterial(
                new ImmutablePair<>("color", new Color().random().multiply(new Color().set("#ffffff"))))
        );
            
    }

    public Mesh(IGeometry geometry, Material material) {
        this.geometry = geometry;
        this.material = material;
    }
    
     public IGeometry getGeometry() {
        return geometry;
    }

    public void setDrawMode(int value) {
        this.drawMode = value;
    }
    
    public void updateMorphTargets() {
        throw new UnsupportedOperationException("Not implemented yet!");
    }

    @Override
    public Mesh copy() {
        return new Mesh(geometry, material).copy(this);
    }

    public Mesh copy(Mesh source) {
        super.copy(source);

        this.drawMode = source.drawMode;

        return this;
    }

    private Vector2d uvIntersection(Vector3d point, Vector3d p1, Vector3d p2, Vector3d p3, Vector2d uv1, Vector2d uv2, Vector2d uv3) {

        Vector3d barycoord = new Vector3d();

        Triangle.barycoordFromPoint(point, p1, p2, p3, barycoord);

        uv1.multiply(barycoord.x());
        uv2.multiply(barycoord.y());
        uv3.multiply(barycoord.z());

        uv1.add(uv2).add(uv3);

        return uv1.copy();
    }

    private RayCastHit checkIntersection(Mesh object, RayCaster raycaster, Ray ray, Vector3d pA, Vector3d pB, Vector3d pC, Vector3d point) {

        Vector3d intersect;
        Material _material = object.material;

        if (_material.side == Constants.BackSide) {
            intersect = ray.intersectTriangle(pC, pB, pA, true, point);
        } else {
            intersect = ray.intersectTriangle(pA, pB, pC, _material.side != Constants.DoubleSide, point);
        }

        if (intersect == null) {
            return null;
        }

        Vector3d intersectionPointWorld = new Vector3d();
        intersectionPointWorld.copy(point);
        intersectionPointWorld.applyMatrix4(object.matrixWorld);

        double distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);

        if (distance < raycaster.near || distance > raycaster.far) {
            return null;
        }

        RayCastHit hit = new RayCastHit();
        hit.distance = distance;
        hit.object = object;
        hit.point = intersectionPointWorld.copy();

        return hit;
    }

    public RayCastHit checkBufferGeometryIntersection(Mesh object, RayCaster raycaster, Ray ray, List<Number> positions, List<Number> uvs, int a, int b, int c) {

        Vector3d vA = new Vector3d();
        Vector3d vB = new Vector3d();
        Vector3d vC = new Vector3d();

        Vector2d uvA = new Vector2d();
        Vector2d uvB = new Vector2d();
        Vector2d uvC = new Vector2d();

        Vector3d intersectionPoint = new Vector3d();

        vA.fromArray(positions, a * 3);
        vB.fromArray(positions, b * 3);
        vC.fromArray(positions, c * 3);

        RayCastHit intersection = checkIntersection(object, raycaster, ray, vA, vB, vC, intersectionPoint);

        if (intersection != null) {

            if (uvs != null) {

                uvA.fromArray(uvs, a * 2);
                uvB.fromArray(uvs, b * 2);
                uvC.fromArray(uvs, c * 2);

                intersection.uv = uvIntersection(intersectionPoint, vA, vB, vC, uvA, uvB, uvC);

            }

            intersection.face = new Face3(a, b, c, Triangle.normal(vA, vB, vC, null));
            intersection.faceIndex = a;

        }

        return intersection;

    }

    public void raycast(RayCaster raycaster, Ray ray, List<RayCastHit> intersects) {

        if (material == null) {
            return;
        }

        if (geometry.getBoundingBox() != null) {
            if (!ray.intersectsBox(geometry.getBoundingBox())) {
                return;
            }
        }

        RayCastHit intersection = null;
       

        if (geometry instanceof BufferGeometry) {
            
             List<Number> uvs = null;

            BufferGeometry bufferGeometry = (BufferGeometry) geometry;

            int a, b, c;
            BufferAttribute index = bufferGeometry.index;
            Map<String, BufferAttribute> attributes = bufferGeometry.attributes;
            List<Number> positions = attributes.get("position").array;

            if (attributes.containsKey("uv")) {

                uvs = attributes.get("uv").array;

            }

            if (index != null) {

                List<Number> indices = index.array;

                for (int i = 0, l = indices.size(); i < l; i += 3) {

                    a = indices.get(i).intValue();
                    b = indices.get(i + 1).intValue();
                    c = indices.get(i + 2).intValue();

                    intersection = checkBufferGeometryIntersection(this, raycaster, ray, positions, uvs, a, b, c);

                    if (intersection != null) {

                        intersection.faceIndex = (int) Math.floor(i / 3); // triangle number in indices buffer semantics
                        intersects.add(intersection);

                    }

                }

            } else {

                for (int i = 0, l = positions.size(); i < l; i += 9) {

                    a = i / 3;
                    b = a + 1;
                    c = a + 2;

                    intersection = checkBufferGeometryIntersection(this, raycaster, ray, positions, uvs, a, b, c);

                    if (intersection != null) {

                        intersection.index = a; // triangle number in positions buffer semantics
                        intersects.add(intersection);

                    }

                }

            }

        }
    }

}
