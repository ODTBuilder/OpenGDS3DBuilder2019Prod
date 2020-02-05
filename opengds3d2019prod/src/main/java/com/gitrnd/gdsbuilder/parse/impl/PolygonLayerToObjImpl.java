package com.gitrnd.gdsbuilder.parse.impl;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.grid.Grids;
import org.geotools.referencing.GeodeticCalculator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.PropertyDescriptor;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.operation.TransformException;
import org.poly2tri.Poly2Tri;
import org.poly2tri.geometry.polygon.PolygonPoint;
import org.poly2tri.triangulation.TriangulationPoint;
import org.poly2tri.triangulation.delaunay.DelaunayTriangle;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.test.qaud.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.Polygon;

public class PolygonLayerToObjImpl {

	private double defaultHeight = 5;
	private static BufferedWriter writer;

	private static double centerX;
	private static double centerY;

	private static List<Vector3d> vertices;
	private static List<Vector2d> vCoordinates;

	private String attribute;
	private String outputPath;

	private int vIdx;
	private int vtIdx;
	private int vnIdx;

	private int objfilenum = 0;

	private EnShpToObjHeightType hType;

	private FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection;
	private String mtl;
	private String usemtl;
	private String texture;

	public PolygonLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String texture,
			EnShpToObjHeightType hType, double defaultHeight, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.texture = texture;
		this.hType = hType;
		this.defaultHeight = defaultHeight;
		this.outputPath = outputPath;
	}

	public PolygonLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String texture,
			EnShpToObjHeightType hType, String attribute, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.texture = texture;
		this.hType = hType;
		this.attribute = attribute;
		this.outputPath = outputPath;
	}

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

	public String getAttribute() {
		return attribute;
	}

	public void setAttribute(String attribute) {
		this.attribute = attribute;
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

	@SuppressWarnings("unchecked")
	public void parseToObjFile() throws UnsupportedEncodingException, FileNotFoundException, IOException,
			FactoryException, TransformException {

		ShpToObjImpl.createFileDirectory(this.outputPath);
		Map<String, Object> sfcMap = new HashMap<>();

		// 높이값 설정
		double height = 0.0;
		double maxHeight = 0.0;
		if (this.hType == EnShpToObjHeightType.DEFAULT) {
			height = defaultHeight;
			maxHeight = defaultHeight;
		}

		// 대용량 처리
		int totalSize = buildingCollection.size();
		if (totalSize > 5000) { // tmp
			// quadtree
			Quadtree quad = ShpToObjImpl.getQuadTree(buildingCollection);

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
			int defaultS = 150;
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
					ShpToObjImpl.createFileDirectory(enPath);
					tmp++;

					Quadtree innerQuad = ShpToObjImpl.getQuadTree(dfc);
					List<Object> innerEnvs = new ArrayList<>();// 4등분된 envelop map

					List<Object> envList = new ArrayList<>();
					envList.add(envelope);
					envList.add(enPath);
					innerEnvs.add(envList);

					if (texture != null) {
						String mtl = texture + ".mtl";
						this.mtl = mtl;

						String image = texture + ".jpg";
						InputStream mtlIs = this.getClass().getResourceAsStream("/img/texture/" + texture + "/" + mtl);
						OutputStream mtlOs = new FileOutputStream(enPath + File.separator + mtl);
						fileCopy(mtlIs, mtlOs);
						InputStream imageIs = this.getClass()
								.getResourceAsStream("/img/texture/" + texture + "/" + image);
						OutputStream imageOs = new FileOutputStream(enPath + File.separator + image);
						fileCopy(imageIs, imageOs);
						this.usemtl = texture;
					}

					// folder
					int halftmp = 1;
					for (int en = 0; en < innerEnvs.size(); en++) {
						List<Object> envs = (List<Object>) innerEnvs.get(en);
						Envelope innerEnv = (Envelope) envs.get(0);
						if (en == 0) {
							if (dfcSize < defaultS) {
								objfilenum++;

								// obj file
								ReferencedEnvelope reEnv = dfc.getBounds();
								Coordinate center = reEnv.centre();
								centerX = center.x;
								centerY = center.y;

								// batch table file
								JSONObject batchTable = new JSONObject();
								// tile propertiles
								JSONObject tilesPropeties = new JSONObject();
								try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
										new FileOutputStream(enPath + File.separator + halftmp + ".obj"), "utf-8"))) {
									this.writer = writer;

									writer.write("o " + buildingCollection.getSchema().getTypeName() + "\n");
									if (mtl != null) {
										writer.write("mtllib " + mtl + "\n");
									}

									vertices = new ArrayList<>();
									vCoordinates = new ArrayList<>();
									vIdx = 0;
									vtIdx = 1;
									vnIdx = 1;

									// featureId
									JSONArray batchIdArr = new JSONArray();
									// properties
									Collection<PropertyDescriptor> properties = dfc.getSchema().getDescriptors();
									for (PropertyDescriptor property : properties) {
										String name = property.getName().toString();
										String type = property.getType().getBinding().getSimpleName();
										if (type.equals("Double") || type.equals("Integer") || type.equals("Long")) {
											batchTable.put(name, new JSONArray());
										}
									}
									FeatureIterator<SimpleFeature> features = dfc.features();
									while (features.hasNext()) {
										SimpleFeature feature = features.next();
										if (this.hType == EnShpToObjHeightType.FIX) {
											try {
												height = (double) feature.getAttribute(attribute);
											} catch (Exception e) {
												height = defaultHeight;
											}
										}
										if (height > maxHeight) {
											maxHeight = height;
										}
										List<String> idlist = buildingFeatureToObjGroup(feature, height);
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
									Iterator batchIter = batchTable.keySet().iterator();
									while (batchIter.hasNext()) {
										String batchKey = (String) batchIter.next();
										JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
										Double max = (Double) Collections.max(propertiesArr);
										Double min = (Double) Collections.min(propertiesArr);
										JSONObject minmaxObj = new JSONObject();
										minmaxObj.put("minimum", min);
										minmaxObj.put("maximum", max);
										tilesPropeties.put(batchKey, minmaxObj);
									}
									batchTable.put("featureId", batchIdArr);
								}

								try (FileWriter file = new FileWriter(
										enPath + File.separator + halftmp + "batch.json")) {
									file.write(batchTable.toJSONString());
								}

								// tileset option file
								double maxX = reEnv.getMaxX(); // east
								double maxY = reEnv.getMaxY(); // north
								double minX = reEnv.getMinX(); // west
								double minY = reEnv.getMinY(); // south

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

								try (FileWriter file = new FileWriter(
										enPath + File.separator + halftmp + "tile.json")) {
									file.write(tileOption.toJSONString());
								}
								break;
							}
						}
						List<Envelope> halfEnvels = ShpToObjImpl.getGrids(innerEnv, innerEnv.getHeight() / 2);
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
										objfilenum++;

										// obj file
										ReferencedEnvelope reEnv = halfSfc.getBounds();
										Coordinate center = reEnv.centre();
										centerX = center.x;
										centerY = center.y;

										// batch table file
										JSONObject batchTable = new JSONObject();
										// tile propertiles
										JSONObject tilesPropeties = new JSONObject();
										try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
												new FileOutputStream(enPath + File.separator + halftmp + ".obj"),
												"utf-8"))) {

											this.writer = writer;
											writer.write("o " + buildingCollection.getSchema().getTypeName() + "\n");

											if (mtl != null) {
												writer.write("mtllib " + mtl + "\n");
											}

											vertices = new ArrayList<>();
											vCoordinates = new ArrayList<>();

											vIdx = 0;
											vtIdx = 1;
											vnIdx = 1;

											// featureId
											JSONArray batchIdArr = new JSONArray();
											// properties
											Collection<PropertyDescriptor> properties = tfc.getSchema()
													.getDescriptors();
											for (PropertyDescriptor property : properties) {
												String name = property.getName().toString();
												String type = property.getType().getBinding().getSimpleName();
												if (type.equals("Double") || type.equals("Integer")
														|| type.equals("Long")) {
													batchTable.put(name, new JSONArray());
												}
											}
											FeatureIterator<SimpleFeature> features = tfc.features();
											while (features.hasNext()) {
												SimpleFeature feature = features.next();
												if (this.hType == EnShpToObjHeightType.FIX) {
													try {
														height = (double) feature.getAttribute(attribute);
													} catch (Exception e) {
														height = defaultHeight;
													}
												}
												if (height > maxHeight) {
													maxHeight = height;
												}
												List<String> idlist = buildingFeatureToObjGroup(feature, height);
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
											Iterator batchIter = batchTable.keySet().iterator();
											while (batchIter.hasNext()) {
												String batchKey = (String) batchIter.next();
												JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
												Double max = (Double) Collections.max(propertiesArr);
												Double min = (Double) Collections.min(propertiesArr);
												JSONObject minmaxObj = new JSONObject();
												minmaxObj.put("minimum", min);
												minmaxObj.put("maximum", max);
												tilesPropeties.put(batchKey, minmaxObj);
											}
											batchTable.put("featureId", batchIdArr);
										}

										try (FileWriter file = new FileWriter(
												enPath + File.separator + halftmp + "batch.json")) {
											file.write(batchTable.toJSONString());
										}

										// tileset option file
										double maxX = reEnv.getMaxX(); // east
										double maxY = reEnv.getMaxY(); // north
										double minX = reEnv.getMinX(); // west
										double minY = reEnv.getMinY(); // south

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

										try (FileWriter file = new FileWriter(
												enPath + File.separator + halftmp + "tile.json")) {
											file.write(tileOption.toJSONString());
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
			objfilenum++;

			if (texture != null) {
				String mtl = texture + ".mtl";
				this.mtl = mtl;

				String image = texture + ".jpg";
				InputStream mtlIs = this.getClass().getResourceAsStream("/img/texture/" + texture + "/" + mtl);
				OutputStream mtlOs = new FileOutputStream(outputPath + File.separator + mtl);
				fileCopy(mtlIs, mtlOs);
				InputStream imageIs = this.getClass().getResourceAsStream("/img/texture/" + texture + "/" + image);
				OutputStream imageOs = new FileOutputStream(outputPath + File.separator + image);
				fileCopy(imageIs, imageOs);
				this.usemtl = texture;
			}

			// obj file
			ReferencedEnvelope reEnv = buildingCollection.getBounds();
			Coordinate center = reEnv.centre();
			centerX = center.x;
			centerY = center.y;

			// batch table file
			JSONObject batchTable = new JSONObject();
			// tile propertiles
			JSONObject tilesPropeties = new JSONObject();
			try (BufferedWriter writer = new BufferedWriter(
					new OutputStreamWriter(new FileOutputStream(outputPath + File.separator + 1 + ".obj"), "utf-8"))) {

				this.writer = writer;
				writer.write("o " + buildingCollection.getSchema().getTypeName() + "\n");
				if (mtl != null) {
					writer.write("mtllib " + mtl + "\n");
				}

				vertices = new ArrayList<>();
				vCoordinates = new ArrayList<>();
				vIdx = 0;
				vtIdx = 1;
				vnIdx = 1;

				// featureId
				JSONArray batchIdArr = new JSONArray();
				// properties
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
					if (this.hType == EnShpToObjHeightType.FIX) {
						try {
							height = (double) feature.getAttribute(attribute);
						} catch (Exception e) {
							height = defaultHeight;
						}
					}
					if (height > maxHeight) {
						maxHeight = height;
					}
					List<String> idlist = buildingFeatureToObjGroup(feature, height);
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

			try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + "batch.json")) {
				file.write(batchTable.toJSONString());
			}

			// tileset option file
			double maxX = reEnv.getMaxX(); // east
			double maxY = reEnv.getMaxY(); // north
			double minX = reEnv.getMinX(); // west
			double minY = reEnv.getMinY(); // south

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

	private List<String> buildingFeatureToObjGroup(SimpleFeature feature, double height)
			throws FactoryException, TransformException, IOException {

		List<String> idList = new ArrayList<>();

		Geometry multipolygon = (Geometry) feature.getDefaultGeometry();
		int numGeom = multipolygon.getNumGeometries();
		for (int g = 0; g < numGeom; g++) {
			String featureID = "g " + feature.getID();
			if (numGeom > 1) {
				featureID += "_" + (g + 1) + "\n";
			} else {
				featureID += "\n";
			}
			idList.add(feature.getID());
			// writer.write(featureID);
			String gId = featureID;

			writer.write(gId);
			if (usemtl != null) {
				writer.write("usemtl " + usemtl + "\n");
			}

			Geometry geom = multipolygon.getGeometryN(g);
			geom.normalize();
			Polygon pg = (Polygon) geom;

			Coordinate[] coordinates = ShpToObjImpl.deleteInnerPoints(pg.getCoordinates());

			List<Face3> faces = new ArrayList<>();
			StringBuilder vBuilder = new StringBuilder();
			List<PolygonPoint> allPoints = new ArrayList<>();

			// 바닥
			List<PolygonPoint> contourPoints = new ArrayList<>();
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
				// vCoordinates.add(new Vector2d(coordinates[i].x, coordinates[i].y));
				vBuilder.append("v " + xDistance + " " + yDistance + " " + 0 + "\n");
				// tri
				allPoints.add(new PolygonPoint(xDistance, yDistance, 0));
			}
			contourPoints.addAll(allPoints);

			// Prepare input data
			org.poly2tri.geometry.polygon.Polygon polygon = new org.poly2tri.geometry.polygon.Polygon(allPoints);

			// hole
			List<PolygonPoint> holePoints = new ArrayList<>();
			int holeSize = pg.getNumInteriorRing();
			if (holeSize > 0) {
				for (int h = 0; h < holeSize; h++) {
					Coordinate[] ringCoors = ShpToObjImpl.deleteInnerPoints(pg.getInteriorRingN(h).getCoordinates());
					List<PolygonPoint> ringPoints = new ArrayList<>();
					for (int i = 0; i < ringCoors.length; i++) {
						GeodeticCalculator gc = new GeodeticCalculator();
						gc.setStartingGeographicPoint(centerX, ringCoors[i].y);
						gc.setDestinationGeographicPoint(ringCoors[i].x, ringCoors[i].y);
						double xDistance = gc.getOrthodromicDistance();
						if (centerX > ringCoors[i].x) {
							xDistance = -xDistance;
						}
						gc.setStartingGeographicPoint(ringCoors[i].x, centerY);
						gc.setDestinationGeographicPoint(ringCoors[i].x, ringCoors[i].y);
						double yDistance = gc.getOrthodromicDistance();
						if (centerY > ringCoors[i].y) {
							yDistance = -yDistance;
						}

						Vector3d vertice = new Vector3d(xDistance, yDistance, 0);
						coorList.add(vertice);
						// threeGeom
						vertices.add(new Vector3d(xDistance, yDistance, 0));
						vCoordinates.add(new Vector2d(ringCoors[i].x, ringCoors[i].y));
						// vCoordinates.add(new Vector2d(ringCoors[i].x, ringCoors[i].y));
						vBuilder.append("v " + xDistance + " " + yDistance + " " + 0 + "\n");
						// tri
						ringPoints.add(new PolygonPoint(xDistance, yDistance, 0));
					}
					org.poly2tri.geometry.polygon.Polygon hole = new org.poly2tri.geometry.polygon.Polygon(ringPoints);
					polygon.addHole(hole);
					holePoints.addAll(ringPoints);
					allPoints.addAll(ringPoints);
				}
			}

			// 천장
			int s = coorList.size();
			List<Vector3d> hCoorList = new ArrayList<>();
			for (int i = 0; i < s; i++) {
				Vector3d vertice = ShpToObjImpl.createLiftedCoordinate(coorList.get(i), height);
				hCoorList.add(vertice);
				// threeGeom
				vertices.add(new Vector3d(coorList.get(i).x(), coorList.get(i).y(), height));
				vBuilder.append("v " + coorList.get(i).x() + " " + coorList.get(i).y() + " " + height + "\n");
			}
			writer.write(vBuilder.toString());

			int bottomStart;
			int bottomEnd;
			int topStart;
			int topEnd;
			int sideStart;
			int sideEnd;

			// Launch tessellation
			Poly2Tri.triangulate(polygon);
			// Gather triangles
			List<DelaunayTriangle> triangles = polygon.getTriangles();

			// 바닥 face
			bottomStart = faces.size();
			for (int m = 0; m < triangles.size(); m++) {
				DelaunayTriangle tri = triangles.get(m);
				TriangulationPoint[] pts = tri.points;

				int fFirIdx = vIdx + allPoints.indexOf(pts[0]);
				int fSecIdx = vIdx + allPoints.indexOf(pts[1]);
				int fThrIdx = vIdx + allPoints.indexOf(pts[2]);
				// threeGeom
				faces.add(new Face3(fFirIdx, fSecIdx, fThrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(fThrIdx, fSecIdx, fFirIdx, new Vector3d(0, 0, 0)));
			}
			bottomEnd = faces.size();

			// 천장 face
			topStart = faces.size();
			for (int m = 0; m < triangles.size(); m++) {
				DelaunayTriangle tri = triangles.get(m);
				TriangulationPoint[] pts = tri.points;

				int fFirIdx = vIdx + s + allPoints.indexOf(pts[0]);
				int fSecIdx = vIdx + s + allPoints.indexOf(pts[1]);
				int fThrIdx = vIdx + s + allPoints.indexOf(pts[2]);
				// threeGeom
				faces.add(new Face3(fFirIdx, fSecIdx, fThrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(fThrIdx, fSecIdx, fFirIdx, new Vector3d(0, 0, 0)));
			}
			topEnd = faces.size();

			// 옆면 face
			sideStart = faces.size();
			int contourPtSize = contourPoints.size();
			int holePtSize = holePoints.size();
			for (int c = 0; c < contourPtSize; c++) {
				int cIdx = allPoints.indexOf(contourPoints.get(c));
				if (c == 0) {
					faces.add(new Face3(vIdx + 0, vIdx + contourPtSize - 1, vIdx + contourPtSize + holePtSize,
							new Vector3d(0, 0, 0)));
					faces.add(new Face3(vIdx + contourPtSize + holePtSize, vIdx + contourPtSize - 1,
							vIdx + (contourPtSize * 2) - 1 + holePtSize, new Vector3d(0, 0, 0)));
				} else {
					faces.add(new Face3(vIdx + cIdx, vIdx + cIdx - 1, vIdx + cIdx + contourPtSize + holePtSize,
							new Vector3d(0, 0, 0)));
					faces.add(new Face3(vIdx + cIdx + contourPtSize + holePtSize, vIdx + cIdx - 1,
							vIdx + cIdx - 1 + contourPtSize + holePtSize, new Vector3d(0, 0, 0)));
				}
			}
			// 옆면 hole face
			if (holeSize > 0) {
				List<org.poly2tri.geometry.polygon.Polygon> holeList = polygon.getHoles();
				for (int h = 0; h < holeList.size(); h++) {
					// if (h == 0) {
					org.poly2tri.geometry.polygon.Polygon hole = holeList.get(h);
					List<TriangulationPoint> holePts = hole.getPoints();
					int hSize = holePts.size();
					for (int hp = 0; hp < hSize; hp++) {
						int hpIdx = allPoints.indexOf(holePts.get(hp));
						if (hp == 0) {
							int fir = vIdx + hpIdx;
							int sec = vIdx + hpIdx + hSize - 1;
							int thr = vIdx + hpIdx + s;
							faces.add(new Face3(fir, sec, thr, new Vector3d(0, 0, 0)));
							faces.add(new Face3(thr, sec, sec + s, new Vector3d(0, 0, 0)));
						} else {
							int fir = vIdx + hpIdx;
							int sec = vIdx + hpIdx - 1;
							int thr = vIdx + hpIdx + s;

							faces.add(new Face3(fir, sec, thr, new Vector3d(0, 0, 0)));
							faces.add(new Face3(thr, sec, sec + s, new Vector3d(0, 0, 0)));
						}
					}
				}
			}
			sideEnd = faces.size();

			vIdx += coorList.size();
			vIdx += hCoorList.size();

			com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom = new com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry();
			threeGeom.faces = faces;
			threeGeom.vertices = vertices;
			threeGeom.computeBoundingBox();

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

				Vector2d v1 = vCoordinates.get(face.a - vCoordinates.size());
				Vector2d v2 = vCoordinates.get(face.b - vCoordinates.size());
				Vector2d v3 = vCoordinates.get(face.c - vCoordinates.size());

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
				// Vector3d f1v3 = threeGeom.vertices.get(face1.c);

				double f1from1to2 = f1v1.distanceTo(f1v2); // x축
				double ratio12 = f1from1to2 / height;
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
			writeThreeGeometry(threeGeom, gId);
		}
		return idList;
	}

	public void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom,
			String gId) throws IOException {

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
			writer.write(fBuilder.toString());
		}
	}

	public void fileCopy(InputStream is, OutputStream os) {
		try {
			int data = 0;
			while ((data = is.read()) != -1) {
				os.write(data);
			}
			is.close();
			os.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
