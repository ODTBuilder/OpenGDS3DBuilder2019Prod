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

public class ShpToObjImpl {

	private String heightValue;
	private String depthValue;
	private String widthValue;
	private String radiusValue;

	private String outputPath;
	private File file;
	private Filter filter;

	private int objfilenum = 0;

	EnShpToObjDepthType dType = null;
	EnShpToObjHeightType hType = null;
	EnShpToObjWidthType wType = null;
	EnShpToObjRadiusType rType = null;

	private String mtl;
	private String usemtl;
	private String texture;

	private boolean isBox = false;
	private boolean isCylinder = false;

	public String getHeightValue() {
		return heightValue;
	}

	public void setHeightValue(String heightAttribute) {
		this.heightValue = heightAttribute;
	}

	public String getDepthValue() {
		return depthValue;
	}

	public void setDepthValue(String depthAttribute) {
		this.depthValue = depthAttribute;
	}

	public String getWidthValue() {
		return widthValue;
	}

	public void setWidthValue(String widthAttribute) {
		this.widthValue = widthAttribute;
	}

	public String getRadiusValue() {
		return radiusValue;
	}

	public void setRadiusValue(String radiusValue) {
		this.radiusValue = radiusValue;
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

	public int getObjfilenum() {
		return objfilenum;
	}

	public void setObjfilenum(int objfilenum) {
		this.objfilenum = objfilenum;
	}

	public EnShpToObjDepthType getdType() {
		return dType;
	}

	public void setdType(EnShpToObjDepthType dType) {
		this.dType = dType;
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

	public EnShpToObjRadiusType getrType() {
		return rType;
	}

	public void setrType(EnShpToObjRadiusType rType) {
		this.rType = rType;
	}

	public String getMtl() {
		return mtl;
	}

	public void setMtl(String mtl) {
		this.mtl = mtl;
	}

	public String getUsemtl() {
		return usemtl;
	}

	public void setUsemtl(String usemtl) {
		this.usemtl = usemtl;
	}

	public String getTexture() {
		return texture;
	}

	public void setTexture(String texture) {
		this.texture = texture;
	}

	public boolean isBox() {
		return isBox;
	}

	public void setBox(boolean isBox) {
		this.isBox = isBox;
	}

	public boolean isCylinder() {
		return isCylinder;
	}

	public void setCylinder(boolean isCylinder) {
		this.isCylinder = isCylinder;
	}

	/**
	 * Shp 출력 타입
	 * 
	 * @author SG.LEE
	 */
	public enum EnShpToObjDepthType {

		DEFAULT("default"), FIX("fix"), UNKNOWN(null);

		String type;

		private EnShpToObjDepthType(String type) {
			this.type = type;
		}

		/**
		 * type명으로 부터 {@link EnShpToObjDepthType} 조회
		 * 
		 * @author SG.LEE
		 * @param type type명
		 * @return {@link EnTreeType}
		 */
		public static EnShpToObjDepthType getFromType(String type) {
			for (EnShpToObjDepthType tt : values()) {
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
		 * type명으로 부터 {@link EnShpToObjDepthType} 조회
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

	public enum EnShpToObjHeightType {

		DEFAULT("default"), FIX("fix"), UNKNOWN(null);

		String type;

		private EnShpToObjHeightType(String type) {
			this.type = type;
		}

		/**
		 * type명으로 부터 {@link EnShpToObjDepthType} 조회
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

	public enum EnShpToObjRadiusType {

		DEFAULT("default"), FIX("fix"), UNKNOWN(null);

		String type;

		private EnShpToObjRadiusType(String type) {
			this.type = type;
		}

		/**
		 * type명으로 부터 {@link EnShpToObjDepthType} 조회
		 * 
		 * @author SG.LEE
		 * @param type type명
		 * @return {@link EnTreeType}
		 */
		public static EnShpToObjRadiusType getFromType(String type) {
			for (EnShpToObjRadiusType tt : values()) {
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
			PolygonLayerToObjImpl polyToObj = new PolygonLayerToObjImpl(buildingCollection, texture, this.dType,
					depthValue, outputPath);
			polyToObj.parseToObjFile();
			this.outputPath = polyToObj.getOutputPath();
			this.objfilenum = polyToObj.getObjfilenum();
		} else if (geomType.contains("LineString") || geomType.contains("MultiLineString")) {
			LineLayerToObjImpl lineToObj = new LineLayerToObjImpl(buildingCollection, texture, this.dType, this.wType,
					depthValue, widthValue, outputPath);
			lineToObj.parseToObjFile();
			this.outputPath = lineToObj.getOutputPath();
			this.objfilenum = lineToObj.getObjfilenum();
		} else if (geomType.contains("Point") || geomType.contains("MultiPoint")) {
			if (isBox) {
				PointLayerToBoxObjImpl pointToObj = new PointLayerToBoxObjImpl(buildingCollection, texture, hType,
						heightValue, wType, widthValue, dType, depthValue, outputPath);
				pointToObj.parseToObjFile();
				this.outputPath = pointToObj.getOutputPath();
				this.objfilenum = pointToObj.getObjfilenum();
			} else if (isCylinder) {
				PointLayerToCylinderObjImpl pointToObj = new PointLayerToCylinderObjImpl(buildingCollection, texture,
						rType, radiusValue, dType, depthValue, outputPath);
				pointToObj.parseToObjFile();
				this.outputPath = pointToObj.getOutputPath();
				this.objfilenum = pointToObj.getObjfilenum();
			}
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
