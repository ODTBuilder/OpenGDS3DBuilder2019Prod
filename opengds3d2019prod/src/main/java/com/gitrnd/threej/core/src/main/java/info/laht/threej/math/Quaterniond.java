/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.Serializable;

/**
 https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js

 @author laht
 */
public class Quaterniond implements Serializable {

    private double x, y, z, w;

    public Quaterniond() {
        this(0, 0, 0, 1);
    }

    public Quaterniond(double x, double y, double z, double w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public double x() {
        return x;
    }

    public double y() {
        return y;
    }

    public double z() {
        return z;
    }

    public double w() {
        return w;
    }

    public Quaterniond set(double x, double y, double z, double w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    }

    /**
     Computes the Euclidean length (straight-line length) of this quaternion,
     considered as a 4 dimensional vector.

     @return
     */
    public double length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    /**
     Computes the Euclidean length (straight-line length) of this quaternion,
     considered as a 4 dimensional vector. This can be useful if you are
     comparing the lengths of two quaternions, as this is a slightly more
     efficient calculation than length().

     @return
     */
    public double lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    /**
     Calculate the dot product of quaternions v and this one.

     @param v

     @return
     */
    public double dot(Quaterniond v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    /**
     Normalizes this quaternion - that is, calculated the quaternion that
     performs the same rotation as this one, but has length equal to 1.

     @return this
     */
    public Quaterniond normalize() {
        double l = this.length();

        if (l == 0) {

            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 1;

        }
        else {

            l = 1d / l;

            this.x = this.x * l;
            this.y = this.y * l;
            this.z = this.z * l;
            this.w = this.w * l;

        }

        return this;
    }

    /**
     Inverts this quaternion - calculate the conjugate and then normalizes the
     result.

     @return this
     */
    public Quaterniond inverse() {
        return this.conjugate().normalize();
    }

    /**
     Returns the rotational conjugate of this quaternion. The conjugate of a
     quaternion represents the same rotation in the opposite direction about
     the rotational axis.

     @return this
     */
    public Quaterniond conjugate() {
        this.x *= - 1;
        this.y *= - 1;
        this.z *= - 1;
        return this;
    }

    public Quaterniond setFromEuler(Eulerd euler) {

        double c1 = Math.cos(euler.x().inRadians() / 2);
        double c2 = Math.cos(euler.y().inRadians() / 2);
        double c3 = Math.cos(euler.z().inRadians() / 2);
        double s1 = Math.sin(euler.x().inRadians() / 2);
        double s2 = Math.sin(euler.y().inRadians() / 2);
        double s3 = Math.sin(euler.z().inRadians() / 2);

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;

        return this;
    }

    public Quaterniond setFromAxisAngle(Vector3d axis, Angle angle) {
        double rad = angle.inRadians();
        double halfAngle = rad / 2, s = Math.sin(halfAngle);

        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(halfAngle);

        return this;
    }

    /**
     Sets this quaternion from rotation specified by axis and angle. Adapted
     from the method here. Axis is assumed to be normalized.

     @param aa

     @return this
     */
    public Quaterniond setFromAxisAngle(AxisAngle aa) {
        return setFromAxisAngle(aa.getAxis(), aa.getAngle());
    }

    /**
     Sets this quaternion to the rotation required to rotate direction vector
     vFrom to direction vector vTo. Adapted from the method here. vFrom and
     vTo are assumed to be normalized.

     @param vFrom
     @param vTo

     @return this
     */
    public Quaterniond setFromUnitVectors(Vector3d vFrom, Vector3d vTo) {
        Vector3d v1 = new Vector3d();

        double EPS = 0.000001;

        double r = vFrom.dot(vTo) + 1;

        if (r < EPS) {
            r = 0;

            if (Math.abs(vFrom.x()) > Math.abs(vFrom.z())) {
                v1.set(-vFrom.y, vFrom.x, 0);
            }
            else {
                v1.set(0, -vFrom.z, vFrom.y);
            }
        }
        else {
            v1.cross(vFrom, vTo);
        }

        this.x = v1.x;
        this.y = v1.y;
        this.z = v1.z;
        this.w = r;

        return this.normalize();
    }

    public Quaterniond setFromRotationMatrix(Matrix4d m) {
        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
        double[] te = m.elements();

        double m11 = te[0], m12 = te[4], m13 = te[8],
                m21 = te[1], m22 = te[5], m23 = te[9],
                m31 = te[2], m32 = te[6], m33 = te[10],
                trace = m11 + m22 + m33,
                s;

        if (trace > 0) {

            s = 0.5 / Math.sqrt(trace + 1.0);

            this.w = 0.25 / s;
            this.x = (m32 - m23) * s;
            this.y = (m13 - m31) * s;
            this.z = (m21 - m12) * s;

        }
        else if (m11 > m22 && m11 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

            this.w = (m32 - m23) / s;
            this.x = 0.25 * s;
            this.y = (m12 + m21) / s;
            this.z = (m13 + m31) / s;

        }
        else if (m22 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            this.w = (m13 - m31) / s;
            this.x = (m12 + m21) / s;
            this.y = 0.25 * s;
            this.z = (m23 + m32) / s;

        }
        else {

            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            this.w = (m21 - m12) / s;
            this.x = (m13 + m31) / s;
            this.y = (m23 + m32) / s;
            this.z = 0.25 * s;

        }

        return this;
    }

    /**
     Multiplies this quaternion by q.

     @param q

     @return this
     */
    public Quaterniond multiply(Quaterniond q) {
        return this.multiply(this, q);
    }

    /**
     Pre-multiplies this quaternion by q.

     @param q

     @return this
     */
    public Quaterniond preMultiply(Quaterniond q) {
        return this.multiply(q, this);
    }

    /**
     Sets this quaternion to a x b.

     @param a
     @param b

     @return this
     */
    public Quaterniond multiply(Quaterniond a, Quaterniond b) {
        // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

        double qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        double qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

        this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return this;
    }

    /**
     Handles the spherical linear interpolation between quaternions. t
     represents the amount of rotation between this quaternion (where t is 0)
     and qb (where t is 1). This quaternion is set to the result. .

     @param qb The other quaternion rotation
     @param t  interpolation factor in the closed interval [0, 1].

     @return this
     */
    public Quaterniond slerp(Quaterniond qb, double t) {
        if (t == 0) {
            return this;
        }
        if (t == 1) {
            return this.copy(qb);
        }

        double _x = this.x, _y = this.y, _z = this.z, _w = this.w;

        // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
        double cosHalfTheta = _w * qb.w + _x * qb.x + _y * qb.y + _z * qb.z;

        if (cosHalfTheta < 0) {

            this.w = -qb.w;
            this.x = -qb.x;
            this.y = -qb.y;
            this.z = -qb.z;

            cosHalfTheta = -cosHalfTheta;

        }
        else {

            this.copy(qb);

        }

        if (cosHalfTheta >= 1.0) {

            this.w = _w;
            this.x = _x;
            this.y = _y;
            this.z = _z;

            return this;

        }

        double sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001) {

            this.w = 0.5 * (_w + this.w);
            this.x = 0.5 * (_x + this.x);
            this.y = 0.5 * (_y + this.y);
            this.z = 0.5 * (_z + this.z);

            return this;

        }

        double halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        double ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
                ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        this.w = (_w * ratioA + this.w * ratioB);
        this.x = (_x * ratioA + this.x * ratioB);
        this.y = (_y * ratioA + this.y * ratioB);
        this.z = (_z * ratioA + this.z * ratioB);

        return this;
    }

    public Quaterniond copy() {
        return new Quaterniond(x, y, z, w);
    }

    public Quaterniond copy(Quaterniond q) {
        return set(q.x, q.y, q.z, q.w);
    }

    public float[] toArrayf() {
        return new float[]{(float) x, (float) y, (float) z, (float) w};
    }

    public double[] toArray() {
        return new double[]{x, y, z, w};
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 67 * hash + (int) (Double.doubleToLongBits(this.x) ^ (Double.doubleToLongBits(this.x) >>> 32));
        hash = 67 * hash + (int) (Double.doubleToLongBits(this.y) ^ (Double.doubleToLongBits(this.y) >>> 32));
        hash = 67 * hash + (int) (Double.doubleToLongBits(this.z) ^ (Double.doubleToLongBits(this.z) >>> 32));
        hash = 67 * hash + (int) (Double.doubleToLongBits(this.w) ^ (Double.doubleToLongBits(this.w) >>> 32));
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
        final Quaterniond other = (Quaterniond) obj;
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
        return "Quaterniond{" + "x=" + x + ", y=" + y + ", z=" + z + ", w=" + w + '}';
    }

}
