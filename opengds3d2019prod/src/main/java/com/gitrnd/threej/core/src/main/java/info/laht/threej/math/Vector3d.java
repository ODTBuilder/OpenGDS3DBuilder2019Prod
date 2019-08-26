/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.Camera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferAttribute;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import java.io.*;
import java.nio.FloatBuffer;
import java.util.List;

/**
 * https://github.com/mrdoob/three.js/blob/dev/src/math/Vector3.js
 *
 * @author laht
 */
public class Vector3d implements Serializable, Copyable {

    protected double x, y, z;

    public Vector3d() {
        this(0, 0, 0);
    }

    public Vector3d(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public double x() {
        return x;
    }

    public Vector3d x(double x) {
        this.x = x;
        return this;
    }

    public double y() {
        return y;
    }

    public Vector3d y(double y) {
        this.y = y;
        return this;
    }

    public double z() {
        return z;
    }

    public Vector3d z(double z) {
        this.z = z;
        return this;
    }

    public Vector3d set(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    public Vector3d setComponent(int index, double value) {
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
            default:
                throw new IllegalArgumentException("Index is out of range: " + index);
        }
    }

    public Vector3d fromArray(double[] array) {
        return fromArray(array, 0);
    }

    public Vector3d fromArray(double[] array, int offset) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        return this;
    }

    public Vector3d fromArray(List<Number> array, int offset) {
        this.x = array.get(offset).doubleValue();
        this.y = array.get(offset + 1).doubleValue();
        this.z = array.get(offset + 2).doubleValue();
        return this;
    }

    public Vector3d fromBufferAttribute(BufferAttribute attribute, int index) {

        this.x(attribute.getX(index).doubleValue());
        this.y(attribute.getY(index).doubleValue());
        this.z(attribute.getZ(index).doubleValue());

        return this;

    }

    /**
     * Add the scalar value s to this vector's x, y and z values.
     *
     * @param s
     *
     * @return this
     */
    public Vector3d add(double s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    }

    /**
     * Adds v to this vector.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d add(Vector3d v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }

    /**
     * Sets this vector to a + b.
     *
     * @param a
     * @param b
     *
     * @return this
     */
    public Vector3d add(Vector3d a, Vector3d b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;
    }

    /**
     * ubtracts s from this vector's x, y and z compnents.
     *
     * @param s
     *
     * @return this
     */
    public Vector3d sub(double s) {
        this.x -= s;
        this.y -= s;
        this.z -= s;

        return this;
    }

    /**
     * Subtracts v from this vector.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d sub(Vector3d v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;
    }

    /**
     * Sets this vector to a - b.
     *
     * @param a
     * @param b
     *
     * @return
     */
    public Vector3d sub(Vector3d a, Vector3d b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;
    }

    /**
     * Multiplies this vector by scalar s.
     *
     * @param scalar
     *
     * @return this
     */
    public Vector3d multiply(double scalar) {

        if (Double.isFinite(scalar)) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }

