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
public class PlaneGeometry extends Geometry {

    public double width, height;
    public int widthSegments, heightSegments;

    public PlaneGeometry(double extent) {
        this(extent, extent);
    }

    public PlaneGeometry(double width, double height) {
        this(width, height, 1, 1);
    }

    public PlaneGeometry(double width, double height, int widthSegments, int heightSegments) {

        type = "PlaneGeometry";

        this.width = width;
        this.height = height;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;

        fromBufferGeometry(new PlaneBufferGeometry(width, height, widthSegments, heightSegments));

    }
    
    public static void main(String[] args) {
        PlaneGeometry geometry = new PlaneGeometry(2, 1);
        geometry.computeBoundingBox();
        System.out.println(geometry.getBoundingBox());
    }

}
