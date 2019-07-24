package com.gitrnd.gdsbuilder.parse.impl;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.opengis.feature.GeometryAttribute;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;
import org.opengis.geometry.BoundingBox;

import com.gitrnd.gdsbuilder.geoserver.data.tree.DTGeoserverTree.EnTreeType;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Polygon;

public class ShpToObjImpl {
	
	private double defaultHeight = 5;
	private double globalMinX;
	private double globalMinY;
	private double scaleFactor;
	
	private double minVal;
	private double maxVal;
	private String attribute;
	
	private String outputPath;
	private File file;
	private Filter filter;
	
	EnShpToObjHeightType hType = null;
	
	/**
	 * Shp 출력 타입
	 * @author SG.LEE
	 */
	public enum EnShpToObjHeightType {
		DEFAULT("default"), RANDOM("random"), FIX("fix"), UNKNOWN(null);

		String type;

		private EnShpToObjHeightType(String type) {
			this.type = type;
		}

		/**
		 * type명으로 부터 {@link EnShpToObjHeightType} 조회
		 * @author SG.LEE
		 * @param type type명
		 * @return {@link EnTreeType}
		 */
		public static EnShpToObjHeightType getFromType(String type) {
			for (EnShpToObjHeightType tt : values()) {
				if (tt == UNKNOWN)
					continue;
				if (tt.type.equals(type))
					return tt;
			}
			return UNKNOWN;
		}

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}
	}
	
	public ShpToObjImpl(File file, Filter filter, double defVal, String outputPath) throws Exception{
		hType = EnShpToObjHeightType.DEFAULT;
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
	}
	
	public ShpToObjImpl(File file, Filter filter, double minVal, double maxVal, String outputPath) throws Exception{
		hType = EnShpToObjHeightType.RANDOM;
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
		this.minVal = minVal;
		this.maxVal = maxVal;
	}
	
	public ShpToObjImpl(File file, Filter filter, String attribute, String outputPath) {
		hType = EnShpToObjHeightType.FIX;
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
		this.attribute = attribute;
	}
	
	
	public void exec() throws Exception {
		FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection = getFeatureCollectionFromFileWithFilter(file, filter);

		SimpleFeatureType featureType = buildingCollection.getSchema();
		String geomType = featureType.getGeometryDescriptor().getType().getBinding().getName();

		if (!geomType.equals("Polygon") || !geomType.equals("MultiPolygon")) {
			try (BufferedWriter writer = new BufferedWriter(
					new OutputStreamWriter(new FileOutputStream(this.outputPath), "utf-8"))) {
				writer.write("mtllib material.mtl\n");

				try (FeatureIterator<SimpleFeature> features = buildingCollection.features()) {
					initShapefileCoordinateSystemBoundaries(buildingCollection);
					while (features.hasNext()) {
						SimpleFeature feature = features.next();
						writer.write(buildingFeatureToObjGroup(feature));
					}
				}
				// writer.write(groundBoundariesToObj(buildingCollection)); //바닥
			}
		}else{
			throw new Exception("Polygon Type만 가능합니다.");
		}
	}
	
	
	public FeatureCollection<SimpleFeatureType, SimpleFeature> getFeatureCollectionFromFileWithFilter(File file,
			Filter filter) throws Exception {
		if (!file.exists()) {
			throw new FileNotFoundException("Failed to find file: " + file.getAbsolutePath());
		}

		Map<String, Object> map = new HashMap<>();
		map.put("url", file.toURI().toURL());

		DataStore dataStore = DataStoreFinder.getDataStore(map);
		String typeName = dataStore.getTypeNames()[0];
		System.out.println(typeName);

		FeatureSource<SimpleFeatureType, SimpleFeature> source = dataStore.getFeatureSource(typeName);
		FeatureCollection<SimpleFeatureType, SimpleFeature> collection = source.getFeatures(filter);
		return collection;
	}

	private String buildingFeatureToObjGroup(SimpleFeature feature) {
		GeometryAttribute featureDefaultGeometryProperty = feature.getDefaultGeometryProperty();
		MultiPolygon multipolygon = (MultiPolygon) featureDefaultGeometryProperty.getValue();
		Coordinate[] coordinates = deleteInnerPoints(multipolygon.getCoordinates());

		Polygon poly = (Polygon) multipolygon.getGeometryN(0);
		// Coordinate[] coords = poly.getExteriorRing().getCoordinates();

		// TODO: What if there is no _mean attribute available?
		// 높이값 설정
		double height = 0.0;
		
		if(this.hType == EnShpToObjHeightType.DEFAULT){
			height = defaultHeight;
		}else if(this.hType == EnShpToObjHeightType.FIX){
			try {
				height = (double) feature.getAttribute(attribute);
			} catch (Exception e) {
				// TODO: handle exception
				height = defaultHeight;
			}
		}else if(this.hType == EnShpToObjHeightType.RANDOM){
			double rdNum = minVal + (int)(Math.random()*maxVal); 
			height = rdNum;
		}
		
		if (height < 1) {
			height = defaultHeight;
		}

		String result = "o " + feature.getID() + "\nusemtl Building_" + getRandomIntWithRange(1, 10) + "\n";
		String roofFace = "f";

		int i;
		for (i = 0; i < coordinates.length; i++) {
			Coordinate c = coordinates[i];
			result = result + coordinateToVertexdescription(toLocalCoordinateSystem(c))
					+ coordinateToVertexdescription(toLocalCoordinateSystem(createLiftedCoordinate(c, height)));
			// Create face between four previous created vertices (=wall)
			if (i > 0) {
				result = result + "f -1 -2 -4 -3 \n";
			}
			roofFace += " -" + (2 * i + 1); // -1 -3 ...
		}
		// Add face between first and last two created vertices (=wall)
		if (i >= 4) {
			result = result + "f -1 -2 -" + (2 * i) + " -" + (2 * i - 1) + "\n";
		}
		result = result + roofFace + "\n";
		return result;
	}

	public String roadFeatureToObjGroup(SimpleFeature feature) {
		GeometryAttribute featureDefaultGeometryProperty = feature.getDefaultGeometryProperty();
		MultiLineString multiLineString = (MultiLineString) featureDefaultGeometryProperty.getValue();
		return null;
	}


	public Coordinate createLiftedCoordinate(Coordinate coordinate, double height) {
		return new Coordinate(coordinate.x, coordinate.y, height);
	}

	public String coordinateToVertexdescription(Coordinate coordinate) {
		return new String("v " + coordinate.x + " " + coordinate.y + " " + coordinate.z + "\n");
	}

	public Coordinate[] deleteInnerPoints(Coordinate[] coordinates) {
		Coordinate startCoordinate = coordinates[0];
		double z = startCoordinate.z;
		if(String.valueOf(z).equals("NaN")){
			startCoordinate.z=0.0;
		}
		int i = 1;
		while (!equal3dCoordinates(startCoordinate, coordinates[i])) {
			i++;
		}
		return Arrays.copyOf(coordinates, i);
	}

	public static boolean equal3dCoordinates(Coordinate c1, Coordinate c2) {
		if(String.valueOf(c2.z).equals("NaN")){
			c2.z=0.0;
		}
		return (c1.x == c2.x && c1.y == c2.y&&c1.z == c2.z);
	}

	public String groundBoundariesToObj(FeatureCollection collection) {

		BoundingBox boundingBox = collection.getBounds();
		Coordinate localUpperLeftCorner = toLocalCoordinateSystem(
				new Coordinate(boundingBox.getMinX(), boundingBox.getMaxY(), 0));
		Coordinate localBottomLeftCorner = toLocalCoordinateSystem(
				new Coordinate(boundingBox.getMinX(), boundingBox.getMinY(), 0));
		Coordinate localUpperRightCorner = toLocalCoordinateSystem(
				new Coordinate(boundingBox.getMaxX(), boundingBox.getMaxY(), 0));
		Coordinate localBottomRightCorner = toLocalCoordinateSystem(
				new Coordinate(boundingBox.getMaxX(), boundingBox.getMinY(), 0));
		String result = "o ground" + "\nusemtl Terrain\n";
		result = result + coordinateToVertexdescription(localUpperLeftCorner)
				+ coordinateToVertexdescription(localBottomLeftCorner)
				+ coordinateToVertexdescription(localUpperRightCorner)
				+ coordinateToVertexdescription(localBottomRightCorner);
		return result + "f -1 -2 -4 -3\n";
	}

	public void initShapefileCoordinateSystemBoundaries(FeatureCollection collection) {
		BoundingBox boundingBox = collection.getBounds();
		globalMinX = boundingBox.getMinX();
		globalMinY = boundingBox.getMinY();
		scaleFactor = 100 / boundingBox.getWidth(); // For a local CS with
													// x-values between 0 and
													// 100
	}

	public Coordinate toLocalCoordinateSystem(Coordinate coordinate) {
		return scaleCoordinateToLocalCoordinateSystem(translateCoordinateToLocalCoordinateSystem(coordinate));
	}

	public Coordinate translateCoordinateToLocalCoordinateSystem(Coordinate coordinate) {
		return new Coordinate(coordinate.x - globalMinX, coordinate.y - globalMinY, coordinate.z);
	}

	public Coordinate scaleCoordinateToLocalCoordinateSystem(Coordinate coordinate) {
		return new Coordinate(coordinate.x * scaleFactor, coordinate.y * scaleFactor, coordinate.z * scaleFactor);
	}

	public int getRandomIntWithRange(int lowerBound, int upperBound) {
		Random generator = new Random();
		return generator.nextInt(upperBound - lowerBound) + lowerBound + 1;
	}
}
