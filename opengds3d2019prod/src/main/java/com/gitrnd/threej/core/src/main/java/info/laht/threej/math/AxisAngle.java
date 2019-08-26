/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.Serializable;

/**
 *
 * @author laht
 */
public class AxisAngle implements Serializable {

    private final Vector3d axis;
    private final Angle angle;

    public AxisAngle(Vector3d axis, Angle angle) {
        this.axis = axis;
        this.angle = angle;
    }

    public Vector3d getAxis() {
        return axis;
    }

    public Angle getAngle() {
        return angle;
    }

    @Override
    public String toString() {
        return "AxisAngle{" + "axis=" + axis + ", angle=" + angle + '}';
    }
    
    

}
