/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;
import java.util.*;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/math/Spline.js
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Spline implements Serializable {

    private final List<Vector3d> points;

    public Spline(List<Vector3d> points) {
        this.points = points;
    }

    public Vector3d getPoint(int k) {

        int point = (this.points.size() - 1) * k;
        int intPoint = (int) Math.floor(point);
        int weight = point - intPoint;

        int[] c = new int[4];
        c[0] = intPoint == 0 ? intPoint : intPoint - 1;
        c[1] = intPoint;
        c[2] = intPoint > this.points.size() - 2 ? this.points.size() - 1 : intPoint + 1;
        c[3] = intPoint > this.points.size() - 3 ? this.points.size() - 1 : intPoint + 2;

        Vector3d pa = this.points.get(c[0]);
        Vector3d pb = this.points.get(c[1]);
        Vector3d pc = this.points.get(c[2]);
        Vector3d pd = this.points.get(c[3]);

        double w2 = weight * weight;
        double w3 = weight * w2;

        Vector3d v3 = new Vector3d();
        v3.x = interpolate(pa.x, pb.x, pc.x, pd.x, weight, w2, w3);
        v3.y = interpolate(pa.y, pb.y, pc.y, pd.y, weight, w2, w3);
        v3.z = interpolate(pa.z, pb.z, pc.z, pd.z, weight, w2, w3);

        return v3;
    }

    public SplineLength getLength() {
        return getLength(100);
    }

    public SplineLength getLength(int nSubDivisions) {

        int i, index, nSamples;
        int point, intPoint, oldIntPoint = 0;
        Vector3d position;
        Vector3d oldPosition = new Vector3d();
        Vector3d tmpVec = new Vector3d();

        double totalLength = 0;

        // first point has 0 length
        nSamples = this.points.size() * nSubDivisions;

        double[] chunkLengths = new double[nSamples];
        chunkLengths[0] = 0;
        oldPosition.copy(this.points.get(0));

        for (i = 1; i < nSamples; i++) {

            index = i / nSamples;

            position = this.getPoint(index);
            tmpVec.copy(position);

            totalLength += tmpVec.distanceTo(oldPosition);

            oldPosition.copy(position);

            point = (this.points.size() - 1) * index;
            intPoint = (int) Math.floor(point);

            if (intPoint != oldIntPoint) {
                chunkLengths[intPoint] = totalLength;
                oldIntPoint = intPoint;
            }

        }

        // last point ends with total length
        chunkLengths[chunkLengths.length] = totalLength;

        return new SplineLength(chunkLengths, totalLength);
    }

    public List<double[]> getControlPointsArray() {
        List<double[]> coords = new ArrayList<>();
        for (int i = 0; i < points.size(); i++) {
            Vector3d p = this.points.get(i);
            coords.add(new double[]{p.x, p.y, p.z});
        }
        return coords;
    }

    public void reparametrizeByArcLength(double samplingCoef) {

        int index, indexCurrent, indexNext;
        double realDistance;
        double sampling;
        Vector3d position;
        List<Vector3d> newpoints = new ArrayList<>();
        Vector3d tmpVec = new Vector3d();
        SplineLength sl = this.getLength();

        newpoints.add(tmpVec.copy(this.points.get(0)).copy());

        for (int i = 1; i < this.points.size(); i++) {

            realDistance = sl.chunks[i] - sl.chunks[i - 1];

            sampling = Math.ceil(samplingCoef * realDistance / sl.total);

            indexCurrent = (i - 1) / (this.points.size() - 1);
            indexNext = i / (this.points.size() - 1);

            for (int j = 1; j < sampling - 1; j++) {

                index = (int) (indexCurrent + j * (1 / sampling) * (indexNext - indexCurrent));

                position = this.getPoint(index);
                newpoints.add(tmpVec.copy(position).copy());

            }

            newpoints.add(tmpVec.copy(this.points.get(i)).copy());

        }

        this.points.clear();
        this.points.addAll(newpoints);

    }

    private double interpolate(double p0, double p1, double p2, double p3, double t, double t2, double t3) {

        double v0 = (p2 - p0) * 0.5;
        double v1 = (p3 - p1) * 0.5;

        return (2 * (p1 - p2) + v0 + v1) * t3 + (- 3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
    }

    class SplineLength {

        private final double total;
        private final double[] chunks;

        public SplineLength(double[] chunkLengths, double totalLength) {
            this.total = totalLength;
            this.chunks = chunkLengths;
        }

    }

}
