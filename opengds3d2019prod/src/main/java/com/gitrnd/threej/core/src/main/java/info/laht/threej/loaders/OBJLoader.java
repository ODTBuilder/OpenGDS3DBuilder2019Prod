/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.loaders;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Object3D;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.Material;
import java.util.List;
import java.util.Map;

/**
 *
 * @author laht
 */
public class OBJLoader {

    // v float float float
    private final static String vertex_pattern = "^v\\s+([\\d|\\.|\\+|\\-|e|E]+)\\s+([\\d|\\.|\\+|\\-|e|E]+)\\s+([\\d|\\.|\\+|\\-|e|E]+)";
    // vn float float float
    private final static String normal_pattern = "^vn\\s+([\\d|\\.|\\+|\\-|e|E]+)\\s+([\\d|\\.|\\+|\\-|e|E]+)\\s+([\\d|\\.|\\+|\\-|e|E]+)";
    // vt float float
    private final static String uv_pattern = "^vt\\s+([\\d|\\.|\\+|\\-|e|E]+)\\s+([\\d|\\.|\\+|\\-|e|E]+)";
    // f vertex vertex vertex
    private final static String face_vertex = "^f\\s+(-?\\d+)\\s+(-?\\d+)\\s+(-?\\d+)(?:\\s+(-?\\d+))?";
    // f vertex/uv vertex/uv vertex/uv
    private final static String face_vertex_uv = "^f\\s+(-?\\d+)\\/(-?\\d+)\\s+(-?\\d+)\\/(-?\\d+)\\s+(-?\\d+)\\/(-?\\d+)(?:\\s+(-?\\d+)\\/(-?\\d+))?";
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
    private final static String face_vertex_uv_normal = "^f\\s+(-?\\d+)\\/(-?\\d+)\\/(-?\\d+)\\s+(-?\\d+)\\/(-?\\d+)\\/(-?\\d+)\\s+(-?\\d+)\\/(-?\\d+)\\/(-?\\d+)(?:\\s+(-?\\d+)\\/(-?\\d+)\\/(-?\\d+))?";
    // f vertex//normal vertex//normal vertex//normal
    private final static String face_vertex_normal = "^f\\s+(-?\\d+)\\/\\/(-?\\d+)\\s+(-?\\d+)\\/\\/(-?\\d+)\\s+(-?\\d+)\\/\\/(-?\\d+)(?:\\s+(-?\\d+)\\/\\/(-?\\d+))?";
    // o object_name | g group_name
    private final static String object_pattern = "^[og]\\s*(.+)?";
    // s boolean
    private final static String smoothing_pattern = "^s\\s+(\\d+|on|off)";
    // mtllib file_reference
    private final static String material_library_pattern = "^mtllib ";
    // usemtl material_name
    private final static String material_use_pattern = "^usemtl ";

    private List<Material> materials;

    public void setMaterials(List<Material> materials) {
        this.materials = materials;
    }

    private class ParserState {

        List<Object3D> objects;
        ParserObject object;

        List<Double> vertices;
        List<Double> normals;
        List<Double> uvs;

        private void startobject(String name, boolean fromDeclaration) {

            if (object != null && !object.fromDeclaration) {

                object.name = name;

            }

        }
        
        private void _finalize() {
            if (object != null) {
//                object._finalize(true);
            }
        }

        private int parseVertexIndex(String value, int len) {
            int index = Integer.parseInt(value, 10);
            return (index >= 0 ? index - 1 : index + len / 3) * 3;
        }

        private int parseNormalIndex(String value, int len) {

            int index = Integer.parseInt(value, 10);
            return (index >= 0 ? index - 1 : index + len / 3) * 3;

        }

        public int parseUVIndex(String value, int len) {

            int index = Integer.parseInt(value, 10);
            return (index >= 0 ? index - 1 : index + len / 2) * 2;

        }

        public void addVertex(int a, int b, int c) {

            List<Double> src = this.vertices;
            List<Double> dst = this.object.geometry.vertices;

//        dst.add(src[a + 0]);
//        dst.add(src[a + 1]);
//        dst.add(src[a + 2]);
//        dst.add(src[b + 0]);
//        dst.add(src[b + 1]);
//        dst.add(src[b + 2]);
//        dst.add(src[c + 0]);
//        dst.add(src[c + 1]);
//        dst.add(src[c + 2]);
        }

        private void addVertexLine(int a) {

            List<Double> src = this.vertices;
            List<Double> dst = this.object.geometry.vertices;

//        dst.add(src[a + 0]);
//        dst.add(src[a + 1]);
//        dst.add(src[a + 2]);
        }

        private void addNormal(int a, int b, int c) {

            List<Double> src = this.normals;
            List<Double> dst = this.object.geometry.normals;

//        dst.add(src[a + 0]);
//        dst.add(src[a + 1]);
//        dst.add(src[a + 2]);
//        dst.add(src[b + 0]);
//        dst.add(src[b + 1]);
//        dst.add(src[b + 2]);
//        dst.add(src[c + 0]);
//        dst.add(src[c + 1]);
//        dst.add(src[c + 2]);
        }

        private void addUV(int a, int b, int c) {

            List<Double> src = this.uvs;
            List<Double> dst = this.object.geometry.uvs;

//        dst.add(src[a + 0]);
//        dst.add(src[a + 1]);
//        dst.add(src[b + 0]);
//        dst.add(src[b + 1]);
//        dst.add(src[c + 0]);
//        dst.add(src[c + 1]);
        }

        private void addUVLine(int a) {

            List<Double> src = this.uvs;
            List<Double> dst = this.object.geometry.uvs;

//        dst.add(src[a + 0]);
//        dst.add(src[a + 1]);
        }

    }

    private class ParserObject {

        String name;
        boolean fromDeclaration;
        Geometry geometry;
        List<ParserMaterial> materials;
        boolean smooth;

        public ParserObject(String name, boolean fromDeclaration, Geometry geometry, List<ParserMaterial> materials, boolean smooth) {
            this.name = name;
            this.fromDeclaration = fromDeclaration;
            this.geometry = geometry;
            this.materials = materials;
            this.smooth = smooth;
        }

        private void startMaterial(String name, Object libraries) {

        }

        private class Geometry {

            List<Double> vertices;
            List<Double> normals;
            List<Double> uvs;

        }

        private class ParserMaterial {

        }

    }

}
