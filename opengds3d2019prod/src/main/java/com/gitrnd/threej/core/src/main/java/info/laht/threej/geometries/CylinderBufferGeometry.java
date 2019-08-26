/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferAttribute;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author laht
 */
public class CylinderBufferGeometry extends BufferGeometry {

    private final double radiusTop, radiusBottom, height;
    private final int radialSegments, heightSegments;
    private final boolean openEnded;
    private final Angle thetaStart, thetaLength;

    public CylinderBufferGeometry(double radius, double height) {
        this(radius, radius, height, 8, 1);
    }

    public CylinderBufferGeometry(double radiusTop, double radiusBottom, double height, int radialSegments, int heightSegments) {
        this(radiusTop, radiusBottom, height, radialSegments, heightSegments, false, Angle.rad(0), Angle.rad(2 * Math.PI));
    }

    public CylinderBufferGeometry(double radiusTop, double radiusBottom, double height, int radialSegments, int heightSegments, boolean openEnded, Angle thetaStart, Angle thetaLength) {

        type = "CylinderBufferGeometry";

        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.openEnded = openEnded;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;

        CylinderBufferGeometryHelper helper = new CylinderBufferGeometryHelper();

        setIndex(helper.indices);
        addAttribute("position", helper.vertices);
        addAttribute("normal", helper.normals);
        addAttribute("uv", helper.uvs);

    }

    private class CylinderBufferGeometryHelper {

        BufferAttribute.IntBufferAttribute indices;
        BufferAttribute.DoubleBufferAttribute vertices, normals, uvs;

        int index = 0, indexOffset = 0;
        List<List<Integer>> indexArray = new ArrayList<>();
        double halfHeight = height / 2;

        int groupStart = 0;

        public CylinderBufferGeometryHelper() {
            int nbCap = 0;

            if (!openEnded) {
                if (radiusTop > 0) {
                    nbCap++;
                }
                if (radiusBottom > 0) {
                    nbCap++;
                }
            }

            int vertexCount = calculateVertexCount(nbCap);
            int indexCount = calculateIndexCount(nbCap);

            indices = new BufferAttribute.IntBufferAttribute(new int[indexCount], 1);
            vertices = new BufferAttribute.DoubleBufferAttribute(new double[vertexCount * 3], 3);
            normals = new BufferAttribute.DoubleBufferAttribute(new double[vertexCount * 3], 3);
            uvs = new BufferAttribute.DoubleBufferAttribute(new double[vertexCount * 2], 2);

            generateTorso();

            if (!openEnded) {
                if (radiusTop > 0) {
                    generateCap(true);
                }
                if (radiusBottom > 0) {
                    generateCap(false);
                }
            }

        }

        private int calculateVertexCount(int nbCap) {
            int count = (radialSegments + 1) * (heightSegments + 1);
            if (!openEnded) {
                count += ((radialSegments + 1) * nbCap) + (radialSegments * nbCap);
            }
            return count;
        }

        private int calculateIndexCount(int nbCap) {
            int count = radialSegments * heightSegments * 2 * 3;
            if (!openEnded) {
                count += radialSegments * nbCap * 3;
            }
            return count;
        }

