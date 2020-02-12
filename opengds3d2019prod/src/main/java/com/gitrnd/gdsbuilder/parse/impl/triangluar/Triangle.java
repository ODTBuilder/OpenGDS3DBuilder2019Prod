package com.gitrnd.gdsbuilder.parse.impl.triangluar;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;

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
	private Vector3d a;
	private Vector3d b;
	private Vector3d c;

	public Triangle(Vector3d a, Vector3d b, Vector3d c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	public boolean isInside(Vector3d p) {
		// interpret v1 and v2 as vectors
		Vector3d v1 = new Vector3d(b.x() - a.x(), b.y() - a.y(),0);
		Vector3d v2 = new Vector3d(c.x() - a.x(), c.y() - a.y(),0);

		double det = v1.x() * v2.y() - v2.x() * v1.y();
		Vector3d tmp = new Vector3d(p.x() - a.x(), p.y() - a.y(),0);
		double lambda = (tmp.x() * v2.y() - v2.x() * tmp.y()) / det;
		double mue = (v1.x() * tmp.y() - tmp.x() * v1.y()) / det;

		return (lambda >= 0 && mue >= 0 && (lambda + mue) <= 1);
	}

	public static boolean isInside(Vector3d x, Vector3d y, Vector3d z, Vector3d p) {
		Vector3d v1 = new Vector3d(y.x() - x.x(), y.y() - x.y(),0);
		Vector3d v2 = new Vector3d(z.x() - x.x(), z.y() - x.y(),0);

		double det = v1.x() * v2.y() - v2.x() * v1.y();
		Vector3d tmp = new Vector3d(p.x() - x.x(), p.y() - x.y(), 0);
		double lambda = (tmp.x() * v2.y() - v2.x() * tmp.y()) / det;
		double mue = (v1.x() * tmp.y() - tmp.x() * v1.y()) / det;

		return (lambda > 0 && mue > 0 && (lambda + mue) < 1);
	}

	public Vector3d getA() {
		return a;
	}

	public void setA(Vector3d a) {
		this.a = a;
	}

	public Vector3d getB() {
		return b;
	}

	public void setB(Vector3d b) {
		this.b = b;
	}

	public Vector3d getC() {
		return c;
	}

	public void setC(Vector3d c) {
		this.c = c;
	}

}
