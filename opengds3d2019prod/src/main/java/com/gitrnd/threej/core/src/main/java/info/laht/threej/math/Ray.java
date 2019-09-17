/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.math;

import java.io.Serializable;
import java.util.Objects;

/**

 @author laht
 */
public class Ray implements Serializable {

    public final Vector3d origin, direction;

    public Ray() {
        this(new Vector3d(), new Vector3d());
    }

    public Ray(Vector3d origin, Vector3d direction) {
        this.origin = origin;
        this.direction = direction;
    }

    public Ray set(Vector3d origin, Vector3d direction) {
        this.origin.copy(origin);
        this.direction.copy(direction);
        return this;
    }

    public Vector3d at(double t) {
        return at(t, null);
    }

    public Vector3d at(double t, Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        return result.copy(direction).multiply(t).add(origin);
    }

    public Ray lookAt(Vector3d v) {
        direction.copy(v).sub(origin).normalize();
        return this;
    }

    public Ray recast(double t) {
        origin.copy(at(t, new Vector3d()));
        return this;
    }

    public Vector3d closestPointToPoint(Vector3d point) {
        return closestPointToPoint(point, null);
    }

    public Vector3d closestPointToPoint(Vector3d point, Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        result.sub(point, origin);
        double directionDistance = result.dot(direction);

        if (directionDistance < 0) {
            return result.copy(origin);
        }

        return result.copy(direction).multiply(directionDistance).add(origin);
    }

    public double distanceSqToPoint(Vector3d point) {
        Vector3d v1 = new Vector3d();
        double directionDistance = v1.sub(point, origin).dot(direction);

        if (directionDistance < 0) {
            return origin.distanceToSquared(point);
        }

        v1.copy(direction).multiply(directionDistance).add(origin);

        return v1.distanceToSquared(point);
    }

    public double distanceToPoint(Vector3d point) {
        return Math.sqrt(distanceSqToPoint(point));
    }

    public double distanceSqToSegment(Vector3d v0, Vector3d v1) {
        return distanceSqToSegment(v0, v1, null, null);
    }

    public double distanceSqToSegment(Vector3d v0, Vector3d v1, Vector3d optionalPointOnRay, Vector3d optionalPointOnSegment) {
        Vector3d segCenter = new Vector3d();
        Vector3d segDir = new Vector3d();
        Vector3d diff = new Vector3d();

        // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteDistRaySegment.h
        // It returns the min distance between the ray and the segment
        // defined by v0 and v1
        // It can also set two optional targets :
        // - The closest point on the ray
        // - The closest point on the segment
        segCenter.copy(v0).add(v1).multiply(0.5);
        segDir.copy(v1).sub(v0).normalize();
        diff.copy(this.origin).sub(segCenter);

        double segExtent = v0.distanceTo(v1) * 0.5;
        double a01 = -this.direction.dot(segDir);
        double b0 = diff.dot(this.direction);
        double b1 = -diff.dot(segDir);
        double c = diff.lengthSq();
        double det = Math.abs(1 - a01 * a01);
        double s0, s1, sqrDist, extDet;

        if (det > 0) {

            // The ray and segment are not parallel.
            s0 = a01 * b1 - b0;
            s1 = a01 * b0 - b1;
            extDet = segExtent * det;

            if (s0 >= 0) {

                if (s1 >= -extDet) {

                    if (s1 <= extDet) {

                        // region 0
                        // Minimum at interior points of ray and segment.
                        double invDet = 1d / det;
                        s0 *= invDet;
                        s1 *= invDet;
                        sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;

                    }
                    else {

                        // region 1
                        s1 = segExtent;
                        s0 = Math.max(0, -(a01 * s1 + b0));
                        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;

                    }

                }
                else {

                    // region 5
                    s1 = -segExtent;
                    s0 = Math.max(0, -(a01 * s1 + b0));
                    sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;

                }

            }
            else {

                if (s1 <= -extDet) {

                    // region 4
                    s0 = Math.max(0, -(-a01 * segExtent + b0));
                    s1 = (s0 > 0) ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
                    sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;

                }
                else if (s1 <= extDet) {

                    // region 3
                    s0 = 0;
                    s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
                    sqrDist = s1 * (s1 + 2 * b1) + c;

                }
                else {

                    // region 2
                    s0 = Math.max(0, -(a01 * segExtent + b0));
                    s1 = (s0 > 0) ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
                    sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;

                }

            }

        }
        else {

            // Ray and segment are parallel.
            s1 = (a01 > 0) ? -segExtent : segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;

        }

        if (optionalPointOnRay != null) {

            optionalPointOnRay.copy(this.direction).multiply(s0).add(this.origin);

        }

        if (optionalPointOnSegment != null) {

            optionalPointOnSegment.copy(segDir).multiply(s1).add(segCenter);

        }

        return sqrDist;
    }

