package com.gitrnd.gdsbuilder.parse.impl;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.geotools.util.NullProgressListener;
import org.opengis.feature.Feature;
import org.opengis.feature.FeatureVisitor;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.geoserver.data.tree.DTGeoserverTree.EnTreeType;
import com.gitrnd.gdsbuilder.parse.impl.test.qaud.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.operation.buffer.BufferParameters;

public class ShpToObjImpl {

	private double defaultHeight = 5;
	private double defaultWidth = 5;

	private String heightAttribute;
	private String widthAttribute;

	private String outputPath;
	private File file;
	private Filter filter;

	private int objfilenum = 0;

	EnShpToObjHeightType hType = null;
	EnShpToObjWidthType wType = null;

	private String mtl;
	private String usemtl;
	private String texture;

	public int getObjfilenum() {
		return objfilenum;
	}

	public void setObjfilenum(int objfilenum) {
		this.objfilenum = objfilenum;
	}

	public double getDefaultHeight() {
		return defaultHeight;
	}

	public void setDefaultHeight(double defaultHeight) {
		this.defaultHeight = defaultHeight;
	}

	public double getDefaultWidth() {
		return defaultWidth;
	}

	public void setDefaultWidth(double defaultWidth) {
		this.defaultWidth = defaultWidth;
	}

	public String getHeightAttribute() {
		return heightAttribute;
	}

	public void setHeightAttribute(String heightAttribute) {
		this.heightAttribute = heightAttribute;
	}

	public String getWidthAttribute() {
		return widthAttribute;
	}

	public void setWidthAttribute(String widthAttribute) {
		this.widthAttribute = widthAttribute;
	}

	public String getOutputPath() {
		return outputPath;
	}

	public void setOutputPath(String outputPath) {
		this.outputPath = outputPath;
	}

	public File getFile() {
		return file;
	}

	public void setFile(File file) {
		this.file = file;
	}

	public EnShpToObjHeightType gethType() {
		return hType;
	}

	public void sethType(EnShpToObjHeightType hType) {
		this.hType = hType;
	}

	public EnShpToObjWidthType getwType() {
		return wType;
	}

	public void setwType(EnShpToObjWidthType wType) {
		this.wType = wType;
	}

	public String getMtl() {
		return mtl;
	}

	public void setMtl(String mtl) {
		this.mtl = mtl;
//		String usemtl = null;
//		try {
//			// 파일 객체 생성
//			File mtlfile = new File(outputPath + File.separator + mtl);
//			// 입력 스트림 생성
//			FileReader filereader = new FileReader(mtlfile);
//			// 입력 버퍼 생성
//			BufferedReader bufReader = new BufferedReader(filereader);
//			String line = "";
//
//			while ((line = bufReader.readLine()) != null) {
//				if (line.startsWith("newmtl ")) {
//					usemtl = line.replace("newmtl ", "");
//				}
//			}
//			// .readLine()은 끝에 개행문자를 읽지 않는다.
//			bufReader.close();
//		} catch (FileNotFoundException e) {
//			// TODO: handle exception
//		} catch (IOException e) {
//			System.out.println(e);
//		}
//		this.usemtl = usemtl;
	}

	public String getTexture() {
		return texture;
	}

	public void setTexture(String texture) {
		this.texture = texture;
	}

	/**
	 * Shp 출력 타입
	 * 
	 * @author SG.LEE
	 */
	public enum EnShpToObjHeightType {

		DEFAULT("default"), FIX("fix"), UNKNOWN(null);

		String type;
		double defaultHeight;
		double attributeKey;

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

	public enum EnShpToObjWidthType {

		DEFAULT("default"), FIX("fix"), UNKNOWN(null);

		String type;

		private EnShpToObjWidthType(String type) {
			this.type = type;
		}

