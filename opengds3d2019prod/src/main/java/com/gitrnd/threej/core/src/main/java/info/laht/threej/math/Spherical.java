/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Spherical implements Serializable {

    public double radius;
    public final Angle phi, theta;

    public Spherical() {
        this(1, new Angle(), new Angle());
    }

    public Spherical(double radius, Angle phi, Angle theta) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    }

    public Spherical set(double radius, Angle phi, Angle theta) {
        this.radius = radius;
        this.phi.copy(phi);
        this.theta.copy(theta);

        return this;
    }

    public Spherical makeSafe() {
        double EPS = 0.000001;
        phi.set(Math.max(EPS, Math.min(Math.PI - EPS, phi.inRadians())), Angle.Representation.RAD);

        return this;
    }

    public Spherical setFromVector3(Vector3d vec3) {
        this.radius = vec3.length();

        if (this.radius == 0) {

            this.theta.set(0, Angle.Representation.RAD);
            this.phi.set(0, Angle.Representation.RAD);

        }
        else {

            this.theta.set(Math.atan2(vec3.x, vec3.z), Angle.Representation.RAD); // equator angle around y-up axis
            this.phi.set(Math.acos(MathUtil.clamp(vec3.y / this.radius, - 1, 1)), Angle.Representation.RAD); // polar angle

        }

        return this;
    }
    
    public Spherical copy() {
        return new Spherical().copy(this);
    }

    public Spherical copy(Spherical source) {

        this.radius = source.radius;
        this.phi.copy(source.phi);
        this.theta.copy(source.theta);

        return this;
    }

}
