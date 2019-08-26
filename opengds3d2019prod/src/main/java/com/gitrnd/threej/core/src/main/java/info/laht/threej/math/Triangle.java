/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;
import java.util.*;

/**
 * https://github.com/mrdoob/three.js/blob/dev/src/math/Triangle.js
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Triangle implements Serializable {

    private final Vector3d a, b, c;

    public Triangle() {
        this(new Vector3d(), new Vector3d(), new Vector3d());
    }

    public Triangle(Vector3d a, Vector3d b, Vector3d c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    public Triangle set(Vector3d a, Vector3d b, Vector3d c) {
        this.a.copy(a);
        this.b.copy(b);
        this.c.copy(c);
        return this;
    }

    public Triangle setFromPointsAndIndices(List<Vector3d> points, int i1, int i2, int i3) {
        this.a.copy(points.get(i1));
        this.b.copy(points.get(i2));
        this.c.copy(points.get(i3));
        return this;
    }

    public Vector3d midPoint(Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return result.add(this.a, this.b).add(this.c).multiply(1d / 3d);
    }

    public double area() {
        Vector3d v0 = new Vector3d().sub(this.c, this.b);
        Vector3d v1 = new Vector3d().sub(this.a, this.b);

        return v0.cross(v1).length() * 0.5;
    }

    public Vector3d baryCoordFromPoint(Vector3d point, Vector3d optionalTarget) {
        return Triangle.barycoordFromPoint(point, a, b, c, optionalTarget);
    }

    public boolean containsPoint(Vector3d point) {
        return Triangle.containsPoint(point, a, b, c);
    }

    public Vector3d closestPointToPoint(Vector3d point, Vector3d optionalTarget) {

        Plane plane = new Plane();
        Line3[] edgeList = new Line3[]{new Line3(), new Line3(), new Line3()};
        Vector3d projectedPoint = new Vector3d();
        Vector3d closestPoint = new Vector3d();

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        double minDistance = Double.POSITIVE_INFINITY;

        // project the point onto the plane of the triangle
        plane.setFromCoplanarPoints(this.a, this.b, this.c);
        plane.projectPoint(point, projectedPoint);

        // check if the projection lies within the triangle
        if (this.containsPoint(projectedPoint) == true) {

            // if so, this is the closest point
            result.copy(projectedPoint);

        } else {

            // if not, the point falls outside the triangle. the result is the closest point to the triangle's edges or vertices
            edgeList[0].set(this.a, this.b);
            edgeList[1].set(this.b, this.c);
            edgeList[2].set(this.c, this.a);

            for (int i = 0; i < edgeList.length; i++) {

                edgeList[i].closestPointToPoint(projectedPoint, true, closestPoint);

                double distance = projectedPoint.distanceToSquared(closestPoint);
                if (distance < minDistance) {
                    minDistance = distance;
                    result.copy(closestPoint);
                }

            }

        }

        return result;
    }

    public Triangle copy() {
        return new Triangle().copy(this);
    }

    public Triangle copy(Triangle triangle) {
        this.a.copy(triangle.a);
        this.b.copy(triangle.b);
        this.c.copy(triangle.c);

        return this;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 89 * hash + Objects.hashCode(this.a);
        hash = 89 * hash + Objects.hashCode(this.b);
        hash = 89 * hash + Objects.hashCode(this.c);
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
        final Triangle other = (Triangle) obj;
        if (!Objects.equals(this.a, other.a)) {
            return false;
        }
        if (!Objects.equals(this.b, other.b)) {
            return false;
        }
        if (!Objects.equals(this.c, other.c)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Triangle{" + "a=" + a + ", b=" + b + ", c=" + c + '}';
    }

    public static Vector3d normal(Vector3d a, Vector3d b, Vector3d c, Vector3d optionalTarget) {
        Vector3d v0 = new Vector3d();

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;

        result.sub(c, b);
        v0.sub(a, b);
        result.cross(v0);

        double resultLengthSq = result.lengthSq();
        if (resultLengthSq > 0) {

            return result.multiply(1d / Math.sqrt(resultLengthSq));

        }

        return result.set(0, 0, 0);
    }

    public static Vector3d barycoordFromPoint(Vector3d point, Vector3d a, Vector3d b, Vector3d c, Vector3d optionalTarget) {
        Vector3d v0 = new Vector3d().sub(c, a);
        Vector3d v1 = new Vector3d().sub(b, a);
        Vector3d v2 = new Vector3d().sub(point, a);

        double dot00 = v0.dot(v0);
        double dot01 = v0.dot(v1);
        double dot02 = v0.dot(v2);
        double dot11 = v1.dot(v1);
        double dot12 = v1.dot(v2);

        double denom = (dot00 * dot11 - dot01 * dot01);

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;

        // collinear or singular triangle
        if (denom == 0) {

            // arbitrary location outside of triangle?
            // not sure if this is the best idea, maybe should be returning undefined
            return result.set(-2, -1, -1);

        }

        double invDenom = 1d / denom;
        double u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        double v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        // barycentric coordinates must always sum to 1
        return result.set(1 - u - v, v, u);
    }

    public static boolean containsPoint(Vector3d point, Vector3d a, Vector3d b, Vector3d c) {
        Vector3d result = Triangle.barycoordFromPoint(point, a, b, c, new Vector3d());
        return (result.x >= 0) && (result.y >= 0) && ((result.x + result.y) <= 1);
    }

}
