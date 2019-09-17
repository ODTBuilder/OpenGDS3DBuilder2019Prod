/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.extras.curves;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.extras.core.Curve3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author zz85 https://github.com/zz85, ported to Java by laht
 *
 * Centripetal CatmullRom Curve - which is useful for avoiding
 * cusps and self-intersections in non-uniform catmull rom curves.
 * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
 *
 * curve.type accepts centripetal(default), chordal and catmullrom
 * curve.tension is used for catmullrom which defaults to 0.5
 */
public class CatmullRomCurve3 extends Curve3 {

    private final static Logger LOG = LoggerFactory.getLogger(CatmullRomCurve3.class);

    public final List<Vector3d> points;

    public Double tension;
    public boolean closed;
    
    private final Vector3d tmp = new Vector3d();
    private final CubicPoly px = new CubicPoly();
    private final CubicPoly py = new CubicPoly();
    private final CubicPoly pz = new CubicPoly();

    public CatmullRomCurve3() {
        this(null);
    }

    public CatmullRomCurve3(List<Vector3d> p) {
        this.points = p == null ? new ArrayList<>() : p;
    }

    @Override
    public Vector3d getPoint(double t) {

        int l = points.size();

        if (l < 2) {
            LOG.warn("duh, you need at least 2 points");
        }

        double point = (l - (this.closed ? 0 : 1)) * t;
        int intPoint = (int) Math.floor(point);
        double weight = point - intPoint;

        if (this.closed) {

            intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / points.size()) + 1) * points.size();

        } else if (weight == 0 && intPoint == l - 1) {

            intPoint = l - 2;
            weight = 1;

        }

        Vector3d p0, p1, p2, p3; // 4 points

        if (this.closed || intPoint > 0) {

            p0 = points.get((intPoint - 1) % l);

        } else {

            // extrapolate first point
            tmp.sub(points.get(0), points.get(1)).add(points.get(0));
            p0 = tmp;

        }

        p1 = points.get(intPoint % l);
        p2 = points.get((intPoint + 1) % l);

        if (this.closed || intPoint + 2 < l) {

            p3 = points.get((intPoint + 2) % l);

        } else {

            // extrapolate last point
            tmp.sub(points.get(l - 1), points.get(l - 2)).add(points.get(l - 1));
            p3 = tmp;

        }

        if (this.type == null || this.type.equals("centripetal") || this.type.equals("chordal")) {

            // init Centripetal / Chordal Catmull-Rom
            double pow = this.type.equals("chordal") ? 0.5 : 0.25;
            double dt0 = Math.pow(p0.distanceToSquared(p1), pow);
            double dt1 = Math.pow(p1.distanceToSquared(p2), pow);
            double dt2 = Math.pow(p2.distanceToSquared(p3), pow);

            // safety check for repeated points
            if (dt1 < 1e-4) {
                dt1 = 1.0;
            }
            if (dt0 < 1e-4) {
                dt0 = dt1;
            }
            if (dt2 < 1e-4) {
                dt2 = dt1;
            }

            px.initNonuniformCatmullRom(p0.x(), p1.x(), p2.x(), p3.x(), dt0, dt1, dt2);
            py.initNonuniformCatmullRom(p0.y(), p1.y(), p2.y(), p3.y(), dt0, dt1, dt2);
            pz.initNonuniformCatmullRom(p0.z(), p1.z(), p2.z(), p3.z(), dt0, dt1, dt2);

        } else if (this.type.equals("catmullrom")) {

            tension = this.tension != null ? this.tension : 0.5;
            px.initCatmullRom(p0.x(), p1.x(), p2.x(), p3.x(), tension);
            py.initCatmullRom(p0.y(), p1.y(), p2.y(), p3.y(), tension);
            pz.initCatmullRom(p0.z(), p1.z(), p2.z(), p3.z(), tension);

        }

        Vector3d v = new Vector3d(
                px.calc(weight),
                py.calc(weight),
                pz.calc(weight)
        );

        return v;

    }

    public final class CubicPoly {

        public double c0, c1, c2, c3;

        public void init(double x0, double x1, double t0, double t1) {
            this.c0 = x0;
            this.c1 = t0;
            this.c2 = - 3 * x0 + 3 * x1 - 2 * t0 - t1;
            this.c3 = 2 * x0 - 2 * x1 + t0 + t1;
        }

        public void initNonuniformCatmullRom(double x0, double x1, double x2, double x3, double dt0, double dt1, double dt2) {

            // compute tangents when parameterized in [t1,t2]
            double t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
            double t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;

            // rescale tangents for parametrization in [0,1]
            t1 *= dt1;
            t2 *= dt1;

            // initCubicPoly
            this.init(x1, x2, t1, t2);

        }

        /**
         * Standard Catmull-Rom spline: interpolate between x1 and x2 with
         * previous/following points x1/x4
         */
        public void initCatmullRom(double x0, double x1, double x2, double x3, double tension) {
            this.init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
        }

        public double calc(double t) {
            double t2 = t * t;
            double t3 = t2 * t;
            return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;
        }

    }

}
