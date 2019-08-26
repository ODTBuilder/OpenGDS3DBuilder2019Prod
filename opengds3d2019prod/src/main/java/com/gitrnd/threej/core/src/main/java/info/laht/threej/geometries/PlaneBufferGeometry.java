/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferAttribute;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferGeometry;

/**
 *
 * @author laht
 */
public class PlaneBufferGeometry extends BufferGeometry {

    public double width, height;
    public int widthSegments, heightSegments;

    public PlaneBufferGeometry(double extent) {
        this(extent, extent);
    }

    public PlaneBufferGeometry(double width, double height) {
        this(width, height, 1, 1);
    }

    public PlaneBufferGeometry(double width, double height, int widthSegments, int heightSegments) {

        type = "PlaneBufferGgeometry";

        this.width = width;
        this.height = height;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;

        PlaneBufferGeometryHelper helper = new PlaneBufferGeometryHelper();

        this.setIndex(new BufferAttribute.IntBufferAttribute(helper.indices, 1));
        this.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(helper.vertices, 3));
        this.addAttribute("normal", new BufferAttribute.DoubleBufferAttribute(helper.normals, 3));
        this.addAttribute("uv", new BufferAttribute.DoubleBufferAttribute(helper.uvs, 2));

    }

    private class PlaneBufferGeometryHelper {

        int[] indices;
        double[] vertices;
        double[] normals;
        double[] uvs;

        public PlaneBufferGeometryHelper() {

            double width_half = width / 2;
            double height_half = height / 2;

            int gridX = widthSegments;
            int gridY = heightSegments;

            int gridX1 = gridX + 1;
            int gridY1 = gridY + 1;

            double segment_width = width / gridX;
            double segment_height = height / gridY;

            vertices = new double[gridX1 * gridY1 * 3];
            normals = new double[gridX1 * gridY1 * 3];
            uvs = new double[gridX1 * gridY1 * 2];

            int offset = 0;
            int offset2 = 0;

            for (int iy = 0; iy < gridY1; iy++) {

                double y = iy * segment_height - height_half;

                for (int ix = 0; ix < gridX1; ix++) {

                    double x = ix * segment_width - width_half;

                    vertices[offset] = x;
                    vertices[offset + 1] = -y;

                    normals[offset + 2] = 1;

                    uvs[offset2] = ix / gridX;
                    uvs[offset2 + 1] = 1 - (iy / gridY);

                    offset += 3;
                    offset2 += 2;

                }

            }

            offset = 0;

            indices = new int[gridX * gridY * 6];

            for (int iy = 0; iy < gridY; iy++) {

                for (int ix = 0; ix < gridX; ix++) {

                    int a = ix + gridX1 * iy;
                    int b = ix + gridX1 * (iy + 1);
                    int c = (ix + 1) + gridX1 * (iy + 1);
                    int d = (ix + 1) + gridX1 * iy;

                    indices[offset] = a;
                    indices[offset + 1] = b;
                    indices[offset + 2] = d;

                    indices[offset + 3] = b;
                    indices[offset + 4] = c;
                    indices[offset + 5] = d;

                    offset += 6;

                }

            }

        }

    }

}
