package com.gitrnd.gdsbuilder.parse.impl;

import java.util.ArrayList;
import java.util.Arrays;

import org.apache.commons.lang.ArrayUtils;

import com.gitrnd.gdsbuilder.parse.geom.LineToPolygon;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.LinearRing;
import com.vividsolutions.jts.geom.Polygon;

/**
 * offset만큼의 두께적
 * @author SG.LEE
 *
 */
public class LineToPolygonImpl implements LineToPolygon{
	public Polygon convertPoly(LineString line, double offset){
		GeometryFactory gf = new GeometryFactory();
		
		Coordinate[] points = line.getCoordinates();

	    ArrayList<Coordinate> soln = new ArrayList<>();
	    //store initial points
	    soln.addAll(Arrays.asList(points));
	    // reverse the list
	    ArrayUtils.reverse(points);
	    // for each point move offset metres right                                  
	    for (Coordinate c:points) {
	      soln.add(new Coordinate(c.x+offset, c.y));
	    }
	    // close the polygon
	    soln.add(soln.get(0));
	    // create polygon
	    LinearRing ring = gf.createLinearRing(soln.toArray(new Coordinate[] {}));
	    LinearRing holes[] = null;
	    Polygon poly = gf.createPolygon(ring, holes);
	    return poly;
	}
}
