/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferAttribute;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Object3D;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import java.io.*;
import java.util.*;

/**
 * https://github.com/mrdoob/three.js/blob/dev/src/math/Box3.js
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Box3d implements Serializable {

    private final Vector3d min, max;

    public Box3d() {
        this(new Vector3d(Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY),
                new Vector3d(Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public Box3d(Vector3d min, Vector3d max) {
        this.min = min;
        this.max = max;
    }

    public Vector3d getMin() {
        return min;
    }

    public Vector3d getMax() {
        return max;
    }

    public Box3d set(Vector3d min, Vector3d max) {
        this.min.copy(min);
        this.max.copy(max);
        return this;
    }

    public Box3d makeEmpty() {
        this.min.x = this.min.y = this.min.z = Double.POSITIVE_INFINITY;
        this.max.x = this.max.y = this.max.z = Double.NEGATIVE_INFINITY;
        return this;
    }

    public boolean isEmpty() {
        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
    }

    public Vector3d getCenter(Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return this.isEmpty() ? result.set(0, 0, 0) : result.add(this.min, this.max).multiply(0.5);
    }

    public Vector3d getSize(Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return this.isEmpty() ? result.set(0, 0, 0) : result.sub(this.max, this.min);
    }

    public Box3d expandByPoint(Vector3d point) {
        this.min.min(point);
        this.max.max(point);

        return this;
    }

    public Box3d expandByVector(Vector3d vector) {

        this.min.sub(vector);
        this.max.add(vector);

        return this;

    }

    public Box3d setFromPoints(Collection<Vector3d> points) {
        this.makeEmpty();
        for (Vector3d p : points) {
            this.expandByPoint(p);
        }

        return this;
    }

    public Box3d setFromCenterAndSize(Vector3d center, Vector3d size) {
        Vector3d halfSize = new Vector3d().copy(size).multiply(0.5);

        this.min.copy(center).sub(halfSize);
        this.max.copy(center).add(halfSize);

        return this;
    }

    public Box3d expandByScalar(double scalar) {

        this.min.add(-scalar);
        this.max.add(scalar);

        return this;

    }

    public Box3d setFromBufferAttribute(BufferAttribute attribute) {
        double minX = Double.POSITIVE_INFINITY;
        double minY = Double.POSITIVE_INFINITY;
        double minZ = Double.POSITIVE_INFINITY;

        double maxX = Double.NEGATIVE_INFINITY;
        double maxY = Double.NEGATIVE_INFINITY;
        double maxZ = Double.NEGATIVE_INFINITY;

        for (int i = 0, l = attribute.getCount(); i < l; i++) {

            double x = attribute.getX(i).doubleValue();
            double y = attribute.getY(i).doubleValue();
            double z = attribute.getZ(i).doubleValue();

            if (x < minX) {
                minX = x;
            }
            if (y < minY) {
                minY = y;
            }
            if (z < minZ) {
                minZ = z;
            }

            if (x > maxX) {
                maxX = x;
            }
            if (y > maxY) {
                maxY = y;
            }
            if (z > maxZ) {
                maxZ = z;
            }

        }

        this.min.set(minX, minY, minZ);
        this.max.set(maxX, maxY, maxZ);

        return this;
    }

    public boolean containsPoint(Vector3d point) {

        return point.x() >= this.min.x() && point.x() <= this.max.x()
                && point.y() >= this.min.y() && point.y() <= this.max.y()
                && point.z() >= this.min.z() && point.z() <= this.max.z();

    }

    public boolean containsBox(Box3d box) {

        return this.min.x() <= box.min.x() && box.max.x() <= this.max.x()
                && this.min.y() <= box.min.y() && box.max.y() <= this.max.y()
                && this.min.z() <= box.min.z() && box.max.z() <= this.max.z();

    }

    public boolean intersectsBox(Box3d box) {

        // using 6 splitting planes to rule out intersections.
        return box.max.x() >= this.min.x() && box.min.x() <= this.max.x()
                && box.max.y() >= this.min.y() && box.min.y() <= this.max.y()
                && box.max.z() >= this.min.z() && box.min.z() <= this.max.z();

    }

    public boolean intersectsSphere(Sphere sphere) {
        Vector3d closestPoint = new Vector3d();
        this.clampPoint(sphere.getCenter(), closestPoint);
        return closestPoint.distanceToSquared(sphere.getCenter()) <= (sphere.getRadius() * sphere.getRadius());
    }

    public boolean intersectsPlane(Plane plane) {
        double min, max;
        Vector3d normal = plane.getNormal();

        if (normal.x() > 0) {

            min = normal.x() * this.min.x();
            max = normal.x() * this.max.x();

        } else {

            min = normal.x() * this.max.x();
            max = normal.x() * this.min.x();

        }

        if (normal.y() > 0) {

            min += normal.y() * this.min.y();
            max += normal.y() * this.max.y();

        } else {

            min += normal.y() * this.max.y();
            max += normal.y() * this.min.y();

        }

        if (normal.z() > 0) {

            min += normal.z() * this.min.z();
            max += normal.z() * this.max.z();

        } else {

            min += normal.z() * this.max.z();
            max += normal.z() * this.min.z();

        }

        return (min <= plane.getConstant() && max >= plane.getConstant());
    }

    public Box3d intersect(Box3d box) {
        this.min.max(box.min);
        this.max.min(box.max);

        // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
        if (this.isEmpty()) {
            this.makeEmpty();
        }

        return this;
    }

    public Box3d union(Box3d box) {
        this.min.min(box.min);
        this.max.max(box.max);

        return this;
    }

    public Vector3d clampPoint(Vector3d point, Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return result.copy(point).clamp(min, max);
    }

    public double distanceToPoint(Vector3d point) {

        Vector3d clampedPoint = new Vector3d().copy(point).clamp(this.min, this.max);
        return clampedPoint.sub(point).length();

    }

    public Box3d translate(Vector3d offset) {
        this.min.add(offset);
        this.max.add(offset);

        return this;
    }

    public Sphere getBoundingSphere(Sphere optionalTarget) {
        Sphere result = optionalTarget == null ? new Sphere() : optionalTarget;

        this.getCenter(result.getCenter());
        result.setRadius(this.getSize(new Vector3d()).length() * 0.5);

        return result;
    }

    public Box3d setFromObject(Object3D object) {

        Vector3d v1 = new Vector3d();

        object.updateMatrixWorld(true);

        this.makeEmpty();

        object.traverse(node -> {

            int i, l;

            IGeometry igeometry = node.getGeometry();

            if (igeometry != null) {

                if (igeometry instanceof Geometry) {
                    Geometry geometry = (Geometry) igeometry;
                    List<Vector3d> vertices = geometry.vertices;

                    for (i = 0, l = vertices.size(); i < l; i++) {

                        v1.copy(vertices.get(i));
                        v1.applyMatrix4(node.matrixWorld);

                        expandByPoint(v1);

                    }

                } else if (igeometry instanceof BufferGeometry) {
                    BufferGeometry geometry = (BufferGeometry) igeometry;
                    BufferAttribute attribute = geometry.attributes.get("position");

                    if (attribute != null) {

                        for (i = 0, l = attribute.getCount(); i < l; i++) {

                            v1.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);

                            expandByPoint(v1);

                        }

                    }

                }

            }
        });

        return this;
    }

    public Box3d copy() {
        return new Box3d(min.copy(), max.copy());
    }

    public Box3d copy(Box3d box) {
        this.min.copy(box.min);
        this.max.copy(box.max);
        return this;
    }

    public void setFromArray(double[] array) {
        double minX = Double.POSITIVE_INFINITY;
        double minY = Double.POSITIVE_INFINITY;
        double minZ = Double.POSITIVE_INFINITY;

        double maxX = Double.NEGATIVE_INFINITY;
        double maxY = Double.NEGATIVE_INFINITY;
        double maxZ = Double.NEGATIVE_INFINITY;

        for (int i = 0, l = array.length; i < l; i += 3) {

            double x = array[i];
            double y = array[i + 1];
            double z = array[i + 2];

            if (x < minX) {
                minX = x;
            }
            if (y < minY) {
                minY = y;
            }
            if (z < minZ) {
                minZ = z;
            }

            if (x > maxX) {
                maxX = x;
            }
            if (y > maxY) {
                maxY = y;
            }
            if (z > maxZ) {
                maxZ = z;
            }

        }

        this.min.set(minX, minY, minZ);
        this.max.set(maxX, maxY, maxZ);
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 41 * hash + Objects.hashCode(this.min);
        hash = 41 * hash + Objects.hashCode(this.max);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Box3d other = (Box3d) obj;
        if (!Objects.equals(this.min, other.min)) {
            return false;
        }
        if (!Objects.equals(this.max, other.max)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Box3d{" + "min=" + min + ", max=" + max + '}';
    }

}
