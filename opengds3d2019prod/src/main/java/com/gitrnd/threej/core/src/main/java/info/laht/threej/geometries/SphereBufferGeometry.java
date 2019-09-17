/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries;

import com.google.common.primitives.Ints;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class SphereBufferGeometry extends BufferGeometry {

    private double radius;
    private int widthSegments;
    private int heightSegments;
    private final Angle phiStart;
    private final Angle phiLength;
    private final Angle thetaStart;
    private final Angle thetaLength;

    public SphereBufferGeometry(double radius) {
        this(radius, 8, 6, Angle.rad(0), Angle.rad(Math.PI * 2), Angle.rad(0), Angle.rad(Math.PI));
    }

    public SphereBufferGeometry(double radius, int widthSegments, int heightSegments, Angle phiStart, Angle phiLength, Angle thetaStart, Angle thetaLength) {

        type = "SphereBufferGeometry";

        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.phiStart = phiStart;
        this.phiLength = phiLength;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;

        SphereBufferGeometryHelper helper = new SphereBufferGeometryHelper();

        setIndex(new BufferAttribute.IntBufferAttribute(Ints.toArray(helper.indices), 1));
        addAttribute("position", helper.positions);
        addAttribute("normal", helper.normals);
        addAttribute("uvs", helper.uvs);

        this.boundingSphere = new Sphere(new Vector3d(), radius);

    }

    private class SphereBufferGeometryHelper {

        List<Integer> indices;
        BufferAttribute.DoubleBufferAttribute positions;
        BufferAttribute.DoubleBufferAttribute normals;
        BufferAttribute.DoubleBufferAttribute uvs;

        public SphereBufferGeometryHelper() {
            double thetaEnd = thetaStart.inRadians() + thetaLength.inRadians();

            int vertexCount = ((widthSegments + 1) * (heightSegments + 1));

            positions = new BufferAttribute.DoubleBufferAttribute(new double[vertexCount * 3], 3);
            normals = new BufferAttribute.DoubleBufferAttribute(new double[vertexCount * 3], 3);
            uvs = new BufferAttribute.DoubleBufferAttribute(new double[vertexCount * 2], 2);

            int index = 0;
            Vector3d normal = new Vector3d();

            List<List<Integer>> vertices = new ArrayList<>();

            for (int y = 0; y <= heightSegments; y++) {

                List<Integer> verticesRow = new ArrayList<>();

                double v = (double)y / heightSegments;

                for (int x = 0; x <= widthSegments; x++) {

                    double u = (double) x / widthSegments;

                    double px = -radius * Math.cos(phiStart.inRadians() + u * phiLength.inRadians()) * Math.sin(thetaStart.inRadians() + v * thetaLength.inRadians());
                    double py = radius * Math.cos(thetaStart.inRadians() + v * thetaLength.inRadians());
                    double pz = radius * Math.sin(phiStart.inRadians() + u * phiLength.inRadians()) * Math.sin(thetaStart.inRadians() + v * thetaLength.inRadians());

                    normal.set(px, py, pz).normalize();

                    positions.setXYZ(index, px, py, pz);
                    normals.setXYZ(index, normal.x(), normal.y(), normal.z());
                    uvs.setXY(index, u, 1 - v);

                    verticesRow.add(index);

                    index++;

                }

                vertices.add(verticesRow);

            }

            indices = new ArrayList<>();

            for (int y = 0; y < heightSegments; y++) {

                for (int x = 0; x < widthSegments; x++) {

                    int v1 = vertices.get(y).get(x + 1);
                    int v2 = vertices.get(y).get(x);
                    int v3 = vertices.get(y + 1).get(x);
                    int v4 = vertices.get(y + 1).get(x + 1);

                    if (y != 0 || thetaStart.inRadians() > 0) {
                        indices.add(v1);
                        indices.add(v2);
                        indices.add(v4);
                    }
                    if (y != heightSegments - 1 || thetaEnd < Math.PI) {
                        indices.add(v2);
                        indices.add(v3);
                        indices.add(v4);
                    }

                }

            }
        }

    }

}
