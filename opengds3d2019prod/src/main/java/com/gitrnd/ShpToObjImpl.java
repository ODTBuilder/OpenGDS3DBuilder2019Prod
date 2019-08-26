package com.gitrnd;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;

import com.gitrnd.gdsbuilder.geoserver.data.tree.DTGeoserverTree.EnTreeType;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.MultiPolygon;

public class ShpToObjImpl {

	private double defaultHeight = 5;

	public static double globalMinX;
	public static double globalMinY;
	public static double scaleFactor;

	private double minVal;
	private double maxVal;

	public static double centerX;
	public static double centerY;

	public static CoordinateReferenceSystem srcCRS;
	public static CoordinateReferenceSystem targetCRS;
	public static MathTransform transform;

	private String attribute;

	private String outputPath;
	private File file;
	private Filter filter;

	private int vIdx = 0;

	EnShpToObjHeightType hType = null;

	/**
	 * Shp 출력 타입
	 * 
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
		 * 
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

	/**
	 * 높이 고정값
	 * 
	 * @author SG.LEE
	 * @param file
	 * @param filter
	 * @param defVal
	 * @param outputPath
	 * @throws Exception
	 */
	public ShpToObjImpl(File file, Filter filter, double defVal, String outputPath) throws Exception {
		hType = EnShpToObjHeightType.DEFAULT;
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
		this.defaultHeight = defVal;
	}

	/**
	 * 높이 min ~ max 사이 랜던값
	 * 
	 * @author SG.LEE
	 * @param file
	 * @param filter
	 * @param minVal
	 * @param maxVal
	 * @param outputPath
	 * @throws Exception
	 */
	public ShpToObjImpl(File file, Filter filter, double minVal, double maxVal, String outputPath) throws Exception {
		hType = EnShpToObjHeightType.RANDOM;
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
		this.minVal = minVal;
		this.maxVal = maxVal;
	}

	/**
	 * 높이 컬럼값 지정
	 * 
	 * @author SG.LEE
	 * @param file
	 * @param filter
	 * @param attribute
	 * @param outputPath
	 */
	public ShpToObjImpl(File file, Filter filter, String attribute, String outputPath) {
		hType = EnShpToObjHeightType.FIX;
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
		this.attribute = attribute;
	}