		/**
		 * type명으로 부터 {@link EnShpToObjHeightType} 조회
		 * 
		 * @author SG.LEE
		 * @param type type명
		 * @return {@link EnTreeType}
		 */
		public static EnShpToObjWidthType getFromType(String type) {
			for (EnShpToObjWidthType tt : values()) {
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

	public ShpToObjImpl(File file, Filter filter, String outputPath) {
		this.file = file;
		this.filter = filter;
		this.outputPath = outputPath;
	}

	public void exec() throws Exception {

		FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection = getFeatureCollectionFromFileWithFilter(
				file, filter);

		SimpleFeatureType featureType = buildingCollection.getSchema();
		String geomType = featureType.getGeometryDescriptor().getType().getBinding().getName();

		if (geomType.contains("Polygon") || geomType.contains("MultiPolygon")) {
			if (this.hType == EnShpToObjHeightType.DEFAULT) {
				PolygonLayerToObjImpl polyToObj = new PolygonLayerToObjImpl(buildingCollection, texture, this.hType,
						defaultHeight, outputPath);
				polyToObj.parseToObjFile();
				this.outputPath = polyToObj.getOutputPath();
				this.objfilenum = polyToObj.getObjfilenum();
			} else if (this.hType == EnShpToObjHeightType.FIX) {
				PolygonLayerToObjImpl polyToObj = new PolygonLayerToObjImpl(buildingCollection, texture, this.hType,
						heightAttribute, outputPath);
				polyToObj.parseToObjFile();
				this.outputPath = polyToObj.getOutputPath();
				this.objfilenum = polyToObj.getObjfilenum();
			}
		} else if (geomType.contains("LineString") || geomType.contains("MultiLineString")) {

			// tmp
			BufferParameters bufferParam = new BufferParameters();
			bufferParam.setEndCapStyle(bufferParam.CAP_ROUND);
			bufferParam.setJoinStyle(bufferParam.JOIN_ROUND);

//			if (this.hType == EnShpToObjHeightType.DEFAULT && this.wType == EnShpToObjWidthType.DEFAULT) {
//				LineLayerToObjImpl lineToObj = new LineLayerToObjImpl(buildingCollection, texture, this.hType,
//						this.wType, defaultHeight, defaultWidth, bufferParam, outputPath);
//				lineToObj.parseToObjFile();
//				this.outputPath = lineToObj.getOutputPath();
//				this.objfilenum = lineToObj.getObjfilenum();
//			} else if (this.hType == EnShpToObjHeightType.DEFAULT && this.wType == EnShpToObjWidthType.FIX) {
//				LineLayerToObjImpl lineToObj = new LineLayerToObjImpl(buildingCollection, texture, this.hType,
//						this.wType, defaultHeight, widthAttribute, bufferParam, outputPath);
//				lineToObj.parseToObjFile();
//				this.outputPath = lineToObj.getOutputPath();
//				this.objfilenum = lineToObj.getObjfilenum();
//			} else if (this.hType == EnShpToObjHeightType.FIX && this.wType == EnShpToObjWidthType.DEFAULT) {
//				LineLayerToObjImpl lineToObj = new LineLayerToObjImpl(buildingCollection, texture, this.hType,
//						this.wType, heightAttribute, defaultWidth, bufferParam, outputPath);
//				lineToObj.parseToObjFile();
//				this.outputPath = lineToObj.getOutputPath();
//				this.objfilenum = lineToObj.getObjfilenum();
//			} else if (this.hType == EnShpToObjHeightType.FIX && this.wType == EnShpToObjWidthType.FIX) {
//				LineLayerToObjImpl lineToObj = new LineLayerToObjImpl(buildingCollection, texture, this.hType,
//						this.wType, heightAttribute, widthAttribute, bufferParam, outputPath);
//				lineToObj.parseToObjFile();
//				this.outputPath = lineToObj.getOutputPath();
//				this.objfilenum = lineToObj.getObjfilenum();
//			}
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

	public static String coordinateToVertexdescription(Coordinate coordinate) {
		return new String("v " + coordinate.x + " " + coordinate.y + " " + coordinate.z + "\n");
	}

	public static Vector3d createLiftedCoordinate(Vector3d vector3d, double height) {
		return new Vector3d(vector3d.x(), vector3d.y(), height);
	}

	public static Coordinate createLiftedCoordinate(Coordinate coordinate, double height) {
		return new Coordinate(coordinate.x, coordinate.y, height);
	}

	public static Coordinate[] deleteInnerPoints(Coordinate[] coordinates) {
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

	public static List<Envelope> getGrids(Envelope envelope, double quadIndexWidth) {

		List<Envelope> resultRefEnl = new ArrayList<Envelope>();
		for (double y = envelope.getMinY(); y < envelope.getMaxY(); y += quadIndexWidth) {
			for (double x = envelope.getMinX(); x < envelope.getMaxX(); x += quadIndexWidth) {
				Envelope newEnvelope = new Envelope(x, x + quadIndexWidth, y, y + quadIndexWidth);
				resultRefEnl.add(newEnvelope);
			}
		}
		return resultRefEnl;
	}

	public static Quadtree getQuadTree(FeatureCollection<SimpleFeatureType, SimpleFeature> sfc) {

		Quadtree quad = new Quadtree();
		try {
			sfc.accepts(new FeatureVisitor() {
				@Override
				public void visit(Feature feature) {
					SimpleFeature simpleFeature = (SimpleFeature) feature;
					Geometry geom = (Geometry) simpleFeature.getDefaultGeometry();
					// Just in case: check for null or empty geometry
					if (geom != null) {
						Envelope env = geom.getEnvelopeInternal();
						if (!env.isNull()) {
							quad.insert(env, simpleFeature);
						}
					}
				}
			}, new NullProgressListener());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return quad;
	}

	public static void createFileDirectory(String directory) {
		File file = new File(directory);
		if (!file.exists()) {
			file.mkdirs();
		}
	}
}
