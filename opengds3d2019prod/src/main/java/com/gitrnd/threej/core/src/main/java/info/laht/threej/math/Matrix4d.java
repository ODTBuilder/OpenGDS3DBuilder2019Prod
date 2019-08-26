/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.Serializable;
import java.nio.FloatBuffer;

/**
 https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js

 @author laht
 */
public final class Matrix4d implements Serializable {

    protected final double[] elements;

    /**
     Creates and initializes the Matrix4 to the 4x4 identity matrix.
     */
    public Matrix4d() {
        this.elements = new double[]{
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1};
    }

    /**
     Set the elements of this matrix to the supplied row-major values n11,
     n12, ... n44.

     @param n11
     @param n12
     @param n13
     @param n14
     @param n21
     @param n22
     @param n23
     @param n24
     @param n31
     @param n32
     @param n33
     @param n34
     @param n41
     @param n42
     @param n43
     @param n44

     @return this
     */
    public Matrix4d set(double n11, double n12, double n13, double n14,
                        double n21, double n22, double n23, double n24,
                        double n31, double n32, double n33, double n34,
                        double n41, double n42, double n43, double n44) {

        elements[0] = n11;
        elements[4] = n12;
        elements[8] = n13;
        elements[12] = n14;
        elements[1] = n21;
        elements[5] = n22;
        elements[9] = n23;
        elements[13] = n24;
        elements[2] = n31;
        elements[6] = n32;
        elements[10] = n33;
        elements[14] = n34;
        elements[3] = n41;
        elements[7] = n42;
        elements[11] = n43;
        elements[15] = n44;

        return this;

    }

    /**
     Sets the position component for this matrix from vector v, without
     affecting the rest of the matrix - i.e. if the matrix is currently:

     @param v

     @return this
     */
    public Matrix4d setPosition(Vector3d v) {
        elements[12] = v.x;
        elements[13] = v.y;
        elements[14] = v.z;

        return this;
    }

    /**
     Resets this matrix to the identity matrix.

     @return this
     */
    public Matrix4d identity() {
        return set(1, 0, 0, 0,
                   0, 1, 0, 0,
                   0, 0, 1, 0,
                   0, 0, 0, 1);
    }

    public Matrix4d fromArray(double[] arr) {
        if (arr.length != 16) {
            throw new IllegalArgumentException();
        }
        System.arraycopy(arr, 0, elements, 0, arr.length);
        return this;
    }

    public Matrix4d copyPosition(Matrix4d m) {
        elements[12] = m.elements[12];
        elements[13] = m.elements[13];
        elements[14] = m.elements[14];
        return this;
    }

    /**
     Constructs a rotation matrix, looking from eye towards center oriented by
     the up vector.

     @param eye
     @param target
     @param up

     @return this
     */
    public Matrix4d lookAt(Vector3d eye, Vector3d target, Vector3d up) {

        Vector3d x = new Vector3d(), y = new Vector3d(), z = new Vector3d();

        z.sub(eye, target);

        if (z.lengthSq() == 0) {
            z.z = 1;
        }

        x.cross(up, z).normalize();

        if (x.lengthSq() == 0) {
            z.z += 0.0001;
            x.cross(up, z).normalize();
        }

        y.cross(z, x);

        elements[0] = x.x;
        elements[4] = y.x;
        elements[8] = z.x;
        elements[1] = x.y;
        elements[5] = y.y;
        elements[9] = z.y;
        elements[2] = x.z;
        elements[6] = y.z;
        elements[10] = z.z;

        return this;
    }

    /**
     Post-multiplies this matrix by m.

     @param m

     @return this
     */
    public Matrix4d multiply(Matrix4d m) {
        return this.multiply(this, m);
    }

    /**
     Pre-multiplies this matrix by m.

     @param m

     @return this
     */
    public Matrix4d preMultiply(Matrix4d m) {
        return this.multiply(m, this);
    }

