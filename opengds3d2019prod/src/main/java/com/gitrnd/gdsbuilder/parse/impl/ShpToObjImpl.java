package com.gitrnd.gdsbuilder.parse.impl;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
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
import org.geotools.referencing.GeodeticCalculator;
import org.json.simple.JSONObject;
import org.opengis.feature.GeometryAttribute;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;

import com.gitrnd.gdsbuilder.create3d.Triangler;
import com.gitrnd.gdsbuilder.geoserver.data.tree.DTGeoserverTree.EnTreeType;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Polygon;

public class ShpToObjImpl {

	private double defaultHeight = 5;
	private static BufferedWriter writer;

	private double minVal;
	private double maxVal;

	private static double centerX;
	private static double centerY;

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
			Coordinate center = buildingCollection.getBounds().centre();
			centerX = center.x;
			centerY = center.y;

			JSONObject obj = new JSONObject();
			obj.put("longitude", Math.toRadians(centerX));
			obj.put("latitude", Math.toRadians(centerY));
			obj.put("transHeight", 0);
			obj.put("region", true);
			obj.put("box", false);
			obj.put("sphere", false);
			obj.put("gltfUpAxis", "Z");

			try (FileWriter file = new FileWriter(
					"D:\\node\\objTo3d-tiles-master\\bin\\0916\\buildings_1_customTilesetOptions.json")) {
				file.write(obj.toJSONString());
			} catch (IOException e) {
				e.printStackTrace();
			}

