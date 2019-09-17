/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.*;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Matrix3d implements Serializable {

    protected double[] elements;

    public Matrix3d() {
        this.elements = new double[]{
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        };
    }

    public Matrix3d set(double n11, double n12, double n13,
            double n21, double n22, double n23,
            double n31, double n32, double n33) {

        double[] te = this.elements;

        te[0] = n11;
        te[1] = n21;
        te[2] = n31;
        te[3] = n12;
        te[4] = n22;
        te[5] = n32;
        te[6] = n13;
        te[7] = n23;
        te[8] = n33;

        return this;

    }

    public Matrix3d identity() {
        return this.set(
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
        );
    }

    public Matrix3d setFromMatrix4(Matrix4d m) {
        double[] me = m.elements();

        this.set(
                me[0], me[4], me[8],
                me[1], me[5], me[9],
                me[2], me[6], me[10]
        );

        return this;
    }

    public double determinant() {
        double[] te = this.elements;

        double a = te[0], b = te[1], c = te[2],
                d = te[3], e = te[4], f = te[5],
                g = te[6], h = te[7], i = te[8];

        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    }

    public Matrix3d getInverse(Matrix3d matrix) {
        double[] me = matrix.elements,
                te = this.elements;

        double n11 = me[0], n21 = me[1], n31 = me[2],
                n12 = me[3], n22 = me[4], n32 = me[5],
                n13 = me[6], n23 = me[7], n33 = me[8],
                t11 = n33 * n22 - n32 * n23,
                t12 = n32 * n13 - n33 * n12,
                t13 = n23 * n12 - n22 * n13,
                det = n11 * t11 + n21 * t12 + n31 * t13;

        if (det == 0) {

            System.err.println("THREE.Matrix3.getInverse(): can't invert matrix, determinant is 0");

            return this.identity();
        }

        double detInv = 1d / det;

        te[0] = t11 * detInv;
        te[1] = (n31 * n23 - n33 * n21) * detInv;
        te[2] = (n32 * n21 - n31 * n22) * detInv;

        te[3] = t12 * detInv;
        te[4] = (n33 * n11 - n31 * n13) * detInv;
        te[5] = (n31 * n12 - n32 * n11) * detInv;

        te[6] = t13 * detInv;
        te[7] = (n21 * n13 - n23 * n11) * detInv;
        te[8] = (n22 * n11 - n21 * n12) * detInv;

        return this;
    }

    public Matrix3d transpose() {
        double[] m = this.elements;
        double tmp;

        tmp = m[1];
        m[1] = m[3];
        m[3] = tmp;
        tmp = m[2];
        m[2] = m[6];
        m[6] = tmp;
        tmp = m[5];
        m[5] = m[7];
        m[7] = tmp;

        return this;
    }

    public Matrix3d transposeIntoArray(double[] r) {
        double[] m = this.elements;

        r[0] = m[0];
        r[1] = m[3];
        r[2] = m[6];
        r[3] = m[1];
        r[4] = m[4];
        r[5] = m[7];
        r[6] = m[2];
        r[7] = m[5];
        r[8] = m[8];

        return this;
    }

    public Matrix3d getNormalMatrix(Matrix4d matrix4) {
        return this.setFromMatrix4(matrix4).getInverse(this).transpose();
    }

    public Matrix3d copy() {
        return new Matrix3d().copy(this);
    }

    public Matrix3d copy(Matrix3d m) {
        System.arraycopy(m.elements, 0, elements, 0, m.elements.length);
        return this;
    }

}