	public void exec() throws Exception {
		FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection = getFeatureCollectionFromFileWithFilter(
				file, filter);

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
			}
		} else {
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

	private String buildingFeatureToObjGroup(SimpleFeature feature) throws FactoryException, TransformException {

		GeometryAttribute featureDefaultGeometryProperty = feature.getDefaultGeometryProperty();
		MultiPolygon multipolygon = (MultiPolygon) featureDefaultGeometryProperty.getValue();
		multipolygon.normalize();
		Coordinate[] coordinates = deleteInnerPoints(multipolygon.getCoordinates());

		// 높이값 설정
		double height = 0.0;

		if (this.hType == EnShpToObjHeightType.DEFAULT) {
			height = defaultHeight;
		} else if (this.hType == EnShpToObjHeightType.FIX) {
			try {
				height = (double) feature.getAttribute(attribute);
			} catch (Exception e) {
				// TODO: handle exception
				height = defaultHeight;
			}
		} else if (this.hType == EnShpToObjHeightType.RANDOM) {
			double rdNum = minVal + (int) (Math.random() * maxVal);
			height = rdNum;
		}

		if (height < 1) {
			height = defaultHeight;
		}

		String result = "o " + feature.getID() + "\n";
		String roofFace = "";
		String wallFace = "";

		// 바닥
		List<Coordinate> coorList = new ArrayList<Coordinate>();
		for (int i = 0; i < coordinates.length; i++) {
			Coordinate localCoor = toLocalCoordinateSystem(coordinates[i]);
			coorList.add(i, localCoor);
			result = result + coordinateToVertexdescription(localCoor);
		}
		KongAlgo ka = new KongAlgo(coorList);
		ka.runKong(); // actual algo call
		List<Map<String, Object>> mapList = ka.getIndexList();
		for (int m = 0; m < mapList.size(); m++) {
			Map<String, Object> map = mapList.get(m);
			Coordinate fir = (Coordinate) map.get("fir");
			Coordinate sec = (Coordinate) map.get("sec");
			Coordinate thr = (Coordinate) map.get("thr");
			int firIdx = vIdx + coorList.indexOf(fir) + 1;
			int secIdx = vIdx + coorList.indexOf(sec) + 1;
			int thrIdx = vIdx + coorList.indexOf(thr) + 1;
			roofFace = roofFace + "f " + firIdx + " " + secIdx + " " + thrIdx + "\n";
			roofFace = roofFace + "f " + thrIdx + " " + secIdx + " " + firIdx + "\n";
		}
		// 지붕
		List<Coordinate> hCoorList = new ArrayList<Coordinate>();
		for (int i = 0; i < coordinates.length; i++) {
			Coordinate localCoor = toLocalCoordinateSystem(createLiftedCoordinate(coordinates[i], height));
			hCoorList.add(i, localCoor);
			result = result + coordinateToVertexdescription(localCoor);
		}
		KongAlgo hKa = new KongAlgo(hCoorList);
		hKa.runKong(); // actual algo call
		int coorSize = coorList.size();
		List<Map<String, Object>> kMapList = hKa.getIndexList();
		for (int m = 0; m < kMapList.size(); m++) {
			Map<String, Object> map = kMapList.get(m);
			Coordinate fir = (Coordinate) map.get("fir");
			Coordinate sec = (Coordinate) map.get("sec");
			Coordinate thr = (Coordinate) map.get("thr");
			int firIdx = vIdx + coorSize + hCoorList.indexOf(fir) + 1;
			int secIdx = vIdx + coorSize + hCoorList.indexOf(sec) + 1;
			int thrIdx = vIdx + coorSize + hCoorList.indexOf(thr) + 1;
			roofFace = roofFace + "f " + firIdx + " " + secIdx + " " + thrIdx + "\n";
			roofFace = roofFace + "f " + thrIdx + " " + secIdx + " " + firIdx + "\n";
		}
		// 옆면
		for (int f = 0; f < coorSize; f++) {
			int tfirIdx = vIdx + f + 1;
			int tsecIdx = vIdx + f + 1 + coorSize;
			int tthrIdx = tsecIdx + 1;

			if (tthrIdx > (vIdx + (coorSize * 2))) {
				tthrIdx = tthrIdx - coorSize;
			}

			int bfirIdx = tfirIdx;
			int bsecIdx = tthrIdx;
			int bthrIdx = bsecIdx - coorSize;

			wallFace = wallFace + "f " + tfirIdx + " " + tsecIdx + " " + tthrIdx + "\n";
			wallFace = wallFace + "f " + bsecIdx + " " + bthrIdx + " " + bfirIdx + "\n";

			wallFace = wallFace + "f " + tthrIdx + " " + tsecIdx + " " + tfirIdx + "\n";
			wallFace = wallFace + "f " + bfirIdx + " " + bthrIdx + " " + bsecIdx + "\n";
		}
		vIdx += coorList.size();
		vIdx += hCoorList.size();
		return result + roofFace + wallFace;
	}

	public String coordinateToVertexdescription(Coordinate coordinate) {
		return new String("v " + coordinate.x + " " + coordinate.y + " " + coordinate.z + "\n");
	}

	public Coordinate[] deleteInnerPoints(Coordinate[] coordinates) {
		Coordinate startCoordinate = coordinates[0];
		double z = startCoordinate.z;
		if (String.valueOf(z).equals("NaN")) {
			startCoordinate.z = 0.0;
		}
		int i = 1;
		while (!equal3dCoordinates(startCoordinate, coordinates[i])) {
			i++;
		}
		return Arrays.copyOf(coordinates, i);
	}

	public static boolean equal3dCoordinates(Coordinate c1, Coordinate c2) {
		if (String.valueOf(c2.z).equals("NaN")) {
			c2.z = 0.0;
		}
		return (c1.x == c2.x && c1.y == c2.y && c1.z == c2.z);
	}

	public static void initShapefileCoordinateSystemBoundaries(FeatureCollection collection) {
		BoundingBox boundingBox = collection.getBounds();
		globalMinX = boundingBox.getMinX();
		globalMinY = boundingBox.getMinY();
		scaleFactor = 300 / boundingBox.getWidth(); // For a local CS with x-values between 0 and 100
	}

	public static Coordinate toLocalCoordinateSystem(Coordinate coordinate) {
		return scaleCoordinateToLocalCoordinateSystem(translateCoordinateToLocalCoordinateSystem(coordinate));
	}

	public static Coordinate translateCoordinateToLocalCoordinateSystem(Coordinate coordinate) {
		return new Coordinate(coordinate.x - globalMinX, coordinate.y - globalMinY, coordinate.z);
	}

	public static Coordinate scaleCoordinateToLocalCoordinateSystem(Coordinate coordinate) {
		return new Coordinate(coordinate.x * scaleFactor, coordinate.y * scaleFactor, coordinate.z * scaleFactor);
	}

	public Coordinate createLiftedCoordinate(Coordinate coordinate, double height) {
		return new Coordinate(coordinate.x, coordinate.y, height);
	}
}
