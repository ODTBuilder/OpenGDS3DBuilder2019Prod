/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras;

/**
 *
 * @author laht
 */
public final class CurveUtils {

    private CurveUtils() {

    }

    public static double tangentQuadraticBezier(double t, double p0, double p1, double p2) {

        return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);

    }

	// Puay Bing, thanks for helping with this derivative!
    public static double tangentCubicBezier(double t, double p0, double p1, double p2, double p3) {

        return - 3 * p0 * (1 - t) * (1 - t)
                + 3 * p1 * (1 - t) * (1 - t) - 6 * t * p1 * (1 - t)
                + 6 * t * p2 * (1 - t) - 3 * t * t * p2
                + 3 * t * t * p3;

    }

    public static double tangentSpline(double t, double p0, double p1, double p2, double p3) {

		// To check if my formulas are correct
        double h00 = 6 * t * t - 6 * t; 	// derived from 2t^3 − 3t^2 + 1
        double h10 = 3 * t * t - 4 * t + 1; // t^3 − 2t^2 + t
        double h01 = - 6 * t * t + 6 * t; 	// − 2t3 + 3t2
        double h11 = 3 * t * t - 2 * t;	// t3 − t2

        return h00 + h10 + h01 + h11;

    }

	// Catmull-Rom
    public static double interpolate(double p0, double p1, double p2, double p3, double t) {

        double v0 = (p2 - p0) * 0.5;
        double v1 = (p3 - p1) * 0.5;
        double t2 = t * t;
        double t3 = t * t2;
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

    }

}
