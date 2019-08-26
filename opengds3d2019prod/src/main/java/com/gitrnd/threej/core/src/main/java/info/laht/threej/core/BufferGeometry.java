/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Box3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Sphere;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;

/**
 *
 * @author laht
 */
public class BufferGeometry implements IGeometry {

	private final UUID uuid;
	private String name;

	public String type = "BufferGeometry";

	public BufferAttribute.IntBufferAttribute index;

	public Map<String, BufferAttribute> attributes;

	public List<GeometryGroup> groups;

	public boolean hasColors;
	public float alpha;

	public Box3d boundingBox;
	public Sphere boundingSphere;

	private DrawRange drawrange;

	public BufferGeometry() {
		this.uuid = UUID.randomUUID();
		this.name = "";

		this.index = null;

		this.attributes = new HashMap<>();

		this.groups = new ArrayList<>();

		this.boundingBox = null;
		this.boundingSphere = null;

		this.drawrange = new DrawRange(0, Double.POSITIVE_INFINITY);
	}

	@Override
	public UUID getUuid() {
		return uuid;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void setName(String name) {
		this.name = name;
	}

	@Override
	public Box3d getBoundingBox() {
		return boundingBox;
	}

	@Override
	public Sphere getBoundingSphere() {
		return boundingSphere;
	}

	public BufferAttribute getIndex() {
		return index;
	}

	public void setIndex(BufferAttribute.IntBufferAttribute index) {
		this.index = index;
	}

	public void addAttribute(String name, BufferAttribute attribute) {

		if (name.equals("index")) {
			setIndex((BufferAttribute.IntBufferAttribute) attribute);
			return;
		}

		attributes.put(name, attribute);

	}

	public BufferAttribute getAttribute(String name) {
		return attributes.get(name);
	}

	public void removeAttribute(String name) {
		attributes.remove(name);
	}

	public void addGroup(int start, int count, int materialIndex) {
		GeometryGroup group = new GeometryGroup();
		group.start = start;
		group.count = count;
		group.materialIndex = materialIndex;
		this.groups.add(group);
	}

	public void clearGroups() {
		groups.clear();
	}

	public void setDrawRange(int start, double count) {
		drawrange.setStart(start);
		drawrange.setCount(count);
	}

	@Override
	public void rotateX(Angle angle) {

		Matrix4d m1 = new Matrix4d().makeRotationX(angle);
		applyMatrix(m1);

	}

	@Override
	public void rotateY(Angle angle) {

		Matrix4d m1 = new Matrix4d().makeRotationY(angle);
		applyMatrix(m1);

	}

	@Override
	public void rotateZ(Angle angle) {

		Matrix4d m1 = new Matrix4d().makeRotationZ(angle);
		applyMatrix(m1);

	}

	public BufferGeometry translate(double x, double y, double z) {

		Matrix4d m1 = new Matrix4d().makeTranslation(x, y, z);
		applyMatrix(m1);

		return this;

	}

	public BufferGeometry scale(double x, double y, double z) {

		Matrix4d m1 = new Matrix4d().makeScale(x, y, z);
		applyMatrix(m1);

		return this;

	}

	public void lookAt(Vector3d vector) {

		Object3D obj = new Object3D();
		obj.lookAt(vector);
		obj.updateMatrix();
		applyMatrix(obj.matrix);

	}

	public Vector3d center() {
		computeBoundingBox();
		Vector3d offset = boundingBox.getCenter(null).negate();
		translate(offset.x(), offset.y(), offset.z());
		return offset;
	}

	@Override
	public void computeBoundingBox() {

		if (this.boundingBox == null) {
			this.boundingBox = new Box3d();
		}

		BufferAttribute position = attributes.get("position");
		if (position != null) {
			boundingBox.setFromBufferAttribute(position);
		} else {
			boundingBox.makeEmpty();
		}

		if (Double.isNaN(boundingBox.getMin().x()) || Double.isNaN(boundingBox.getMin().x())
				|| Double.isNaN(boundingBox.getMin().x())) {
		}

	}

	@Override
	public void computeBoundingSphere() {

		if (this.boundingSphere == null) {
			this.boundingSphere = new Sphere();
		}

		Box3d box = new Box3d();
		Vector3d vector = new Vector3d();

		BufferAttribute position = this.attributes.get("position");

		if (position != null) {

			Vector3d center = this.boundingSphere.getCenter();

			box.setFromBufferAttribute(position);
			box.getCenter(center);

			// hoping to find a boundingSphere with a radius smaller than the
			// boundingSphere of the boundingBox: sqrt(3) smaller in the best case
			double maxRadiusSq = 0;

			for (int i = 0, il = position.getCount(); i < il; i++) {

				vector.x(position.getX(i).doubleValue());
				vector.y(position.getY(i).doubleValue());
				vector.z(position.getZ(i).doubleValue());
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));

			}

			this.boundingSphere.setRadius(Math.sqrt(maxRadiusSq));

			if (Double.isNaN(this.boundingSphere.getRadius())) {

			}

		}
	}

	public void computeVertexNormals() {
		BufferAttribute index = this.index;

		if (attributes.containsKey("position")) {

			List<Number> positions = attributes.get("position").array;

			if (!attributes.containsKey("normal")) {

				this.addAttribute("normal",
						new BufferAttribute.DoubleBufferAttribute(new double[positions.size()], 3, false));

			} else {

				// reset existing normals to zero
				List<Number> array = attributes.get("normal").array;

				for (int i = 0, il = array.size(); i < il; i++) {

					array.set(i, 0);

				}

			}

			List<Number> normals = attributes.get("normal").array;

			int vA, vB, vC;
			Vector3d pA = new Vector3d(), pB = new Vector3d(), pC = new Vector3d();
			Vector3d cb = new Vector3d(), ab = new Vector3d();

			// indexed elements
			if (index != null) {

				List<Number> indices = index.array;

				if (groups.isEmpty()) {

					this.addGroup(0, indices.size(), 0);

				}

				for (int j = 0, jl = groups.size(); j < jl; ++j) {

					GeometryGroup group = groups.get(j);

					int start = group.start;
					int count = group.count;

					for (int i = start, il = start + count; i < il; i += 3) {

						vA = indices.get(i + 0).intValue() * 3;
						vB = indices.get(i + 1).intValue() * 3;
						vC = indices.get(i + 2).intValue() * 3;

						pA.fromArray(positions, vA);
						pB.fromArray(positions, vB);
						pC.fromArray(positions, vC);

						cb.sub(pC, pB);
						ab.sub(pA, pB);
						cb.cross(ab);

						normals.set(vA, normals.get(vA).doubleValue() + cb.x());
						normals.set(vA + 1, normals.get(vA + 1).doubleValue() + cb.y());
						normals.set(vA + 2, normals.get(vA + 2).doubleValue() + cb.z());

						normals.set(vB, normals.get(vB).doubleValue() + cb.x());
						normals.set(vB + 1, normals.get(vB + 1).doubleValue() + cb.y());
						normals.set(vB + 2, normals.get(vB + 2).doubleValue() + cb.z());

						normals.set(vC, normals.get(vC).doubleValue() + cb.x());
						normals.set(vC + 1, normals.get(vC + 1).doubleValue() + cb.y());
						normals.set(vC + 2, normals.get(vC + 2).doubleValue() + cb.z());

					}

				}

			} else {

				// non-indexed elements (unconnected triangle soup)
				for (int i = 0, il = positions.size(); i < il; i += 9) {

					pA.fromArray(positions, i);
					pB.fromArray(positions, i + 3);
					pC.fromArray(positions, i + 6);

					cb.sub(pC, pB);
					ab.sub(pA, pB);
					cb.cross(ab);

					normals.set(i, normals.get(i).doubleValue() + cb.x());
					normals.set(i + 1, normals.get(i + 1).doubleValue() + cb.y());
					normals.set(i + 2, normals.get(i + 2).doubleValue() + cb.z());

					normals.set(i + 3, cb.x());
					normals.set(i + 4, cb.y());
					normals.set(i + 5, cb.z());

					normals.set(i + 6, cb.x());
					normals.set(i + 7, cb.y());
					normals.set(i + 8, cb.z());

				}

			}

			this.normalizeNormals();

			attributes.get("normal").needsUpdate(true);

		}
	}

	public void normalizeNormals() {
		List<Number> normals = attributes.get("normal").array;

		double x, y, z, n;

		for (int i = 0, i1 = normals.size(); i < i1; i += 3) {
			x = normals.get(i).doubleValue();
			y = normals.get(i + 1).doubleValue();
			z = normals.get(i + 2).doubleValue();

			n = 1.0 / Math.sqrt(x * x + y * y + z * z);

			normals.set(i, x * n);
			normals.set(i + 1, z * n);
			normals.set(i + 2, y * n);
		}
	}

	public void applyMatrix(Matrix4d matrix) {

		BufferAttribute position = attributes.get("position");
		if (position != null) {
			position.applyToBufferAttribute(matrix);
			position.needsUpdate(true);
		}

		BufferAttribute normal = attributes.get("normal");
		if (normal != null) {
			Matrix3d normalMatrix = new Matrix3d().getNormalMatrix(matrix);

			normal.applyToBufferAttribute(normalMatrix);
			normal.needsUpdate(true);
		}

		if (boundingBox != null) {
			computeBoundingBox();
		}

		if (boundingSphere != null) {
			computeBoundingSphere();
		}

	}

	public BufferGeometry setFromObject(Object3D object) {
		throw new UnsupportedOperationException("Not implmented yet!");
	}

	public BufferGeometry toNonIndexed() {

		if (index == null) {
			return this;
		}

		BufferGeometry geometry2 = new BufferGeometry();

		List<Number> indices = this.index.array;

		for (String name : attributes.keySet()) {

			BufferAttribute attribute = attributes.get(name);

			List<Number> array = attribute.array;
			int itemSize = attribute.itemSize;

			List<Number> array2 = new ArrayList<>(indices.size() * itemSize);

			int index = 0, index2 = 0;

			for (int i = 0, l = indices.size(); i < l; i++) {

				index = indices.get(i).intValue() * itemSize;

				for (int j = 0; j < itemSize; j++) {
					array2.set(index2++, array.get(index++));
				}

			}

			geometry2.addAttribute(name, new BufferAttribute(array2, itemSize));

		}

		return geometry2;

	}

}
