/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import java.io.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Color implements Serializable, Copyable {

    public float r, g, b;

    public Color() {
        this(1, 1, 1);
    }

    public Color(float r, float g, float b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public Color set(float r, float g, float b) {
        this.r = r;
        this.g = g;
        this.b = b;

        return this;
    }

    public Color set(String hex) {
        java.awt.Color decode = java.awt.Color.decode(hex);
        float[] rgb = decode.getRGBColorComponents(null);
        this.r = rgb[0];
        this.g = rgb[0];
        this.b = rgb[0];

        return this;
    }

    public Color random() {
        return set((float) Math.random(), (float) Math.random(), (float) Math.random());
    }

    public Color add(Color color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;

        return this;
    }

    public Color add(Color color1, Color color2) {
        this.r = color1.r + color2.r;
        this.g = color1.g + color2.g;
        this.b = color1.b + color2.b;

        return this;
    }

    public Color add(float s) {
        this.r += s;
        this.g += s;
        this.b += s;

        return this;
    }

    public Color sub(Color color) {
        this.r = Math.max(0, this.r - color.r);
        this.g = Math.max(0, this.g - color.g);
        this.b = Math.max(0, this.b - color.b);

        return this;
    }

    public Color multiply(Color color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;

        return this;
    }

    public Color multiply(float s) {
        this.r *= s;
        this.g *= s;
        this.b *= s;

        return this;
    }

    public Color lerp(Color color, double alpha) {
        this.r += (color.r - this.r) * alpha;
        this.g += (color.g - this.g) * alpha;
        this.b += (color.b - this.b) * alpha;

        return this;
    }

    public Color copy() {
        return new Color().copy(this);
    }

    public Color copy(Color color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 47 * hash + Float.floatToIntBits(this.r);
        hash = 47 * hash + Float.floatToIntBits(this.g);
        hash = 47 * hash + Float.floatToIntBits(this.b);
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
        final Color other = (Color) obj;
        if (Float.floatToIntBits(this.r) != Float.floatToIntBits(other.r)) {
            return false;
        }
        if (Float.floatToIntBits(this.g) != Float.floatToIntBits(other.g)) {
            return false;
        }
        if (Float.floatToIntBits(this.b) != Float.floatToIntBits(other.b)) {
            return false;
        }
        return true;
    }

    public float[] toArray(float[] array, int offset) {
        float[] result = array == null ? new float[3] : array;
        array[offset] = this.r;
        array[offset + 1] = this.g;
        array[offset + 2] = this.b;
        return result;
    }

    @Override
    public String toString() {
        return "Color{" + "r=" + r + ", g=" + g + ", b=" + b + '}';
    }

}