    public Vector3d intersectSphere(Sphere sphere) {
        return intersectSphere(sphere, null);
    }
    
    public Vector3d intersectSphere(Sphere sphere, Vector3d optionalTarget) {
        Vector3d v1 = new Vector3d();
        v1.sub(sphere.getCenter(), origin);
        double tca = v1.dot(this.direction);
        double d2 = v1.dot(v1) - tca * tca;
        double radius2 = sphere.getRadius() * sphere.getRadius();

        if (d2 > radius2) {
            return null;
        }

        double thc = Math.sqrt(radius2 - d2);

        // t0 = first intersect point - entrance on front of sphere
        double t0 = tca - thc;

        // t1 = second intersect point - exit point on back of sphere
        double t1 = tca + thc;

        // test to see if both t0 and t1 are behind the ray - if so, return null
        if (t0 < 0 && t1 < 0) {
            return null;
        }

        // test to see if t0 is behind the ray:
        // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
        // in order to always return an intersect point that is in front of the ray.
        if (t0 < 0) {
            return this.at(t1, optionalTarget);
        }

        return at(t0, optionalTarget);
    }

    public boolean intersectsSphere(Sphere sphere) {
        return distanceToPoint(sphere.getCenter()) <= sphere.getRadius();
    }

    public double distanceToPlane(Plane plane) {
        double denominator = plane.getNormal().dot(this.direction);

        if (denominator == 0) {

            // line is coplanar, return origin
            if (plane.distanceToPoint(this.origin) == 0) {

                return 0;

            }

            // Null is preferable to undefined since undefined means.... it is undefined
            return Double.NaN;

        }

        double t = -(this.origin.dot(plane.getNormal()) + plane.getConstant()) / denominator;

        // Return if the ray never intersects the plane
        return t >= 0 ? t : null;
    }

     public Vector3d intersectPlane(Plane plane) {
         return intersectPlane(plane, null);
     }
    
    public Vector3d intersectPlane(Plane plane, Vector3d optionalTarget) {
        double t = this.distanceToPlane(plane);

        if (Double.isNaN(t)) {
            return null;
        }

        return this.at(t, optionalTarget);
    }

    public boolean intersectsPlane(Plane plane) {

        // check if the ray lies on the plane first
        double distToPoint = plane.distanceToPoint(this.origin);
        if (distToPoint == 0) {
            return true;
        }

        double denominator = plane.getNormal().dot(this.direction);
        if (denominator * distToPoint < 0) {
            return true;
        }

        // ray origin is behind the plane (and is pointing behind it)
        return false;
    }

    public Vector3d intersectBox(Box3d box) {
        return intersectBox(box, null);
    }
    
