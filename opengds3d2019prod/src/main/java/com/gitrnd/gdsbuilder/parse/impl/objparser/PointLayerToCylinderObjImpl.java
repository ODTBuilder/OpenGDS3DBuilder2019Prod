package com.gitrnd.gdsbuilder.parse.impl.objparser;

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

import com.gitrnd.gdsbuilder.file.FileManager;
import com.gitrnd.gdsbuilder.parse.impl.objparser.ShpToObjImpl.EnShpToObjDepthType;
import com.gitrnd.gdsbuilder.parse.impl.objparser.ShpToObjImpl.EnShpToObjRadiusType;
import com.gitrnd.gdsbuilder.parse.impl.quad.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.algorithm.CGAlgorithms;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.util.GeometricShapeFactory;

/**
 * Poine 타입의 2D FeatureCollection 객체를 3D Cylinder Obj 객체로 변환하여 Obj 파일을 생성하는 클래스
 * 
 * @author DY.Oh
 *
 */
public class PointLayerToCylinderObjImpl {

	/**
	 * 입력 높이 값
	 */
	private String depthValue;
	/**
	 * 입력 반지름 값
	 */
	private String radiusValue;
	/**
	 * 높이 고정값
	 */
	private double defaultDepth = 5; // 높이
	/**
	 * 높이 반지름값
	 */
	private double defaultRadius = 5; // 높이
	/**
	 * 높이 속성 값
	 */
	private String depthAttribute;
	/**
	 * 반지름 속성 값
	 */
	private String radiusAttribute;
	/**
	 * 변환 후 3D vertex 리스트
	 */
	private static List<Vector3d> vector3dList;
	/**
	 * 변환 전 2D vertex 리스트
	 */
	private static List<Vector2d> vector2dList;
	/**
	 * Obj 파일내 v 개수
	 */
	private int vSize;
	/**
	 * Obj 파일내 vt 개수
	 */
	private int vtIdx;
	/**
	 * Obj 파일내 vn 개수
	 */
	private int vnIdx;
	/**
	 * Obj 파일 중점 x 좌표
	 */
	private static double centerX;
	/**
	 * Obj 파일 중점 y 좌표
	 */
	private static double centerY;
	/**
	 * 높이 입력값 타입
	 */
	private EnShpToObjDepthType dType;
	/**
	 * 반지름 입력값 타입
	 */
	private EnShpToObjRadiusType rType;
	/**
	 * Point 타입의 2D FeatureCollection
	 */
	private FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection;
	/**
	 * mtl 파일명
	 */
	private String mtl;
	/**
	 * usemtl 명
	 */
	private String usemtl;
	/**
	 * texture 명
	 */
	private String texture;
	/**
	 * 생성된 Obj 파일 개수
	 */
	private int objfilenum = 0;
	/**
	 * Obj 파일 상위 경로
	 */
	private String outputPath;
	/**
	 * BufferedWriter
	 */
	private static BufferedWriter writer;

