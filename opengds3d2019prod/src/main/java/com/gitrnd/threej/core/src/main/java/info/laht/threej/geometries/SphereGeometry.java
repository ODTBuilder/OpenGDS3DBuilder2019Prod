/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;

/**
 *
 * @author laht
 */
public class SphereGeometry extends Geometry {

    private double radius;
    private int widthSegments;
    private int heightSegments;
    private final Angle phiStart;
    private final Angle phiLength;
    private final Angle thetaStart;
    private final Angle thetaLength;

    public SphereGeometry(double radius) {
        this(radius, 8, 6, Angle.rad(0), Angle.rad(Math.PI * 2), Angle.rad(0), Angle.rad(Math.PI));
    }

    public SphereGeometry(double radius, int widthSegments, int heightSegments, Angle phiStart, Angle phiLength, Angle thetaStart, Angle thetaLength) {
        
        type = "SphereGeometry";
        
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.phiStart = phiStart;
        this.phiLength = phiLength;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;
        
        fromBufferGeometry(new SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength));

    }
    
    public static void main(String[] args) {
        IGeometry geometry = new SphereBufferGeometry(0.5);
        geometry.computeBoundingBox();
        System.out.println(geometry.getBoundingBox());
    }
    
    
}
