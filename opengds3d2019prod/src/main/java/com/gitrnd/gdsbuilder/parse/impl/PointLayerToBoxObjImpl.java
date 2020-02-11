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

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjDepthType;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjWidthType;
import com.gitrnd.gdsbuilder.parse.impl.test.qaud.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.geometries.BoxGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;

public class PointLayerToBoxObjImpl {

	private double defaultDepth = 5; // 높이
	private double defaultWidth = 5; // 가로
	private double defaultHeight = 5; // 세로

	private String depthAttribute;
	private String widthAttribute;
	private String heightAttribute;

	private String depthValue;
	private String heightValue;
	private String widthValue;

	private static List<Vector3d> vector3dList;
	private static List<Vector2d> vector2dList;

	private String outputPath;

	private int vSize;
	private int vtIdx;
	private int vnIdx;
	private int objfilenum = 0;

	private static double centerX;
	private static double centerY;

	private double maxX; // east
	private double maxY; // north
	private double minX; // west
	private double minY; // south

	private EnShpToObjHeightType hType;
	private EnShpToObjDepthType dType;
	private EnShpToObjWidthType wType;

	private FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection;
	private String mtl;
	private String usemtl;
	private String texture;

	private static BufferedWriter writer;

	public PointLayerToBoxObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection,
			String texture, EnShpToObjHeightType hType, String heightValue, EnShpToObjWidthType wType,
			String widthValue, EnShpToObjDepthType dType, String depthValue, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.texture = texture;
		this.hType = hType;
		this.heightValue = heightValue;
		this.wType = wType;
		this.widthValue = widthValue;
		this.dType = dType;
		this.depthValue = depthValue;
		this.outputPath = outputPath;
	}

	public int getObjfilenum() {
		return objfilenum;
	}

	public void setObjfilenum(int objfilenum) {
		this.objfilenum = objfilenum;
	}

	public EnShpToObjHeightType gethType() {
		return hType;
	}

	public void sethType(EnShpToObjHeightType hType) {
		this.hType = hType;
	}

	public EnShpToObjDepthType getdType() {
		return dType;
	}

	public void setdType(EnShpToObjDepthType dType) {
		this.dType = dType;
	}

	public EnShpToObjWidthType getwType() {
		return wType;
	}

	public void setwType(EnShpToObjWidthType wType) {
		this.wType = wType;
	}

	public double getDefaultDepth() {
		return defaultDepth;
	}

	public void setDefaultDepth(double defaultDepth) {
		this.defaultDepth = defaultDepth;
	}

	public double getDefaultWidth() {
		return defaultWidth;
	}

	public void setDefaultWidth(double defaultWidth) {
		this.defaultWidth = defaultWidth;
	}

	public double getDefaultHeight() {
		return defaultHeight;
	}

	public void setDefaultHeight(double defaultHeight) {
		this.defaultHeight = defaultHeight;
	}

	public String getDepthAttribute() {
		return depthAttribute;
	}

	public void setDepthAttribute(String depthAttribute) {
		this.depthAttribute = depthAttribute;
	}

	public String getWidthAttribute() {
		return widthAttribute;
	}

	public void setWidthAttribute(String widthAttribute) {
		this.widthAttribute = widthAttribute;
	}

	public String getHeightAttribute() {
		return heightAttribute;
	}

	public void setHeightAttribute(String heightAttribute) {
		this.heightAttribute = heightAttribute;
	}

	public String getDepthValue() {
		return depthValue;
	}

	public void setDepthValue(String depthValue) {
		this.depthValue = depthValue;
	}

	public String getHeightValue() {
		return heightValue;
	}

	public void setHeightValue(String heightValue) {
		this.heightValue = heightValue;
	}

	public String getWidthValue() {
		return widthValue;
	}

	public void setWidthValue(String widthValue) {
		this.widthValue = widthValue;
	}

	public String getOutputPath() {
		return outputPath;
	}

	public void setOutputPath(String outputPath) {
		this.outputPath = outputPath;
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
		double maxDepth = 0.0;
		if (this.dType == EnShpToObjDepthType.DEFAULT) {
			defaultDepth = Double.valueOf(depthValue);
			maxDepth = defaultDepth;
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
										// height
										if (this.hType == EnShpToObjHeightType.FIX) {
											heightAttribute = heightValue;
											defaultHeight = (double) feature.getAttribute(heightAttribute);
										}
										// widht
										if (this.wType == EnShpToObjWidthType.FIX) {
											widthAttribute = widthValue;
											defaultWidth = (double) feature.getAttribute(widthAttribute);
										}
										// depth
										if (this.dType == EnShpToObjDepthType.FIX) {
											depthAttribute = depthValue;
											defaultDepth = (double) feature.getAttribute(depthAttribute);
										}
										// set tile height
										if (maxDepth < defaultDepth) {
											maxDepth = defaultDepth;
										}
										List<String> idlist = buildingFeatureToObjGroup(feature);
										for (String id : idlist) {
											// featureId
											batchIdArr.add(id);
											// properties
											Iterator batchIter = batchTable.keySet().iterator();
											while (batchIter.hasNext()) {
												String batchKey = (String) batchIter.next();
												JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
												if (feature.getAttribute(batchKey) == null) {
													double value = 0.0;
													propertiesArr.add(value);
												} else {
													propertiesArr.add(feature.getAttribute(batchKey));
												}
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
								tileOption.put("maxHeight", maxDepth);
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
												// height
												if (this.hType == EnShpToObjHeightType.FIX) {
													heightAttribute = heightValue;
													defaultHeight = (double) feature.getAttribute(heightAttribute);
												}
												// widht
												if (this.wType == EnShpToObjWidthType.FIX) {
													widthAttribute = widthValue;
													defaultWidth = (double) feature.getAttribute(widthAttribute);
												}
												// depth
												if (this.dType == EnShpToObjDepthType.FIX) {
													depthAttribute = depthValue;
													defaultDepth = (double) feature.getAttribute(depthAttribute);
												}
												// set tile height
												if (maxDepth < defaultDepth) {
													maxDepth = defaultDepth;
												}
												List<String> idlist = buildingFeatureToObjGroup(feature);
												for (String id : idlist) {
													// featureId
													batchIdArr.add(id);
													// properties
													Iterator batchIter = batchTable.keySet().iterator();
													while (batchIter.hasNext()) {
														String batchKey = (String) batchIter.next();
														JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
														if (feature.getAttribute(batchKey) == null) {
															double value = 0.0;
															propertiesArr.add(value);
														} else {
															propertiesArr.add(feature.getAttribute(batchKey));
														}
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
										tileOption.put("maxHeight", maxDepth);
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
					// height
					if (this.hType == EnShpToObjHeightType.FIX) {
						heightAttribute = heightValue;
						defaultHeight = (double) feature.getAttribute(heightAttribute);
					}
					// widht
					if (this.wType == EnShpToObjWidthType.FIX) {
						widthAttribute = widthValue;
						defaultWidth = (double) feature.getAttribute(widthAttribute);
					}
					// depth
					if (this.dType == EnShpToObjDepthType.FIX) {
						depthAttribute = depthValue;
						defaultDepth = (double) feature.getAttribute(depthAttribute);
					}
					// set tile height
					if (maxDepth < defaultDepth) {
						maxDepth = defaultDepth;
					}
					List<String> idlist = buildingFeatureToObjGroup(feature);
					for (String id : idlist) {
						// featureId
						batchIdArr.add(id);
						// properties
						Iterator batchIter = batchTable.keySet().iterator();
						while (batchIter.hasNext()) {
							String batchKey = (String) batchIter.next();
							JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
							if (feature.getAttribute(batchKey) == null) {
								double value = 0.0;
								propertiesArr.add(value);
							} else {
								propertiesArr.add(feature.getAttribute(batchKey));
							}
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
			tileOption.put("maxHeight", maxDepth);
			tileOption.put("properties", tilesPropeties);

			try (FileWriter file = new FileWriter(outputPath + File.separator + 1 + "tile.json")) {
				file.write(tileOption.toJSONString());
			}
		}
	}

	private List<String> buildingFeatureToObjGroup(SimpleFeature feature)
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
			if (!geom.getGeometryType().contains("Point")) {
				return null;
			}

			Coordinate[] coordinates = geom.getCoordinates();

			BoxGeometry geometry = new BoxGeometry(defaultWidth, defaultHeight, defaultDepth);
			geometry.computeBoundingBox();
			List<Vector3d> vertices = geometry.getVertices();

			int v = 0;
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
				for (Vector3d vertice : vertices) {
					double distX = vertice.x() + xDistance;
					double distY = vertice.y() + yDistance;
					double distZ = vertice.z();

					if (distZ < 0) {
						distZ = 0;
					} else {
						distZ = defaultDepth;
					}
					Vector3d distVertice = new Vector3d(distX, distY, distZ);
					vertices.set(v, distVertice);
					v++;
				}
			}
			geometry.setVertices(vertices);
			writeThreeGeometry(geometry);

			vSize += v;
		}
		return idList;
	}

	public void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom)
			throws IOException {

		// v
		if (threeGeom.getVertices() != null) {
			if (threeGeom.getVertices().size() > 0) {
				StringBuilder vBuilder = new StringBuilder();
				List<Vector3d> vertices = threeGeom.getVertices();
				for (Vector3d vertice : vertices) {
					vBuilder.append("v " + vertice.x() + " " + vertice.y() + " " + vertice.z() + "\n");
				}
				writer.write(vBuilder.toString());
			}
		}
		// vt
		boolean isVt = false;
		if (threeGeom.faceVertexUvs != null) {
			if (threeGeom.faceVertexUvs.size() > 0) {
				StringBuilder vtBuilder = new StringBuilder();
				List<List<Vector2d>> faceVertexUvs = threeGeom.faceVertexUvs.get(0);
				for (List<Vector2d> faceVertexUv : faceVertexUvs) {
					if (faceVertexUv == null) {
						vtBuilder.append("vt " + "0" + " " + "0" + "\n");
					} else {
						for (Vector2d vt : faceVertexUv) {
							vtBuilder.append("vt " + vt.x() + " " + vt.y() + "\n");
						}
					}
				}
				writer.write(vtBuilder.toString());
				isVt = true;
			}
		}
		// f
		if (threeGeom.faces != null) {
			if (threeGeom.faces.size() > 0) {
				StringBuilder vnBuilder = new StringBuilder();
				StringBuilder fBuilder = new StringBuilder();
				for (Face3 face : threeGeom.faces) {
					// vn
					Vector3d normal = face.normal;
					vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
					vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");
					vnBuilder.append("vn " + normal.x() + " " + normal.y() + " " + normal.z() + "\n");

					int a = face.a + 1 + vSize;
					int b = face.b + 1 + vSize;
					int c = face.c + 1 + vSize;

					if (isVt) {
						fBuilder.append("f " + a + "/" + vnIdx + "/" + vtIdx + " ");
						vtIdx++;
						vnIdx++;
						fBuilder.append(b + "/" + vnIdx + "/" + vtIdx + " ");
						vtIdx++;
						vnIdx++;
						fBuilder.append(c + "/" + vnIdx + "/" + vtIdx + "\n");
						vtIdx++;
						vnIdx++;
					} else {
						fBuilder.append("f " + a + "/" + vnIdx + " ");
						vnIdx++;
						fBuilder.append(b + "/" + vnIdx + " ");
						vnIdx++;
						fBuilder.append(c + "/" + vnIdx + "\n");
						vnIdx++;
					}
				}
				writer.write(vnBuilder.toString());
				writer.write(fBuilder.toString());
			}
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
