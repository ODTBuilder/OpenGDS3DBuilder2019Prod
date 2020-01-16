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

		// tmp
		int g = 1;

		List<String> idList = new ArrayList<>();

		Geometry geom = (Geometry) feature.getDefaultGeometry();
		Coordinate[] lineCoors = geom.getCoordinates();
		Coordinate firCoor = lineCoors[0];
		Coordinate lasCoor = lineCoors[lineCoors.length - 1];
		// 시계방향으로 reverse
		if (firCoor.x > lasCoor.x) {
			geom = geom.reverse();
			lineCoors = geom.getCoordinates();
		}

		// line의 두 점씩 뽑아 사각형으로 생성
		for (int c = 0; c < lineCoors.length - 1; c++) {

			Coordinate lineFirCoor = lineCoors[c];
			Coordinate lineLasCoor = lineCoors[c + 1];

			// center line
			Coordinate[] tmpCoors = new Coordinate[2];
			tmpCoors[0] = lineFirCoor;
			tmpCoors[1] = lineLasCoor;
			Geometry centerLine = gf.createLineString(tmpCoors);

			// 각 점으로부터 기울기,거리만큼 떨어진 점 생성
			Coordinate tmpPt1 = new Coordinate(lineLasCoor.x, lineFirCoor.y);
			Coordinate tmpPt2 = new Coordinate(lineFirCoor.x, lineLasCoor.y);
			// 첫점의 기울기
			double angleFir = Angle.toDegrees(Angle.angleBetween(tmpPt1, lineFirCoor, lineLasCoor));
			// 마지막점의 기울기
			double angleLas = Angle.toDegrees(Angle.angleBetween(tmpPt2, lineLasCoor, lineFirCoor));

			// lineFirCoor
			double radinFirTop = Math.toRadians(90 - angleFir);
			double radinLasTop = Math.toRadians(90 - angleLas);
			Coordinate firTopCoor = new Coordinate(lineFirCoor.x + defaultWidth * Math.cos(radinFirTop),
					lineFirCoor.y + defaultWidth * Math.sin(radinFirTop));
			Coordinate lasTopCoor = new Coordinate(lineLasCoor.x + defaultWidth * Math.cos(radinLasTop),
					lineLasCoor.y + defaultWidth * Math.sin(radinLasTop));

			Coordinate[] topCoors = new Coordinate[2];
			topCoors[0] = firTopCoor;
			topCoors[1] = lasTopCoor;
			Geometry topLine = gf.createLineString(topCoors);

			// lineLasCoor
			double radinFirBottom = Math.toRadians(90 - angleFir);
			double radinLasBottom = Math.toRadians(90 - angleLas);
			Coordinate firBottomCoor = new Coordinate(lineFirCoor.x - defaultWidth * Math.cos(radinFirBottom),
					lineFirCoor.y - defaultWidth * Math.sin(radinFirBottom));
			Coordinate lasBottomCoor = new Coordinate(lineLasCoor.x - defaultWidth * Math.cos(radinLasBottom),
					lineLasCoor.y - defaultWidth * Math.sin(radinLasBottom));
			Coordinate[] bottomCoors = new Coordinate[2];
			bottomCoors[0] = firBottomCoor;
			bottomCoors[1] = lasBottomCoor;
			Geometry bottomLine = gf.createLineString(bottomCoors);

			// 부채꼴 생성
			// lineFirCoor
			GeometricShapeFactory f1 = new GeometricShapeFactory();
			f1.setCentre(lineFirCoor);
			f1.setSize(defaultWidth * 2);
			f1.setNumPoints(50);
			f1.setRotation(0);
			Geometry arcFir = f1.createArc(Math.toRadians(90 - angleFir), Math.toRadians(180));
			// lineLasCoor
			GeometricShapeFactory f2 = new GeometricShapeFactory();
			f2.setCentre(lineLasCoor);
			f2.setSize(defaultWidth * 2);
			f2.setNumPoints(50);
			f2.setRotation(0);
			Geometry arcLas = f2.createArc(Math.toRadians(270 - angleLas), Math.toRadians(180));

			// 부채꼴 face 생성
			// lineFirCoor - arcFir
			Coordinate[] firArcCoors = arcFir.getCoordinates();
			if (CGAlgorithms.isCCW(firArcCoors)) {
				arcFir = arcFir.reverse();
				firArcCoors = arcFir.getCoordinates();
			}
			for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
//				firArcCoors[ac];
//				firArcCoors[ac+1];
			}

			// lineLasCoor - arcLas
			Coordinate[] lasArcCoors = arcLas.getCoordinates();
			if (CGAlgorithms.isCCW(lasArcCoors)) {
				arcLas = arcLas.reverse();
				lasArcCoors = arcLas.getCoordinates();
			}

			// Geometry square = BufferOp.bufferOp(centerLine, 0.00001,
			// bufferParam).getBoundary();
			try {
				SimpleFeatureType sfType = DataUtilities.createType("test", "the_geom:MultiLineString");
				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { centerLine }, String.valueOf(g)));
				g++;
				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { topLine }, String.valueOf(g)));
				g++;
				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { bottomLine }, String.valueOf(g)));
				g++;
				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { arcFir }, String.valueOf(g)));
				g++;
				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { arcLas }, String.valueOf(g)));
				g++;
			} catch (SchemaException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			// 첫점, 끝점 -> 부채꼴 형태로 생성

//			GeometricShapeFactory f1 = new GeometricShapeFactory();
//			f1.setCentre(coor1);
//			f1.setSize(0.00001 * 2);
//			f1.setNumPoints(50);
//			f1.setRotation(0);
//
//			Coordinate test1 = new Coordinate(coor2.x, coor1.y);
//			double angle1 = Angle.toDegrees(Angle.angleBetween(test1, coor1, coor2));
//			Geometry arc1 = f1.createArc(Math.toRadians(90 - angle1), Math.toRadians(180));
//
//			GeometricShapeFactory f2 = new GeometricShapeFactory();
//			f2.setCentre(coor2);
//			f2.setSize(0.00001 * 2);
//			f2.setNumPoints(50);
//			f2.setRotation(0);
//
//			Coordinate test2 = new Coordinate(coor1.x, coor2.y);
//			double angle2 = Angle.toDegrees(Angle.angleBetween(test2, coor2, coor1));
//			Geometry arc2 = f2.createArc(Math.toRadians(270 - angle2), Math.toRadians(180));

//			Geometry lasCoorGeom = new GeometryFactory().createPoint(lasCoor);
//			try {
//				SimpleFeatureType sfType = DataUtilities.createType("test", "the_geom:MultiLineString");
//				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { arc1 }, String.valueOf(g)));
//				g++;
//				dfc.add(SimpleFeatureBuilder.build(sfType, new Object[] { arc2 }, String.valueOf(g)));
//				g++;
//			} catch (SchemaException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}

		}
		try {
			SHPFileWriter.writeSHP("EPSG:4326", dfc, "D:\\test\\test.shp");
		} catch (SchemaException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
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
}
