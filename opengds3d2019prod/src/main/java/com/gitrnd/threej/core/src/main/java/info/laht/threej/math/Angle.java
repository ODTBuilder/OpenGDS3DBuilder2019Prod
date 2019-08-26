/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.Serializable;

/**

 @author laht
 */
public class Angle implements Serializable {

    public enum Representation {
        DEG, RAD
    };

    private double phi;

    public Angle() {
        this.phi = 0;
    }

    public Angle(double phi, Representation repr) {
        this.phi = ensureRadians(phi, repr);
    }

    public void set(double phi, Representation repr) {
        this.phi = ensureRadians(phi, repr);
    }

    public double inDegrees() {
        return Math.toDegrees(phi);
    }

    public double inRadians() {
        return phi;
    }

    public double cos() {
        return Math.cos(phi);
    }

    public double sin() {
        return Math.sin(phi);
    }

    public double acos() {
        return Math.acos(phi);
    }

    public double asin() {
        return Math.asin(phi);
    }
    
    public Angle scale(double s) {
        phi *= s;
        return this;
    }

    public Angle multiply(double phi, Angle.Representation repr) {
        phi *= ensureRadians(phi, repr);
        return this;
    }
    
    public Angle multiply(Angle angle) {
        phi *= angle.phi;
        return this;
    }

    public Angle divide(double phi, Angle.Representation repr) {
        phi /= ensureRadians(phi, repr);
        return this;
    }
    
    public Angle divide(Angle angle) {
        phi /= angle.phi;
        return this;
    }

    public Angle add(double phi, Angle.Representation repr) {
        phi += ensureRadians(phi, repr);
        return this;
    }
    
    public Angle add(Angle angle) {
        phi += angle.phi;
        return this;
    }

    public Angle sub(Angle angle) {
        phi -= angle.phi;
        return this;
    }
    
     public Angle sub(double phi, Angle.Representation repr) {
        phi -= ensureRadians(phi, repr);
        return this;
    }

    public Angle copy() {
        return new Angle(phi, Representation.RAD);
    }

    public Angle copy(Angle a) {
        this.phi = a.phi;
        return this;
    }

    public static double ensureRadians(double val, Representation repr) {
        if (repr == Representation.RAD) {
            return val;
        }
        else if (repr == Representation.DEG) {
            return Math.toRadians(val);
        }
        throw new IllegalArgumentException();
    }
    
    public static Angle rad(double phi) {
        return new Angle(phi, Representation.RAD);
    }
    
    public static Angle deg(double phi) {
        return new Angle(phi, Representation.DEG);
    }

    @Override
    public String toString() {
        return "Angle{" + "inDegrees=" + Math.toDegrees(phi) + ", inRadians=" + phi + '}';
    }

}
