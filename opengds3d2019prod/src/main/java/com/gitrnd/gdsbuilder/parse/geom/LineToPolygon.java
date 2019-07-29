package com.gitrnd.gdsbuilder.parse.geom;

import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.Polygon;

public interface LineToPolygon {
	public Polygon convertPoly(LineString line, double offset);
}

