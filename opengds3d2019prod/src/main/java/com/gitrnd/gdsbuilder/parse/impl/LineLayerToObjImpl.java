package com.gitrnd.gdsbuilder.parse.impl;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.geotools.data.DataUtilities;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.feature.SchemaException;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.GeodeticCalculator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.PropertyDescriptor;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.poly2tri.Poly2Tri;
import org.poly2tri.geometry.polygon.PolygonPoint;
import org.poly2tri.triangulation.TriangulationPoint;
import org.poly2tri.triangulation.delaunay.DelaunayTriangle;

import com.gitrnd.gdsbuilder.fileread.shp.SHPFileWriter;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjWidthType;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.operation.buffer.BufferOp;
import com.vividsolutions.jts.operation.buffer.BufferParameters;

public class LineLayerToObjImpl {

	private FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection;
	private String mtl;
	private String usemtl;
	private String outputPath;

	private EnShpToObjHeightType hType;
	private EnShpToObjWidthType wType;

	private double defaultHeight = 5;
	private double defaultWidth = 5;

	private String heightAttribute;
	private String widthAttribute;

	private BufferParameters bufferParam;

	private static BufferedWriter writer;

	private static double centerX;
	private static double centerY;

	private static List<Vector3d> vertices;
	private static List<Vector2d> vCoordinates;

	private int vIdx;
	private int vtIdx;
	private int vnIdx;
	private int objfilenum = 0;

	private double maxX; // east
	private double maxY; // north
	private double minX; // west
	private double minY; // south

	public FeatureCollection<SimpleFeatureType, SimpleFeature> getBuildingCollection() {
		return buildingCollection;
	}

	public void setBuildingCollection(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection) {
		this.buildingCollection = buildingCollection;
	}

	public String getMtl() {
		return mtl;
	}

	public void setMtl(String mtl) {
		this.mtl = mtl;
	}

	public String getOutputPath() {
		return outputPath;
	}

	public void setOutputPath(String outputPath) {
		this.outputPath = outputPath;
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

	public BufferParameters getBufferParam() {
		return bufferParam;
	}

	public void setBufferParam(BufferParameters bufferParam) {
		this.bufferParam = bufferParam;
	}

	public static BufferedWriter getWriter() {
		return writer;
	}

	public static void setWriter(BufferedWriter writer) {
		LineLayerToObjImpl.writer = writer;
	}

	public int getObjfilenum() {
		return objfilenum;
	}

	public void setObjfilenum(int objfilenum) {
		this.objfilenum = objfilenum;
	}

	public LineLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String mtl,
			String usemtl, EnShpToObjHeightType hType, EnShpToObjWidthType wType, double defaultHeight,
			double defaultWidth, BufferParameters bufferParam, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.mtl = mtl;
		this.usemtl = usemtl;
		this.defaultHeight = defaultHeight;
		this.defaultWidth = defaultWidth;
		this.bufferParam = bufferParam;
		this.outputPath = outputPath;
	}

