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
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.feature.SchemaException;
import org.geotools.feature.simple.SimpleFeatureBuilder;
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

import com.gitrnd.gdsbuilder.fileread.shp.SHPFileWriter;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjWidthType;
import com.gitrnd.gdsbuilder.parse.impl.test.qaud.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.algorithm.Angle;
import com.vividsolutions.jts.algorithm.CGAlgorithms;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.operation.buffer.BufferOp;
import com.vividsolutions.jts.operation.buffer.BufferParameters;
import com.vividsolutions.jts.util.GeometricShapeFactory;

public class LineLayerToObjImpl {

	int tmp = 0;

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

	private static List<Vector3d> vector3dList;
	private static List<Vector2d> vector2dList;

	private int vSize;
	private int vtIdx;
	private int vnIdx;
	private int objfilenum = 0;

	private double maxX; // east
	private double maxY; // north
	private double minX; // west
	private double minY; // south

	// tmp
	private boolean isNext = false;
	private Coordinate firTopCoor;
	private Coordinate secTopCoor;
	private Coordinate firBottomCoor;
	private Coordinate secBottomCoor;

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

	@SuppressWarnings("unchecked")
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
			// tmp
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
									vector3dList = new ArrayList<>();
									vector2dList = new ArrayList<>();
									vSize = 0;
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
										List<String> idlist = buildingFeatureToObjGroup(feature, defaultWidth,
												defaultHeight);
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

											vector3dList = new ArrayList<>();
											vector2dList = new ArrayList<>();

											vSize = 0;
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
												List<String> idlist = buildingFeatureToObjGroup(feature, defaultWidth,
														defaultHeight);
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
				this.vector3dList = new ArrayList<>();
				this.vector2dList = new ArrayList<>();
				vSize = 0;
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
//					for (String id : idlist) {
//						// featureId
//						batchIdArr.add(id);
//						// properties
//						Iterator batchIter = batchTable.keySet().iterator();
//						while (batchIter.hasNext()) {
//							String batchKey = (String) batchIter.next();
//							JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
//							propertiesArr.add(feature.getAttribute(batchKey));
//							batchTable.put(batchKey, propertiesArr);
//						}
//					}
				}

				try {
					SHPFileWriter.writeSHP("EPSG:4326", dfc, "D:\\test\\ss.shp");
				} catch (SchemaException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

//				Iterator batchIter = batchTable.keySet().iterator();
//				while (batchIter.hasNext()) {
//					String batchKey = (String) batchIter.next();
//					JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
//					JSONObject minmaxObj = new JSONObject();
//					minmaxObj.put("minimum", Collections.max(propertiesArr));
//					minmaxObj.put("maximum", Collections.min(propertiesArr));
//					tilesPropeties.put(batchKey, minmaxObj);
//				}
//				batchTable.put("featureId", batchIdArr);
			}
