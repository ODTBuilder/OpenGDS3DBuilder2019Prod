/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.exporters;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Object3D;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.objects.Mesh;
import java.util.List;

/**
 *
 * @author laht
 */
public class STLExporter {

    public String parse(Object3D scene) {

        StringBuilder output = new StringBuilder();

        output.append("solid exported\n");

        Vector3d vector = new Vector3d();
        Matrix3d normalMatrixWorld = new Matrix3d();

        scene.traverse((object) -> {

            if (object instanceof Mesh) {

                IGeometry geometry = ((Mesh) object).geometry;
                Matrix4d matrixWorld = object.matrixWorld;

                if (geometry instanceof Geometry) {

                    List<Vector3d> vertices = ((Geometry) geometry).vertices;
                    List<Face3> faces = ((Geometry) geometry).faces;

                    normalMatrixWorld.getNormalMatrix(matrixWorld);

                    for (int i = 0, l = faces.size(); i < l; i++) {

                        Face3 face = faces.get(i);

                        vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

                        output.append("\tfacet normal ").append(vector.x()).append(" ").append(vector.y()).append(" ").append(vector.z()).append("\n");
                        output.append("\t\touter loop\n");

                        int[] indices = new int[]{face.a, face.b, face.c};

                        for (int j = 0; j < 3; j++) {

                            vector.copy(vertices.get(indices[j])).applyMatrix4(matrixWorld);

                            output.append("\t\t\tvertex ").append(vector.x()).append(" ").append(vector.y()).append(" ").append(vector.z()).append("\n");

                        }

                        output.append("\t\tendloop\n");
                        output.append("\tendfacet\n");

                    }

                }

            }

        });
        
        output.append("endsolid exported\n");

        return output.toString();

    }

}
