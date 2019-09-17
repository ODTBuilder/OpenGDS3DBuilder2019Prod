/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import java.io.Serializable;
import java.util.*;

/**

 @author laht
 */
public class Vector4d implements Serializable, Copyable {

    protected double x, y, z, w;

    public Vector4d() {
        this(0, 0, 0, 0);
    }

    public Vector4d(double x, double y, double z, double w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public double x() {
        return x;
    }

    public Vector4d x(double x) {
        this.x = x;
        return this;
    }

    public double y() {
        return y;
    }

    public Vector4d y(double y) {
        this.y = y;
        return this;
    }

    public double z() {
        return z;
    }

    public Vector4d z(double z) {
        this.z = z;
        return this;
    }

    public double w() {
        return w;
    }

    public Vector4d w(double w) {
        this.w = w;
        return this;
    }

    public Vector4d set(double x, double y, double z, double w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    }

    public Vector4d setComponent(int index, double value) {
        switch (index) {
            case 0:
                this.x = value;
                break;
            case 1:
                this.y = value;
                break;
            case 2:
                this.z = value;
                break;
            case 3:
                this.w = value;
                break;
            default:
                throw new IllegalArgumentException("Index is out of range: " + index);
        }
        return this;
    }

    public double getComponent(int index) {
        switch (index) {
            case 0:
                return x;
            case 1:
                return y;
            case 2:
                return z;
            case 3:
                return w;
            default:
                throw new IllegalArgumentException("Index is out of range: " + index);
        }
    }

    public Vector4d fromArray(double[] array) {
        return fromArray(array, 0);
    }

    public Vector4d fromArray(double[] array, int offset) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        this.w = array[offset + 2];
        return this;
    }

    public Vector4d fromArray(List<Number> array, int offset) {
        this.x = array.get(offset).doubleValue();
        this.y = array.get(offset + 1).doubleValue();
        this.z = array.get(offset + 2).doubleValue();
        this.z = array.get(offset + 3).doubleValue();
        return this;
    }

    /**
     Copy this

     @return a new vector3 with the same x, y and z values as this one
     */
    public Vector4d copy() {
        return new Vector4d(x, y, z, w);
    }

    /**
     Copies the values of the passed vector3's x, y and z properties to this
     vector3.

     @param v

     @return this
     */
    public Vector4d copy(Vector4d v) {
        return set(v.x, v.y, v.z, v.w);
    }

    public float[] toArrayf() {
        return new float[]{(float) x, (float) y, (float) z, (float) w};
    }

    public double[] toArray() {
        return new double[]{x, y, z, w};
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 47 * hash + (int) (Double.doubleToLongBits(this.x) ^ (Double.doubleToLongBits(this.x) >>> 32));
        hash = 47 * hash + (int) (Double.doubleToLongBits(this.y) ^ (Double.doubleToLongBits(this.y) >>> 32));
        hash = 47 * hash + (int) (Double.doubleToLongBits(this.z) ^ (Double.doubleToLongBits(this.z) >>> 32));
        hash = 47 * hash + (int) (Double.doubleToLongBits(this.w) ^ (Double.doubleToLongBits(this.w) >>> 32));
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
        final Vector4d other = (Vector4d) obj;
        if (Double.doubleToLongBits(this.x) != Double.doubleToLongBits(other.x)) {
            return false;
        }
        if (Double.doubleToLongBits(this.y) != Double.doubleToLongBits(other.y)) {
            return false;
        }
        if (Double.doubleToLongBits(this.z) != Double.doubleToLongBits(other.z)) {
            return false;
        }
        if (Double.doubleToLongBits(this.w) != Double.doubleToLongBits(other.w)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Vector4d{" + "x=" + x + ", y=" + y + ", z=" + z + ", w=" + w + '}';
    }

}
