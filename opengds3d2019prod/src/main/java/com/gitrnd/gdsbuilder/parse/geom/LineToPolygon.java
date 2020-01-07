package com.gitrnd.gdsbuilder.parse.geom;

import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.Polygon;

public interface LineToPolygon {
	public Polygon convertPoly(MultiLineString line, double offset);
}
