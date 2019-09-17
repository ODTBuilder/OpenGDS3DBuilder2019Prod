/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.extras.curves;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.extras.core.Curve3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;

/**
 *
 * @author laht
 */
public class LineCurve3 extends Curve3 {

    private final Vector3d v1, v2;

    public LineCurve3(Vector3d v1, Vector3d v2) {
        this.v1 = v1;
        this.v2 = v2;
    }

    @Override
    public Vector3d getPoint(double t) {

        if (t == 1) {
            return v2.copy();
        }

        Vector3d vector = new Vector3d();

        vector.sub(v2, v1); //diff
        vector.multiply(t);
        vector.add(v1);

        return vector;

    }

}