        private void generateTorso() {

            Vector3d normal = new Vector3d();
            Vector3d vertex = new Vector3d();

            int groupCount = 0;

            // this will be used to calculate the normal
            double slope = (radiusBottom - radiusTop) / height;

            // generate vertices, normals and uvs
            for (int y = 0; y <= heightSegments; y++) {

                List<Integer> indexRow = new ArrayList<>();

                double v = ((double)y) / heightSegments;

                // calculate the radius of the current row
                double radius = v * (radiusBottom - radiusTop) + radiusTop;

                for (int x = 0; x <= radialSegments; x++) {

                    double u = ((double)x) / radialSegments;

                    double theta = u * thetaLength.inRadians() + thetaStart.inRadians();

                    double sinTheta = Math.sin(theta);
                    double cosTheta = Math.cos(theta);

                    // vertex
                    vertex.x(radius * sinTheta);
                    vertex.y(-v * height + halfHeight);
                    vertex.z(radius * cosTheta);
                    vertices.setXYZ(index, vertex.x(), vertex.y(), vertex.z());

                    // normal
                    normal.set(sinTheta, slope, cosTheta).normalize();
                    normals.setXYZ(index, normal.x(), normal.y(), normal.z());

                    // uv
                    uvs.setXY(index, u, 1 - v);

                    // save index of vertex in respective row
                    indexRow.add(index);

                    // increase index
                    index++;

                }

                // now save vertices of the row in our index array
                indexArray.add(indexRow);

            }

            // generate indices
            for (int x = 0; x < radialSegments; x++) {

                for (int y = 0; y < heightSegments; y++) {

                    // we use the index array to access the correct indices
                    int i1 = indexArray.get(y).get(x);
                    int i2 = indexArray.get(y + 1).get(x);
                    int i3 = indexArray.get(y + 1).get(x + 1);
                    int i4 = indexArray.get(y).get(x + 1);

                    // face one
                    indices.setX(indexOffset, i1);
                    indexOffset++;
                    indices.setX(indexOffset, i2);
                    indexOffset++;
                    indices.setX(indexOffset, i4);
                    indexOffset++;

                    // face two
                    indices.setX(indexOffset, i2);
                    indexOffset++;
                    indices.setX(indexOffset, i3);
                    indexOffset++;
                    indices.setX(indexOffset, i4);
                    indexOffset++;

                    // update counters
                    groupCount += 6;

                }

            }

            // add a group to the geometry. this will ensure multi material support
            addGroup(groupStart, groupCount, 0);

            // calculate new start value for groups
            groupStart += groupCount;
        }

        private void generateCap(boolean top) {
            int centerIndexStart, centerIndexEnd;

            Vector2d uv = new Vector2d();
            Vector3d vertex = new Vector3d();

            int groupCount = 0;

            double radius = (top) ? radiusTop : radiusBottom;
            int sign = (top) ? 1 : - 1;

            // save the index of the first center vertex
            centerIndexStart = index;

            // first we generate the center vertex data of the cap.
            // because the geometry needs one set of uvs per face,
            // we must generate a center vertex per face/segment
            for (int x = 1; x <= radialSegments; x++) {

                // vertex
                vertices.setXYZ(index, 0, halfHeight * sign, 0);

                // normal
                normals.setXYZ(index, 0, sign, 0);

                // uv
                uv.x(0.5);
                uv.y(0.5);

                uvs.setXY(index, uv.x(), uv.y());

                // increase index
                index++;

            }

            // save the index of the last center vertex
            centerIndexEnd = index;

            // now we generate the surrounding vertices, normals and uvs
            for (int x = 0; x <= radialSegments; x++) {

                double u = x / radialSegments;
                double theta = u * thetaLength.inRadians() + thetaStart.inRadians();

                double cosTheta = Math.cos(theta);
                double sinTheta = Math.sin(theta);

                // vertex
                vertex.x(radius * sinTheta);
                vertex.y(halfHeight * sign);
                vertex.z(radius * cosTheta);
                vertices.setXYZ(index, vertex.x(), vertex.y(), vertex.z());

                // normal
                normals.setXYZ(index, 0, sign, 0);

                // uv
                uv.x((cosTheta * 0.5) + 0.5);
                uv.y((sinTheta * 0.5 * sign) + 0.5);
                uvs.setXY(index, uv.x(), uv.y());

                // increase index
                index++;

            }

            // generate indices
            for (int x = 0; x < radialSegments; x++) {

                int c = centerIndexStart + x;
                int i = centerIndexEnd + x;

                if (top) {

                    // face top
                    indices.setX(indexOffset, i);
                    indexOffset++;
                    indices.setX(indexOffset, i + 1);
                    indexOffset++;
                    indices.setX(indexOffset, c);
                    indexOffset++;

                } else {

                    // face bottom
                    indices.setX(indexOffset, i + 1);
                    indexOffset++;
                    indices.setX(indexOffset, i);
                    indexOffset++;
                    indices.setX(indexOffset, c);
                    indexOffset++;

                }

                // update counters
                groupCount += 3;

            }

            // add a group to the geometry. this will ensure multi material support
            addGroup(groupStart, groupCount, top ? 1 : 2);

            // calculate new start value for groups
            groupStart += groupCount;
        }

    }

}
