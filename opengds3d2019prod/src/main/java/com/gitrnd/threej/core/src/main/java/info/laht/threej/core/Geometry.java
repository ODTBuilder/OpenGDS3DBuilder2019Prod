/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Box3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Sphere;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.objects.Mesh;
import java.util.*;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/core/Geometry.js
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Geometry implements IGeometry {

	private final UUID uuid;
	private String name;

	public String type = "Geometry";

	public List<Vector3d> vertices;
	public List<Color> colors;
	public List<Face3> faces;
	public List<List<List<Vector2d>>> faceVertexUvs;

	public List<Double> lineDistances;

	public Box3d boundingBox;
	public Sphere boundingSphere;

	public boolean elementsNeedUpdate;
	public boolean verticesNeedUpdate;
	public boolean uvsNeedUpdate;
	public boolean normalsNeedUpdate;
	public boolean colorsNeedUpdate;
	public boolean lineDistancesNeedUpdate;
	public boolean groupsNeedUpdate;

	public Geometry() {
		this.name = "";
		this.uuid = UUID.randomUUID();

		this.vertices = new ArrayList<>();
		this.colors = new ArrayList<>();
		this.faces = new ArrayList<>();
		this.faceVertexUvs = new ArrayList<>();
		this.faceVertexUvs = new ArrayList<>();

		this.lineDistances = new ArrayList<>();

		this.boundingBox = null;
		this.boundingSphere = null;

	}

	public UUID getUuid() {
		return uuid;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Box3d getBoundingBox() {
		return boundingBox;
	}

	public Sphere getBoundingSphere() {
		return boundingSphere;
	}

	public void applyMatrix(Matrix4d matrix) {
		Matrix3d normalMatrix = new Matrix3d().getNormalMatrix(matrix);

		for (int i = 0; i < this.vertices.size(); i++) {
			Vector3d vertex = vertices.get(i);
			vertex.applyMatrix4(matrix);
		}

		for (int i = 0; i < this.faces.size(); i++) {
			Face3 face = faces.get(i);
			face.normal.applyMatrix3(normalMatrix);

			for (int j = 0; j < face.vertexNormals.size(); j++) {
				face.vertexNormals.get(j).applyMatrix3(normalMatrix).normalize();
			}

		}

		if (boundingBox != null) {
			computeBoundingBox();
		}

		if (boundingSphere != null) {
			computeBoundingSphere();
		}

		verticesNeedUpdate = true;
		normalsNeedUpdate = true;

	}

	public void rotateX(Angle angle) {

		Matrix4d m1 = new Matrix4d().makeRotationX(angle);
		applyMatrix(m1);

	}

	public void rotateY(Angle angle) {

		Matrix4d m1 = new Matrix4d().makeRotationY(angle);
		applyMatrix(m1);

	}

	public void rotateZ(Angle angle) {

		Matrix4d m1 = new Matrix4d().makeRotationZ(angle);
		applyMatrix(m1);

	}

	public Geometry translate(double x, double y, double z) {
		Matrix4d m1 = new Matrix4d().makeTranslation(x, y, z);
		applyMatrix(m1);
		return this;
	}

	public Geometry scale(double x, double y, double z) {
		Matrix4d m1 = new Matrix4d().makeScale(x, y, z);
		applyMatrix(m1);
		return this;
	}

	public void lookAt(Vector3d vector) {

		Object3D obj = new Object3D();
		obj.lookAt(vector);
		obj.updateMatrix();
		this.applyMatrix(obj.matrix);

	}

	public Vector3d center() {
		this.computeBoundingBox();
		Vector3d offset = boundingBox.getCenter(null).negate();
		translate(offset.x(), offset.y(), offset.z());
		return offset;
	}

	public Geometry normalize() {
		this.computeBoundingSphere();

		Vector3d center = this.boundingSphere.getCenter();
		double radius = this.boundingSphere.getRadius();

		double s = radius == 0 ? 1 : 1.0 / radius;

		Matrix4d matrix = new Matrix4d();
		matrix.set(s, 0, 0, -s * center.x(), 0, s, 0, -s * center.y(), 0, 0, s, -s * center.z(), 0, 0, 0, 1);

		applyMatrix(matrix);

		return this;
	}

	public void computeFaceNormals() {
		Vector3d cb = new Vector3d(), ab = new Vector3d();

		for (int f = 0, fl = this.faces.size(); f < fl; f++) {

			Face3 face = this.faces.get(f);

			Vector3d vA = this.vertices.get(face.a);
			Vector3d vB = this.vertices.get(face.b);
			Vector3d vC = this.vertices.get(face.c);

			cb.sub(vC, vB);
			ab.sub(vA, vB);
			cb.cross(ab);

			cb.normalize();

			face.normal.copy(cb);

		}
	}

	public void computeVertexNormals(boolean areaWeighted) {
		int v, vl, f, fl;
		Face3 face;

		List<Vector3d> vertices = new ArrayList(this.vertices.size());
		for (v = 0, vl = this.vertices.size(); v < vl; v++) {
			vertices.add(new Vector3d());
		}

		if (areaWeighted) {

			// vertex normals weighted by triangle areas
			// http://www.iquilezles.org/www/articles/normals/normals.htm
			Vector3d vA, vB, vC;
			Vector3d cb = new Vector3d(), ab = new Vector3d();

			for (f = 0, fl = this.faces.size(); f < fl; f++) {

				face = this.faces.get(f);

				vA = this.vertices.get(face.a);
				vB = this.vertices.get(face.b);
				vC = this.vertices.get(face.c);

				cb.sub(vC, vB);
				ab.sub(vA, vB);
				cb.cross(ab);

				vertices.get(face.a).add(cb);
				vertices.get(face.b).add(cb);
				vertices.get(face.c).add(cb);

			}

		} else {

			this.computeFaceNormals();

			for (f = 0, fl = this.faces.size(); f < fl; f++) {

				face = this.faces.get(f);

				vertices.get(face.a).add(face.normal);
				vertices.get(face.b).add(face.normal);
				vertices.get(face.c).add(face.normal);

			}

		}

		for (v = 0, vl = this.vertices.size(); v < vl; v++) {
			vertices.get(v).normalize();
		}

		for (f = 0, fl = this.faces.size(); f < fl; f++) {

			face = this.faces.get(f);

			List<Vector3d> vertexNormals = face.vertexNormals;

			if (vertexNormals.size() == 3) {

				vertexNormals.get(0).copy(vertices.get(face.a));
				vertexNormals.get(1).copy(vertices.get(face.b));
				vertexNormals.get(2).copy(vertices.get(face.c));

			} else {

				vertexNormals.set(0, vertices.get(face.a).copy());
				vertexNormals.set(1, vertices.get(face.b).copy());
				vertexNormals.set(2, vertices.get(face.c).copy());

			}

		}

		if (this.faces.size() > 0) {

			this.normalsNeedUpdate = true;

		}
	}

	public void computeFlatVertexNormals() {
		int f, fl;
		Face3 face;

		this.computeFaceNormals();

		for (f = 0, fl = this.faces.size(); f < fl; f++) {

			face = this.faces.get(f);

			List<Vector3d> vertexNormals = face.vertexNormals;

			if (vertexNormals.size() == 3) {

				vertexNormals.get(0).copy(face.normal);
				vertexNormals.get(1).copy(face.normal);
				vertexNormals.get(2).copy(face.normal);

			} else {

				vertexNormals.add(0, face.normal.copy());
				vertexNormals.add(1, face.normal.copy());
				vertexNormals.add(2, face.normal.copy());

			}

		}

		if (this.faces.size() > 0) {

			this.normalsNeedUpdate = true;

		}

	}

	public void computeLineDistances() {

		double d = 0;
		for (int i = 0, il = vertices.size(); i < il; i++) {

			if (i > 0) {
				d += vertices.get(i).distanceTo(vertices.get(i - 1));
			}

			this.lineDistances.set(i, d);
		}

	}

	@Override
	public void computeBoundingBox() {
		if (this.boundingBox == null) {
			this.boundingBox = new Box3d();
		}
		this.boundingBox.setFromPoints(vertices);
	}

	@Override
	public void computeBoundingSphere() {
		if (this.boundingSphere == null) {
			this.boundingSphere = new Sphere();
		}
		this.boundingSphere.setFromPoints(vertices, null);
	}

	public void sortFacesByMaterialIndex() {

		for (int i = 0; i < faces.size(); i++) {
			faces.get(i);
		}

		faces.sort((Face3 a, Face3 b) -> a.materialIndex - b.materialIndex);

		// sort uvs
		List<List<Vector2d>> uvs1 = this.faceVertexUvs.get(0);
		List<List<Vector2d>> uvs2 = this.faceVertexUvs.get(1);

		List<List<Vector2d>> newUvs1 = null, newUvs2 = null;

		if (uvs1 != null && uvs1.size() == faces.size()) {
			newUvs1 = new ArrayList<>();
		}
		if (uvs2 != null && uvs2.size() == faces.size()) {
			newUvs2 = new ArrayList<>();
		}

		for (int i = 0; i < faces.size(); i++) {

			int id = faces.get(i)._id;

			if (newUvs1 != null) {
				newUvs1.add(uvs1.get(id));
			}
			if (newUvs2 != null) {
				newUvs2.add(uvs2.get(id));
			}

		}

		if (newUvs1 != null) {
			this.faceVertexUvs.set(0, newUvs1);
		}
		if (newUvs2 != null) {
			this.faceVertexUvs.set(1, newUvs2);
		}

	}

	public Geometry fromBufferGeometry(BufferGeometry geometry) {

		List<Number> indices = geometry.index != null ? geometry.index.array : null;
		Map<String, BufferAttribute> attributes = geometry.attributes;

		List<Number> positions = attributes.get("position").array;
		List<Number> normals = attributes.containsKey("normal") ? attributes.get("normal").array : null;
		List<Number> colors = attributes.containsKey("color") ? attributes.get("color").array : null;

		List<Vector3d> tempNormals = new ArrayList<>();

		for (int i = 0, j = 0; i < positions.size(); i += 3, j += 2) {

			this.vertices.add(new Vector3d(positions.get(i).doubleValue(), positions.get(i + 1).doubleValue(),
					positions.get(i + 2).doubleValue()));

			if (normals != null) {
				tempNormals.add(new Vector3d(normals.get(i).doubleValue(), normals.get(i + 1).doubleValue(),
						normals.get(i + 2).doubleValue()));
			}

			if (colors != null) {
				this.colors.add(new Color(colors.get(i).floatValue(), colors.get(i + 1).floatValue(),
						colors.get(i + 2).floatValue()));
			}
		}

		if (indices != null) {
			List<GeometryGroup> groups = geometry.groups;

			if (groups.size() > 0) {
				for (int i = 0; i < groups.size(); i++) {
					GeometryGroup group = groups.get(i);

					int start = group.start;
					int count = group.count;

					for (int j = start, j1 = start + count; j < j1; j += 3) {
						addFace(indices.get(j).intValue(), indices.get(j + 1).intValue(), indices.get(j + 2).intValue(),
								group.materialIndex, normals, tempNormals, colors);
					}
				}
			} else {
				for (int i = 0; i < indices.size(); i += 3) {
					addFace(indices.get(i).intValue(), indices.get(i + 1).intValue(), indices.get(i + 2).intValue(),
							null, null, null, null);
				}
			}
		} else {
			for (int i = 0; i < positions.size() / 3; i += 3) {
				addFace(i, i + 1, i + 2, null, null, null, null);
			}
		}

		this.computeFaceNormals();

		if (geometry.boundingBox != null) {
			this.boundingBox = geometry.boundingBox.copy();
		}

		if (geometry.boundingSphere != null) {
			this.boundingSphere = geometry.boundingSphere.copy();
		}

		return this;
	}

	private void addFace(int a, int b, int c, Integer materialIndex, List<Number> normals, List<Vector3d> tempNormals,
			List<Number> colors) {
		List<Vector3d> vertexNormals = normals != null ? new ArrayList<>(Arrays.asList(
				new Vector3d[] { tempNormals.get(a).copy(), tempNormals.get(b).copy(), tempNormals.get(c).copy() }))
				: new ArrayList<>();
		List<Color> vertexColors = colors != null ? new ArrayList<>(Arrays.asList(
				new Color[] { this.colors.get(a).copy(), this.colors.get(b).copy(), this.colors.get(c).copy() }))
				: new ArrayList<>();

		Face3 face = new Face3(a, b, c, vertexNormals, vertexColors, materialIndex);
		faces.add(face);
	}

	public void mergeMesh(Mesh mesh) {
		if (mesh.matrixAutoUpdate) {
			mesh.updateMatrix();
		}

		if (!(mesh.geometry instanceof Geometry)) {
			throw new IllegalArgumentException("Mesh.geometry is not an instance of Geometry!");
		}

		merge((Geometry) mesh.geometry, mesh.matrix, null);

	}

	public void merge(Geometry geometry, Matrix4d matrix, Integer materialIndexOffset) {

		Matrix3d normalMatrix = null;
		int vertexOffset = vertices.size();
		List<Vector3d> vertices1 = this.vertices;
		List<Vector3d> vertices2 = geometry.vertices;
		List<Face3> faces1 = this.faces;
		List<Face3> faces2 = geometry.faces;
		List<List<Vector2d>> uvs1 = this.faceVertexUvs.get(0);
		List<List<Vector2d>> uvs2 = geometry.faceVertexUvs.get(0);
		List<Color> colors1 = this.colors;
		List<Color> colors2 = geometry.colors;

		if (materialIndexOffset == null) {
			materialIndexOffset = 0;
		}

		if (matrix != null) {
			normalMatrix = new Matrix3d().getNormalMatrix(matrix);
		}

		// vertices
		for (int i = 0, il = vertices2.size(); i < il; i++) {

			Vector3d vertex = vertices2.get(i);

			Vector3d vertexCopy = vertex.copy();

			if (matrix != null) {
				vertexCopy.applyMatrix4(matrix);
			}

			vertices1.add(vertexCopy);

		}

		// colors
		for (int i = 0, il = colors2.size(); i < il; i++) {
			colors1.add(colors2.get(i).copy());
		}

		// faces
		for (int i = 0, il = faces2.size(); i < il; i++) {

			Face3 face = faces2.get(i), faceCopy;
			Vector3d normal;
			Color color;
			List<Vector3d> faceVertexNormals = face.vertexNormals;
			List<Color> faceVertexColors = face.vertexColors;

			faceCopy = new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset,
					new Vector3d().copy(face.normal));

			if (normalMatrix != null) {

				faceCopy.normal.applyMatrix3(normalMatrix).normalize();

			}

			for (int j = 0, jl = faceVertexNormals.size(); j < jl; j++) {

				normal = faceVertexNormals.get(j).copy();

				if (normalMatrix != null) {
					normal.applyMatrix3(normalMatrix).normalize();
				}

				faceCopy.vertexNormals.add(normal);

			}

			faceCopy.color.copy(face.color);

			for (int j = 0, jl = faceVertexColors.size(); j < jl; j++) {

				color = faceVertexColors.get(j);
				faceCopy.vertexColors.add(color.copy());

			}

			faceCopy.materialIndex = face.materialIndex + materialIndexOffset;

			faces1.add(faceCopy);

		}

		// uvs
		for (int i = 0, il = uvs2.size(); i < il; i++) {

			List<Vector2d> uv = uvs2.get(i);
			List<Vector2d> uvCopy = new ArrayList<>();

			if (uv == null) {
				continue;
			}

			for (int j = 0, jl = uv.size(); j < jl; j++) {

				uvCopy.add(uv.get(j).copy());

			}

			uvs1.add(uvCopy);

		}

	}

	public int mergeVertices() {
		Map<String, Integer> verticesMap = new HashMap<>(); // Hashmap for looking up vertices by position coordinates
															// (and making sure they are unique)
		List<Vector3d> unique = new ArrayList<>();
		List<Integer> changes = new ArrayList<>();

		int precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
		double precision = Math.pow(10, precisionPoints);

		for (int i = 0, il = this.vertices.size(); i < il; i++) {

			Vector3d v = this.vertices.get(i);
			String key = "" + Math.round(v.x() * precision) + '_' + Math.round(v.y() * precision) + '_'
					+ Math.round(v.z() * precision);

			if (verticesMap.get(key) == null) {

				verticesMap.put(key, i);
				unique.add(this.vertices.get(i));
				while (changes.size() <= i) {
					changes.add(null);
				}
				changes.set(i, unique.size() - 1);

			} else {

				// console.log('Duplicate vertex found. ', i, ' could be using ',
				// verticesMap[key]);
				while (changes.size() <= i) {
					changes.add(null);
				}
				changes.set(i, changes.get(verticesMap.get(key)));

			}

		}

		// if faces are completely degenerate after merging vertices, we
		// have to remove them from the geometry.
		List<Integer> faceIndicesToRemove = new ArrayList();

		for (int i = 0, il = this.faces.size(); i < il; i++) {

			Face3 face = this.faces.get(i);

			face.a = changes.get(face.a);
			face.b = changes.get(face.b);
			face.c = changes.get(face.c);

			int[] indices = new int[] { face.a, face.b, face.c };

			// if any duplicate vertices are found in a Face3
			// we have to remove the face as nothing can be saved
			for (int n = 0; n < 3; n++) {

				if (indices[n] == indices[(n + 1) % 3]) {

					faceIndicesToRemove.add(i);
					break;

				}

			}

		}

		for (int i = faceIndicesToRemove.size() - 1; i >= 0; i--) {

			int idx = faceIndicesToRemove.get(i);

			this.faces.remove(idx);

			for (int j = 0, jl = this.faceVertexUvs.size(); j < jl; j++) {
				this.faceVertexUvs.get(j).remove(idx);
			}

		}

		// Use unique set of vertices
		int diff = this.vertices.size() - unique.size();
		this.vertices.clear();
		this.vertices.addAll(unique);
		return diff;
	}

}
