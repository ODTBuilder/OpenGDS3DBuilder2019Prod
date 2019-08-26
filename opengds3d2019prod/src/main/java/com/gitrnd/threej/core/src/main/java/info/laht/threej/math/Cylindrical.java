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
public class Cylindrical implements Serializable {

    public double radius, y;
    public final Angle theta;

    public Cylindrical() {
        this(1, new Angle(), 0);
    }

    public Cylindrical(double radius, Angle theta, double y) {
        this.radius = radius;
        this.theta = theta;
        this.y = y;
    }
    
    public Cylindrical set(double radius, Angle theta, double y) {
        this.radius = radius;
        this.theta.copy(theta);
        this.y = y;
        
        return this;
    }
    
    public Cylindrical copy() {
        return new Cylindrical().copy(this);
    }
    
    public Cylindrical copy(Cylindrical cyl) {
        this.radius = cyl.radius;
        this.theta.copy(cyl.theta);
        this.y = cyl.y;
        
        return this;
    }
    
}