	public LineLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String mtl,
			String usemtl, EnShpToObjHeightType hType, EnShpToObjWidthType wType, double defaultHeight,
			String widthAttribute, BufferParameters bufferParam, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.mtl = mtl;
		this.usemtl = usemtl;
		this.defaultHeight = defaultHeight;
		this.widthAttribute = widthAttribute;
		this.bufferParam = bufferParam;
		this.outputPath = outputPath;
	}

	public LineLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String mtl,
			String usemtl, EnShpToObjHeightType hType, EnShpToObjWidthType wType, String heightAttribute,
			double defaultWidth, BufferParameters bufferParam, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.mtl = mtl;
		this.usemtl = usemtl;
		this.heightAttribute = heightAttribute;
		this.defaultWidth = defaultWidth;
		this.bufferParam = bufferParam;
		this.outputPath = outputPath;
	}

	public LineLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String mtl,
			String usemtl, EnShpToObjHeightType hType, EnShpToObjWidthType wType, String heightAttribute,
			String widthAttribute, BufferParameters bufferParam, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.mtl = mtl;
		this.usemtl = usemtl;
		this.heightAttribute = heightAttribute;
		this.widthAttribute = widthAttribute;
		this.bufferParam = bufferParam;
		this.outputPath = outputPath;
	}

	public void parseToObjFile() throws UnsupportedEncodingException, FileNotFoundException, IOException,
			FactoryException, TransformException {

		ShpToObjImpl.createFileDirectory(this.outputPath);
		Map<String, Object> sfcMap = new HashMap<>();

		// 높이값 설정
		double maxHeight = 0.0;
		if (this.hType == EnShpToObjHeightType.DEFAULT) {
			maxHeight = defaultHeight;
		}

		// 대용량 처리
		int totalSize = buildingCollection.size();
		if (totalSize > 5000) { // tmp

		} else {
			objfilenum++;
			// set center
			ReferencedEnvelope reEnv = buildingCollection.getBounds();
			Coordinate center = reEnv.centre();
			centerX = center.x;
			centerY = center.y;
			// set tile boundary
			maxX = reEnv.getMaxX(); // east
			maxY = reEnv.getMaxY(); // north
			minX = reEnv.getMinX(); // west
			minY = reEnv.getMinY(); // south
			// batch table file
			JSONObject batchTable = new JSONObject();
			// tile propertiles
			JSONObject tilesPropeties = new JSONObject();
			// obj file
			try (BufferedWriter writer = new BufferedWriter(
					new OutputStreamWriter(new FileOutputStream(outputPath + File.separator + 1 + ".obj"), "utf-8"))) {
				// init
				this.writer = writer;
				vertices = new ArrayList<>();
				vCoordinates = new ArrayList<>();
				vIdx = 0;
				vtIdx = 1;
				vnIdx = 1;

				writer.write("o " + buildingCollection.getSchema().getTypeName() + "\n");
				if (mtl != null) {
					writer.write("mtllib " + mtl + "\n");
				}
				// featureId array
				JSONArray batchIdArr = new JSONArray();
				// put batch table feature properties
				Collection<PropertyDescriptor> properties = buildingCollection.getSchema().getDescriptors();
				for (PropertyDescriptor property : properties) {
					String name = property.getName().toString();
					String type = property.getType().getBinding().getSimpleName();
					if (type.equals("Double") || type.equals("Integer") || type.equals("Long")) {
						batchTable.put(name, new JSONArray());
					}
				}
				FeatureIterator<SimpleFeature> features = buildingCollection.features();
				while (features.hasNext()) {
					SimpleFeature feature = features.next();
					// widht
					if (this.wType == EnShpToObjWidthType.FIX) {
						defaultWidth = (double) feature.getAttribute(widthAttribute);
					}
					// height
					if (this.hType == EnShpToObjHeightType.FIX) {
						defaultHeight = (double) feature.getAttribute(heightAttribute);
					}
					// set tile height
					if (maxHeight < defaultHeight) {
						maxHeight = defaultHeight;
					}
					List<String> idlist = buildingFeatureToObjGroup(feature, defaultWidth, defaultHeight);
					for (String id : idlist) {
						// featureId
						batchIdArr.add(id);
						// properties
						Iterator batchIter = batchTable.keySet().iterator();
						while (batchIter.hasNext()) {
							String batchKey = (String) batchIter.next();
							JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
							propertiesArr.add(feature.getAttribute(batchKey));
							batchTable.put(batchKey, propertiesArr);
						}
					}
				}

				try {
					SHPFileWriter.writeSHP("EPSG:4326", dfc, "D:\\test\\test.shp");
				} catch (SchemaException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				Iterator batchIter = batchTable.keySet().iterator();
				while (batchIter.hasNext()) {
					String batchKey = (String) batchIter.next();
					JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
					JSONObject minmaxObj = new JSONObject();
					minmaxObj.put("minimum", Collections.max(propertiesArr));
					minmaxObj.put("maximum", Collections.min(propertiesArr));
					tilesPropeties.put(batchKey, minmaxObj);
				}
				batchTable.put("featureId", batchIdArr);
			}
			// custom batch file
			try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + "batch.json")) {
				file.write(batchTable.toJSONString());
			}

			// tileset option file
			JSONObject tileOption = new JSONObject();
			tileOption.put("longitude", Math.toRadians(centerX));
			tileOption.put("latitude", Math.toRadians(centerY));
			tileOption.put("west", Math.toRadians(minX));
			tileOption.put("south", Math.toRadians(minY));
			tileOption.put("east", Math.toRadians(maxX));
			tileOption.put("north", Math.toRadians(maxY));
			tileOption.put("transHeight", 0);
			tileOption.put("region", true);
			tileOption.put("box", false);
			tileOption.put("sphere", false);
			tileOption.put("gltfUpAxis", "Z");
			tileOption.put("minHeight", 0);
			tileOption.put("maxHeight", maxHeight);
			tileOption.put("properties", tilesPropeties);

			try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + "tile.json")) {
				file.write(tileOption.toJSONString());
			}
		}
	}

	DefaultFeatureCollection dfc = new DefaultFeatureCollection();

	private List<String> buildingFeatureToObjGroup(SimpleFeature feature, double defaultWidth, double defaultHeight)
			throws FactoryException, TransformException, IOException {

		List<String> idList = new ArrayList<>();
		// parse line to buffer polygon
		List<Polygon> pgList = bufferLine(feature, defaultWidth, bufferParam);
		for (int p = 0; p < pgList.size(); p++) {
			// set id
			String featureID = "g " + feature.getID();
			if (pgList.size() > 1) {
				featureID += "_" + (p + 1) + "\n";
			} else {
				featureID += "\n";
			}
			idList.add(feature.getID());

			String gId = featureID;
			Polygon pg = pgList.get(p);

			try {
				SimpleFeatureType sfType = DataUtilities.createType("test", "the_geom:MultiPolygon");
				SimpleFeature sf = SimpleFeatureBuilder.build(sfType, new Object[] { pg }, gId);
				dfc.add(sf);
			} catch (SchemaException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			// set tile boundary
			Envelope pgEv = pg.getEnvelopeInternal();
			double pgMaxX = pgEv.getMaxX();
			double pgMaxY = pgEv.getMaxY();
			double pgMinX = pgEv.getMinX();
			double pgMinY = pgEv.getMinY();
			if (maxX < pgMaxX) {
				maxX = pgMaxX;
			}
			if (maxY < pgMaxY) {
				maxY = pgMaxY;
			}
			if (minX < pgMinX) {
				minX = pgMinX;
			}
			if (minY < pgMinY) {
				minY = pgMinY;
			}

			pg.normalize();
			Coordinate[] coordinates = ShpToObjImpl.deleteInnerPoints(pg.getCoordinates());

			List<Face3> faces = new ArrayList<>();
			StringBuilder vBuilder = new StringBuilder();
			List<PolygonPoint> points = new ArrayList<>();

			// 바닥
			List<Vector3d> coorList = new ArrayList<>();
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
				Vector3d vertice = new Vector3d(xDistance, yDistance, 0);
				coorList.add(vertice);

				// threeGeom
				vertices.add(new Vector3d(xDistance, yDistance, 0));
				vCoordinates.add(new Vector2d(coordinates[i].x, coordinates[i].y));

				vBuilder.append("v " + xDistance + " " + yDistance + " " + 0 + "\n");

				// tri
				points.add(new PolygonPoint(xDistance, yDistance, 0));
			}

			// 천장
			int s = coorList.size();
			List<Vector3d> hCoorList = new ArrayList<>();
			for (int i = 0; i < s; i++) {
				Vector3d vertice = ShpToObjImpl.createLiftedCoordinate(coorList.get(i), defaultHeight);
				hCoorList.add(vertice);
				// threeGeom
				vertices.add(new Vector3d(coorList.get(i).x(), coorList.get(i).y(), defaultHeight));
				vCoordinates.add(new Vector2d(coordinates[i].x, coordinates[i].y));

				vBuilder.append("v " + coorList.get(i).x() + " " + coorList.get(i).y() + " " + defaultHeight + "\n");
			}
			writer.write(vBuilder.toString());

			int bottomStart;
			int bottomEnd;
			int topStart;
			int topEnd;
			int sideStart;
			int sideEnd;

			// Prepare input data
			org.poly2tri.geometry.polygon.Polygon polygon = new org.poly2tri.geometry.polygon.Polygon(points);
			// Launch tessellation
			Poly2Tri.triangulate(polygon);
			// Gather triangles
			List<DelaunayTriangle> triangles = polygon.getTriangles();

			// 바닥 face
			bottomStart = faces.size();
			for (int m = 0; m < triangles.size(); m++) {
				DelaunayTriangle tri = triangles.get(m);
				TriangulationPoint[] pts = tri.points;
				int fFirIdx = vIdx + points.indexOf(pts[0]);
				int fSecIdx = vIdx + points.indexOf(pts[1]);
				int fThrIdx = vIdx + points.indexOf(pts[2]);
				// threeGeom
				faces.add(new Face3(fFirIdx, fSecIdx, fThrIdx, new Vector3d(0, 0, 0)));
			}
			bottomEnd = faces.size();

			// 천장 face
			topStart = faces.size();
			for (int m = 0; m < triangles.size(); m++) {
				DelaunayTriangle tri = triangles.get(m);
				TriangulationPoint[] pts = tri.points;
				int fFirIdx = vIdx + s + points.indexOf(pts[0]);
				int fSecIdx = vIdx + s + points.indexOf(pts[1]);
				int fThrIdx = vIdx + s + points.indexOf(pts[2]);
				// threeGeom
				faces.add(new Face3(fFirIdx, fSecIdx, fThrIdx, new Vector3d(0, 0, 0)));
			}
			topEnd = faces.size();

			// 옆면 face
			sideStart = faces.size();
			for (int f = 0; f < s; f++) {
				if (f == 0) {
					faces.add(new Face3(vIdx + 0, vIdx + s - 1, vIdx + s, new Vector3d(0, 0, 0)));
					faces.add(new Face3(vIdx + s, vIdx + s - 1, vIdx + (2 * s - 1), new Vector3d(0, 0, 0)));
				} else {
					faces.add(new Face3(vIdx + f, vIdx + f - 1, vIdx + f + s, new Vector3d(0, 0, 0)));
					faces.add(new Face3(vIdx + f + s, vIdx + f - 1, vIdx + f - 1 + s, new Vector3d(0, 0, 0)));
				}
			}
			sideEnd = faces.size();

			vIdx += coorList.size();
			vIdx += hCoorList.size();

			com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom = new com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry();
			threeGeom.faces = faces;
			threeGeom.vertices = vertices;

			writeThreeGeometry(threeGeom, gId);
		}
		return idList;
	}

	public void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom,
			String gId) throws IOException {

		// vt
//		if (threeGeom.faceVertexUvs != null) {
//			StringBuilder vtBuilder = new StringBuilder();
//			List<List<Vector2d>> faceVertexUvs = threeGeom.faceVertexUvs.get(0);
//			for (List<Vector2d> faceVertexUv : faceVertexUvs) {
//				for (Vector2d vt : faceVertexUv) {
//					vtBuilder.append("vt " + vt.x() + " " + vt.y() + "\n");
//				}
//			}
//			writer.write(vtBuilder.toString());
//		}
		// f
		if (threeGeom.faces != null) {
			writer.write(gId);
			if (usemtl != null) {
				writer.write("usemtl " + usemtl + "\n");
			}
			StringBuilder vnBuilder = new StringBuilder();
			StringBuilder fBuilder = new StringBuilder();
			for (Face3 face : threeGeom.faces) {
				// vn
//				Vector3d normal = face.normal;
//				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
//				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
//				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");

				int a = face.a + 1;
				int b = face.b + 1;
				int c = face.c + 1;

				fBuilder.append("f " + a + "/" + vnIdx + "/" + vtIdx + " ");
				vtIdx++;
				vnIdx++;
				fBuilder.append(b + "/" + vnIdx + "/" + vtIdx + " ");
				vtIdx++;
				vnIdx++;
				fBuilder.append(c + "/" + vnIdx + "/" + vtIdx + "\n");
				vtIdx++;
				vnIdx++;
			}
			// writer.write(vnBuilder.toString());
			writer.write(fBuilder.toString());
		}
	}

	private List<Polygon> bufferLine(SimpleFeature sf, double width, BufferParameters bufferParam) {

		List<Polygon> pgList = new ArrayList<>();

		Geometry geom = (Geometry) sf.getDefaultGeometry();
		int g = geom.getNumGeometries();
		for (int i = 0; i < g; i++) {
			Geometry bufferGeom = null;
			if (bufferParam == null) {
				bufferGeom = BufferOp.bufferOp(geom.getGeometryN(i), width);
			} else {
				bufferGeom = BufferOp.bufferOp(geom.getGeometryN(i), width, bufferParam);
			}
			if (bufferGeom != null) {
				String bufferGeomType = bufferGeom.getGeometryType();
				if (bufferGeomType.equals("MultiPolygon")) {
					int m = bufferGeom.getNumGeometries();
					for (int j = 0; j < m; j++) {
						Polygon pg = (Polygon) bufferGeom.getGeometryN(j);
						pgList.add(pg);
					}
				} else if (bufferGeomType.equals("Polygon")) {
					Polygon pg = (Polygon) bufferGeom;
					pgList.add(pg);
				}
			}
		}
		return pgList;
	}
}