    /**
     Sets this matrix to a x b.

     @param a
     @param b

     @return this
     */
    public Matrix4d multiply(Matrix4d a, Matrix4d b) {
        double[] ae = a.elements;
        double[] be = b.elements;

        double a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        double a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        double a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        double a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        double b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        double b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        double b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        double b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        elements[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        elements[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        elements[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        elements[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        elements[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        elements[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        elements[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        elements[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        elements[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        elements[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        elements[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        elements[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        elements[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        elements[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        elements[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        elements[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    }

    /**
     Multiplies every component of the matrix by a scalar value s.

     @param s

     @return this
     */
    public Matrix4d multiply(double s) {
        double[] te = this.elements;

        te[0] *= s;
        te[4] *= s;
        te[8] *= s;
        te[12] *= s;
        te[1] *= s;
        te[5] *= s;
        te[9] *= s;
        te[13] *= s;
        te[2] *= s;
        te[6] *= s;
        te[10] *= s;
        te[14] *= s;
        te[3] *= s;
        te[7] *= s;
        te[11] *= s;
        te[15] *= s;

        return this;
    }

    /**
     Computes and returns the determinant of this matrix.

     @return
     */
    public double determinant() {
        double[] te = this.elements;

        double n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        double n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        double n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        double n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

        //TODO: make this more efficient
        //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
        return (n41 * (+n14 * n23 * n32
                       - n13 * n24 * n32
                       - n14 * n22 * n33
                       + n12 * n24 * n33
                       + n13 * n22 * n34
                       - n12 * n23 * n34)
                + n42 * (+n11 * n23 * n34
                         - n11 * n24 * n33
                         + n14 * n21 * n33
                         - n13 * n21 * n34
                         + n13 * n24 * n31
                         - n14 * n23 * n31)
                + n43 * (+n11 * n24 * n32
                         - n11 * n22 * n34
                         - n14 * n21 * n32
                         + n12 * n21 * n34
                         + n14 * n22 * n31
                         - n12 * n24 * n31)
                + n44 * (-n13 * n22 * n31
                         - n11 * n23 * n32
                         + n11 * n22 * n33
                         + n13 * n21 * n32
                         - n12 * n21 * n33
                         + n12 * n23 * n31));
    }

    /**
     Transposes this matrix.

     @return this
     */
    public Matrix4d transpose() {
        double[] te = this.elements;
        double tmp;

        tmp = te[1];
        te[1] = te[4];
        te[4] = tmp;
        tmp = te[2];
        te[2] = te[8];
        te[8] = tmp;
        tmp = te[6];
        te[6] = te[9];
        te[9] = tmp;

        tmp = te[3];
        te[3] = te[12];
        te[12] = tmp;
        tmp = te[7];
        te[7] = te[13];
        te[13] = tmp;
        tmp = te[11];
        te[11] = te[14];
        te[14] = tmp;

        return this;
    }

    /**
     Set this matrix to the inverse. If the matrix is not invertible, set this
     to the 4x4 identity matrix.
     * @param m
     @return this
     */
    public Matrix4d getInverse(Matrix4d m) {
        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        double[] te = this.elements, me = m.elements;

        double n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
                n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
                n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
                n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
                t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
                t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
                t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
                t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        double det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det == 0) {
            System.err.println("Matrix4.invert(): can't invert matrix, determinant is 0");
            return this.identity();
        }

        double detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

        return this;
    }

    /**
     Set this to the basis matrix consisting of the three provided basis vectors:

     @param xAxis
     @param yAxis
     @param zAxis

     @return
     */
    public Matrix4d makeBasis(Vector3d xAxis, Vector3d yAxis, Vector3d zAxis) {
        this.set(
                xAxis.x(), yAxis.x(), zAxis.x(), 0,
                xAxis.y(), yAxis.y(), zAxis.y(), 0,
                xAxis.z(), yAxis.z(), zAxis.z(), 0,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as a rotational transformation around the X axis by
     theta (θ).

     @param theta Rotation angle

     @return this
     */
    public Matrix4d makeRotationX(Angle theta) {
        double c = theta.cos(), s = theta.sin();

        this.set(
                1, 0, 0, 0,
                0, c, -s, 0,
                0, s, c, 0,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as a rotational transformation around the Y axis by
     theta (θ).

     @param theta Rotation angle

     @return this
     */
    public Matrix4d makeRotationY(Angle theta) {
        double c = theta.cos(), s = theta.sin();

        this.set(
                c, 0, s, 0,
                0, 1, 0, 0,
                -s, 0, c, 0,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as a rotational transformation around the Z axis by
     theta (θ).

     @param theta Rotation angle

     @return this
     */
    public Matrix4d makeRotationZ(Angle theta) {
        double c = theta.cos(), s = theta.sin();

        this.set(
                c, -s, 0, 0,
                s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as rotation transform around axis by theta radians. This
     is a somewhat controversial but mathematically sound alternative to
     rotating via Quaternions.

     @param axis  Rotation axis, should be normalized.
     @param angle Rotation angle

     @return
     */
    public Matrix4d makeRotationAxis(Vector3d axis, Angle angle) {
        // Based on http://www.gamedev.net/reference/articles/article1199.asp

        double c = angle.cos();
        double s = angle.sin();
        double t = 1 - c;
        double x = axis.x, y = axis.y, z = axis.z;
        double tx = t * x, ty = t * y;

        this.set(
                tx * x + c, tx * y - s * z, tx * z + s * y, 0,
                tx * y + s * z, ty * y + c, ty * z - s * x, 0,
                tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
                0, 0, 0, 1
        );

        return this;
    }

    public Matrix4d makeRotationAxis(AxisAngle aa) {
        return makeRotationAxis(aa.getAxis(), aa.getAngle());
    }

    /**
     Sets the rotation component of this matrix to the rotation specified by
     q, as outlined here. The rest of the matrix is set to the identity. So,
     given q = w + xi + yj + zk

     @param q

     @return this
     */
    public Matrix4d makeRotationFromQuaternion(Quaterniond q) {
        double[] te = this.elements;

        double x = q.x(), y = q.y(), z = q.z(), w = q.w();
        double x2 = x + x, y2 = y + y, z2 = z + z;
        double xx = x * x2, xy = x * y2, xz = x * z2;
        double yy = y * y2, yz = y * z2, zz = z * z2;
        double wx = w * x2, wy = w * y2, wz = w * z2;

        te[0] = 1 - (yy + zz);
        te[4] = xy - wz;
        te[8] = xz + wy;

        te[1] = xy + wz;
        te[5] = 1 - (xx + zz);
        te[9] = yz - wx;

        te[2] = xz - wy;
        te[6] = yz + wx;
        te[10] = 1 - (xx + yy);

        // last column
        te[3] = 0;
        te[7] = 0;
        te[11] = 0;

        // bottom row
        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;

        return this;
    }

    /**
     Sets the rotation component (the upper left 3x3 matrix) of this matrix to the rotation specified by the given Euler Angle. The rest of the matrix is set to the identity.

     @param euler

     @return
     */
    public Matrix4d makeRotationFromEuler(Eulerd euler) {
        double[] te = this.elements;

        double x = euler.x().inRadians(), y = euler.y().inRadians(), z = euler.z().inRadians();
        double a = Math.cos(x), b = Math.sin(x);
        double c = Math.cos(y), d = Math.sin(y);
        double e = Math.cos(z), f = Math.sin(z);

        double ae = a * e, af = a * f, be = b * e, bf = b * f;

        te[0] = c * e;
        te[4] = -c * f;
        te[8] = d;

        te[1] = af + be * d;
        te[5] = ae - bf * d;
        te[9] = -b * c;

        te[2] = bf - ae * d;
        te[6] = be + af * d;
        te[10] = a * c;

        // last column
        te[3] = 0;
        te[7] = 0;
        te[11] = 0;

        // bottom row
        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;

        return this;
    }

    /**
     Sets this matrix as scale transform

     @param x the amount to scale in the X axis.
     @param y the amount to scale in the Y axis.
     @param z the amount to scale in the Z axis.

     @return this
     */
    public Matrix4d makeScale(double x, double y, double z) {
        this.set(
                x, 0, 0, 0,
                0, y, 0, 0,
                0, 0, z, 0,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as a shear transform

     @param x the amount to shear in the X axis.
     @param y the amount to shear in the Y axis.
     @param z the amount to shear in the Z axis.

     @return
     */
    public Matrix4d makeShear(double x, double y, double z) {
        this.set(
                1, y, z, 0,
                x, 1, z, 0,
                x, y, 1, 0,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as a translation transform

     @param x the amount to translate in the X axis.
     @param y the amount to translate in the Y axis.
     @param z the amount to translate in the Z axis.

     @return this
     */
    public Matrix4d makeTranslation(double x, double y, double z) {
        this.set(
                1, 0, 0, x,
                0, 1, 0, y,
                0, 0, 1, z,
                0, 0, 0, 1
        );

        return this;
    }

    /**
     Sets this matrix as a translation transform:

     @param v the amount to translate in the X, Y and Z axis

     @return this
     */
    public Matrix4d makeTranslation(Vector3d v) {
        return makeTranslation(v.x(), v.y(), v.z());
    }

    public Matrix4d scale(Vector3d v) {
        elements[0] *= v.x();
        elements[4] *= v.y();
        elements[8] *= v.z();
        elements[1] *= v.x();
        elements[5] *= v.y();
        elements[9] *= v.z();
        elements[2] *= v.x();
        elements[6] *= v.y();
        elements[10] *= v.z();
        elements[3] *= v.x();
        elements[7] *= v.y();
        elements[11] *= v.z();

        return this;
    }

    /**
     Gets the maximum scale value of the 3 axes.

     @return
     */
    public double getMaxScaleOnAxis() {
        double[] te = this.elements;

        double scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
        double scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
        double scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

        return Math.sqrt(Math.max(Math.max(scaleXSq, scaleYSq), scaleZSq));
    }

    public Matrix4d compose(Vector3d position, Quaterniond quaternion, Vector3d scale) {
        this.makeRotationFromQuaternion(quaternion);
        this.scale(scale);
        this.setPosition(position);

        return this;
    }

    public Matrix4d decompose(Vector3d position, Quaterniond quaternion, Vector3d scale) {

        Vector3d vector = new Vector3d();
        Matrix4d matrix = new Matrix4d();

        double[] te = this.elements;

        double sx = vector.set(te[0], te[1], te[2]).length();
        double sy = vector.set(te[4], te[5], te[6]).length();
        double sz = vector.set(te[8], te[9], te[10]).length();

        // if determine is negative, we need to invert one scale
        double det = this.determinant();
        if (det < 0) {

            sx = -sx;

        }

        position.x = te[12];
        position.y = te[13];
        position.z = te[14];

        // scale the rotation part
        matrix.fromArray(this.elements);

        double invSX = 1 / sx;
        double invSY = 1 / sy;
        double invSZ = 1 / sz;

        matrix.elements[0] *= invSX;
        matrix.elements[1] *= invSX;
        matrix.elements[2] *= invSX;

        matrix.elements[4] *= invSY;
        matrix.elements[5] *= invSY;
        matrix.elements[6] *= invSY;

        matrix.elements[8] *= invSZ;
        matrix.elements[9] *= invSZ;
        matrix.elements[10] *= invSZ;

        quaternion.setFromRotationMatrix(matrix);

        scale.x = sx;
        scale.y = sy;
        scale.z = sz;

        return this;

    }

    public Matrix4d makePerspective(double left, double right, double top, double bottom, double near, double far) {
        double[] te = this.elements;
        double x = 2 * near / (right - left);
        double y = 2 * near / (top - bottom);

        double a = (right + left) / (right - left);
        double b = (top + bottom) / (top - bottom);
        double c = -(far + near) / (far - near);
        double d = - 2 * far * near / (far - near);

        te[0] = x;
        te[4] = 0;
        te[8] = a;
        te[12] = 0;
        te[1] = 0;
        te[5] = y;
        te[9] = b;
        te[13] = 0;
        te[2] = 0;
        te[6] = 0;
        te[10] = c;
        te[14] = d;
        te[3] = 0;
        te[7] = 0;
        te[11] = - 1;
        te[15] = 0;

        return this;
    }

    public Matrix4d makeOrthographic(double left, double right, double top, double bottom, double near, double far) {
        double[] te = this.elements;
        double w = 1.0 / (right - left);
        double h = 1.0 / (top - bottom);
        double p = 1.0 / (far - near);

        double x = (right + left) * w;
        double y = (top + bottom) * h;
        double z = (far + near) * p;

        te[0] = 2 * w;
        te[4] = 0;
        te[8] = 0;
        te[12] = -x;
        te[1] = 0;
        te[5] = 2 * h;
        te[9] = 0;
        te[13] = -y;
        te[2] = 0;
        te[6] = 0;
        te[10] = - 2 * p;
        te[14] = -z;
        te[3] = 0;
        te[7] = 0;
        te[11] = 0;
        te[15] = 1;

        return this;
    }
    
    public Matrix4d copy() {
        return new Matrix4d().copy(this);
    }
    
    public Matrix4d copy(Matrix4d m) {
        System.arraycopy(m.elements, 0, elements, 0, m.elements.length);
        return this;
    }
    
    public void store(FloatBuffer buf) {
        buf.put((float) elements[0]);
        buf.put((float) elements[1]);
        buf.put((float) elements[2]);
        buf.put((float) elements[3]);
        buf.put((float) elements[4]);
        buf.put((float) elements[5]);
        buf.put((float) elements[6]);
        buf.put((float) elements[7]);
        buf.put((float) elements[8]);
        buf.put((float) elements[9]);
        buf.put((float) elements[10]);
        buf.put((float) elements[11]);
        buf.put((float) elements[12]);
        buf.put((float) elements[13]);
        buf.put((float) elements[14]);
        buf.put((float) elements[15]);
    }

    public double[] elements() {
        return elements;
    }

}