//			// custom batch file
//			try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + "batch.json")) {
//				file.write(batchTable.toJSONString());
//			}
//			// tileset option file
//			JSONObject tileOption = new JSONObject();
//			tileOption.put("longitude", Math.toRadians(centerX));
//			tileOption.put("latitude", Math.toRadians(centerY));
//			tileOption.put("west", Math.toRadians(minX));
//			tileOption.put("south", Math.toRadians(minY));
//			tileOption.put("east", Math.toRadians(maxX));
//			tileOption.put("north", Math.toRadians(maxY));
//			tileOption.put("transHeight", 0);
//			tileOption.put("region", true);
//			tileOption.put("box", false);
//			tileOption.put("sphere", false);
//			tileOption.put("gltfUpAxis", "Z");
//			tileOption.put("minHeight", 0);
//			tileOption.put("maxHeight", maxHeight);
//			tileOption.put("properties", tilesPropeties);
//
//			try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + "tile.json")) {
//				file.write(tileOption.toJSONString());
//			}
		}
	}

	DefaultFeatureCollection dfc = new DefaultFeatureCollection();
	int g = 1;
	GeometryFactory gf = new GeometryFactory();

	private Coordinate getDistanceCoordinate(Coordinate coordinate, double defaultHeight) {
		GeodeticCalculator gc = new GeodeticCalculator();
		gc.setStartingGeographicPoint(centerX, coordinate.y);
		gc.setDestinationGeographicPoint(coordinate.x, coordinate.y);
		double xDistance = gc.getOrthodromicDistance();
		if (centerX > coordinate.x) {
			xDistance = -xDistance;
		}
		gc.setStartingGeographicPoint(coordinate.x, centerY);
		gc.setDestinationGeographicPoint(coordinate.x, coordinate.y);
		double yDistance = gc.getOrthodromicDistance();
		if (centerY > coordinate.y) {
			yDistance = -yDistance;
		}
		return new Coordinate(xDistance, yDistance, defaultHeight);
	}

	private List<String> buildingFeatureToObjGroup(SimpleFeature feature, double defaultWidth, double defaultHeight)
			throws FactoryException, TransformException, IOException {

		String featureID = "g " + feature.getID() + "\n";
		writer.write(featureID);

		List<String> idList = new ArrayList<>();
		Geometry geom = (Geometry) feature.getDefaultGeometry();
		Coordinate[] lineCoors = geom.getCoordinates();
		
		List<Coordinate> allCoordinates = new ArrayList<>();
		List<Face3> faces = new ArrayList<>();
		StringBuilder vBuilder = new StringBuilder();
		// 중심점 밑면 거리 좌표
		for (int c = 0; c < lineCoors.length; c++) {
			GeodeticCalculator gc = new GeodeticCalculator();
			gc.setStartingGeographicPoint(centerX, lineCoors[c].y);
			gc.setDestinationGeographicPoint(lineCoors[c].x, lineCoors[c].y);
			double xDistance = gc.getOrthodromicDistance();
			if (centerX > lineCoors[c].x) {
				xDistance = -xDistance;
			}
			gc.setStartingGeographicPoint(lineCoors[c].x, centerY);
			gc.setDestinationGeographicPoint(lineCoors[c].x, lineCoors[c].y);
			double yDistance = gc.getOrthodromicDistance();
			if (centerY > lineCoors[c].y) {
				yDistance = -yDistance;
			}
			vector2dList.add(new Vector2d(xDistance, yDistance));

			lineCoors[c] = new Coordinate(xDistance, yDistance, 0);
			allCoordinates.add(new Coordinate(lineCoors[c]));
			vector3dList.add(new Vector3d(lineCoors[c].x, lineCoors[c].y, 0));
			vBuilder.append("v " + lineCoors[c].x + " " + lineCoors[c].y + " " + 0 + "\n");

			allCoordinates.add(new Coordinate(lineCoors[c].x, lineCoors[c].y, defaultHeight));
			vector3dList.add(new Vector3d(lineCoors[c].x, lineCoors[c].y, defaultHeight));
			vBuilder.append("v " + lineCoors[c].x + " " + lineCoors[c].y + " " + defaultHeight + "\n");
		}

		if (lineCoors.length > 3) {
			
			for (int c = 0; c < lineCoors.length - 2; c++) {

				Coordinate lineFirCoor = lineCoors[c];
				Coordinate lineSecCoor = lineCoors[c + 1];
				Coordinate lineThrCoor = lineCoors[c + 2];

				// center line 1
				Coordinate[] tmpCoors1 = new Coordinate[2];
				tmpCoors1[0] = lineFirCoor;
				tmpCoors1[1] = lineSecCoor;
				Geometry centerLine1 = gf.createLineString(tmpCoors1);

				// center line 2
				Coordinate[] tmpCoors2 = new Coordinate[2];
				tmpCoors2[0] = lineSecCoor;
				tmpCoors2[1] = lineThrCoor;
				Geometry centerLine2 = gf.createLineString(tmpCoors2);

				// line 1
				Coordinate firTopCoor1 = null;
				Coordinate secTopCoor1 = null;
				Coordinate firBottomCoor1 = null;
				Coordinate secBottomCoor1 = null;

				if (isNext) {
					firTopCoor1 = this.firTopCoor;
					secTopCoor1 = this.secTopCoor;
					firBottomCoor1 = this.firBottomCoor;
					secBottomCoor1 = this.secBottomCoor;
				} else {
					// line 1
					double dx1 = lineSecCoor.x - lineFirCoor.x;
					double dy1 = lineSecCoor.y - lineFirCoor.y;
					double len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

					double ux1Top = 1 * defaultWidth * dx1 / len1;
					double uy1Top = 1 * defaultWidth * dy1 / len1;

					firTopCoor1 = new Coordinate(lineFirCoor.x - uy1Top, lineFirCoor.y + ux1Top);
					secTopCoor1 = new Coordinate(lineSecCoor.x - uy1Top, lineSecCoor.y + ux1Top);

					double ux1Bottom = -1 * defaultWidth * dx1 / len1;
					double uy1Bottom = -1 * defaultWidth * dy1 / len1;

					firBottomCoor1 = new Coordinate(lineFirCoor.x - uy1Bottom, lineFirCoor.y + ux1Bottom);
					secBottomCoor1 = new Coordinate(lineSecCoor.x - uy1Bottom, lineSecCoor.y + ux1Bottom);
				}
				// line 2
				double dx2 = lineThrCoor.x - lineSecCoor.x;
				double dy2 = lineThrCoor.y - lineSecCoor.y;
				double len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

				double ux2Top = 1 * defaultWidth * dx2 / len2;
				double uy2Top = 1 * defaultWidth * dy2 / len2;

				Coordinate firTopCoor2 = new Coordinate(lineSecCoor.x - uy2Top, lineSecCoor.y + ux2Top);
				Coordinate secTopCoor2 = new Coordinate(lineThrCoor.x - uy2Top, lineThrCoor.y + ux2Top);

				double ux2Bottom = -1 * defaultWidth * dx2 / len2;
				double uy2Bottom = -1 * defaultWidth * dy2 / len2;

				Coordinate firBottomCoor2 = new Coordinate(lineSecCoor.x - uy2Bottom, lineSecCoor.y + ux2Bottom);
				Coordinate secBottomCoor2 = new Coordinate(lineThrCoor.x - uy2Bottom, lineThrCoor.y + ux2Bottom);

				Coordinate[] topCoors1 = new Coordinate[2];
				topCoors1[0] = firTopCoor1;
				topCoors1[1] = secTopCoor1;
				Geometry topLine1 = gf.createLineString(topCoors1);

				Coordinate[] topCoors2 = new Coordinate[2];
				topCoors2[0] = firTopCoor2;
				topCoors2[1] = secTopCoor2;
				Geometry topLine2 = gf.createLineString(topCoors2);

				Coordinate[] bottomCoors1 = new Coordinate[2];
				bottomCoors1[0] = firBottomCoor1;
				bottomCoors1[1] = secBottomCoor1;
				Geometry bottomLine1 = gf.createLineString(bottomCoors1);

				Coordinate[] bottomCoors2 = new Coordinate[2];
				bottomCoors2[0] = firBottomCoor2;
				bottomCoors2[1] = secBottomCoor2;
				Geometry bottomLine2 = gf.createLineString(bottomCoors2);

				// 첫 점 부채꼴
				if (c == 0) {
					double angle1 = Angle.angle(lineFirCoor, firTopCoor1);
					GeometricShapeFactory f1 = new GeometricShapeFactory();
					f1.setCentre(lineFirCoor);
					f1.setSize(defaultWidth * 2);
					f1.setNumPoints(50);
					f1.setRotation(0);
					Geometry arcFir = f1.createArc(angle1, Math.toRadians(180));
					Coordinate[] firArcCoors = arcFir.getCoordinates();
					if (CGAlgorithms.isCCW(firArcCoors)) {
						arcFir = arcFir.reverse();
						firArcCoors = arcFir.getCoordinates();
					}
					// 부채꼴 아랫면 vertex add
					for (int ac = 0; ac < firArcCoors.length; ac++) {
						vector2dList.add(new Vector2d(firArcCoors[ac].x, firArcCoors[ac].y));

						allCoordinates.add(firArcCoors[ac]);
						vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + 0 + "\n");
						vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, 0));

						allCoordinates.add(new Coordinate(firArcCoors[ac].x, firArcCoors[ac].y, defaultHeight));
						vBuilder.append(
								"v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + defaultHeight + "\n");
						vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, defaultHeight));
					}
					// 부채꼴 face 생성
					// 첫점 부채꼴 밑면, 윗면
					int lineFirBottomIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
						int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
						int thrIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
						// 첫점 부채꼴 밑면 face
						faces.add(new Face3(lineFirBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						// 첫점 부채꼴 윗면 face
						faces.add(new Face3(lineFirBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					}
					// 첫점 부채꼴 옆면
					for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
						int firIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
						int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
						int thrIdx = firIdx + 1;
						faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					}
				}
				// 마지막 점 부채꼴
				if (c + 2 == lineCoors.length - 1) {
					double angle2 = Angle.angle(lineThrCoor, secBottomCoor2);
					GeometricShapeFactory f2 = new GeometricShapeFactory();
					f2.setCentre(lineThrCoor);
					f2.setSize(defaultWidth * 2);
					f2.setNumPoints(50);
					f2.setRotation(0);
					Geometry arcSec = f2.createArc(angle2, Math.toRadians(180));
					Coordinate[] lasArcCoors = arcSec.getCoordinates();
					if (CGAlgorithms.isCCW(lasArcCoors)) {
						arcSec = arcSec.reverse();
						lasArcCoors = arcSec.getCoordinates();
					}
					for (int ac = 0; ac < lasArcCoors.length; ac++) {
						vector2dList.add(new Vector2d(lasArcCoors[ac].x, lasArcCoors[ac].y));
						// 부채꼴 아랫면 vertex add
						allCoordinates.add(lasArcCoors[ac]);
						vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + 0 + "\n");
						vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, 0));
						// 부채꼴 윗면 vertex add
						allCoordinates.add(new Coordinate(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultHeight));
						vBuilder.append(
								"v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + defaultHeight + "\n");
						vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultHeight));
					}
					// 마지막점 부채꼴 밑면, 윗면
					int lineLasBottomIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
						int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
						int thrIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
						// 마지막점 부채꼴 밑면 face
						faces.add(new Face3(lineLasBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						// 마지막점 부채꼴 윗면 face
						faces.add(new Face3(lineLasBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					}
					// 마지막 부채꼴 옆면
					for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
						int firIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
						int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
						int thrIdx = firIdx + 1;
						faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					}
				}

				double angle = Angle.toDegrees(Angle.angleBetweenOriented(lineFirCoor, lineSecCoor, lineThrCoor));
				if (angle != 180) {
					// 윗선 교차
					Geometry topInterset = topLine1.intersection(topLine2);
					if (!topInterset.isEmpty()) {
						Coordinate intersectionCoor = topInterset.getCoordinate();
						// line 1 top
						vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
						allCoordinates.add(firTopCoor1);
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultHeight));
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultHeight));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultHeight + "\n");

						vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
						allCoordinates.add(intersectionCoor);
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
						vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultHeight));
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultHeight));
						vBuilder.append(
								"v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultHeight + "\n");

						// line 1 bottom
						vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
						allCoordinates.add(firBottomCoor1);
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultHeight + "\n");

						vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
						allCoordinates.add(secBottomCoor1);
						vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
						vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultHeight));
						vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultHeight));
						vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultHeight + "\n");

						// 꺾인부분 부채꼴
						double angleCenter = Angle.angle(lineSecCoor, secBottomCoor1);
						double arcDegree = Angle.angleBetween(secBottomCoor1, lineSecCoor, firBottomCoor2);

						GeometricShapeFactory fCenter = new GeometricShapeFactory();
						fCenter.setCentre(lineSecCoor);
						fCenter.setSize(defaultWidth * 2);
						fCenter.setNumPoints(50);
						fCenter.setRotation(0);
						Geometry arcCenter = fCenter.createArc(angleCenter, arcDegree);
						Coordinate[] arcCenterCoors = arcCenter.getCoordinates();
						if (CGAlgorithms.isCCW(arcCenterCoors)) {
							arcCenter = arcCenter.reverse();
							arcCenterCoors = arcCenter.getCoordinates();
						}
						// 부채꼴의 모든 점 add
						for (int ac = 0; ac < arcCenterCoors.length; ac++) {
							vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
							allCoordinates.add(arcCenterCoors[ac]);
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
							// 윗면 vertex add
							allCoordinates
									.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " "
									+ defaultHeight + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
						}
						// face
						int lineSecBottomIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int lineSecTopIdx = vSize + allCoordinates.indexOf(lineSecCoor) + 1;
						// 부채꼴 아랫면, 윗면
						for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
							int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
							int thrIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
							// bottom
							faces.add(new Face3(lineSecBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							// top
							faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
						}
						// 부채꼴 옆면
						for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
							int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
							int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
							int thrIdx = firIdx + 1;
							// side
							faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
						}

						// line 1 top line 밑면, 윗면
						int top1FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int top1ThrIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
						faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

						// line 1 top line 옆면
						int topSide1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						int topSide1ThrIdx = topSide1FirIdx + 1;
						int topSide1FurIdx = topSide1SecIdx + 1;
						faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

						// line 1 bottom line 밑면, 윗면
						int bopttom1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
						int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom1FurIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1,
								new Vector3d(0, 0, 0)));

						// line 1 bottom line 옆면
						int bottomSide1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
						int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
						int bottomSide1FurIdx = bottomSide1SecIdx + 1;
						faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
								new Vector3d(0, 0, 0)));
						faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx,
								new Vector3d(0, 0, 0)));

						if (c + 2 == lineCoors.length - 1) {
							// line 2 top
							vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
							allCoordinates.add(secTopCoor2);
							vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
							vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultHeight));
							vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultHeight));
							vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultHeight + "\n");

							// line 2 bottom
							vector2dList.add(new Vector2d(firBottomCoor2.x, firBottomCoor2.y));
							allCoordinates.add(firBottomCoor2);
							vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, 0));
							vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firBottomCoor2.x, firBottomCoor2.y, defaultHeight));
							vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, defaultHeight));
							vBuilder.append(
									"v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + defaultHeight + "\n");

							vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
							allCoordinates.add(secBottomCoor2);
							vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
							vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
							vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
							vBuilder.append(
									"v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultHeight + "\n");

							// line 2 top line 밑면, 윗면
							int top2FirIdx = vSize + allCoordinates.indexOf(lineThrCoor);
							int top2SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							int top2ThrIdx = vSize + allCoordinates.indexOf(secTopCoor2);
							int top2FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);
							faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FurIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
							faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FurIdx + 1, new Vector3d(0, 0, 0)));

							// line 2 top line 옆면
							int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
							int topSide2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
							int topSide2ThrIdx = topSide2FirIdx + 1;
							int topSide2FurIdx = topSide2SecIdx + 1;
							faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FurIdx, new Vector3d(0, 0, 0)));

							// line 2 bottom line 밑면, 윗면
							int bottom2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
							int bottom2SecIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
							int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineThrCoor);
							int bottom2FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FurIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
									new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FurIdx + 1,
									new Vector3d(0, 0, 0)));

							// line 2 bottom line 옆면
							int bottomSide2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
							int bottomSide2SecIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
							int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
							int bottomSide2FurIdx = bottomSide2SecIdx + 1;
							faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
									new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FurIdx,
									new Vector3d(0, 0, 0)));

							this.firTopCoor = null;
							this.secTopCoor = null;
							this.firBottomCoor = null;
							this.secBottomCoor = null;
							this.isNext = false;
						} else {
							// 다음 for 문 연산을 위해 저장
							this.firTopCoor = intersectionCoor;
							this.secTopCoor = secTopCoor2;
							this.firBottomCoor = firBottomCoor2;
							this.secBottomCoor = secBottomCoor2;
							this.isNext = true;
						}
					}
					// 아랫선 교차
					Geometry bottomIntersect = bottomLine1.intersection(bottomLine2);
					if (!bottomIntersect.isEmpty()) {
						Coordinate intersectionCoor = bottomIntersect.getCoordinate();

						double angleCenter = Angle.angle(lineSecCoor, firTopCoor2);
						double arcDegree = Angle.angleBetween(secTopCoor1, lineSecCoor, firTopCoor2);

						GeometricShapeFactory fCenter = new GeometricShapeFactory();
						fCenter.setCentre(lineSecCoor);
						fCenter.setSize(defaultWidth * 2);
						fCenter.setNumPoints(50);
						fCenter.setRotation(0);
						Geometry arcCenter = fCenter.createArc(angleCenter, arcDegree);

						Coordinate[] arcCenterCoors = arcCenter.getCoordinates();
						if (CGAlgorithms.isCCW(arcCenterCoors)) {
							arcCenter = arcCenter.reverse();
							arcCenterCoors = arcCenter.getCoordinates();
						}
						// 부채꼴의 모든 점 add
						for (int ac = 0; ac < arcCenterCoors.length; ac++) {
							vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
							allCoordinates.add(arcCenterCoors[ac]);
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
							// 윗면 vertex add
							allCoordinates
									.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " "
									+ defaultHeight + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
						}
						// face
						int lineSecBottomIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int lineSecTopIdx = vSize + allCoordinates.indexOf(lineSecCoor) + 1;
						// 부채꼴 아랫면, 윗면
						for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
							int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
							int thrIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
							// bottom
							faces.add(new Face3(lineSecBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							// top
							faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
						}
						// 부채꼴 옆면
						for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
							int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
							int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
							int thrIdx = firIdx + 1;
							// side
							faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
						}

						// line 1 top
						vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
						allCoordinates.add(firTopCoor1);
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultHeight));
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultHeight));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultHeight + "\n");

						vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
						allCoordinates.add(secTopCoor1);
						vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
						vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultHeight));
						vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultHeight));
						vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultHeight + "\n");

						// line 1 bottom
						vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
						allCoordinates.add(firBottomCoor1);
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultHeight + "\n");

						vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
						allCoordinates.add(intersectionCoor);
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
						vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultHeight));
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultHeight));
						vBuilder.append(
								"v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultHeight + "\n");

						// line 1 top line 밑면, 윗면
						int top1FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int top1ThrIdx = vSize + allCoordinates.indexOf(secTopCoor1);
						int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
						faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

						// line 1 top line 옆면
						int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
						int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						int topSide1ThrIdx = topSide1FirIdx + 1;
						int topSide1FurIdx = topSide1SecIdx + 1;
						faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

						// line 1 bottom line 밑면, 윗면
						int bopttom1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1,
								new Vector3d(0, 0, 0)));

						// line 1 bottom line 옆면
						int bottomSide1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
						int bottomSide1FurIdx = bottomSide1SecIdx + 1;
						faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
								new Vector3d(0, 0, 0)));
						faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx,
								new Vector3d(0, 0, 0)));

						if (c + 2 == lineCoors.length - 1) {
							// line 2 top
							vector2dList.add(new Vector2d(firTopCoor2.x, firTopCoor2.y));
							allCoordinates.add(firTopCoor2);
							vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, 0));
							vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firTopCoor2.x, firTopCoor2.y, defaultHeight));
							vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, defaultHeight));
							vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + defaultHeight + "\n");

							vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
							allCoordinates.add(secTopCoor2);
							vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
							vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultHeight));
							vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultHeight));
							vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultHeight + "\n");

							// line 2 bottom
							vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
							allCoordinates.add(secBottomCoor2);
							vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
							vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
							vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
							vBuilder.append(
									"v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultHeight + "\n");

							// line 2 top line 밑면, 윗면
							int top2FirIdx = vSize + allCoordinates.indexOf(lineThrCoor);
							int top2SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							int top2ThrIdx = vSize + allCoordinates.indexOf(secTopCoor2);
							int top2FurIdx = vSize + allCoordinates.indexOf(firTopCoor2);
							faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FurIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
							faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FurIdx + 1, new Vector3d(0, 0, 0)));

							// line 2 top line 옆면
							int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
							int topSide2SecIdx = vSize + allCoordinates.indexOf(firTopCoor2);
							int topSide2ThrIdx = topSide2FirIdx + 1;
							int topSide2FurIdx = topSide2SecIdx + 1;
							faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FurIdx, new Vector3d(0, 0, 0)));

							// line 2 bottom line 밑면, 윗면
							int bottom2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
							int bottom2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
							int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineThrCoor);
							int bottom2FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FurIdx, new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
									new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FurIdx + 1,
									new Vector3d(0, 0, 0)));

							// line 2 bottom line 옆면
							int bottomSide2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
							int bottomSide2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
							int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
							int bottomSide2FurIdx = bottomSide2SecIdx + 1;
							faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
									new Vector3d(0, 0, 0)));
							faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FurIdx,
									new Vector3d(0, 0, 0)));
							
							this.firTopCoor = null;
							this.secTopCoor = null;
							this.firBottomCoor = null;
							this.secBottomCoor = null;
							this.isNext = false;
						} else {
							// 다음 for 문 연산을 위해 저장
							this.firTopCoor = firTopCoor2;
							this.secTopCoor = secTopCoor2;
							this.firBottomCoor = intersectionCoor;
							this.secBottomCoor = secBottomCoor2;
							this.isNext = true;
						}
					}
				} else {// 세 점이 평행
					// line 1 top line 밑면, 윗면
					int top1FirIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					int top1ThrIdx = vSize + allCoordinates.indexOf(secTopCoor1);
					int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 1 top line 옆면
					int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					int topSide1ThrIdx = topSide1FirIdx + 1;
					int topSide1FurIdx = topSide1SecIdx + 1;
					faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

					// line 1 bottom line 밑면, 윗면
					int bopttom1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
					int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int bottom1FurIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 1 bottom line 옆면
					int bottomSide1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
					int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
					int bottomSide1FurIdx = bottomSide1SecIdx + 1;
					faces.add(
							new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx, new Vector3d(0, 0, 0)));

					// 다음 for 문 연산을 위해 저장
					this.firTopCoor = firTopCoor2;
					this.secTopCoor = secTopCoor2;
					this.firBottomCoor = firBottomCoor2;
					this.secBottomCoor = secBottomCoor2;
					this.isNext = true;
				}

				try {
					SimpleFeatureType sfType = DataUtilities.createType("test", "the_geom:MultiLineString,name:String");

					SimpleFeature c1 = SimpleFeatureBuilder.build(sfType, new Object[] { centerLine1, "centerLine1" },
							String.valueOf(g));
					g++;
					dfc.add(c1);
					SimpleFeature c2 = SimpleFeatureBuilder.build(sfType, new Object[] { centerLine2, "centerLine2" },
							String.valueOf(g));
					g++;
					dfc.add(c2);
//					SimpleFeature sf1 = SimpleFeatureBuilder.build(sfType, new Object[] { arcFir, "arcFir" },
//							String.valueOf(g));
//					g++;
//					dfc.add(sf1);
//					SimpleFeature sf2 = SimpleFeatureBuilder.build(sfType, new Object[] { arcSec, "arcSec" },
//							String.valueOf(g));
//					g++;
//					dfc.add(sf2);
					SimpleFeature sf3 = SimpleFeatureBuilder.build(sfType, new Object[] { topLine1, "topLine1" },
							String.valueOf(g));
					g++;
					dfc.add(sf3);
					SimpleFeature sf4 = SimpleFeatureBuilder.build(sfType, new Object[] { topLine2, "topLine2" },
							String.valueOf(g));
					g++;
					dfc.add(sf4);
					SimpleFeature sf5 = SimpleFeatureBuilder.build(sfType, new Object[] { bottomLine2, "bottomLine2" },
							String.valueOf(g));
					g++;
					dfc.add(sf5);
					SimpleFeature sf6 = SimpleFeatureBuilder.build(sfType, new Object[] { bottomLine1, "bottomLine1" },
							String.valueOf(g));
					g++;
					dfc.add(sf6);
//					SimpleFeature ttt = SimpleFeatureBuilder.build(sfType, new Object[] { test, "test" },
//							String.valueOf(g));
//					g++;
//					dfc.add(ttt);
				} catch (SchemaException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}

		}
		if (lineCoors.length == 2) {

			Coordinate lineFirCoor = lineCoors[0];
			Coordinate lineSecCoor = lineCoors[1];

			double dx1 = lineSecCoor.x - lineFirCoor.x;
			double dy1 = lineSecCoor.y - lineFirCoor.y;
			double len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

			double ux1Top = 1 * defaultWidth * dx1 / len1;
			double uy1Top = 1 * defaultWidth * dy1 / len1;

			Coordinate firTopCoor1 = new Coordinate(lineFirCoor.x - uy1Top, lineFirCoor.y + ux1Top);
			Coordinate secTopCoor1 = new Coordinate(lineSecCoor.x - uy1Top, lineSecCoor.y + ux1Top);

			// line 1 top
			vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
			allCoordinates.add(firTopCoor1);
			vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
			vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
			allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultHeight));
			vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultHeight));
			vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultHeight + "\n");

			vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
			allCoordinates.add(secTopCoor1);
			vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
			vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
			allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultHeight));
			vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultHeight));
			vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultHeight + "\n");

			double ux1Bottom = -1 * defaultWidth * dx1 / len1;
			double uy1Bottom = -1 * defaultWidth * dy1 / len1;

			Coordinate firBottomCoor1 = new Coordinate(lineFirCoor.x - uy1Bottom, lineFirCoor.y + ux1Bottom);
			Coordinate secBottomCoor1 = new Coordinate(lineSecCoor.x - uy1Bottom, lineSecCoor.y + ux1Bottom);

			// line 1 bottom
			vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
			allCoordinates.add(firBottomCoor1);
			vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
			vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
			allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
			vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
			vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultHeight + "\n");

			vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
			allCoordinates.add(secBottomCoor1);
			vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
			vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
			allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultHeight));
			vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultHeight));
			vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultHeight + "\n");

			double angle1 = Angle.angle(lineFirCoor, firTopCoor1);
			GeometricShapeFactory f1 = new GeometricShapeFactory();
			f1.setCentre(lineFirCoor);
			f1.setSize(defaultWidth * 2);
			f1.setNumPoints(50);
			f1.setRotation(0);
			Geometry arcFir = f1.createArc(angle1, Math.toRadians(180));
			Coordinate[] firArcCoors = arcFir.getCoordinates();
			if (CGAlgorithms.isCCW(firArcCoors)) {
				arcFir = arcFir.reverse();
				firArcCoors = arcFir.getCoordinates();
			}
			for (int ac = 0; ac < firArcCoors.length; ac++) {
				// 부채꼴 아랫면 vertex add
				vector2dList.add(new Vector2d(firArcCoors[ac].x, firArcCoors[ac].y));
				allCoordinates.add(firArcCoors[ac]);
				vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + 0 + "\n");
				vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, 0));
				// 부채꼴 윗면 vertex add
				allCoordinates.add(new Coordinate(firArcCoors[ac].x, firArcCoors[ac].y, defaultHeight));
				vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + defaultHeight + "\n");
				vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, defaultHeight));
			}

			double angle2 = Angle.angle(lineSecCoor, secBottomCoor1);
			GeometricShapeFactory f2 = new GeometricShapeFactory();
			f2.setCentre(lineSecCoor);
			f2.setSize(defaultWidth * 2);
			f2.setNumPoints(50);
			f2.setRotation(0);
			Geometry arcSec = f2.createArc(angle2, Math.toRadians(180));
			Coordinate[] lasArcCoors = arcSec.getCoordinates();
			if (CGAlgorithms.isCCW(lasArcCoors)) {
				arcSec = arcSec.reverse();
				lasArcCoors = arcSec.getCoordinates();
			}
			for (int ac = 0; ac < lasArcCoors.length; ac++) {
				// 부채꼴 아랫면 vertex add
				vector2dList.add(new Vector2d(lasArcCoors[ac].x, lasArcCoors[ac].y));
				allCoordinates.add(lasArcCoors[ac]);
				vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + 0 + "\n");
				vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, 0));
				// 부채꼴 윗면 vertex add
				allCoordinates.add(new Coordinate(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultHeight));
				vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + defaultHeight + "\n");
				vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultHeight));
			}

			// 부채꼴 face 생성
			// 첫점 부채꼴 밑면, 윗면
			int lineFirBottomIdx = vSize + allCoordinates.indexOf(lineFirCoor);
			for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
				int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
				int thrIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
				// 첫점 부채꼴 밑면 face
				faces.add(new Face3(lineFirBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				// 첫점 부채꼴 윗면 face
				faces.add(new Face3(lineFirBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
			}
			// 첫점 부채꼴 옆면
			for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
				int firIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
				int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
				int thrIdx = firIdx + 1;

				faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
			}
			// 마지막점 부채꼴 밑면, 윗면
			int lineLasBottomIdx = vSize + allCoordinates.indexOf(lineSecCoor);
			for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
				int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
				int thrIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
				// 마지막점 부채꼴 밑면 face
				faces.add(new Face3(lineLasBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				// 마지막점 부채꼴 윗면 face
				faces.add(new Face3(lineLasBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
			}
			// 마지막 부채꼴 옆면
			for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
				int firIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
				int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
				int thrIdx = firIdx + 1;
				faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
			}

			// line 1 top line 밑면, 윗면
			int top1FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
			int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
			int top1ThrIdx = vSize + allCoordinates.indexOf(secTopCoor1);
			int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
			faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
			faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
			faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
			faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

			// line 1 top line 옆면
			int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
			int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
			int topSide1ThrIdx = topSide1FirIdx + 1;
			int topSide1FurIdx = topSide1SecIdx + 1;
			faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
			faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

			// line 1 bottom line 밑면, 윗면
			int bopttom1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
			int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
			int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
			int bottom1FurIdx = vSize + allCoordinates.indexOf(lineFirCoor);
			faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
			faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
			faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
			faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1, new Vector3d(0, 0, 0)));

			// line 1 bottom line 옆면
			int bottomSide1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
			int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
			int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
			int bottomSide1FurIdx = bottomSide1SecIdx + 1;
			faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
			faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx, new Vector3d(0, 0, 0)));

		} else if (lineCoors.length == 3) {

			Coordinate lineFirCoor = lineCoors[0];
			Coordinate lineSecCoor = lineCoors[1];
			Coordinate lineThrCoor = lineCoors[2];

			// center line 1
			Coordinate[] tmpCoors1 = new Coordinate[2];
			tmpCoors1[0] = lineFirCoor;
			tmpCoors1[1] = lineSecCoor;
			Geometry centerLine1 = gf.createLineString(tmpCoors1);

			double dx1 = lineSecCoor.x - lineFirCoor.x;
			double dy1 = lineSecCoor.y - lineFirCoor.y;
			double len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

			double ux1Top = 1 * defaultWidth * dx1 / len1;
			double uy1Top = 1 * defaultWidth * dy1 / len1;

			Coordinate firTopCoor1 = new Coordinate(lineFirCoor.x - uy1Top, lineFirCoor.y + ux1Top);
			Coordinate secTopCoor1 = new Coordinate(lineSecCoor.x - uy1Top, lineSecCoor.y + ux1Top);

			Coordinate[] topCoors1 = new Coordinate[2];
			topCoors1[0] = firTopCoor1;
			topCoors1[1] = secTopCoor1;
			Geometry topLine1 = gf.createLineString(topCoors1);

			double ux1Bottom = -1 * defaultWidth * dx1 / len1;
			double uy1Bottom = -1 * defaultWidth * dy1 / len1;

			Coordinate firBottomCoor1 = new Coordinate(lineFirCoor.x - uy1Bottom, lineFirCoor.y + ux1Bottom);
			Coordinate secBottomCoor1 = new Coordinate(lineSecCoor.x - uy1Bottom, lineSecCoor.y + ux1Bottom);

			Coordinate[] bottomCoors1 = new Coordinate[2];
			bottomCoors1[0] = firBottomCoor1;
			bottomCoors1[1] = secBottomCoor1;
			Geometry bottomLine1 = gf.createLineString(bottomCoors1);

			double angle1 = Angle.angle(lineFirCoor, firTopCoor1);

			// double angle1 = Math.atan2(dy1, dx1);
			GeometricShapeFactory f1 = new GeometricShapeFactory();
			f1.setCentre(lineFirCoor);
			f1.setSize(defaultWidth * 2);
			f1.setNumPoints(50);
			f1.setRotation(0);
			Geometry arcFir = f1.createArc(angle1, Math.toRadians(180));
			Coordinate[] firArcCoors = arcFir.getCoordinates();
			if (CGAlgorithms.isCCW(firArcCoors)) {
				arcFir = arcFir.reverse();
				firArcCoors = arcFir.getCoordinates();
			}
			// 부채꼴 아랫면 vertex add
			for (int ac = 0; ac < firArcCoors.length; ac++) {
				vector2dList.add(new Vector2d(firArcCoors[ac].x, firArcCoors[ac].y));
				allCoordinates.add(firArcCoors[ac]);
				vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + 0 + "\n");
				vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, 0));
				allCoordinates.add(new Coordinate(firArcCoors[ac].x, firArcCoors[ac].y, defaultHeight));
				vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + defaultHeight + "\n");
				vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, defaultHeight));
			}

			// center line 2
			Coordinate[] tmpCoors2 = new Coordinate[2];
			tmpCoors2[0] = lineSecCoor;
			tmpCoors2[1] = lineThrCoor;
			Geometry centerLine2 = gf.createLineString(tmpCoors2);

			double dx2 = lineThrCoor.x - lineSecCoor.x;
			double dy2 = lineThrCoor.y - lineSecCoor.y;
			double len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

			double ux2Top = 1 * defaultWidth * dx2 / len2;
			double uy2Top = 1 * defaultWidth * dy2 / len2;

			Coordinate firTopCoor2 = new Coordinate(lineSecCoor.x - uy2Top, lineSecCoor.y + ux2Top);
			Coordinate secTopCoor2 = new Coordinate(lineThrCoor.x - uy2Top, lineThrCoor.y + ux2Top);

			Coordinate[] topCoors2 = new Coordinate[2];
			topCoors2[0] = firTopCoor2;
			topCoors2[1] = secTopCoor2;
			Geometry topLine2 = gf.createLineString(topCoors2);

			double ux2Bottom = -1 * defaultWidth * dx2 / len2;
			double uy2Bottom = -1 * defaultWidth * dy2 / len2;

			Coordinate firBottomCoor2 = new Coordinate(lineSecCoor.x - uy2Bottom, lineSecCoor.y + ux2Bottom);
			Coordinate secBottomCoor2 = new Coordinate(lineThrCoor.x - uy2Bottom, lineThrCoor.y + ux2Bottom);

			Coordinate[] bottomCoors2 = new Coordinate[2];
			bottomCoors2[0] = firBottomCoor2;
			bottomCoors2[1] = secBottomCoor2;
			Geometry bottomLine2 = gf.createLineString(bottomCoors2);

			double angle2 = Angle.angle(lineThrCoor, secBottomCoor2);
			GeometricShapeFactory f2 = new GeometricShapeFactory();
			f2.setCentre(lineThrCoor);
			f2.setSize(defaultWidth * 2);
			f2.setNumPoints(50);
			f2.setRotation(0);
			Geometry arcSec = f2.createArc(angle2, Math.toRadians(180));
			Coordinate[] lasArcCoors = arcSec.getCoordinates();
			if (CGAlgorithms.isCCW(lasArcCoors)) {
				arcSec = arcSec.reverse();
				lasArcCoors = arcSec.getCoordinates();
			}
			for (int ac = 0; ac < lasArcCoors.length; ac++) {
				vector2dList.add(new Vector2d(lasArcCoors[ac].x, lasArcCoors[ac].y));
				// 부채꼴 아랫면 vertex add
				allCoordinates.add(lasArcCoors[ac]);
				vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + 0 + "\n");
				vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, 0));
				// 부채꼴 윗면 vertex add
				allCoordinates.add(new Coordinate(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultHeight));
				vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + defaultHeight + "\n");
				vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultHeight));
			}
			// 부채꼴 face 생성
			// 첫점 부채꼴 밑면, 윗면
			int lineFirBottomIdx = vSize + allCoordinates.indexOf(lineFirCoor);
			for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
				int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
				int thrIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
				// 첫점 부채꼴 밑면 face
				faces.add(new Face3(lineFirBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				// 첫점 부채꼴 윗면 face
				faces.add(new Face3(lineFirBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
			}
			// 첫점 부채꼴 옆면
			for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
				int firIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
				int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
				int thrIdx = firIdx + 1;

				faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
			}
			// 마지막점 부채꼴 밑면, 윗면
			int lineLasBottomIdx = vSize + allCoordinates.indexOf(lineThrCoor);
			for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
				int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
				int thrIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
				// 마지막점 부채꼴 밑면 face
				faces.add(new Face3(lineLasBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				// 마지막점 부채꼴 윗면 face
				faces.add(new Face3(lineLasBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
			}
			// 마지막 부채꼴 옆면
			for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
				int firIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
				int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
				int thrIdx = firIdx + 1;
				faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
			}

			double angle = Angle.toDegrees(Angle.angleBetweenOriented(lineFirCoor, lineSecCoor, lineThrCoor));
			if (angle != 180) {
				// 윗선 교차
				Geometry topInterset = topLine1.intersection(topLine2);
				if (!topInterset.isEmpty()) {
					Coordinate intersectionCoor = topInterset.getCoordinate();
					// line 1 top
					vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
					allCoordinates.add(firTopCoor1);
					vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
					vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultHeight));
					vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultHeight));
					vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultHeight + "\n");

					vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
					allCoordinates.add(intersectionCoor);
					vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
					vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultHeight));
					vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultHeight));
					vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultHeight + "\n");

					// line 1 bottom
					vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
					allCoordinates.add(firBottomCoor1);
					vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
					vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
					vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
					vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultHeight + "\n");

					vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
					allCoordinates.add(secBottomCoor1);
					vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
					vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultHeight));
					vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultHeight));
					vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultHeight + "\n");

					// line 2 top
					vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
					allCoordinates.add(secTopCoor2);
					vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
					vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultHeight));
					vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultHeight));
					vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultHeight + "\n");

					// line 2 bottom
					vector2dList.add(new Vector2d(firBottomCoor2.x, firBottomCoor2.y));
					allCoordinates.add(firBottomCoor2);
					vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, 0));
					vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firBottomCoor2.x, firBottomCoor2.y, defaultHeight));
					vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, defaultHeight));
					vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + defaultHeight + "\n");

					vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
					allCoordinates.add(secBottomCoor2);
					vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
					vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
					vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
					vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultHeight + "\n");

					// 꺾인부분 부채꼴
					double angleCenter = Angle.angle(lineSecCoor, secBottomCoor1);
					double arcDegree = Angle.angleBetween(secBottomCoor1, lineSecCoor, firBottomCoor2);

					GeometricShapeFactory fCenter = new GeometricShapeFactory();
					fCenter.setCentre(lineSecCoor);
					fCenter.setSize(defaultWidth * 2);
					fCenter.setNumPoints(50);
					fCenter.setRotation(0);
					Geometry arcCenter = fCenter.createArc(angleCenter, arcDegree);
					Coordinate[] arcCenterCoors = arcCenter.getCoordinates();
					if (CGAlgorithms.isCCW(arcCenterCoors)) {
						arcCenter = arcCenter.reverse();
						arcCenterCoors = arcCenter.getCoordinates();
					}
					// 부채꼴의 모든 점 add
					for (int ac = 0; ac < arcCenterCoors.length; ac++) {
						vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
						allCoordinates.add(arcCenterCoors[ac]);
						vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
						vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
						// 윗면 vertex add
						allCoordinates.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
						vBuilder.append(
								"v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + defaultHeight + "\n");
						vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
					}
					// face
					int lineSecBottomIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int lineSecTopIdx = vSize + allCoordinates.indexOf(lineSecCoor) + 1;
					// 부채꼴 아랫면, 윗면
					for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
						int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
						int thrIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
						// bottom
						faces.add(new Face3(lineSecBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						// top
						faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					}
					// 부채꼴 옆면
					for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
						int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
						int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
						int thrIdx = firIdx + 1;
						// side
						faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					}

					// line 1 top line 밑면, 윗면
					int top1FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					int top1ThrIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 1 top line 옆면
					int topSide1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					int topSide1ThrIdx = topSide1FirIdx + 1;
					int topSide1FurIdx = topSide1SecIdx + 1;
					faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

					// line 1 bottom line 밑면, 윗면
					int bopttom1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
					int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int bottom1FurIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 1 bottom line 옆면
					int bottomSide1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
					int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
					int bottomSide1FurIdx = bottomSide1SecIdx + 1;
					faces.add(
							new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx, new Vector3d(0, 0, 0)));

					// line 2 top line 밑면, 윗면
					int top2FirIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int top2SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int top2ThrIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int top2FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FurIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 2 top line 옆면
					int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int topSide2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int topSide2ThrIdx = topSide2FirIdx + 1;
					int topSide2FurIdx = topSide2SecIdx + 1;
					faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FurIdx, new Vector3d(0, 0, 0)));

					// line 2 bottom line 밑면, 윗면
					int bottom2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
					int bottom2SecIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
					int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int bottom2FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FurIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 2 bottom line 옆면
					int bottomSide2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
					int bottomSide2SecIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
					int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
					int bottomSide2FurIdx = bottomSide2SecIdx + 1;
					faces.add(
							new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FurIdx, new Vector3d(0, 0, 0)));
				}
				// 아랫선 교차
				Geometry bottomIntersect = bottomLine1.intersection(bottomLine2);
				if (!bottomIntersect.isEmpty()) {
					Coordinate intersectionCoor = bottomIntersect.getCoordinate();

					double angleCenter = Angle.angle(lineSecCoor, firTopCoor2);
					double arcDegree = Angle.angleBetween(secTopCoor1, lineSecCoor, firTopCoor2);

					GeometricShapeFactory fCenter = new GeometricShapeFactory();
					fCenter.setCentre(lineSecCoor);
					fCenter.setSize(defaultWidth * 2);
					fCenter.setNumPoints(50);
					fCenter.setRotation(0);
					Geometry arcCenter = fCenter.createArc(angleCenter, arcDegree);

					Coordinate[] arcCenterCoors = arcCenter.getCoordinates();
					if (CGAlgorithms.isCCW(arcCenterCoors)) {
						arcCenter = arcCenter.reverse();
						arcCenterCoors = arcCenter.getCoordinates();
					}
					// 부채꼴의 모든 점 add
					for (int ac = 0; ac < arcCenterCoors.length; ac++) {
						vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
						allCoordinates.add(arcCenterCoors[ac]);
						vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
						vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
						// 윗면 vertex add
						allCoordinates.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
						vBuilder.append(
								"v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + defaultHeight + "\n");
						vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultHeight));
					}
					// face
					int lineSecBottomIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int lineSecTopIdx = vSize + allCoordinates.indexOf(lineSecCoor) + 1;
					// 부채꼴 아랫면, 윗면
					for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
						int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
						int thrIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
						// bottom
						faces.add(new Face3(lineSecBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						// top
						faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					}
					// 부채꼴 옆면
					for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
						int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
						int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
						int thrIdx = firIdx + 1;
						// side
						faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
						faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					}

					// line 1 top
					vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
					allCoordinates.add(firTopCoor1);
					vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
					vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultHeight));
					vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultHeight));
					vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultHeight + "\n");

					vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
					allCoordinates.add(secTopCoor1);
					vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
					vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultHeight));
					vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultHeight));
					vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultHeight + "\n");

					// line 1 bottom
					vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
					allCoordinates.add(firBottomCoor1);
					vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
					vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
					vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultHeight));
					vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultHeight + "\n");

					vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
					allCoordinates.add(intersectionCoor);
					vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
					vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultHeight));
					vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultHeight));
					vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultHeight + "\n");

					// line 2 top
					vector2dList.add(new Vector2d(firTopCoor2.x, firTopCoor2.y));
					allCoordinates.add(firTopCoor2);
					vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, 0));
					vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firTopCoor2.x, firTopCoor2.y, defaultHeight));
					vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, defaultHeight));
					vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + defaultHeight + "\n");

					vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
					allCoordinates.add(secTopCoor2);
					vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
					vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultHeight));
					vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultHeight));
					vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultHeight + "\n");

					// line 2 bottom
					vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
					allCoordinates.add(secBottomCoor2);
					vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
					vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
					vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultHeight));
					vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultHeight + "\n");

					// line 1 top line 밑면, 윗면
					int top1FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					int top1ThrIdx = vSize + allCoordinates.indexOf(secTopCoor1);
					int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 1 top line 옆면
					int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
					int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					int topSide1ThrIdx = topSide1FirIdx + 1;
					int topSide1FurIdx = topSide1SecIdx + 1;
					faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

					// line 1 bottom line 밑면, 윗면
					int bopttom1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int bottom1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 1 bottom line 옆면
					int bottomSide1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
					int bottomSide1FurIdx = bottomSide1SecIdx + 1;
					faces.add(
							new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx, new Vector3d(0, 0, 0)));

					// line 2 top line 밑면, 윗면
					int top2FirIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int top2SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int top2ThrIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int top2FurIdx = vSize + allCoordinates.indexOf(firTopCoor2);
					faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FurIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 2 top line 옆면
					int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int topSide2SecIdx = vSize + allCoordinates.indexOf(firTopCoor2);
					int topSide2ThrIdx = topSide2FirIdx + 1;
					int topSide2FurIdx = topSide2SecIdx + 1;
					faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FurIdx, new Vector3d(0, 0, 0)));

					// line 2 bottom line 밑면, 윗면
					int bottom2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
					int bottom2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int bottom2FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FurIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FurIdx + 1, new Vector3d(0, 0, 0)));

					// line 2 bottom line 옆면
					int bottomSide2FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
					int bottomSide2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
					int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
					int bottomSide2FurIdx = bottomSide2SecIdx + 1;
					faces.add(
							new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx, new Vector3d(0, 0, 0)));
					faces.add(
							new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FurIdx, new Vector3d(0, 0, 0)));
				}
			} else { // 세 점이 평행

				// line 1 top line 밑면, 윗면
				int top1FirIdx = vSize + allCoordinates.indexOf(lineThrCoor);
				int top1SecIdx = vSize + allCoordinates.indexOf(lineFirCoor);
				int top1ThrIdx = vSize + allCoordinates.indexOf(secTopCoor1);
				int top1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);
				faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FurIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
				faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FurIdx + 1, new Vector3d(0, 0, 0)));

				// line 1 top line 옆면
				int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
				int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1);
				int topSide1ThrIdx = topSide1FirIdx + 1;
				int topSide1FurIdx = topSide1SecIdx + 1;
				faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FurIdx, new Vector3d(0, 0, 0)));

				// line 1 bottom line 밑면, 윗면
				int bopttom1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
				int bottom1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
				int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineThrCoor);
				int bottom1FurIdx = vSize + allCoordinates.indexOf(lineFirCoor);
				faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FurIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
				faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FurIdx + 1, new Vector3d(0, 0, 0)));

				// line 1 bottom line 옆면
				int bottomSide1FirIdx = vSize + allCoordinates.indexOf(secBottomCoor2);
				int bottomSide1SecIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
				int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
				int bottomSide1FurIdx = bottomSide1SecIdx + 1;
				faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FurIdx, new Vector3d(0, 0, 0)));

			}
		}
		vSize += allCoordinates.size();

		writer.write(vBuilder.toString());

		com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom = new com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry();
		threeGeom.faces = faces;
		threeGeom.vertices = vector3dList;

		writeThreeGeometry(threeGeom, featureID);
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
			StringBuilder vnBuilder = new StringBuilder();
			StringBuilder fBuilder = new StringBuilder();
			int t = 1;
			for (Face3 face : threeGeom.faces) {
				// vn
//				Vector3d normal = face.normal;
//				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
//				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
//				vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");

				int a = face.a + 1;
				int b = face.b + 1;
				int c = face.c + 1;

				fBuilder.append("f " + a + " " + b + " " + c + "\n");

//				fBuilder.append("f " + a + "/" + vnIdx + "/" + vtIdx + " ");
//				vtIdx++;
//				vnIdx++;
//				fBuilder.append(b + "/" + vnIdx + "/" + vtIdx + " ");
//				vtIdx++;
//				vnIdx++;
//				fBuilder.append(c + "/" + vnIdx + "/" + vtIdx + "\n");
//				vtIdx++;
//				vnIdx++;

				t++;
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

//	try {
//		SimpleFeatureType sfType = DataUtilities.createType("test", "the_geom:MultiLineString");
//		SimpleFeature sf1 = SimpleFeatureBuilder.build(sfType, new Object[] { arcFir }, String.valueOf(g));
//		g++;
//		SimpleFeature sf2 = SimpleFeatureBuilder.build(sfType, new Object[] { arcSec }, String.valueOf(g));
//		g++;
//		dfc.add(sf1);
//		dfc.add(sf2);
//	} catch (SchemaException e) {
//		// TODO Auto-generated catch block
//		e.printStackTrace();
//	}

}
