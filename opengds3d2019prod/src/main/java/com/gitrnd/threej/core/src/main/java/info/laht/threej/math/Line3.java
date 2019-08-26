/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;
import java.util.*;


/**
 https://github.com/mrdoob/three.js/blob/dev/src/math/Line3.js

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Line3 implements Serializable {

    private final Vector3d start, end;

    public Line3() {
        this(new Vector3d(), new Vector3d());
    }

    public Line3(Vector3d start, Vector3d end) {
        this.start = start;
        this.end = end;
    }

    /**
     Sets the start and end values by copying the provided vectors.

     @param start set the start point of the line.
     @param end   Vector3 - set the end point of the line.

     @return
     */
    public Line3 set(Vector3d start, Vector3d end) {
        this.start.copy(start);
        this.end.copy(end);

        return this;
    }

    /**
     Return the center of the line segment.

     @param optionalTarget (optional) if specified, the result will be copied into this Vector3, otherwise a new Vector3 will be created.

     @return
     */
    public Vector3d getCenter(Vector3d optionalTarget) {

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return result.add(this.start, this.end).multiply(0.5);

    }

    /**
     Returns the delta vector of the line segment ( end vector minus the start vector).

     @param optionalTarget (optional) if specified, the result will be copied into this Vector3, otherwise a new Vector3 will be created.

     @return
     */
    public Vector3d delta(Vector3d optionalTarget) {

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return result.sub(this.end, this.start);

    }

    /**
     Returns the square of the Euclidean distance (straight-line distance) between the line's start and end vectors.

     @return
     */
    public double distanceSq() {
        return this.start.distanceToSquared(this.end);
    }

    /**
     Returns the Euclidean distance (straight-line distance) between the line's start and end points.

     @return
     */
    public double distance() {
        return this.start.distanceTo(this.end);
    }

    /**
     Return a vector at a certain position along the line. When t = 0, it returns the start vector, and when t = 1 it returns the end vector.

     @param t              Use values 0-1 to return a position along the line segment.
     @param optionalTarget (optional) if specified, the result will be copied into this Vector3, otherwise a new Vector3 will be created.

     @return
     */
    public Vector3d at(double t, Vector3d optionalTarget) {

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return this.delta(result).multiply(t).add(this.start);

    }

    /**
     Returns a point parameter based on the closest point as projected on the line segement. If clamp to line is true, then the returned value will be between 0 and 1.

     @param point       the point for which to return a point parameter.
     @param clampToLine Whether to clamp the result to the range [0, 1].

     @return
     */
    double closestPointToPointParameter(Vector3d point, boolean clampToLine) {

        Vector3d startP = new Vector3d();
        Vector3d startEnd = new Vector3d();

        startP.sub(point, this.start);
        startEnd.sub(this.end, this.start);

        double startEnd2 = startEnd.dot(startEnd);
        double startEnd_startP = startEnd.dot(startP);

        double t = startEnd_startP / startEnd2;

        if (clampToLine) {

            t = MathUtil.clamp(t, 0, 1);

        }

        return t;

    }

    /**
     Returns the closets point on the line. If clampToLine is true, then the returned value will be clamped to the line segment.

     @param point          return the closest point on the line to this point.
     @param clampToLine    whether to clamp the returned value to the line segment.
     @param optionalTarget (optional) if specified, the result will be copied into this Vector3, otherwise a new Vector3 will be created.

     @return
     */
    Vector3d closestPointToPoint(Vector3d point, boolean clampToLine, Vector3d optionalTarget) {

        double t = this.closestPointToPointParameter(point, clampToLine);

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;

        return this.delta(result).multiply(t).add(this.start);

    }

    /**
     Apply a matrix transform to the line segment

     @param matrix

     @return this
     */
    public Line3 applyMatrix4(Matrix4d matrix) {

        this.start.applyMatrix4(matrix);
        this.end.applyMatrix4(matrix);

        return this;

    }

    public Line3 copy() {
        return new Line3().copy(this);
    }

    public Line3 copy(Line3 line) {
        this.start.copy(line.start);
        this.end.copy(line.end);

        return this;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 17 * hash + Objects.hashCode(this.start);
        hash = 17 * hash + Objects.hashCode(this.end);
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
        final Line3 other = (Line3) obj;
        if (!Objects.equals(this.start, other.start)) {
            return false;
        }
        if (!Objects.equals(this.end, other.end)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Line3{" + "start=" + start + ", end=" + end + '}';
    }

}
