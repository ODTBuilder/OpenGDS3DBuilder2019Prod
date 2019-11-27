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
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.grid.Grids;
import org.geotools.referencing.GeodeticCalculator;
import org.geotools.util.NullProgressListener;
import org.json.simple.JSONObject;
import org.opengis.feature.Feature;
import org.opengis.feature.FeatureVisitor;
import org.opengis.feature.GeometryAttribute;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;

import com.gitrnd.gdsbuilder.create3d.Triangler;
import com.gitrnd.gdsbuilder.geoserver.data.tree.DTGeoserverTree.EnTreeType;
import com.gitrnd.gdsbuilder.parse.impl.test.qaud.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.MultiPolygon;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.geom.TopologyException;

public class ShpToObjImpl {

	private double defaultHeight = 5;
	private static BufferedWriter writer;

	private double minVal;
	private double maxVal;

	private static double centerX;
	private static double centerY;

	private static List<Vector3d> vertices;
	private static List<Vector2d> vCoordinates;

	private String attribute;

	private String outputPath;
	private File file;
	private Filter filter;

	private int vIdx;
	private int vtIdx;
	private int vnIdx;

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

			// 최상위 폴더 생성
			// D:\node\objTo3d-tiles-master\bin\shptoobj\obj
			createFileDirectory(this.outputPath);

			Map<String, Object> sfcMap = new HashMap<>();

