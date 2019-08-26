/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;
import java.util.*;

/**
 https://github.com/mrdoob/three.js/blob/dev/src/math/Sphere.js

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Sphere implements Serializable {

    private double radius;
    private final Vector3d center;

    public Sphere() {
        this(new Vector3d(), 0);
    }

    public Sphere(Vector3d center, double radius) {
        this.radius = radius;
        this.center = center;
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    public Vector3d getCenter() {
        return center;
    }

    public Sphere set(Vector3d center, double radius) {
        this.radius = radius;
        this.center.copy(center);

        return this;
    }

    public Sphere setFromPoints(List<Vector3d> points, Vector3d optionalCenter) {

        Box3d box = new Box3d();

        if (optionalCenter != null) {
            center.copy(optionalCenter);
        }
        else {
            box.setFromPoints(points).getCenter(center);
        }

        double maxRadiusSq = 0;

        for (int i = 0, il = points.size(); i < il; i++) {
            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points.get(i)));
        }

        this.radius = Math.sqrt(maxRadiusSq);

        return this;
    }

    public boolean isEmpty() {
        return this.radius <= 0;
    }

    public boolean containsPoint(Vector3d point) {
        return (point.distanceToSquared(this.center) <= (this.radius * this.radius));
    }

    public double distanceToPoint(Vector3d point) {
        return (point.distanceTo(this.center) - this.radius);
    }

    public boolean intersectsSphere(Sphere sphere) {
        double radiusSum = this.radius + sphere.radius;

        return sphere.center.distanceToSquared(this.center) <= (radiusSum * radiusSum);
    }

    public boolean intersectsBox(Box3d box) {
        return box.intersectsSphere(this);
    }

    public boolean intersectsPlane(Plane plane) {
        // We use the following equation to compute the signed distance from
        // the center of the sphere to the plane.
        //
        // distance = q * n - d
        //
        // If this distance is greater than the radius of the sphere,
        // then there is no intersection.

        return Math.abs(this.center.dot(plane.getNormal()) - plane.getConstant()) <= this.radius;
    }

    public Vector3d clampPoint(Vector3d point, Vector3d optionalTarget) {
        double deltaLengthSq = this.center.distanceToSquared(point);

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        result.copy(point);

        if (deltaLengthSq > (this.radius * this.radius)) {

            result.sub(this.center).normalize();
            result.multiply(this.radius).add(this.center);

        }

        return result;
    }

    public Box3d getBoundingBox(Box3d optionalTarget) {
        Box3d result = optionalTarget == null ? new Box3d() : optionalTarget;
        result.set(center, center);
        result.expandByScalar(radius);
        return result;
    }

    public Sphere applyMatrix4(Matrix4d matrix) {
        this.center.applyMatrix4(matrix);
        this.radius = this.radius * matrix.getMaxScaleOnAxis();

        return this;
    }

    public Sphere translate(Vector3d offset) {
        this.center.add(offset);
        return this;
    }
    
    public Sphere copy() {
        return new Sphere().copy(this);
    }
    
    public Sphere copy(Sphere sphere) {
        this.radius = sphere.radius;
        this.center.copy(sphere.center);
        
        return this;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 67 * hash + (int) (Double.doubleToLongBits(this.radius) ^ (Double.doubleToLongBits(this.radius) >>> 32));
        hash = 67 * hash + Objects.hashCode(this.center);
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
        final Sphere other = (Sphere) obj;
        if (Double.doubleToLongBits(this.radius) != Double.doubleToLongBits(other.radius)) {
            return false;
        }
        if (!Objects.equals(this.center, other.center)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Sphere{" + "radius=" + radius + ", center=" + center + '}';
    }

}
