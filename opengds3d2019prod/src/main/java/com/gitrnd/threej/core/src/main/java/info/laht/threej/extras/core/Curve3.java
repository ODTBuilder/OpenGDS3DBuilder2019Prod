/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.extras.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.MathUtil;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author laht
 */
public abstract class Curve3 {
    
    public String type = null;

    public boolean needsUpdate;
    
    private double[] cacheArcLengths;

    public void updateArcLengths() {
        this.needsUpdate = true;
        getLengths();
    }

    public double[] getLengths() {
        double[] lengths = getLengths(200);
        throw new UnsupportedOperationException();
    }

    public double[] getLengths(int divisions) {
        
        if (cacheArcLengths != null && cacheArcLengths.length == divisions +1 && !needsUpdate) {
            return cacheArcLengths;
        }
        
        needsUpdate = false;
        
        double[] cache = new double[divisions];
        
        cache[0] = 0;
        double sum = 0;
        Vector3d last = getPoint(0);
        for (int p = 0; p <= divisions; p++) {
            Vector3d current = getPoint((double) p/divisions);
            sum+= current.distanceTo(last);
            cache[p] = sum;
            last = current;
        }
        
        cacheArcLengths = cache;
        
        return cache;
        
    }

    public abstract Vector3d getPoint(double t);

    public Vector3d getPointAt(double u) {
        double t = getUtoTmapping(u);
        return getPoint(t);
    }

    public List<Vector3d> getPoints() {
        return getPoints(5);
    }

    public List<Vector3d> getPoints(int divisions) {
        List<Vector3d> points = new ArrayList<>();
        for (int d = 0; d <= divisions; d++) {
            points.add(this.getPoint(d / divisions));
        }
        return points;
    }

    public List<Vector3d> getSpacedPoints() {
        return getSpacedPoints(5);
    }

    public List<Vector3d> getSpacedPoints(int divisions) {
        List<Vector3d> points = new ArrayList<>();
        for (int d = 0; d <= divisions; d++) {
            points.add(this.getPointAt(d / divisions));
        }
        return points;
    }

    private double getUtoTmapping(double u) {
        double distance = 0; //targetArcLength = u * arcLengths[ il - 1 ]
        return getUtoTmapping(u, distance);
    }

    private double getUtoTmapping(double u, double distance) {

        double[] arcLengths = this.getLengths();

        int il = arcLengths.length;

        double targetArcLength = distance;

        // binary search for the index with largest value smaller than target u distance
        int low = 0, high = il - 1;

        while (low <= high) {

            int i = (int) Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

            double comparison = arcLengths[i] - targetArcLength;

            if (comparison < 0) {

                low = i + 1;

            } else if (comparison > 0) {

                high = i - 1;

            } else {

                high = i;
                break;

                // DONE
            }

        }

        int i = high;
        if (arcLengths[i] == targetArcLength) {

            double t = i / (il - 1);
            return t;

        }

        // we could get finer grain at lengths, or use simple interpolation between two points
        double lengthBefore = arcLengths[i];
        double lengthAfter = arcLengths[i + 1];

        double segmentLength = lengthAfter - lengthBefore;

        // determine where we are between the 'before' and 'after' points
        double segmentFraction = (targetArcLength - lengthBefore) / segmentLength;

        // add that fractional amount to t
        double t = (i + segmentFraction) / (il - 1);

        return t;

    }

    public Vector3d getTangent(double t) {

        double delta = 0.0001;
        double t1 = t - delta;
        double t2 = t + delta;

        // Capping in case of danger
        if (t1 < 0) {
            t1 = 0;
        }
        if (t2 > 1) {
            t2 = 1;
        }

        Vector3d pt1 = this.getPoint(t1);
        Vector3d pt2 = this.getPoint(t2);

        Vector3d vec = pt2.copy().sub(pt1);
        return vec.normalize();

    }

    public Vector3d getTangentAt(double u) {
        double t = this.getUtoTmapping(u);
        return this.getTangent(t);
    }

    public FrenetFrame computeFrenetFrames(int segments, boolean closed) {

        // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
        Vector3d normal = new Vector3d();

        List<Vector3d> tangents = new ArrayList<>();
        List<Vector3d> normals = new ArrayList<>();
        List<Vector3d> binormals = new ArrayList<>();

        Vector3d vec = new Vector3d();
        Matrix4d mat = new Matrix4d();

        Angle theta;

        // compute the tangent vectors for each segment on the curve
        for (int i = 0; i <= segments; i++) {

            double u = i / segments;
            Vector3d tangentAt = this.getTangentAt(u);
            tangentAt.normalize();
            tangents.add(tangentAt);

        }

        // select an initial normal vector perpendicular to the first tangent vector,
        // and in the direction of the minimum tangent xyz component
        normals.add(new Vector3d());
        binormals.add(new Vector3d());
        double min = Double.MAX_VALUE;
        double tx = Math.abs(tangents.get(0).x());
        double ty = Math.abs(tangents.get(0).y());
        double tz = Math.abs(tangents.get(0).z());

        if (tx <= min) {

            min = tx;
            normal.set(1, 0, 0);

        }

        if (ty <= min) {

            min = ty;
            normal.set(0, 1, 0);

        }

        if (tz <= min) {

            normal.set(0, 0, 1);

        }

        vec.cross(tangents.get(0), normal).normalize();

        normals.get(0).cross(tangents.get(0), vec);
        binormals.get(0).cross(tangents.get(0), normals.get(0));

        // compute the slowly-varying normal and binormal vectors for each segment on the curve
        for (int i = 1; i <= segments; i++) {

            normals.set(i, normals.get(i - 1).copy());

            binormals.set(i, binormals.get(i - 1).copy());

            vec.cross(tangents.get(i - 1), tangents.get(i));

            if (vec.length() > Double.MIN_VALUE) {

                vec.normalize();

                theta = Angle.rad(Math.acos(MathUtil.clamp(tangents.get(i - 1).dot(tangents.get(i)), - 1, 1))); // clamp for floating pt errors

                normals.get(i).applyMatrix4(mat.makeRotationAxis(vec, theta));

            }

            binormals.get(i).cross(tangents.get(i), normals.get(i));

        }

        // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
        if (closed == true) {

            theta = Angle.rad(Math.acos(MathUtil.clamp(normals.get(0).dot(normals.get(segments)), - 1, 1)));
            theta.scale(1 / segments);

            if (tangents.get(0).dot(vec.cross(normals.get(0), normals.get(segments))) > 0) {

                theta.sub(theta);

            }

            for (int i = 1; i <= segments; i++) {

                // twist a little...
                normals.get(i).applyMatrix4(mat.makeRotationAxis(tangents.get(i), Angle.rad(theta.inRadians() * i)));
                binormals.get(i).cross(tangents.get(i), normals.get(i));

            }

        }

        return new FrenetFrame(tangents, normals, binormals);

    }

    public static class FrenetFrame {

        public final List<Vector3d> tangents;
        public final List<Vector3d> normals;
        public final List<Vector3d> binormals;

        public FrenetFrame(List<Vector3d> tangents, List<Vector3d> normals, List<Vector3d> binormals) {
            this.tangents = tangents;
            this.normals = normals;
            this.binormals = binormals;
        }

    }

}
