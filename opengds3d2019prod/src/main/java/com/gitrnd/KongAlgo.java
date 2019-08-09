package com.gitrnd;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import com.vividsolutions.jts.geom.Coordinate;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Sunshine
 */
public class KongAlgo {

//	private Vector<Point> points;
//	private Vector<Point> nonconvexPoints;
	private Vector<Triangle> triangles;

	private List<Coordinate> coors;
	private List<Coordinate> nonconvexCoors;

	private List<Map<String, Object>> indexList;

	// orientation of polygon - true = clockwise, false = counterclockwise
	private boolean isCw;

	public KongAlgo(List<Coordinate> coors) {
		// we have to copy the point vector as we modify it
		this.coors = new ArrayList<>();
		for (int i = 0; i < coors.size(); i++)
			this.coors.add(coors.get(i));

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
		Coordinate p;
		Coordinate v;
		Coordinate u;
		// result value of test function
		double res = 0;
		for (int i = 0; i < coors.size() - 1; i++) {
			p = coors.get(i);
			Coordinate tmp = coors.get(i + 1);
			v = new Coordinate(); // interpret v as vector from i to i+1
			v.x = tmp.x - p.x;
			v.y = tmp.y - p.y;

			// ugly - last polygon segment goes from last point to first point
			if (i == coors.size() - 2)
				u = coors.get(0);
			else
				u = coors.get(i + 2);

			res = u.x * v.y - u.y * v.x + v.x * p.y - v.y * p.x;
			// note: cw means res/newres is <= 0
			if ((res > 0 && isCw) || (res <= 0 && !isCw)) {
				nonconvexCoors.add(tmp);
				System.out.println("konkav point #" + (i + 1) + "  Coords: " + tmp.x + "/" + tmp.y);
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

		// first find point with minimum x-coord - if there are several ones take
		// the one with maximal y-coord
		int index = 0; // index of point in vector to find
		Coordinate pointOfIndex = coors.get(0);
		for (int i = 1; i < coors.size(); i++) {
			if (coors.get(i).x < pointOfIndex.x) {
				pointOfIndex = coors.get(i);
				index = i;
			} else if (coors.get(i).x == pointOfIndex.x && coors.get(i).y > pointOfIndex.y) {
				pointOfIndex = coors.get(i);
				index = i;
			}
		}

		// get vector from index-1 to index
		Coordinate prevPointOfIndex;
		if (index == 0)
			prevPointOfIndex = coors.get(coors.size() - 1);
		else
			prevPointOfIndex = coors.get(index - 1);
		Coordinate v1 = new Coordinate(pointOfIndex.x - prevPointOfIndex.x, pointOfIndex.y - prevPointOfIndex.y);
		// get next point
		Coordinate succPointOfIndex;
		if (index == coors.size() - 1)
			succPointOfIndex = coors.get(0);
		else
			succPointOfIndex = coors.get(index + 1);

		// get orientation
		double res = succPointOfIndex.x * v1.y - succPointOfIndex.y * v1.x + v1.x * prevPointOfIndex.y
				- v1.y * prevPointOfIndex.x;

		isCw = (res <= 0 ? true : false);
		System.out.println("isCw : " + isCw);
	}

	/*
	 * Returns true if the triangle formed by the three given points is an ear
	 * considering the polygon - thus if no other point is inside and it is convex.
	 * Otherwise false.
	 */
	private boolean isEar(Coordinate p1, Coordinate p2, Coordinate p3) {
		// not convex, bye
		if (!(isConvex(p1, p2, p3)))
			return false;

		// iterate over all konkav points and check if one of them lies inside the given
		// triangle
		for (int i = 0; i < nonconvexCoors.size(); i++) {
			if (Triangle.isInside(p1, p2, p3, nonconvexCoors.get(i)))
				return false;
		}
		return true;
	}

	/*
	 * Returns true if the point p2 is convex considered the actual polygon. p1, p2
	 * and p3 are three consecutive points of the polygon.
	 */
	private boolean isConvex(Coordinate p1, Coordinate p2, Coordinate p3) {
		Coordinate v = new Coordinate(p2.x - p1.x, p2.y - p1.y);
		double res = p3.x * v.y - p3.y * v.x + v.x * p1.y - v.y * p1.x;
		return !((res > 0 && isCw) || (res <= 0 && !isCw));
	}

	/*
	 * This is a helper function for accessing consecutive points of the polygon
	 * vector. It ensures that no IndexOutofBoundsException occurs.
	 * 
	 * @param index is the base index of the point to be accessed
	 * 
	 * @param offset to be added/subtracted to the index value
	 */
	private int getIndex(int index, int offset) {
		int newindex;
		System.out.println("size " + coors.size() + " index:" + index + " offset:" + offset);
		if (index + offset >= coors.size())
			newindex = coors.size() - (index + offset);
		else {
			if (index + offset < 0)
				newindex = coors.size() + (index + offset);
			else
				newindex = index + offset;
		}
		System.out.println("new index = " + newindex);
		return newindex;
	}

	/*
	 * The actual Kong's Triangulation Algorithm
	 */
	public void runKong() {
		if (coors.size() < 3)
			return;

		triangles.clear();
		int index = 1;
		indexList = new ArrayList<>();
		while (coors.size() > 3) {
			int firIndex = getIndex(index, -1);
			int secIndex = index;
			int thrIndex = getIndex(index, 1);

			Coordinate fir = coors.get(firIndex);
			Coordinate sec = coors.get(secIndex);
			Coordinate thr = coors.get(thrIndex);

			if (isEar(fir, sec, thr)) {
				// cut ear
				// triangles.add(new Triangle(fir, sec, thr));
				Map<String, Object> indexMap = new HashMap<String, Object>();
				indexMap.put("fir", fir);
				indexMap.put("sec", sec);
				indexMap.put("thr", thr);
				indexList.add(indexMap);
				coors.remove(coors.get(index));
				index = getIndex(index, -1);
			} else {
				index = getIndex(index, 1);
			}
		}
		// add last triangle
		// triangles.add(new Triangle(coors.get(0), coors.get(1), coors.get(2)));
		Map<String, Object> indexMap = new HashMap<String, Object>();
		indexMap.put("fir", coors.get(0));
		indexMap.put("sec", coors.get(1));
		indexMap.put("thr", coors.get(2));
		indexList.add(indexMap);
	}

	public Vector<Triangle> getTriangles() {
		return triangles;
	}

	public List<Coordinate> getCoors() {
		return coors;
	}

	public void setCoors(List<Coordinate> coors) {
		this.coors = coors;
	}

	public List<Coordinate> getNonconvexCoors() {
		return nonconvexCoors;
	}

	public void setNonconvexCoors(List<Coordinate> nonconvexCoors) {
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

}
