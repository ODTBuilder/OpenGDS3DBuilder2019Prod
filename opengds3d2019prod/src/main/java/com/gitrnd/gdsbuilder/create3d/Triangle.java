package com.gitrnd.gdsbuilder.create3d;

import com.vividsolutions.jts.geom.Coordinate;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Sunshine A class to represent a triangle Note that all three points
 *         should be different in order to work properly
 */
public class Triangle {

	// coordinates
	private Coordinate a;
	private Coordinate b;
	private Coordinate c;

	public Triangle(Coordinate a, Coordinate b, Coordinate c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	public boolean isInside(Coordinate p) {
		// interpret v1 and v2 as vectors
		Coordinate v1 = new Coordinate(b.x - a.x, b.y - a.y);
		Coordinate v2 = new Coordinate(c.x - a.x, c.y - a.y);

		double det = v1.x * v2.y - v2.x * v1.y;
		Coordinate tmp = new Coordinate(p.x - a.x, p.y - a.y);
		double lambda = (tmp.x * v2.y - v2.x * tmp.y) / det;
		double mue = (v1.x * tmp.y - tmp.x * v1.y) / det;

		return (lambda >= 0 && mue >= 0 && (lambda + mue) <= 1);
	}

	public static boolean isInside(Coordinate x, Coordinate y, Coordinate z, Coordinate p) {
		Coordinate v1 = new Coordinate(y.x - x.x, y.y - x.y);
		Coordinate v2 = new Coordinate(z.x - x.x, z.y - x.y);

		double det = v1.x * v2.y - v2.x * v1.y;
		Coordinate tmp = new Coordinate(p.x - x.x, p.y - x.y);
		double lambda = (tmp.x * v2.y - v2.x * tmp.y) / det;
		double mue = (v1.x * tmp.y - tmp.x * v1.y) / det;

		return (lambda > 0 && mue > 0 && (lambda + mue) < 1);
	}

	public Coordinate getA() {
		return a;
	}

	public void setA(Coordinate a) {
		this.a = a;
	}

	public Coordinate getB() {
		return b;
	}

	public void setB(Coordinate b) {
		this.b = b;
	}

	public Coordinate getC() {
		return c;
	}

	public void setC(Coordinate c) {
		this.c = c;
	}

}
