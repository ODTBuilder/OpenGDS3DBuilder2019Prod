/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;

/**
 https://github.com/mrdoob/three.js/blob/master/src/math/Frustum.js

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Frustrum implements Serializable {

    private final Plane[] planes;

    public Frustrum() {
        this(new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane());
    }

    public Frustrum(Plane p0, Plane p1, Plane p2, Plane p3, Plane p4, Plane p5) {
        this.planes = new Plane[]{p0, p1, p2, p3, p4, p5};
    }

    public Frustrum set(Plane p0, Plane p1, Plane p2, Plane p3, Plane p4, Plane p5) {
        planes[0].copy(p0);
        planes[1].copy(p1);
        planes[2].copy(p2);
        planes[3].copy(p3);
        planes[4].copy(p4);
        planes[5].copy(p5);

        return this;
    }

    public Frustrum setFromMatrix(Matrix4d m) {

        double[] me = m.elements();
        double me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
        double me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
        double me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
        double me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

        planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
        planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
        planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
        planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
        planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();

        return this;
    }

    public boolean instersectsSphere(Sphere sphere) {

        Vector3d center = sphere.getCenter();
        double negRadius = -sphere.getRadius();

        for (int i = 0; i < 6; i++) {
            double distance = planes[i].distanceToPoint(center);
            if (distance < negRadius) {
                return false;
            }
        }

        return true;
    }

    public boolean intersectsBox(Box3d box) {
        Vector3d p1 = new Vector3d();
        Vector3d p2 = new Vector3d();
        for (int i = 0; i < 6; i++) {

            Plane plane = planes[i];
            Vector3d min = box.getMin();
            Vector3d max = box.getMax();
            Vector3d normal = plane.getNormal();

            p1.x = normal.x() > 0 ? min.x() : max.x();
            p2.x = normal.x() > 0 ? max.x() : min.x();
            p1.y = normal.y() > 0 ? min.y() : max.y();
            p2.y = normal.y() > 0 ? max.y() : min.y();
            p1.z = normal.z() > 0 ? min.z() : max.z();
            p2.z = normal.z() > 0 ? max.z() : min.z();

            double d1 = plane.distanceToPoint(p1);
            double d2 = plane.distanceToPoint(p2);

            // if both outside plane, no intersection
            if (d1 < 0 && d2 < 0) {
                return false;
            }

        }

        return true;
    }

    public boolean containsPoint(Vector3d point) {
        for (int i = 0; i < 6; i++) {
            if (planes[i].distanceToPoint(point) < 0) {
                return false;
            }
        }
        return true;
    }

    public Frustrum copy() {
        return new Frustrum().copy(this);
    }

    public Frustrum copy(Frustrum frustrum) {
        for (int i = 0; i < 6; i++) {
            this.planes[i].copy(frustrum.planes[i]);
        }
        return this;
    }

}
