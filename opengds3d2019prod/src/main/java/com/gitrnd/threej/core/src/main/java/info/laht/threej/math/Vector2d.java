/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import java.io.Serializable;
import java.util.List;

/**

 @author laht
 */
public class Vector2d implements Serializable, Copyable {

    protected double x, y;

    public Vector2d() {
        this(0, 0);
    }

    public Vector2d(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double x() {
        return x;
    }

    public Vector2d x(double x) {
        this.x = x;
        return this;
    }

    public double y() {
        return y;
    }

    public Vector2d y(double y) {
        this.y = y;
        return this;
    }
    
    public Vector2d set(double x, double y) {
        this.x = x;
        this.y = y;
        
        return this;
    }

    public Vector2d setComponent(int index, double value) {
        switch (index) {
            case 0:
                this.x = value;
                break;
            case 1:
                this.y = value;
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
            default:
                throw new IllegalArgumentException("Index is out of range: " + index);
        }
    }

    public Vector2d fromArray(double[] array) {
        return fromArray(array, 0);
    }

    public Vector2d fromArray(double[] array, int offset) {
        this.x = array[offset];
        this.y = array[offset + 1];
        return this;
    }

    public Vector2d fromArray(List<Number> array, int offset) {
        this.x = array.get(offset).doubleValue();
        this.y = array.get(offset + 1).doubleValue();
        return this;
    }

    public Vector2d add(Vector2d v) {

        this.x += v.x;
        this.y += v.y;

        return this;

    }

    public Vector2d add(double s) {

        this.x += s;
        this.y += s;

        return this;

    }

    public Vector2d add(Vector2d a, Vector2d b) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;

        return this;

    }

    public Vector2d addScaled(Vector2d v, double s) {

        this.x += v.x * s;
        this.y += v.y * s;

        return this;

    }

    public Vector2d sub(Vector2d v) {

        this.x -= v.x;
        this.y -= v.y;

        return this;

    }

    public Vector2d sub(double s) {

        this.x -= s;
        this.y -= s;

        return this;

    }

    public Vector2d sub(Vector2d a, Vector2d b) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;

        return this;

    }

    public Vector2d multiply(Vector2d v) {

        this.x *= v.x;
        this.y *= v.y;

        return this;

    }

    public Vector2d multiply(double scalar) {

        if (Double.isFinite(scalar)) {

            this.x *= scalar;
            this.y *= scalar;

        }
        else {

            this.x = 0;
            this.y = 0;

        }

        return this;

    }

    public Vector2d divide(Vector2d v) {

        this.x /= v.x;
        this.y /= v.y;

        return this;

    }

    public Vector2d divide(double scalar) {

        return this.multiply(1d / scalar);

    }

    public Vector2d min(Vector2d v) {

        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);

        return this;

    }

    public Vector2d max(Vector2d v) {

        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);

        return this;

    }

    public float[] toArrayd() {
        return new float[]{(float) x, (float) y};
    }

    public double[] toArray() {
        return new double[]{x, y};
    }

    public Vector2d copy() {
        return new Vector2d(x, y);
    }

    public Vector2d copy(Vector2d v) {
        this.x = v.x;
        this.y = v.y;

        return this;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 97 * hash + (int) (Double.doubleToLongBits(this.x) ^ (Double.doubleToLongBits(this.x) >>> 32));
        hash = 97 * hash + (int) (Double.doubleToLongBits(this.y) ^ (Double.doubleToLongBits(this.y) >>> 32));
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
        final Vector2d other = (Vector2d) obj;
        if (Double.doubleToLongBits(this.x) != Double.doubleToLongBits(other.x)) {
            return false;
        }
        if (Double.doubleToLongBits(this.y) != Double.doubleToLongBits(other.y)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Vector2d{" + "x=" + x + ", y=" + y + '}';
    }

}
