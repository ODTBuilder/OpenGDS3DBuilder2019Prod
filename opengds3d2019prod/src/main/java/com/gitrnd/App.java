package com.gitrnd;

import java.io.File;
import java.io.IOException;

import org.opengis.filter.Filter;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;
import org.opengis.referencing.operation.TransformException;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;
import com.vividsolutions.jts.geom.Coordinate;

public class App {

	public static void main(String[] args) throws IOException, NoSuchAuthorityCodeException, FactoryException,
			MismatchedDimensionException, TransformException {

		File buildingFile = new File("D:\\node\\objTo3d-tiles-master\\bin\\shptoobj\\gis_osm_buildings.shp");
		Filter filter = Filter.INCLUDE;

		try {
			new ShpToObjImpl(buildingFile, filter, 50, "D:\\node\\objTo3d-tiles-master\\bin\\shptoobj\\obj3").exec();
		} catch (Exception e) {
			e.printStackTrace();
		}

//		FileDataStore store = FileDataStoreFinder.getDataStore(file);
//		SimpleFeatureSource fs = store.getFeatureSource();
//
//		CoordinateReferenceSystem sourceCRS = fs.getSchema().getCoordinateReferenceSystem();
//		CoordinateReferenceSystem worldCRS = CRS.decode("EPSG:4326");
//
//		Query query = new Query("Reproject");
//		query.setCoordinateSystem(sourceCRS);
//		query.setCoordinateSystemReproject(worldCRS);
//		SimpleFeatureCollection sfc = fs.getFeatures(query);
//		SimpleFeatureIterator sfIter = sfc.features();
//		
//		while (sfIter.hasNext()) {
//			SimpleFeature feature = sfIter.next();
//			Geometry geom = (Geometry) feature.getDefaultGeometry();
//			if (geom instanceof Point) {
//				
//			} else if (geom instanceof LineString) {
//
//			} else if (geom instanceof Polygon) {
//
//			} else if (geom instanceof MultiPoint) {
//
//			} else if (geom instanceof MultiLineString) {
//
//			} else if (geom instanceof MultiPolygon) {
//
//			} else {
//				throw new IllegalArgumentException("Unsupported geometry type " + geom.getClass());
//			}
//
//		}
	}

	public Coordinate inverseXY(Coordinate originCoor) {

		return new Coordinate(originCoor.y, originCoor.x, 0);
	}
}
