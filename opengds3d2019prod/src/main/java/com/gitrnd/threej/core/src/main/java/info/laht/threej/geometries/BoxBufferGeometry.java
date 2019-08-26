/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class BoxBufferGeometry extends BufferGeometry {

    private final double width, height, depth;
    private final int widthSegments, heightSegments, depthSegments;

    public BoxBufferGeometry(double width, double height, double depth) {
        this(width, height, depth, 1, 1, 1);
    }

    public BoxBufferGeometry(double width, double height, double depth, int widthSegments, int heightSegments, int depthSegments) {

        type = "BoxBufferGeometry";

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;

        BoxBufferGeometryHelper helper = new BoxBufferGeometryHelper();

        this.setIndex(new BufferAttribute.IntBufferAttribute(helper.indices, 1));
        this.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(helper.vertices, 3));
        this.addAttribute("normal", new BufferAttribute.DoubleBufferAttribute(helper.normals, 3));
        this.addAttribute("uv", new BufferAttribute.DoubleBufferAttribute(helper.uvs, 2));

    }

    private class BoxBufferGeometryHelper {

        int[] indices;
        double[] vertices;
        double[] normals;
        double[] uvs;

        // offset variables
        int vertexBufferOffset = 0;
        int uvBufferOffset = 0;
        int indexBufferOffset = 0;
        int numberOfVertices = 0;

        // group variables
        int groupStart = 0;

        public BoxBufferGeometryHelper() {

            // these are used to calculate buffer length
            int vertexCount = calculateVertexCount(widthSegments, heightSegments, depthSegments);
            int indexCount = calculateIndexCount(widthSegments, heightSegments, depthSegments);

            indices = new int[indexCount];
            vertices = new double[vertexCount * 3];
            normals = new double[vertexCount * 3];
            uvs = new double[vertexCount * 2];

            // build each side of the box geometry
            buildPlane(2, 1, 0, - 1, - 1, depth, height, width, depthSegments, heightSegments, 0); // px
            buildPlane(2, 1, 0, 1, - 1, depth, height, -width, depthSegments, heightSegments, 1); // nx
            buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
            buildPlane(0, 2, 1, 1, - 1, width, depth, -height, widthSegments, depthSegments, 3); // ny
            buildPlane(0, 1, 2, 1, - 1, width, height, depth, widthSegments, heightSegments, 4); // pz
            buildPlane(0, 1, 2, - 1, - 1, width, height, -depth, widthSegments, heightSegments, 5); // nz
        }

        public final void buildPlane(int u, int v, int w, int udir, int vdir, double width, double height, double depth, int gridX, int gridY, int materialIndex) {

            double segmentWidth = width / gridX;
            double segmentHeight = height / gridY;

            double widthHalf = width / 2;
            double heightHalf = height / 2;
            double depthHalf = depth / 2;

            int gridX1 = gridX + 1;
            int gridY1 = gridY + 1;

            int vertexCounter = 0;
            int groupCount = 0;

            Vector3d vector = new Vector3d();

            // generate vertices, normals and uvs
            for (int iy = 0; iy < gridY1; iy++) {

                double y = iy * segmentHeight - heightHalf;

                for (int ix = 0; ix < gridX1; ix++) {

                    double x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component
                    vector.setComponent(u, x * udir);
                    vector.setComponent(v, y * vdir);
                    vector.setComponent(w, depthHalf);

                    // now apply vector to vertex buffer
                    vertices[vertexBufferOffset] = vector.x();
                    vertices[vertexBufferOffset + 1] = vector.y();
                    vertices[vertexBufferOffset + 2] = vector.z();

                    // set values to correct vector component
                    vector.setComponent(u, 0);
                    vector.setComponent(v, 0);
                    vector.setComponent(w, depth > 0 ? 1 : - 1);

                    // now apply vector to normal buffer
                    normals[vertexBufferOffset] = vector.x();
                    normals[vertexBufferOffset + 1] = vector.y();
                    normals[vertexBufferOffset + 2] = vector.z();

                    // uvs
                    uvs[uvBufferOffset] = ix / gridX;
                    uvs[uvBufferOffset + 1] = 1 - (iy / gridY);

                    // update offsets and counters
                    vertexBufferOffset += 3;
                    uvBufferOffset += 2;
                    vertexCounter += 1;

                }

            }

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment
            for (int iy = 0; iy < gridY; iy++) {

                for (int ix = 0; ix < gridX; ix++) {

                    // indices
                    int a = numberOfVertices + ix + gridX1 * iy;
                    int b = numberOfVertices + ix + gridX1 * (iy + 1);
                    int c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    int d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    // face one
                    indices[indexBufferOffset] = a;
                    indices[indexBufferOffset + 1] = b;
                    indices[indexBufferOffset + 2] = d;

                    // face two
                    indices[indexBufferOffset + 3] = b;
                    indices[indexBufferOffset + 4] = c;
                    indices[indexBufferOffset + 5] = d;

                    // update offsets and counters
                    indexBufferOffset += 6;
                    groupCount += 6;

                }

            }

            // add a group to the geometry. this will ensure multi material support
            addGroup(groupStart, groupCount, materialIndex);

            // calculate new start value for groups
            groupStart += groupCount;

            // update total number of vertices
            numberOfVertices += vertexCounter;

        }

        private int calculateIndexCount(int w, int h, int d) {

            int index = 0;

            // calculate the amount of squares for each side
            index += w * h * 2; // xy
            index += w * d * 2; // xz
            index += d * h * 2; // zy

            return index * 6; // two triangles per square => six vertices per square

        }

        private int calculateVertexCount(int w, int h, int d) {

            int vertices = 0;

            // calculate the amount of vertices for each side (plane)
            vertices += (w + 1) * (h + 1) * 2; // xy
            vertices += (w + 1) * (d + 1) * 2; // xz
            vertices += (d + 1) * (h + 1) * 2; // zy

            return vertices;

        }

    }

}
