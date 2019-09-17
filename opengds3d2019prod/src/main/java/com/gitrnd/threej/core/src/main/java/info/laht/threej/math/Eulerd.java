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
public class Eulerd implements Serializable {

    private Angle x, y, z;

    public Eulerd() {
        this(0, 0, 0, Angle.Representation.RAD);
    }

    public Eulerd(double x, double y, double z, Angle.Representation repr) {
        this.x = new Angle(x, repr);
        this.y = new Angle(y, repr);
        this.z = new Angle(z, repr);
    }

    public Angle x() {
        return x;
    }

    public Angle y() {
        return y;
    }

    public Angle z() {
        return z;
    }

    public Eulerd setFromRotationMatrix(Matrix4d m) {
        double[] te = m.elements();
        double m11 = te[0], m12 = te[4], m13 = te[8];
        double m21 = te[1], m22 = te[5], m23 = te[9];
        double m31 = te[2], m32 = te[6], m33 = te[10];

        this.y.set(Math.asin(MathUtil.clamp(m13, - 1, 1)), Angle.Representation.RAD);

        if (Math.abs(m13) < 0.99999) {

            this.x.set(Math.atan2(-m23, m33), Angle.Representation.RAD);
            this.z.set(Math.atan2(-m12, m11), Angle.Representation.RAD);

        }
        else {

            this.x.set(Math.atan2(m32, m22), Angle.Representation.RAD);
            this.z.set(0, Angle.Representation.RAD);

        }

        return this;

    }

    public Eulerd setFromQuaternion(Quaterniond q) {
        Matrix4d matrix = new Matrix4d();
        matrix.makeRotationFromQuaternion(q);
        return this.setFromRotationMatrix(matrix);
    }

    public Vector3d toVector3d(Angle.Representation repr) {
        if (repr == Angle.Representation.RAD) {
            return new Vector3d(x.inRadians(), y.inRadians(), z.inRadians());
        }
        else if (repr == Angle.Representation.DEG) {
            return new Vector3d(x.inDegrees(), y.inDegrees(), z.inDegrees());
        }
        throw new IllegalArgumentException();
    }

    public Eulerd copy() {
        return new Eulerd(x.inRadians(), y.inRadians(), z.inRadians(), Angle.Representation.RAD);
    }

    public Eulerd copy(Eulerd euler) {
        this.x = euler.x;
        this.y = euler.y;
        this.z = euler.z;
        return this;
    }

}