	/**
	 * PointLayerToCylinderObjImpl 생성자
	 * 
	 * @param buildingCollection Point 타입의 2D FeatureCollection
	 * @param texture            texture 명
	 * @param rType              반지름 입력 타입
	 * @param radiusValue        반지름 입력 값
	 * @param dType              높이 입력값 타입
	 * @param depthValue         높이 입력 값
	 * @param outputPath         Obj 파일 상위 경로
	 */
	public PointLayerToCylinderObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection,
			String texture, EnShpToObjRadiusType rType, String radiusValue, EnShpToObjDepthType dType,
			String depthValue, String outputPath) {
		this.buildingCollection = buildingCollection;
		this.texture = texture;
		this.rType = rType;
		this.radiusValue = radiusValue; // 반지름
		this.dType = dType;
		this.depthValue = depthValue; // 높이
		this.outputPath = outputPath;
	}

	public int getObjfilenum() {
		return objfilenum;
	}

	public void setObjfilenum(int objfilenum) {
		this.objfilenum = objfilenum;
	}

	public double getDefaultDepth() {
		return defaultDepth;
	}

	public void setDefaultDepth(double defaultDepth) {
		this.defaultDepth = defaultDepth;
	}

	public double getDefaultRadius() {
		return defaultRadius;
	}

	public void setDefaultRadius(double defaultRadius) {
		this.defaultRadius = defaultRadius;
	}

	public String getDepthAttribute() {
		return depthAttribute;
	}

	public void setDepthAttribute(String depthAttribute) {
		this.depthAttribute = depthAttribute;
	}

	public String getRadiusAttribute() {
		return radiusAttribute;
	}

	public void setRadiusAttribute(String radiusAttribute) {
		this.radiusAttribute = radiusAttribute;
	}

	public String getDepthValue() {
		return depthValue;
	}

	public void setDepthValue(String depthValue) {
		this.depthValue = depthValue;
	}

	public String getRadiusValue() {
		return radiusValue;
	}

	public void setRadiusValue(String radiusValue) {
		this.radiusValue = radiusValue;
	}

	public EnShpToObjDepthType getdType() {
		return dType;
	}

	public void setdType(EnShpToObjDepthType dType) {
		this.dType = dType;
	}

	public EnShpToObjRadiusType getrType() {
		return rType;
	}

	public void setrType(EnShpToObjRadiusType rType) {
		this.rType = rType;
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

	/**
	 * Point 타입의 2D FeatureCollection 객체를 3D Cylinder Obj 객체로 변환
	 * 
	 * @throws UnsupportedEncodingException
	 * @throws FileNotFoundException
	 * @throws IOException
	 * @throws FactoryException
	 * @throws TransformException
	 * 
	 * @author DY.Oh
	 */
	@SuppressWarnings("unchecked")
	public void parseToObjFile() throws UnsupportedEncodingException, FileNotFoundException, IOException,
			FactoryException, TransformException {

		ShpToObjImpl.createFileDirectory(this.outputPath);
		Map<String, Object> sfcMap = new HashMap<>();

		// 높이값 설정
		double maxHeight = 0.0;
		if (this.dType == EnShpToObjDepthType.DEFAULT) {
			defaultDepth = Double.parseDouble(depthValue);
			maxHeight = defaultDepth;
		}
		if (this.rType == EnShpToObjRadiusType.DEFAULT) {
			defaultRadius = Double.parseDouble(radiusValue);
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
						FileManager.fileCopy(mtlIs, mtlOs);
						InputStream imageIs = this.getClass()
								.getResourceAsStream("/img/texture/" + texture + "/" + image);
						OutputStream imageOs = new FileOutputStream(enPath + File.separator + image);
						FileManager.fileCopy(imageIs, imageOs);
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
										// radius
										if (this.rType == EnShpToObjRadiusType.FIX) {
											radiusAttribute = radiusValue;
											defaultRadius = (double) feature.getAttribute(radiusAttribute);
										}
										// depth
										if (this.dType == EnShpToObjDepthType.FIX) {
											depthAttribute = depthValue;
											defaultDepth = (double) feature.getAttribute(depthAttribute);
										}
										// set tile height
										if (maxHeight < defaultDepth) {
											maxHeight = defaultDepth;
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
												// radius
												if (this.rType == EnShpToObjRadiusType.FIX) {
													radiusAttribute = radiusValue;
													defaultRadius = (double) feature.getAttribute(radiusAttribute);
												}
												// depth
												if (this.dType == EnShpToObjDepthType.FIX) {
													depthAttribute = depthValue;
													defaultDepth = (double) feature.getAttribute(depthAttribute);
												}
												// set tile height
												if (maxHeight < defaultDepth) {
													maxHeight = defaultDepth;
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
				FileManager.fileCopy(mtlIs, mtlOs);
				InputStream imageIs = this.getClass().getResourceAsStream("/img/texture/" + texture + "/" + image);
				OutputStream imageOs = new FileOutputStream(outputPath + File.separator + image);
				FileManager.fileCopy(imageIs, imageOs);
				this.usemtl = texture;
			}

			// set center
			Envelope reEnv = buildingCollection.getBounds();
			Coordinate center = reEnv.centre();
			centerX = center.x;
			centerY = center.y;
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
					// radius
					if (this.rType == EnShpToObjRadiusType.FIX) {
						radiusAttribute = radiusValue;
						defaultRadius = (double) feature.getAttribute(radiusAttribute);
					}
					// depth
					if (this.dType == EnShpToObjDepthType.FIX) {
						depthAttribute = depthValue;
						defaultDepth = (double) feature.getAttribute(depthAttribute);
					}
					// set tile height
					if (maxHeight < defaultDepth) {
						maxHeight = defaultDepth;
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
			double maxX = reEnv.getMaxX(); // east
			double maxY = reEnv.getMaxY(); // north
			double minX = reEnv.getMinX(); // west
			double minY = reEnv.getMinY(); // south

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

			List<Coordinate> allCoordinates = new ArrayList<>();
			StringBuilder vBuilder = new StringBuilder();
			List<Face3> faces = new ArrayList<>();

			// face idx
			int bottomend = 0;
			int topend = 0;
			int sideend = 0;

			Coordinate[] coordinates = geom.getCoordinates();
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
				coordinates[i] = new Coordinate(xDistance, yDistance, 0);
				allCoordinates.add(new Coordinate(coordinates[i]));
				vector3dList.add(new Vector3d(coordinates[i].x, coordinates[i].y, 0));
				vBuilder.append("v " + coordinates[i].x + " " + coordinates[i].y + " " + 0 + "\n");

				allCoordinates.add(new Coordinate(coordinates[i].x, coordinates[i].y, defaultDepth));
				vector3dList.add(new Vector3d(coordinates[i].x, coordinates[i].y, defaultDepth));
				vBuilder.append("v " + coordinates[i].x + " " + coordinates[i].y + " " + defaultDepth + "\n");
			}

			Envelope circleEv = null;

			for (int i = 0; i < coordinates.length; i++) {

				Coordinate coor = coordinates[i];

				GeometricShapeFactory f = new GeometricShapeFactory();
				f.setCentre(coor);
				f.setSize(defaultRadius * 2);
				f.setNumPoints(8);
				f.setRotation(0);
				Geometry circle = f.createArc(Math.toRadians(0), Math.toRadians(360));
				Coordinate[] circleCoors = circle.getCoordinates();
				if (!CGAlgorithms.isCCW(circleCoors)) {
					circle = circle.reverse();
					circleCoors = circle.getCoordinates();
				}
				LineString circleLine = (LineString) circle;
				circleEv = circleLine.getEnvelopeInternal();

				// circle vertex add
				for (int c = 0; c < circleCoors.length; c++) {
					vector2dList.add(new Vector2d(circleCoors[c].x, circleCoors[c].y));
					// 밑면
					allCoordinates.add(circleCoors[c]);
					vBuilder.append("v " + circleCoors[c].x + " " + circleCoors[c].y + " " + 0 + "\n");
					vector3dList.add(new Vector3d(circleCoors[c].x, circleCoors[c].y, 0));
					// 윗면
					allCoordinates.add(new Coordinate(circleCoors[c].x, circleCoors[c].y, defaultDepth));
					vBuilder.append("v " + circleCoors[c].x + " " + circleCoors[c].y + " " + defaultDepth + "\n");
					vector3dList.add(new Vector3d(circleCoors[c].x, circleCoors[c].y, defaultDepth));
				}
				// circle face 생성
				// circle 밑면
				int centerIdx = vSize + allCoordinates.indexOf(coor); // 중점
				for (int c = 0; c < circleCoors.length - 1; c++) {
					int secIdx = vSize + allCoordinates.indexOf(circleCoors[c]);
					int thrIdx = vSize + allCoordinates.indexOf(circleCoors[c + 1]);
					faces.add(new Face3(centerIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(thrIdx, secIdx, centerIdx, new Vector3d(0, 0, 0)));
				}
				bottomend = faces.size();
				// circle 윗면
				for (int c = 0; c < circleCoors.length - 1; c++) {
					int secIdx = vSize + allCoordinates.indexOf(circleCoors[c]);
					int thrIdx = vSize + allCoordinates.indexOf(circleCoors[c + 1]);
					faces.add(new Face3(centerIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(thrIdx + 1, secIdx + 1, centerIdx + 1, new Vector3d(0, 0, 0)));
				}
				topend = faces.size();
				// circle 옆면 face
				for (int c = 0; c < circleCoors.length - 1; c++) {
					int firIdx = vSize + allCoordinates.indexOf(circleCoors[c]);
					int secIdx = vSize + allCoordinates.indexOf(circleCoors[c + 1]);
					int thrIdx = firIdx + 1;
					faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
					faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
				}
				sideend = faces.size();
				writer.write(vBuilder.toString());

				com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom = new com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry();
				threeGeom.setFaces(faces);
				threeGeom.setVertices(vector3dList);

				// vt
				List<List<Vector2d>> faceVertexUvs = new ArrayList<>();
				// 바닥
				for (int fIdx = 0; fIdx < bottomend; fIdx++) {
					List<Vector2d> innerFvt = new ArrayList<>();
					innerFvt.add(new Vector2d(0, 0));
					innerFvt.add(new Vector2d(0, 0));
					innerFvt.add(new Vector2d(0, 0));
					faceVertexUvs.add(innerFvt);
				}
				// 윗면
				if (circleEv != null) {
					Vector2d offset2dCircle = new Vector2d(0 - circleEv.getMinX(), 0 - circleEv.getMinY());
					Vector2d range2dCircle = new Vector2d(((circleEv.getMinX() - circleEv.getMaxX()) * -1),
							((circleEv.getMinY() - circleEv.getMaxY()) * -1));

					for (int fIdx = bottomend; fIdx < topend; fIdx++) {
						Face3 face = threeGeom.faces.get(fIdx);
						List<Vector2d> innerFvt = new ArrayList<>();
						Vector3d v1 = threeGeom.vertices.get(face.a);
						Vector3d v2 = threeGeom.vertices.get(face.b);
						Vector3d v3 = threeGeom.vertices.get(face.c);

						Vector2d vt1 = new Vector2d((v1.x() + offset2dCircle.x()) / range2dCircle.x(),
								(v1.y() + offset2dCircle.y()) / range2dCircle.y());
						Vector2d vt2 = new Vector2d((v2.x() + offset2dCircle.x()) / range2dCircle.x(),
								(v2.y() + offset2dCircle.y()) / range2dCircle.y());
						Vector2d vt3 = new Vector2d((v3.x() + offset2dCircle.x()) / range2dCircle.x(),
								(v3.y() + offset2dCircle.y()) / range2dCircle.y());
						innerFvt.add(vt1);
						innerFvt.add(vt2);
						innerFvt.add(vt3);
						faceVertexUvs.add(innerFvt);
					}
				}
				// 옆면
				for (int fIdx = topend; fIdx < sideend; fIdx = fIdx + 4) {
					List<Vector2d> innerFvt1 = new ArrayList<>();
					innerFvt1.add(new Vector2d(0, 0));
					innerFvt1.add(new Vector2d(1, 0));
					innerFvt1.add(new Vector2d(0, 1));

					List<Vector2d> innerFvt1b = new ArrayList<>();
					innerFvt1b.add(new Vector2d(0, 0));
					innerFvt1b.add(new Vector2d(0, 0));
					innerFvt1b.add(new Vector2d(0, 0));

					List<Vector2d> innerFvt2 = new ArrayList<>();
					innerFvt2.add(new Vector2d(0, 1));
					innerFvt2.add(new Vector2d(1, 0));
					innerFvt2.add(new Vector2d(1, 1));

					List<Vector2d> innerFvt2b = new ArrayList<>();
					innerFvt2b.add(new Vector2d(0, 0));
					innerFvt2b.add(new Vector2d(0, 0));
					innerFvt2b.add(new Vector2d(0, 0));

					faceVertexUvs.add(innerFvt1);
					faceVertexUvs.add(innerFvt1b);
					faceVertexUvs.add(innerFvt2);
					faceVertexUvs.add(innerFvt2b);
				}
				threeGeom.faceVertexUvs.add(faceVertexUvs);
				threeGeom.computeFlatVertexNormals();
				threeGeom.computeFaceNormals();
				writeThreeGeometry(threeGeom);
				vSize += allCoordinates.size();
			}
		}
		return idList;
	}

	public void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom)
			throws IOException {

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

					int a = face.a + 1;
					int b = face.b + 1;
					int c = face.c + 1;

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
}
