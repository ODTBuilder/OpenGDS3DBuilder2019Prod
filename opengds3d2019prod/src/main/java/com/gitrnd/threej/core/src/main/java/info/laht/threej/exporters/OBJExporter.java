/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.exporters;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.objects.*;
import java.util.*;
import org.slf4j.*;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class OBJExporter {

	private final static Logger LOG = LoggerFactory.getLogger(OBJExporter.class);

	private StringBuilder output;

	private int indexVertex = 0;
	private int indexVertexUvs = 0;
	private int indexNormals = 0;

	public String parse(Object3D object) {

		output = new StringBuilder();

		indexVertex = 0;
		indexVertexUvs = 0;
		indexNormals = 0;

		object.traverse(child -> {

			if (object instanceof Mesh) {
				parseMesh((Mesh) object);
			}

			if (object instanceof Line) {
				parseLine((Line) object);
			}

		});

		return output.toString();

	}

	private void parseMesh(Mesh mesh) {
		int nbVertex = 0;
		int nbNormals = 0;
		int nbVertexUvs = 0;

		Vector3d vertex = new Vector3d();
		Vector3d normal = new Vector3d();
		Vector2d uv = new Vector2d();

		IGeometry iGeometry = mesh.geometry;

		if (iGeometry instanceof Geometry) {
			iGeometry = new BufferGeometry().setFromObject(mesh);
		}

		if (iGeometry instanceof BufferGeometry) {

			BufferGeometry geometry = (BufferGeometry) mesh.geometry;

			Matrix3d normalMatrixWorld = new Matrix3d();

			BufferAttribute vertices = geometry.getAttribute("position");
			BufferAttribute normals = geometry.getAttribute("normal");
			BufferAttribute uvs = geometry.getAttribute("uv");
			BufferAttribute indices = geometry.getIndex();

			// name of the mesh object
			output.append("o ").append(mesh.name).append("\n");

			// vertices
			if (vertices != null) {

				for (int i = 0, l = vertices.getCount(); i < l; i++, nbVertex++) {

					vertex.x(vertices.getX(i).doubleValue());
					vertex.y(vertices.getY(i).doubleValue());
					vertex.z(vertices.getZ(i).doubleValue());

					// transfrom the vertex to world space
					vertex.applyMatrix4(mesh.matrixWorld);

					// transform the vertex to export format
					output.append("v ").append(vertex.x()).append(" ").append(vertex.y()).append(" ").append(vertex.z())
							.append("\n");
				}

			}

			// uvs
			if (uvs != null) {

				for (int i = 0, l = uvs.getCount(); i < l; i++, nbVertexUvs++) {

					uv.x(uvs.getX(i).doubleValue());
					uv.y(uvs.getY(i).doubleValue());

					// transform the uv to export format
					output.append("vt ").append(uv.x()).append(" ").append(uv.y()).append("\n");

				}

			}

			// normals
			if (normals != null) {

				normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);

				for (int i = 0, l = normals.getCount(); i < l; i++, nbNormals++) {

					normal.x(normals.getX(i).doubleValue());
					normal.y(normals.getY(i).doubleValue());
					normal.z(normals.getZ(i).doubleValue());

					// transfrom the normal to world space
					normal.applyMatrix3(normalMatrixWorld);

					// transform the normal to export format
					output.append("vn ").append(normal.x()).append(" ").append(normal.y()).append(" ")
							.append(normal.z()).append("\n");

				}

			}

			// faces
			if (indices != null) {

				for (int i = 0, l = indices.getCount(); i < l; i += 3) {
					StringJoiner face = new StringJoiner(" ");
					for (int m = 0; m < 3; m++) {

						int j = indices.getX(i + m).intValue() + 1;
						face.add((indexVertex + j) + "/" + (uvs == null ? (indexVertexUvs + j) : "") + "/"
								+ (indexNormals + j));

					}

					// transform the face to export format
					output.append("f ").append(face.toString()).append("\n");

				}

			} else {

				for (int i = 0, l = vertices.getCount(); i < l; i += 3) {
					StringJoiner face = new StringJoiner(" ");
					for (int m = 0; m < 3; m++) {

						int j = i + m + 1;

						face.add((indexVertex + j) + "/" + (uvs == null ? (indexVertexUvs + j) : "") + "/"
								+ (indexNormals + j));

					}

					// transform the face to export format
					output.append("f ").append(face.toString()).append("\n");

				}

			}
		} else {
			LOG.error("Geometry type unsupported: {}", mesh.geometry);
		}

		// update index
		indexVertex += nbVertex;
		indexVertexUvs += nbVertexUvs;
		indexNormals += nbNormals;

	}

	private void parseLine(Line line) {

		int nbVertex = 0;

		Vector3d vertex = new Vector3d();

		BufferGeometry geometry = line.geometry;
		BufferAttribute vertices = geometry.getAttribute("position");
		BufferAttribute indices = geometry.getIndex();

		output.append("o ").append(line.name).append("\n");

		if (vertices != null) {

			for (int i = 0, l = vertices.getCount(); i < l; i++, nbVertex++) {

				vertex.x(vertices.getX(i).doubleValue());
				vertex.y(vertices.getY(i).doubleValue());
				vertex.z(vertices.getZ(i).doubleValue());

				// transfrom the vertex to world space
				vertex.applyMatrix4(line.matrixWorld);

				// transform the vertex to export format
				output.append("v ").append(vertex.x()).append(" ").append(vertex.y()).append(" ").append(vertex.z())
						.append("\n");

			}

		}

		if (line.type.equals("Line")) {

			output.append("l ");
			for (int j = 1, l = vertices.getCount(); j <= l; j++) {
				output.append(indexVertex).append(j).append(" ");
			}
			output.append("/n");

		} else if (line.type.equals("LineSegments")) {

			for (int j = 1, k = j + 1, l = vertices.getCount(); j < l; j += 2, k = j + 1) {
				output.append("l ").append(indexVertex).append(j).append(' ').append(indexVertex).append(k)
						.append("\n");
			}

		} else {
			LOG.warn("Geometry type unsupported: {}", geometry);
		}

		// update index
		indexVertex += nbVertex;

	}

}
