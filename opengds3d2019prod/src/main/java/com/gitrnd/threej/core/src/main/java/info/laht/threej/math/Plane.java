/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;

/**
 https://github.com/mrdoob/three.js/blob/dev/src/math/Plane.js

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Plane implements Serializable {

    private double constant;
    private final Vector3d normal;

    public Plane() {
        this(new Vector3d(1, 0, 0), 0);
    }

    public Plane(Vector3d normal, double constant) {
        this.constant = constant;
        this.normal = normal;
    }

    public double getConstant() {
        return constant;
    }

    public Vector3d getNormal() {
        return normal;
    }

    public Plane set(Vector3d normal, double constant) {
        this.normal.copy(normal);
        this.constant = constant;

        return this;
    }

    public Plane setComponents(double x, double y, double z, double w) {
        this.normal.set(x, y, z);
        this.constant = w;

        return this;
    }

    public Plane setFromNormalAndCoplanarPoint(Vector3d normal, Vector3d point) {
        this.normal.copy(normal);
        this.constant = -point.dot(this.normal);	// must be this.normal, not normal, as this.normal is normalized

        return this;
    }

    public Plane setFromCoplanarPoints(Vector3d a, Vector3d b, Vector3d c) {
        Vector3d normal = new Vector3d().sub(c, b).cross(new Vector3d().sub(a, b)).normalize();
        this.setFromNormalAndCoplanarPoint(normal, a);

        return this;
    }

    public double distanceToPoint(Vector3d point) {
        return this.normal.dot(point) + this.constant;
    }

    public double distanceToSphere(Sphere sphere) {
        return this.distanceToPoint(sphere.getCenter()) - sphere.getRadius();
    }
    
    public Vector3d projectPoint(Vector3d point, Vector3d optionalTarget) {
        return this.orthoPoint( point, optionalTarget ).sub( point ).negate();
    }

    public Vector3d orthoPoint(Vector3d point, Vector3d optionalTarget) {
        double perpendicularMagnitude = this.distanceToPoint(point);

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return result.copy(this.normal).multiply(perpendicularMagnitude);
    }

    public Plane normalize() {
        double inverseNormalLength = 1.0 / this.normal.length();
        this.normal.multiply(inverseNormalLength);
        this.constant *= inverseNormalLength;

        return this;
    }

    public Plane negate() {
        this.constant *= -1;
        this.normal.negate();

        return this;
    }

    public Plane copy() {
        return new Plane().copy(this);
    }

    public Plane copy(Plane plane) {
        this.normal.copy(plane.normal);
        this.constant = plane.constant;
        return this;
    }

    @Override
    public String toString() {
        return "Plane{" + "constant=" + constant + ", normal=" + normal + '}';
    }

}
