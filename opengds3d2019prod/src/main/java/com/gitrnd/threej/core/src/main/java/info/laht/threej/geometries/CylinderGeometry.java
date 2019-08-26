/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;

/**
 *
 * @author laht
 */
public class CylinderGeometry extends Geometry {

    private final double radiusTop, radiusBottom, height;
    private final int radialSegments, heightSegments;
    private final boolean openEnded;
    private final Angle thetaStart, thetaLength;

    public CylinderGeometry(double radius, double height) {
        this(radius, radius, height, 8, 1);
    }
    
    public CylinderGeometry(double radiusTop, double radiusBottom, double height, int radialSegments, int heightSegments) {
        this(radiusTop, radiusBottom, height, radialSegments, heightSegments, false, Angle.rad(0), Angle.rad(2 * Math.PI));
    }

    public CylinderGeometry(double radiusTop, double radiusBottom, double height, int radialSegments, int heightSegments, boolean openEnded, Angle thetaStart, Angle thetaLength) {
    
        type = "CylinderGeometry";
        
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.openEnded = openEnded;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;
        
        fromBufferGeometry(new CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength));
        mergeVertices();
    }
    
    public static void main(String[] args) {
        CylinderGeometry geometry = new CylinderGeometry(0.5, 1);
        geometry.computeBoundingBox();
        System.out.println(geometry.boundingBox);
        
    }
    
}