			try (BufferedWriter writer = new BufferedWriter(
					new OutputStreamWriter(new FileOutputStream(this.outputPath), "utf-8"))) {
				ShpToObjImpl.writer = writer;
				try (FeatureIterator<SimpleFeature> features = buildingCollection.features()) {
					while (features.hasNext()) {
						SimpleFeature feature = features.next();
						buildingFeatureToObjGroup(feature);
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

		FeatureSource<SimpleFeatureType, SimpleFeature> source = dataStore.getFeatureSource(typeName);
		FeatureCollection<SimpleFeatureType, SimpleFeature> collection = source.getFeatures(filter);
		return collection;
	}

	private void buildingFeatureToObjGroup(SimpleFeature feature)
			throws FactoryException, TransformException, IOException {

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

		GeometryAttribute featureDefaultGeometryProperty = feature.getDefaultGeometryProperty();
		MultiPolygon multipolygon = (MultiPolygon) featureDefaultGeometryProperty.getValue();
		int numGeom = multipolygon.getNumGeometries();
		for (int g = 0; g < numGeom; g++) {
			String featureID = "o " + feature.getID();
			if (numGeom > 1) {
				featureID += "_" + (g + 1);
			} else {
				featureID += "\n";
			}
			writer.write(featureID);

			Geometry geom = multipolygon.getGeometryN(g);
			geom.normalize();
			Polygon pg = (Polygon) geom;
			Coordinate[] coordinates = deleteInnerPoints(pg.getCoordinates());

			// 바닥
			List<Coordinate> coorList = new ArrayList<Coordinate>();
			for (int i = 0; i < coordinates.length; i++) {
				GeodeticCalculator gc = new GeodeticCalculator();
				gc.setStartingGeographicPoint(centerX, coordinates[i].y);
				gc.setDestinationGeographicPoint(coordinates[i].x, coordinates[i].y);
				double xDistance = gc.getOrthodromicDistance();
				if (centerX > coordinates[i].x) {
					xDistance = -xDistance;
				}
				gc.setStartingGeographicPoint(coordinates[i].x, centerY);
				gc.setDestinationGeographicPoint(coordinates[i].x, coordinates[i].y);
				double yDistance = gc.getOrthodromicDistance();
				if (centerY > coordinates[i].y) {
					yDistance = -yDistance;
				}
				Coordinate localCoor = new Coordinate(xDistance, yDistance, 0);
				coorList.add(localCoor);
				// 버텍스 좌표를 obj 포맷으로 줄줄이 입력
				writer.write(coordinateToVertexdescription(localCoor));
			}
			// inner ring
			List<Integer> holeList = new ArrayList<>();
			int numRing = pg.getNumInteriorRing();
			if (numRing > 0) {
				for (int n = 0; n < numRing; n++) {
					LineString ring = pg.getInteriorRingN(n);
					Coordinate[] ringCoors = deleteInnerPoints(ring.getCoordinates());
					for (int r = 0; r < ringCoors.length; r++) {
						GeodeticCalculator gc = new GeodeticCalculator();
						gc.setStartingGeographicPoint(centerX, ringCoors[r].y);
						gc.setDestinationGeographicPoint(ringCoors[r].x, ringCoors[r].y);
						double xDistance = gc.getOrthodromicDistance();
						if (centerX > ringCoors[r].x) {
							xDistance = -xDistance;
						}
						gc.setStartingGeographicPoint(ringCoors[r].x, centerY);
						gc.setDestinationGeographicPoint(ringCoors[r].x, ringCoors[r].y);
						double yDistance = gc.getOrthodromicDistance();
						if (centerY > ringCoors[r].y) {
							yDistance = -yDistance;
						}
						Coordinate localCoor = new Coordinate(xDistance, yDistance, 0);
						coorList.add(localCoor);
						if (r == 0) { // first idx
							holeList.add(coorList.lastIndexOf(localCoor));
						}
						// 버텍스 좌표를 obj 포맷으로 줄줄이 입력
						writer.write(coordinateToVertexdescription(localCoor));
					}
				}
			}
			Triangler tri = new Triangler(coorList);
			tri.triangify(holeList); // actual algo call
			List<Integer> faceIndice = tri.getFaceIndices();
			for (int m = 0; m < faceIndice.size(); m += 3) {
				int fFirIdx = vIdx + faceIndice.get(m) + 1;
				int fSecIdx = vIdx + faceIndice.get(m + 1) + 1;
				int fThrIdx = vIdx + faceIndice.get(m + 2) + 1;
				// 바닥 face
				writer.write("f " + fFirIdx + " " + fSecIdx + " " + fThrIdx + "\n");
				writer.write("f " + fThrIdx + " " + fSecIdx + " " + fFirIdx + "\n");
			}
			// 천장
			int s = coorList.size();
			List<Coordinate> hCoorList = new ArrayList<>();
			for (int i = 0; i < s; i++) {
				Coordinate hCoor = createLiftedCoordinate(coorList.get(i), height);
				hCoorList.add(hCoor);
				writer.write(coordinateToVertexdescription(hCoor));
			}
			for (int m = 0; m < faceIndice.size(); m += 3) {
				int fFirIdx = vIdx + s + faceIndice.get(m) + 1;
				int fSecIdx = vIdx + s + faceIndice.get(m + 1) + 1;
				int fThrIdx = vIdx + s + faceIndice.get(m + 2) + 1;
				// 천장 face
				writer.write("f " + fFirIdx + " " + fSecIdx + " " + fThrIdx + "\n");
				writer.write("f " + fThrIdx + " " + fSecIdx + " " + fFirIdx + "\n");
			}
			// 옆면
			holeList.add(s);
			int hSize = holeList.size();
			if (hSize > 0) {
				// hole polygon
				for (int h = 0; h < hSize; h++) {
					if (h == 0) {
						int polyIdx = holeList.get(h);
						for (int f = 0; f < polyIdx; f++) {
							int firIdx = vIdx + f + 1;
							int secIdx = vIdx + f + 1 + s;
							int thrIdx = secIdx + 1;

							if (thrIdx > (vIdx + polyIdx + s)) {
								thrIdx = thrIdx - polyIdx;
							}
							int bfirIdx = firIdx;
							int bsecIdx = thrIdx;
							int bthrIdx = bsecIdx - s;

							writer.write("f " + firIdx + " " + secIdx + " " + thrIdx + "\n");
							writer.write("f " + thrIdx + " " + secIdx + " " + firIdx + "\n");
							writer.write("f " + bsecIdx + " " + bthrIdx + " " + bfirIdx + "\n");
							writer.write("f " + bfirIdx + " " + bthrIdx + " " + bsecIdx + "\n");
						}
					} else {
						int hole1Idx = holeList.get(h - 1);
						int hole2Idx = holeList.get(h);
						for (int f = hole1Idx; f < hole2Idx; f++) {
							int firIdx = vIdx + f + 1;
							int secIdx = vIdx + f + 1 + s;
							int thrIdx = secIdx + 1;
							if (thrIdx > (vIdx + (hole2Idx) + s)) {
								thrIdx = thrIdx - (hole2Idx - hole1Idx);
							}
							int bfirIdx = firIdx;
							int bsecIdx = thrIdx;
							int bthrIdx = bsecIdx - s;

							writer.write("f " + firIdx + " " + secIdx + " " + thrIdx + "\n");
							writer.write("f " + thrIdx + " " + secIdx + " " + firIdx + "\n");
							writer.write("f " + bsecIdx + " " + bthrIdx + " " + bfirIdx + "\n");
							writer.write("f " + bfirIdx + " " + bthrIdx + " " + bsecIdx + "\n");
						}
					}
				}
			} else {
				// polygon
				for (int f = 0; f < s; f++) {
					int firIdx = vIdx + f + 1;
					int secIdx = vIdx + f + 1 + s;
					int thrIdx = secIdx + 1;
					if (thrIdx > (vIdx + (s * 2))) {
						thrIdx = thrIdx - s;
					}
					int bfirIdx = firIdx;
					int bsecIdx = thrIdx;
					int bthrIdx = bsecIdx - s;

					writer.write("f " + firIdx + " " + secIdx + " " + thrIdx + "\n");
					writer.write("f " + bsecIdx + " " + bthrIdx + " " + bfirIdx + "\n");
					writer.write("f " + thrIdx + " " + secIdx + " " + firIdx + "\n");
					writer.write("f " + bfirIdx + " " + bthrIdx + " " + bsecIdx + "\n");
				}
			}
			vIdx += coorList.size();
			vIdx += hCoorList.size();
		}
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

	public Coordinate createLiftedCoordinate(Coordinate coordinate, double height) {
		return new Coordinate(coordinate.x, coordinate.y, height);
	}
}
