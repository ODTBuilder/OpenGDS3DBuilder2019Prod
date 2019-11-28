package com.gitrnd.gdsbuilder.create3d;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.apache.commons.lang.ArrayUtils;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;

public class Triangler {
	// private Vector<Point> points;
	// private Vector<Point> nonconvexPoints;
	private Vector<Triangle> triangles;

	private List<Vector3d> coors;
	private List<Vector3d> nonconvexCoors;

	private List<Map<String, Object>> indexList;

	private List<Integer> faceIndices;

	// orientation of polygon - true = clockwise, false = counterclockwise
	private boolean isCw;

	public Triangler(List<Vector3d> coorList) {
		// we have to copy the point vector as we modify it
		this.coors = new ArrayList<>();
		for (int i = 0; i < coorList.size(); i++)
			this.coors.add(coorList.get(i));

		nonconvexCoors = new ArrayList<>();
		triangles = new Vector<Triangle>();

		calcPolyOrientation();
		calcNonConvexPoints();
	}

	/*
	 * This determines all concave vertices of the polygon.
	 */
	private void calcNonConvexPoints() {
		// safety check, with less than 4 points we have to do nothing
		if (coors.size() <= 3)
			return;

		// actual three points
		Vector3d p;
		Vector3d v;
		Vector3d u;
		// result value of test function
		double res = 0;
		for (int i = 0; i < coors.size() - 1; i++) {
			p = coors.get(i);
			Vector3d tmp = coors.get(i + 1);
			v = new Vector3d(tmp.x() - p.x(), tmp.y() - p.y(), 0); // interpret v as vector from i to i+1

			// ugly - last polygon segment goes from last point to first point
			if (i == coors.size() - 2)
				u = coors.get(0);
			else
				u = coors.get(i + 2);

			res = u.x() * v.y() - u.y() * v.x() + v.x() * p.y() - v.y() * p.x();
			// note: cw means res/newres is <= 0
			if ((res > 0 && isCw) || (res <= 0 && !isCw)) {
				nonconvexCoors.add(tmp);
			}

		}
	}

	/*
	 * Get the orientation of the polygon - clockwise (cw) or counter-clockwise
	 * (ccw)
	 */
	private void calcPolyOrientation() {
		if (coors.size() < 3)
			return;

		// first find point with minimum x-coord - if there are several ones
		// take
		// the one with maximal y-coord
		int index = 0; // index of point in vector to find
		Vector3d pointOfIndex = coors.get(0);
		for (int i = 1; i < coors.size(); i++) {
			if (coors.get(i).x() < pointOfIndex.x()) {
				pointOfIndex = coors.get(i);
				index = i;
			} else if (coors.get(i).x() == pointOfIndex.x() && coors.get(i).y() > pointOfIndex.y()) {
				pointOfIndex = coors.get(i);
				index = i;
			}
		}

		// get vector from index-1 to index
		Vector3d prevPointOfIndex;
		if (index == 0)
			prevPointOfIndex = coors.get(coors.size() - 1);
		else
			prevPointOfIndex = coors.get(index - 1);
		Vector3d v1 = new Vector3d(pointOfIndex.x() - prevPointOfIndex.x(), pointOfIndex.y() - prevPointOfIndex.y(), 0);
		// get next point
		Vector3d succPointOfIndex;
		if (index == coors.size() - 1)
			succPointOfIndex = coors.get(0);
		else
			succPointOfIndex = coors.get(index + 1);

		// get orientation
		double res = succPointOfIndex.x() * v1.y() - succPointOfIndex.y() * v1.x() + v1.x() * prevPointOfIndex.y()
				- v1.y() * prevPointOfIndex.x();
		isCw = (res <= 0 ? true : false);
	}

	/*
	 * The actual Kong's Triangulation Algorithm
	 */
	public void triangify() {
		if (coors.size() < 3)
			return;

		triangles.clear();
		// int index = 1;
		indexList = new ArrayList<>();

		List<Double> beforeEarcut = new ArrayList<>();
		for (int i = 0; i < coors.size(); i++) {
			beforeEarcut.add(coors.get(i).x());
			beforeEarcut.add(coors.get(i).y());
			beforeEarcut.add(coors.get(i).z());
		}
		Double[] capDData = beforeEarcut.toArray(new Double[beforeEarcut.size()]);
		double[] data = ArrayUtils.toPrimitive(capDData);
		List<Integer> triangleIndices = Earcut.earcut(data);
		this.setFaceIndices(triangleIndices);
	}

	public void triangify(List<Integer> holeList) {
		if (coors.size() < 3)
			return;
		triangles.clear();
		indexList = new ArrayList<>();
		List<Double> beforeEarcut = new ArrayList<>();
		for (int i = 0; i < coors.size(); i++) {
			beforeEarcut.add(coors.get(i).x());
			beforeEarcut.add(coors.get(i).y());
		}
		Double[] capDData = beforeEarcut.toArray(new Double[beforeEarcut.size()]);
		double[] data = ArrayUtils.toPrimitive(capDData);

		Integer[] holeIndices = holeList.toArray(new Integer[holeList.size()]);
		int[] hole = ArrayUtils.toPrimitive(holeIndices);

		List<Integer> triangleIndices = Earcut.earcut(data, hole, 2);
		this.setFaceIndices(triangleIndices);
	}

	public Vector<Triangle> getTriangles() {
		return triangles;
	}

	public List<Vector3d> getCoors() {
		return coors;
	}

	public void setCoors(List<Vector3d> coors) {
		this.coors = coors;
	}

	public List<Vector3d> getNonconvexCoors() {
		return nonconvexCoors;
	}

	public void setNonconvexCoors(List<Vector3d> nonconvexCoors) {
		this.nonconvexCoors = nonconvexCoors;
	}

	public List<Map<String, Object>> getIndexList() {
		return indexList;
	}

	public void setIndexList(List<Map<String, Object>> indexList) {
		this.indexList = indexList;
	}

	public boolean isCw() {
		return isCw;
	}

	public void setCw(boolean isCw) {
		this.isCw = isCw;
	}

	public void setTriangles(Vector<Triangle> triangles) {
		this.triangles = triangles;
	}

	public List<Integer> getFaceIndices() {
		return faceIndices;
	}

	public void setFaceIndices(List<Integer> faceIndices) {
		this.faceIndices = faceIndices;
	}

}