        return this;

    }

    /**
     * Multiplies this vector by v.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d multiply(Vector3d v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;
    }

    /**
     * Sets this vector equal to a x b.
     *
     * @param a
     * @param b
     *
     * @return this
     */
    public Vector3d multiply(Vector3d a, Vector3d b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;
    }

    /**
     * Divides this vector by scalar s. Sets vector to ( 0, 0 ) if *s = 0*.
     *
     * @param scalar
     *
     * @return this
     */
    public Vector3d divide(double scalar) {
        return this.multiply(1 / scalar);
    }

    /**
     * Divides this vector by v.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d divide(Vector3d v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;

        return this;
    }

    /**
     * Transforms the direction of this vector by a matrix (the upper left 3 x 3
     * subset of a m) and then normalizes the result.
     *
     * @param m
     *
     * @return this
     */
    public Vector3d transformDirection(Matrix4d m) {

        double _x = this.x, _y = this.y, _z = this.z;
        double[] e = m.elements();

        this.x = e[0] * _x + e[4] * _y + e[8] * _z;
        this.y = e[1] * _x + e[5] * _y + e[9] * _z;
        this.z = e[2] * _x + e[6] * _y + e[10] * _z;

        return this.normalize();
    }

    /**
     * Applies a Quaternion transform to this vector.
     *
     * @param q
     *
     * @return this
     */
    public Vector3d applyQuaternion(Quaterniond q) {
        double _x = this.x, _y = this.y, _z = this.z;
        double qx = q.x(), qy = q.y(), qz = q.z(), qw = q.w();

        // calculate quat * vector
        double ix = qw * _x + qy * _z - qz * _y;
        double iy = qw * _y + qz * _x - qx * _z;
        double iz = qw * _z + qx * _y - qy * _x;
        double iw = -qx * _x - qy * _y - qz * _z;

        // calculate result * inverse quat
        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return this;
    }

    public Vector3d applyMatrix3(Matrix3d m) {
        double x = this.x, y = this.y, z = this.z;
        double[] e = m.elements;

        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;

        return this;
    }

    /**
     * Multiply this vector by 4 x 3 subset of a m. If m is:
     *
     * @param m
     *
     * @return
     */
    public Vector3d applyMatrix4(Matrix4d m) {
        double _x = this.x, _y = this.y, _z = this.z;
        double[] e = m.elements();

        this.x = e[0] * _x + e[4] * _y + e[8] * _z + e[12];
        this.y = e[1] * _x + e[5] * _y + e[9] * _z + e[13];
        this.z = e[2] * _x + e[6] * _y + e[10] * _z + e[14];

        return this;
    }

    /**
     * Calculate the dot product of this vector and v.
     *
     * @param v
     *
     * @return
     */
    public double dot(Vector3d v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Sets this vector to cross product of itself and v.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d cross(Vector3d v) {
        double _x = this.x, _y = this.y, _z = this.z;

        this.x = _y * v.z - _z * v.y;
        this.y = _z * v.x - _x * v.z;
        this.z = _x * v.y - _y * v.x;

        return this;
    }

    /**
     * Sets this vector to cross product of a and b.
     *
     * @param a
     * @param b
     *
     * @return this
     */
    public Vector3d cross(Vector3d a, Vector3d b) {
        double ax = a.x, ay = a.y, az = a.z;
        double bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }

    /**
     * If this vector's x, y or z value is less than v's x, y or z value,
     * replace that value with the corresponding max value
     *
     * @param v
     *
     * @return this
     */
    public Vector3d min(Vector3d v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);

        return this;
    }

    /**
     * If this vector's x, y or z value is greater than v's x, y or z value,
     * replace that value with the corresponding min value.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d max(Vector3d v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);

        return this;
    }

    /**
     * If this vector's x, y or z value is greater than the max vector's x, y or
     * z value, it is replaced by the corresponding value.
     * <br>
     * If this vector's x, y or z value is less than the min vector's x, y or z
     * value, it is replaced by the corresponding value.
     *
     * @param min the minimum x, y and z values.
     * @param max the maximum x, y and z values.
     *
     * @return
     */
    public Vector3d clamp(Vector3d min, Vector3d max) {
        // This function assumes min < max, if this assumption isn't true it will not operate correctly

        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        this.z = Math.max(min.z, Math.min(max.z, this.z));

        return this;
    }

    /**
     * If this vector's x, y or z values are greater than the max value, they
     * are replaced by the max value.
     * <br>
     * If this vector's x, y or z values are less than the min value, they are
     * replaced by the min value.
     *
     * @param minVal the minimum value the components will be clamped to
     * @param maxVal the maximum value the components will be clamped to
     *
     * @return
     */
    public Vector3d clamp(double minVal, double maxVal) {
        this.x = Math.max(minVal, Math.min(maxVal, this.x));
        this.y = Math.max(minVal, Math.min(maxVal, this.y));
        this.z = Math.max(minVal, Math.min(maxVal, this.z));

        return this;
    }

    /**
     * Computes the distance from this vector to v.
     *
     * @param v
     *
     * @return this
     */
    public double distanceTo(Vector3d v) {
        return Math.sqrt(this.distanceToSquared(v));
    }

    /**
     * Computes the squared distance from this vector to v. If you are just
     * comparing the distance with another distance, you should compare the
     * distance squared instead as it is slightly more efficient to calculate.
     *
     * @param v
     *
     * @return
     */
    public double distanceToSquared(Vector3d v) {
        double dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Returns the angle between this vector and vector v
     *
     * @param v
     *
     * @return
     */
    public Angle angleTo(Vector3d v) {
        double theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));

        // clamp, to handle numerical problems
        return new Angle(Math.acos(MathUtil.clamp(theta, -1, 1)), Angle.Representation.RAD);
    }

    /**
     * Computes the Euclidean length (straight-line length) from (0, 0, 0) to
     * (x, y, z).
     *
     * @return
     */
    public double length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Computes the Manhattan length of this vector.
     *
     * @return
     */
    public double lengthManhattan() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }

    /**
     * Computes the square of the Euclidean length (straight-line length) from
     * (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you
     * should compare the length squared instead as it is slightly more
     * efficient to calculate.
     *
     * @return
     */
    public double lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Convert this vector to a unit vector - that is, sets it equal to the
     * vector with the same direction as this one, but length 1.
     *
     * @return this
     */
    public Vector3d normalize() {
        return this.divide(this.length());
    }

    public Vector3d negate() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;

        return this;
    }

    /**
     * Set this vector to the vector with the same direction as this one, but
     * length l.
     *
     * @param length
     *
     * @return this
     */
    public Vector3d setLength(double length) {
        return this.multiply(length / this.length());
    }

    public Vector3d setFromSpherical(Spherical s) {
        double sinPhiRadius = Math.sin(s.phi.inRadians()) * s.radius;

        this.x = sinPhiRadius * Math.sin(s.theta.inRadians());
        this.y = Math.cos(s.phi.inRadians()) * s.radius;
        this.z = sinPhiRadius * Math.cos(s.theta.inRadians());

        return this;
    }

    public Vector3d setFromCylindrical(Cylindrical c) {

        this.x = c.radius * Math.sin(c.theta.inRadians());
        this.y = c.y;
        this.z = c.radius * Math.cos(c.theta.inRadians());

        return this;

    }

    /**
     * Linearly interpolate between this vector and v, where alpha is the
     * distance along the line - alpha = 0 will be this vector, and alpha = 1
     * will be v.
     *
     * @param v Vector3 to interpolate towards.
     * @param alpha interpolation factor in the closed interval [0, 1].
     *
     * @return this
     */
    public Vector3d lerp(Vector3d v, double alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;

        return this;
    }

    public Vector3d setFromMatrixPosition(Matrix4d m) {
        return this.setFromMatrixColumn(m, 3);
    }

    public Vector3d setFromMatrixColumn(Matrix4d m, int index) {
        return this.fromArray(m.elements(), index * 4);
    }

    public Vector3d unproject(Camera camera) {
        Matrix4d matrix = new Matrix4d();
        matrix.multiply(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
        return applyMatrix4(matrix);
    }

    /**
     * Copy this
     *
     * @return a new vector3 with the same x, y and z values as this one
     */
    public Vector3d copy() {
        return new Vector3d(x, y, z);
    }

    /**
     * Copies the values of the passed vector3's x, y and z properties to this
     * vector3.
     *
     * @param v
     *
     * @return this
     */
    public Vector3d copy(Vector3d v) {
        return set(v.x, v.y, v.z);
    }

    public float[] toArrayf() {
        return new float[]{(float) x, (float) y, (float) z};
    }

    public double[] toArray() {
        return new double[]{x, y, z};
    }

    public void store(FloatBuffer buf) {
        buf.put((float) x);
        buf.put((float) y);
        buf.put((float) z);
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 53 * hash + (int) (Double.doubleToLongBits(this.x) ^ (Double.doubleToLongBits(this.x) >>> 32));
        hash = 53 * hash + (int) (Double.doubleToLongBits(this.y) ^ (Double.doubleToLongBits(this.y) >>> 32));
        hash = 53 * hash + (int) (Double.doubleToLongBits(this.z) ^ (Double.doubleToLongBits(this.z) >>> 32));
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
        final Vector3d other = (Vector3d) obj;
        if (Double.doubleToLongBits(this.x) != Double.doubleToLongBits(other.x)) {
            return false;
        }
        if (Double.doubleToLongBits(this.y) != Double.doubleToLongBits(other.y)) {
            return false;
        }
        if (Double.doubleToLongBits(this.z) != Double.doubleToLongBits(other.z)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Vector3d{" + "x=" + x + ", y=" + y + ", z=" + z + '}';
    }

}