    public Vector3d intersectBox(Box3d box, Vector3d optionalTarget) {
        double tmin, tmax, tymin, tymax, tzmin, tzmax;

        double invdirx = 1d / this.direction.x,
                invdiry = 1d / this.direction.y,
                invdirz = 1d / this.direction.z;

        if (invdirx >= 0) {

            tmin = (box.getMin().x - origin.x) * invdirx;
            tmax = (box.getMax().x - origin.x) * invdirx;

        }
        else {

            tmin = (box.getMax().x - origin.x) * invdirx;
            tmax = (box.getMin().x - origin.x) * invdirx;

        }

        if (invdiry >= 0) {

            tymin = (box.getMin().y - origin.y) * invdiry;
            tymax = (box.getMax().y - origin.y) * invdiry;

        }
        else {

            tymin = (box.getMax().y - origin.y) * invdiry;
            tymax = (box.getMin().y - origin.y) * invdiry;

        }

        if ((tmin > tymax) || (tymin > tmax)) {
            return null;
        }

        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN
        if (tymin > tmin || tmin != tmin) {
            tmin = tymin;
        }

        if (tymax < tmax || tmax != tmax) {
            tmax = tymax;
        }

        if (invdirz >= 0) {

            tzmin = (box.getMin().z - origin.z) * invdirz;
            tzmax = (box.getMax().z - origin.z) * invdirz;

        }
        else {

            tzmin = (box.getMax().z - origin.z) * invdirz;
            tzmax = (box.getMin().z - origin.z) * invdirz;

        }

        if ((tmin > tzmax) || (tzmin > tmax)) {
            return null;
        }

        if (tzmin > tmin || tmin != tmin) {
            tmin = tzmin;
        }

        if (tzmax < tmax || tmax != tmax) {
            tmax = tzmax;
        }

        //return point closest to the ray (positive side)
        if (tmax < 0) {
            return null;
        }

        return this.at(tmin >= 0 ? tmin : tmax, optionalTarget);
    }

    public boolean intersectsBox(Box3d box) {
        return intersectBox(box, new Vector3d()) != null;
    }

    public Vector3d intersectTriangle(Vector3d a, Vector3d b, Vector3d c, boolean backfaceCulling) {
        return intersectTriangle(a, b, c, backfaceCulling, null);
    }
    
    public Vector3d intersectTriangle(Vector3d a, Vector3d b, Vector3d c, boolean backfaceCulling, Vector3d optionalTarget) {
        Vector3d diff = new Vector3d();
        Vector3d edge1 = new Vector3d();
        Vector3d edge2 = new Vector3d();
        Vector3d normal = new Vector3d();

        // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
        edge1.sub(b, a);
        edge2.sub(c, a);
        normal.cross(edge1, edge2);

        // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
        // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
        //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
        //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
        //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
        double DdN = this.direction.dot(normal);
        int sign;

        if (DdN > 0) {

            if (backfaceCulling) {
                return null;
            }
            sign = 1;

        }
        else if (DdN < 0) {

            sign = - 1;
            DdN = -DdN;

        }
        else {
            return null;
        }

        diff.sub(this.origin, a);
        double DdQxE2 = sign * this.direction.dot(edge2.cross(diff, edge2));

        // b1 < 0, no intersection
        if (DdQxE2 < 0) {
            return null;
        }

        double DdE1xQ = sign * this.direction.dot(edge1.cross(diff));

        // b2 < 0, no intersection
        if (DdE1xQ < 0) {
            return null;
        }

        // b1+b2 > 1, no intersection
        if (DdQxE2 + DdE1xQ > DdN) {
            return null;
        }

        // Line intersects triangle, check if ray does.
        double QdN = -sign * diff.dot(normal);

        // t < 0, no intersection
        if (QdN < 0) {
            return null;
        }

        // Ray intersects triangle.
        return this.at(QdN / DdN, optionalTarget);

    }

    public Ray applyMatrix4(Matrix4d matrix4) {
        this.direction.add(this.origin).applyMatrix4(matrix4);
        this.origin.applyMatrix4(matrix4);
        this.direction.sub(this.origin);
        this.direction.normalize();

        return this;
    }

    public Ray copy() {
        return new Ray().copy(this);
    }

    public Ray copy(Ray ray) {
        this.origin.copy(ray.origin);
        this.direction.copy(ray.direction);
        return this;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 43 * hash + Objects.hashCode(this.origin);
        hash = 43 * hash + Objects.hashCode(this.direction);
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
        final Ray other = (Ray) obj;
        if (!Objects.equals(this.origin, other.origin)) {
            return false;
        }
        if (!Objects.equals(this.direction, other.direction)) {
            return false;
        }
        return true;
    }

}