			// 대용량 처리
			int totalSize = buildingCollection.size();
			if (totalSize > 5000) { // tmp
				// quadtree
				Quadtree quad = getQuadTree(buildingCollection);

				// get envelops
				List<Envelope> gridEnvs = new ArrayList<>();
				ReferencedEnvelope bounds = buildingCollection.getBounds();
				double h = bounds.getHeight() / 50;
				if (h == 0) {
					gridEnvs.add(bounds);
				} else {
					SimpleFeatureSource grid = Grids.createSquareGrid(bounds, h);
					SimpleFeatureIterator gridIter = null;
					try {
						gridIter = grid.getFeatures().features();
					} catch (IOException e) {
						e.printStackTrace();
					}
					while (gridIter.hasNext()) {
						SimpleFeature sf = gridIter.next();
						Geometry gridGeom = (Geometry) sf.getDefaultGeometry();
						gridEnvs.add(gridGeom.getEnvelopeInternal());
					}
				}

				// filter
				FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
				int defaultS = 100;
				int tmp = 1;
				for (Envelope envelope : gridEnvs) {
					List items = quad.query(envelope);
					int tmpSize = items.size();
					SimpleFeatureCollection dfc = new DefaultFeatureCollection();
					for (int i = 0; i < tmpSize; i++) {
						SimpleFeature sf = (SimpleFeature) items.get(i);
						if (sf != null) {
							((DefaultFeatureCollection) dfc).add(sf);
						}
					}
					Filter intFilter = ff.intersects(ff.property("the_geom"), ff.literal(envelope));
					dfc = (SimpleFeatureCollection) dfc.subCollection(intFilter);

					int dfcSize = dfc.size();
					if (dfcSize > 0) {
						// D:\node\objTo3d-tiles-master\bin\shptoobj\obj\tmp
						String enPath = this.outputPath + File.separator + tmp;
						createFileDirectory(enPath);
						tmp++;

						Quadtree innerQuad = getQuadTree(dfc);
						List<Object> innerEnvs = new ArrayList<>();// 4등분된 envelop map

						List<Object> envList = new ArrayList<>();
						envList.add(envelope);
						envList.add(enPath);
						innerEnvs.add(envList);

						// folder
						int halftmp = 1;
						for (int en = 0; en < innerEnvs.size(); en++) {
							List<Object> envs = (List<Object>) innerEnvs.get(en);
							Envelope innerEnv = (Envelope) envs.get(0);
							if (en == 0) {
								if (dfcSize < defaultS) {
									// obj file
									ReferencedEnvelope reEnv = dfc.getBounds();
									Coordinate center = reEnv.centre();
									centerX = center.x;
									centerY = center.y;
									try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
											new FileOutputStream(enPath + File.separator + halftmp + ".obj"),
											"utf-8"))) {
										ShpToObjImpl.writer = writer;
										vertices = new ArrayList<>();
										vCoordinates = new ArrayList<>();
										vIdx = 0;
										vtIdx = 1;
										vnIdx = 1;
										try (FeatureIterator<SimpleFeature> features = dfc.features()) {
											writer.write("o " + buildingCollection.getSchema().getTypeName() + "\n");
											while (features.hasNext()) {
												SimpleFeature feature = features.next();
												buildingFeatureToObjGroup(feature);
											}
										}
									}
									double maxX = reEnv.getMaxX(); // east
									double maxY = reEnv.getMaxY(); // north
									double minX = reEnv.getMinX(); // west
									double minY = reEnv.getMinY(); // south
									// tileset option file
									JSONObject obj = new JSONObject();
									obj.put("longitude", Math.toRadians(centerX));
									obj.put("latitude", Math.toRadians(centerY));
									obj.put("west", Math.toRadians(minX));
									obj.put("south", Math.toRadians(minY));
									obj.put("east", Math.toRadians(maxX));
									obj.put("north", Math.toRadians(maxY));
									obj.put("transHeight", 0);
									obj.put("region", true);
									obj.put("box", false);
									obj.put("sphere", false);
									obj.put("gltfUpAxis", "Z");
									obj.put("minHeight", 0);
									obj.put("maxHeight", 100);

									try (FileWriter file = new FileWriter(
											enPath + File.separator + halftmp + ".json")) {
										file.write(obj.toJSONString());
									}
									break;
								}
							}
							List<Envelope> halfEnvels = getGrids(innerEnv, innerEnv.getHeight() / 2);
							for (Envelope halfEnvel : halfEnvels) {
								List halfItems = innerQuad.query(halfEnvel);
								int halfSize = halfItems.size();
								SimpleFeatureCollection halfSfc = new DefaultFeatureCollection();
								for (int i = 0; i < halfSize; i++) {
									SimpleFeature sf = (SimpleFeature) halfItems.get(i);
									if (sf != null) {
										((DefaultFeatureCollection) halfSfc).add(sf);
									}
								}
								Filter halfFilter = ff.intersects(ff.property("the_geom"), ff.literal(halfEnvel));
								halfSfc = (SimpleFeatureCollection) halfSfc.subCollection(halfFilter);
								int tSize = halfSfc.size();
								if (tSize > 0) {
									if (tSize < defaultS) {
										DefaultFeatureCollection tfc = new DefaultFeatureCollection();
										SimpleFeatureIterator iter = halfSfc.features();
										while (iter.hasNext()) {
											SimpleFeature tsf = (SimpleFeature) iter.next();
											if (tsf != null) {
												String id = tsf.getID();
												if (!sfcMap.containsKey(id)) {
													tfc.add(tsf);
													sfcMap.put(id, null);
												}
											}
										}
										if (tfc.size() > 0) {
											// obj file
											ReferencedEnvelope reEnv = halfSfc.getBounds();
											Coordinate center = reEnv.centre();
											centerX = center.x;
											centerY = center.y;

											try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
													new FileOutputStream(enPath + File.separator + halftmp + ".obj"),
													"utf-8"))) {
												ShpToObjImpl.writer = writer;
												vertices = new ArrayList<>();
												vCoordinates = new ArrayList<>();
												vIdx = 0;
												vtIdx = 1;
												vnIdx = 1;
												writer.write("mtllib barrel.mtl" + "\n");
												try (FeatureIterator<SimpleFeature> features = tfc.features()) {
													writer.write(
															"o " + buildingCollection.getSchema().getTypeName() + "\n");
													while (features.hasNext()) {
														SimpleFeature feature = features.next();
														buildingFeatureToObjGroup(feature);
													}
												}
											}

											double maxX = reEnv.getMaxX(); // east
											double maxY = reEnv.getMaxY(); // north
											double minX = reEnv.getMinX(); // west
											double minY = reEnv.getMinY(); // south
											// tileset option file
											JSONObject obj = new JSONObject();
											obj.put("longitude", Math.toRadians(centerX));
											obj.put("latitude", Math.toRadians(centerY));
											obj.put("west", Math.toRadians(minX));
											obj.put("south", Math.toRadians(minY));
											obj.put("east", Math.toRadians(maxX));
											obj.put("north", Math.toRadians(maxY));
											obj.put("transHeight", 0);
											obj.put("region", true);
											obj.put("box", false);
											obj.put("sphere", false);
											obj.put("gltfUpAxis", "Z");
											obj.put("minHeight", 0);
											obj.put("maxHeight", 100);

											try (FileWriter file = new FileWriter(
													enPath + File.separator + halftmp + ".json")) {
												file.write(obj.toJSONString());
											}
											halftmp++;
										}
									} else {
										List<Object> halfEnvList = new ArrayList<>();
										halfEnvList.add(halfEnvel);
										innerEnvs.add(halfEnvList);
									}
								}
							}
						}
					}
				}
			} else {
				// obj file
				ReferencedEnvelope reEnv = buildingCollection.getBounds();
				Coordinate center = reEnv.centre();
				centerX = center.x;
				centerY = center.y;

				try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
						new FileOutputStream(outputPath + File.separator + 1 + ".obj"), "utf-8"))) {
					ShpToObjImpl.writer = writer;
					try (FeatureIterator<SimpleFeature> features = buildingCollection.features()) {
						writer.write("o " + buildingCollection.getSchema().getTypeName() + "\n");
						ShpToObjImpl.writer = writer;
						vertices = new ArrayList<>();
						vCoordinates = new ArrayList<>();
						vIdx = 0;
						vtIdx = 1;
						vnIdx = 1;
						while (features.hasNext()) {
							SimpleFeature feature = features.next();
							buildingFeatureToObjGroup(feature);
						}
					}
				}
				double maxX = reEnv.getMaxX(); // east
				double maxY = reEnv.getMaxY(); // north
				double minX = reEnv.getMinX(); // west
				double minY = reEnv.getMinY(); // south
				// tileset option file
				JSONObject obj = new JSONObject();
				obj.put("longitude", Math.toRadians(centerX));
				obj.put("latitude", Math.toRadians(centerY));
				obj.put("west", Math.toRadians(minX));
				obj.put("south", Math.toRadians(minY));
				obj.put("east", Math.toRadians(maxX));
				obj.put("north", Math.toRadians(maxY));
				obj.put("transHeight", 0);
				obj.put("region", true);
				obj.put("box", false);
				obj.put("sphere", false);
				obj.put("gltfUpAxis", "Z");
				obj.put("minHeight", 0);
				obj.put("maxHeight", 100);

				try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + ".json")) {
					file.write(obj.toJSONString());
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
			// String featureID = "g " + feature.getID();
			String featureID = "g " + feature.getAttribute("osm_id");
			if (numGeom > 1) {
				featureID += "_" + (g + 1) + "\n";
			} else {
				featureID += "\n";
			}
			writer.write(featureID);

			Geometry geom = multipolygon.getGeometryN(g);
			geom.normalize();
			Polygon pg = (Polygon) geom;
			Coordinate[] coordinates = deleteInnerPoints(pg.getCoordinates());

			// threeGeom
			List<Face3> faces = new ArrayList<>();
			StringBuilder vBuilder = new StringBuilder();

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
			}

			int bottomStart;
			int bottomEnd;
			int topStart;
			int topEnd;
			int sideStart;
			int sideEnd;

			// 천장
			int s = coorList.size();
			List<Vector3d> hCoorList = new ArrayList<>();
			for (int i = 0; i < s; i++) {
				Vector3d vertice = createLiftedCoordinate(coorList.get(i), height);
				hCoorList.add(vertice);
				// threeGeom
				vertices.add(new Vector3d(coorList.get(i).x(), coorList.get(i).y(), height));
				vCoordinates.add(new Vector2d(coordinates[i].x, coordinates[i].y));

				vBuilder.append("v " + coorList.get(i).x() + " " + coorList.get(i).y() + " " + height + "\n");
			}
			writer.write(vBuilder.toString());

			// face
			// coorList.add(coorList.get(0));
			Triangler tri = new Triangler(coorList);
			tri.triangify();
			// tri.triangify(holeList); // actual algo call
			List<Integer> faceIndice = tri.getFaceIndices();
			// 바닥 face
			bottomStart = faces.size();
			for (int m = 0; m < faceIndice.size(); m += 3) {
				int fFirIdx = vIdx + faceIndice.get(m);
				int fSecIdx = vIdx + faceIndice.get(m + 1);
				int fThrIdx = vIdx + faceIndice.get(m + 2);

				// threeGeom
				faces.add(new Face3(fFirIdx, fSecIdx, fThrIdx, new Vector3d(0, 0, 0)));
			}
			bottomEnd = faces.size();
			// 천장 face
			topStart = faces.size();
			for (int m = 0; m < faceIndice.size(); m += 3) {
				int fFirIdx = vIdx + s + faceIndice.get(m);
				int fSecIdx = vIdx + s + faceIndice.get(m + 1);
				int fThrIdx = vIdx + s + faceIndice.get(m + 2);

				// threeGeom
				faces.add(new Face3(fThrIdx, fSecIdx, fFirIdx, new Vector3d(0, 0, 0)));
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
			threeGeom.computeBoundingBox();

			Vector3d max = threeGeom.boundingBox.getMax();

			double rangeMaxX = max.x();
			double rangeMaxY = max.y();

			Envelope pgEv = pg.getEnvelopeInternal();
			double range2dminX = pgEv.getMinX();
			double range2dmaxX = pgEv.getMaxX();
			double range2dminY = pgEv.getMinY();
			double range2dmaxY = pgEv.getMaxY();

			Vector2d offset2d = new Vector2d(0 - range2dminX, 0 - range2dminY);
			Vector2d range2d = new Vector2d(((range2dminX - range2dmaxX) * -1), ((range2dminY - range2dmaxY) * -1));

			// vt
			List<List<Vector2d>> faceVertexUvs = new ArrayList<>();

			// 바닥
			for (int i = bottomStart; i < bottomEnd; i++) {
				List<Vector2d> innerFvt = new ArrayList<>();
				Face3 face = threeGeom.faces.get(i);

				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));

				faceVertexUvs.add(innerFvt);
			}
			// 윗면
			for (int i = topStart; i < topEnd; i++) {
				List<Vector2d> innerFvt = new ArrayList<>();
				Face3 face = threeGeom.faces.get(i);

				Vector2d v1 = vCoordinates.get(face.a);
				Vector2d v2 = vCoordinates.get(face.b);
				Vector2d v3 = vCoordinates.get(face.c);

				Vector2d vt1 = new Vector2d((v1.x() + offset2d.x()) / range2d.x() * 0.4,
						(v1.y() + offset2d.y()) / range2d.y() * 0.4 + 0.6);
				Vector2d vt2 = new Vector2d((v2.x() + offset2d.x()) / range2d.x() * 0.4,
						(v2.y() + offset2d.y()) / range2d.y() * 0.4 + 0.6);
				Vector2d vt3 = new Vector2d((v3.x() + offset2d.x()) / range2d.x() * 0.4,
						(v3.y() + offset2d.y()) / range2d.y() * 0.4 + 0.6);

				innerFvt.add(vt1);
				innerFvt.add(vt2);
				innerFvt.add(vt3);

				faceVertexUvs.add(innerFvt);
			}
			// 옆면
			double vtBottom = 0;
			double vtHeight = 0.6;

			for (int i = sideStart; i < sideEnd; i = i + 2) {
				Face3 face1 = threeGeom.faces.get(i);
				Vector3d f1v1 = threeGeom.vertices.get(face1.a);
				Vector3d f1v2 = threeGeom.vertices.get(face1.b);
				Vector3d f1v3 = threeGeom.vertices.get(face1.c);

				double f1from1to2 = f1v1.distanceTo(f1v2); // x축
				double ratio12 = (f1from1to2 * 0.6) / rangeMaxY;
				if (ratio12 > 1) {
					ratio12 = 1;
				}

				List<Vector2d> innerFvt1 = new ArrayList<>();
				innerFvt1.add(new Vector2d(0, vtBottom));
				innerFvt1.add(new Vector2d(ratio12, vtBottom));
				innerFvt1.add(new Vector2d(0, vtHeight));

				List<Vector2d> innerFvt2 = new ArrayList<>();
				innerFvt2.add(new Vector2d(0, vtHeight));
				innerFvt2.add(new Vector2d(ratio12, vtBottom));
				innerFvt2.add(new Vector2d(ratio12, vtHeight));

				faceVertexUvs.add(innerFvt1);
				faceVertexUvs.add(innerFvt2);
			}
			threeGeom.faceVertexUvs.add(faceVertexUvs);
			// vn
			threeGeom.computeFlatVertexNormals();
			threeGeom.computeFaceNormals();
			writeThreeGeometry(threeGeom);
		}
	}

	public void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom)
			throws IOException {

		// vt
		if (threeGeom.faceVertexUvs != null) {
			StringBuilder vtBuilder = new StringBuilder();
			List<List<Vector2d>> faceVertexUvs = threeGeom.faceVertexUvs.get(0);
			for (List<Vector2d> faceVertexUv : faceVertexUvs) {
				for (Vector2d vt : faceVertexUv) {
					vtBuilder.append("vt " + vt.x() + " " + vt.y() + "\n");
				}
			}
			writer.write(vtBuilder.toString());
		}
		// f
		if (threeGeom.faces != null) {
			StringBuilder vnBuilder = new StringBuilder();
			StringBuilder fBuilder = new StringBuilder();
			for (Face3 face : threeGeom.faces) {
				// vn
				Vector3d normal = face.normal;
				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");

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
			writer.write(vnBuilder.toString());
			writer.write("usemtl wood" + "\n");
			writer.write(fBuilder.toString());
		}
	}

	public void createUVVerticeOnPolygon(Geometry geom, Object result) {

	}

	private String coordinateToVertexdescription(Vector3d vertice) {
		return new String("v " + vertice.x() + " " + vertice.y() + " " + vertice.z() + "\n");
	}

	public String coordinateToVertexdescription(Coordinate coordinate) {
		return new String("v " + coordinate.x + " " + coordinate.y + " " + coordinate.z + "\n");
	}

	private Vector3d createLiftedCoordinate(Vector3d vector3d, double height) {
		return new Vector3d(vector3d.x(), vector3d.y(), height);
	}

	public Coordinate createLiftedCoordinate(Coordinate coordinate, double height) {
		return new Coordinate(coordinate.x, coordinate.y, height);
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

	private SimpleFeature getIntersection(Envelope envelope, SimpleFeature sf) {

		GeometryFactory f = new GeometryFactory();
		SimpleFeature resultSF = SimpleFeatureBuilder.copy(sf);
		Geometry envelpoeGeom = f.toGeometry(envelope);
		Geometry sfGeom = (Geometry) sf.getDefaultGeometry();
		Geometry interGeom = null;
		try {
			interGeom = envelpoeGeom.intersection(sfGeom);
			if (interGeom != null) {
				resultSF.setDefaultGeometry(interGeom);
			}
		} catch (TopologyException e) {
			return resultSF;
		} finally {
			return resultSF;
		}
	}

	private List<Envelope> getGrids(Envelope envelope, double quadIndexWidth) {

		List<Envelope> resultRefEnl = new ArrayList<Envelope>();
		for (double y = envelope.getMinY(); y < envelope.getMaxY(); y += quadIndexWidth) {
			for (double x = envelope.getMinX(); x < envelope.getMaxX(); x += quadIndexWidth) {
				Envelope newEnvelope = new Envelope(x, x + quadIndexWidth, y, y + quadIndexWidth);
				resultRefEnl.add(newEnvelope);
			}
		}
		return resultRefEnl;
	}

	private Quadtree getQuadTree(FeatureCollection<SimpleFeatureType, SimpleFeature> sfc) {

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

	private void createFileDirectory(String directory) {
		File file = new File(directory);
		if (!file.exists()) {
			file.mkdirs();
		}
	}
}
