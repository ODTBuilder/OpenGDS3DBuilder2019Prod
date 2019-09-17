/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry;

/**
 *
 * @author laht
 */
public class BoxGeometry extends Geometry {

    private final double width, height, depth;
    private final int widthSegments, heightSegments, depthSegments;

    public BoxGeometry(double extent) {
        this(extent, extent, extent);
    }
    
    public BoxGeometry(double width, double height, double depth) {
        this(width, height, depth, 1, 1, 1);
    }
    
    public BoxGeometry(double width, double height, double depth, int widthSegments, int heightSegments, int depthSegments) {
        
        type = "BoxGeometry";
        
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;
        
        fromBufferGeometry(new BoxBufferGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
        
    }

    public static void main(String[] args) {
        BoxGeometry geometry = new BoxGeometry(1, 2, 3);
        geometry.computeBoundingBox();
        System.out.println(geometry.getBoundingBox());
    }
    
}
