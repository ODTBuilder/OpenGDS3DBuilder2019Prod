/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Box3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Sphere;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author laht
 */
public class DirectGeometry implements Serializable {

    private final static Logger LOG = LoggerFactory.getLogger(DirectGeometry.class);

    public final List<Vector3d> vertices;
    public final List<Vector3d> normals;
    public final List<Color> colors;
    public final List<Vector2d> uvs;

    public List<GeometryGroup> groups;

    public Box3d boundingBox;
    public Sphere boundingSphere;

    // update flags
    public boolean verticesNeedUpdate;
    public boolean normalsNeedUpdate;
    public boolean colorsNeedUpdate;
    public boolean uvsNeedUpdate;
    public boolean groupsNeedUpdate;

    public DirectGeometry() {
        this.vertices = new ArrayList<>();
        this.normals = new ArrayList<>();
        this.colors = new ArrayList<>();
        this.uvs = new ArrayList<>();
    }

    private void computeGroups(Geometry geometry) {

        GeometryGroup group = null;
        List<GeometryGroup> groups = new ArrayList<>();
        int materialIndex = -1;

        List<Face3> faces = geometry.faces;

        int i = 0;
        for (; i < faces.size(); i++) {

            Face3 face = faces.get(i);

			// materials
            if (face.materialIndex != materialIndex) {

                materialIndex = face.materialIndex;

                if (group != null) {

                    group.count = (i * 3) - group.start;
                    groups.add(group);

                }

                group = new GeometryGroup();
                group.start = i * 3;
                group.materialIndex = materialIndex;

            }

        }

        if (group != null) {

            group.count = (i * 3) - group.start;
            groups.add(group);

        }

        this.groups = groups;

    }

    public DirectGeometry fromGeometry(Geometry geometry) {

        List<Face3> faces = geometry.faces;
        List<Vector3d> vertices = geometry.vertices;
        List<List<List<Vector2d>>> faceVertexUvs = geometry.faceVertexUvs;

        boolean hasFaceVertexUv = faceVertexUvs.get(0) != null && faceVertexUvs.get(0).size() > 0;
        boolean hasFaceVertexUv2 = faceVertexUvs.get(1) != null && faceVertexUvs.get(0).size() > 0;

        // morphs
        /**
         * var morphTargets = geometry.morphTargets; var morphTargetsLength =
         * morphTargets.length;
         *
         * var morphTargetsPosition;
         *
         * if ( morphTargetsLength > 0 ) {
         *
         * morphTargetsPosition = [];
         *
         * for ( var i = 0; i < morphTargetsLength; i ++ ) {
         *
         * morphTargetsPosition[ i ] = [];
         *
         * }
         *
         * this.morphTargets.position = morphTargetsPosition;
         *
         * }
         *
         * var morphNormals = geometry.morphNormals;
         * var morphNormalsLength = morphNormals.length;
         *
         * var morphTargetsNormal;
         *
         * if ( morphNormalsLength > 0 ) {
         *
         * morphTargetsNormal = [];
         *
         * for ( var i = 0; i < morphNormalsLength; i ++ ) {
         *
         * morphTargetsNormal[ i ] = [];
         *
         * }
         *
         * this.morphTargets.normal = morphTargetsNormal;
         *
         * }
         *
         * // skins
         *
         * var skinIndices = geometry.skinIndices; var skinWeights =
         * geometry.skinWeights;
         *
         * var hasSkinIndices = skinIndices.length === vertices.length; var
         * hasSkinWeights = skinWeights.length === vertices.length;
         *
         */
        for (int i = 0; i < faces.size(); i++) {

            Face3 face = faces.get(i);

            this.vertices.add(vertices.get(face.a));
            this.vertices.add(vertices.get(face.b));
            this.vertices.add(vertices.get(face.c));

            List<Vector3d> vertexNormals = face.vertexNormals;

            if (vertexNormals.size() == 3) {

                this.normals.add(vertexNormals.get(0));
                this.normals.add(vertexNormals.get(1));
                this.normals.add(vertexNormals.get(2));

            } else {

                Vector3d normal = face.normal;

                this.normals.add(normal);
                this.normals.add(normal);
                this.normals.add(normal);

            }

            List<Color> vertexColors = face.vertexColors;

            if (vertexColors.size() == 3) {

                this.colors.add(vertexColors.get(0));
                this.colors.add(vertexColors.get(1));
                this.colors.add(vertexColors.get(2));

            } else {

                Color color = face.color;

                this.colors.add(color);
                this.colors.add(color);
                this.colors.add(color);

            }

            if (hasFaceVertexUv) {

                List<Vector2d> vertexUvs = faceVertexUvs.get(0).get(i);

                if (vertexUvs != null) {

                    this.uvs.add(vertexUvs.get(0));
                    this.uvs.add(vertexUvs.get(0));
                    this.uvs.add(vertexUvs.get(0));
                } else {

                    LOG.warn("Undefined vertexUv {}", i);

                    this.uvs.add(new Vector2d());
                    this.uvs.add(new Vector2d());
                    this.uvs.add(new Vector2d());

                }

            }

        }

        this.computeGroups(geometry);

        this.verticesNeedUpdate = geometry.verticesNeedUpdate;
        this.normalsNeedUpdate = geometry.normalsNeedUpdate;
        this.colorsNeedUpdate = geometry.colorsNeedUpdate;
        this.uvsNeedUpdate = geometry.uvsNeedUpdate;
        this.groupsNeedUpdate = geometry.groupsNeedUpdate;

        return this;

    }
   
}
