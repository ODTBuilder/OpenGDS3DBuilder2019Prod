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
import com.gitrnd.gdsbuilder.parse.impl.objparser.ShpToObjImpl.EnShpToObjWidthType;
import com.gitrnd.gdsbuilder.parse.impl.quad.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.algorithm.Angle;
import com.vividsolutions.jts.algorithm.CGAlgorithms;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.util.GeometricShapeFactory;

/**
 * LineString 타입의 2D FeatureCollection 객체를 3D Obj 객체로 변환하여 Obj 파일을 생성하는 클래스
 * 
 * @author DY.Oh
 *
 */
public class LineLayerToObjImpl {

	/**
	 * LineString 타입의 2D FeatureCollection
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
	 * Obj 파일 상위 경로
	 */
	private String outputPath;
	/**
	 * 높이 입력값 타입
	 */
	private EnShpToObjDepthType dType;
	/**
	 * 너비 입력값 타입
	 */
	private EnShpToObjWidthType wType;
	/**
	 * 높이 고정값
	 */
	private double defaultDepth = 5;
	/**
	 * 너비 고정값
	 */
	private double defaultWidth = 5;
	/**
	 * 높이 속성 값
	 */
	private String depthAttribute;
	/**
	 * 너비 속성 값
	 */
	private String widthAttribute;
	/**
	 * 입력 높이 값
	 */
	private String depthValue;
	/**
	 * 너비 높이 값
	 */
	private String widthValue;
	/**
	 * BufferedWriter
	 */
	private static BufferedWriter writer;
	/**
	 * Obj 파일 중점 x 좌표
	 */
	private static double centerX;
	/**
	 * Obj 파일 중점 y 좌표
	 */
	private static double centerY;
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
	 * 생성된 Obj 파일 개수
	 */
	private int objfilenum = 0;

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

	public String getDepthValue() {
		return depthValue;
	}

	public void setDepthValue(String depthValue) {
		this.depthValue = depthValue;
	}

	public String getWidthValue() {
		return widthValue;
	}

	public void setWidthValue(String widthValue) {
		this.widthValue = widthValue;
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

	/**
	 * LineLayerToObjImpl 생성자
	 * 
	 * @param buildingCollection LineString 타입의 2D FeatureCollection
	 * @param texture            texture 명
	 * @param dType              높이 입력값 타입
	 * @param wType              너비 입력값 타입
	 * @param depthValue         높이 입력값
	 * @param widthValue         너비 입력값
	 * @param outputPath         Obj 파일 상위 경로
	 */
	public LineLayerToObjImpl(FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection, String texture,
			EnShpToObjDepthType dType, EnShpToObjWidthType wType, String depthValue, String widthValue,
			String outputPath) {
		this.buildingCollection = buildingCollection;
		this.texture = texture;
		this.depthValue = depthValue;
		this.widthValue = widthValue;
		this.outputPath = outputPath;
	}

	/**
	 * LineString 타입의 2D FeatureCollection 객체를 3D Obj 객체로 변환
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
			defaultDepth = Double.valueOf(depthValue);
			maxHeight = defaultDepth;
		}
		if (this.wType == EnShpToObjWidthType.DEFAULT) {
			defaultWidth = Double.valueOf(widthValue);
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
						OutputStream mtlOs = new FileOutputStream(outputPath + File.separator + mtl);
						FileManager.fileCopy(mtlIs, mtlOs);
						InputStream imageIs = this.getClass()
								.getResourceAsStream("/img/texture/" + texture + "/" + image);
						OutputStream imageOs = new FileOutputStream(outputPath + File.separator + image);
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
										// widht
										if (this.wType == EnShpToObjWidthType.FIX) {
											widthAttribute = widthValue;
											defaultWidth = (double) feature.getAttribute(widthAttribute);
										}
										// height
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
												// widht
												if (this.wType == EnShpToObjWidthType.FIX) {
													widthAttribute = widthValue;
													defaultWidth = (double) feature.getAttribute(widthAttribute);
												}
												// height
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
			ReferencedEnvelope reEnv = buildingCollection.getBounds();
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
					// widht
					if (this.wType == EnShpToObjWidthType.FIX) {
						widthAttribute = widthValue;
						defaultWidth = (double) feature.getAttribute(widthAttribute);
					}
					// height
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

		GeometryFactory gf = new GeometryFactory();

		List<String> idList = new ArrayList<>();
		Geometry lineString = (Geometry) feature.getDefaultGeometry();

		int numGeom = lineString.getNumGeometries();
		for (int g = 0; g < numGeom; g++) {
			String featureID = "g " + feature.getID();
			if (numGeom > 1) {
				featureID += "_" + (g + 1) + "\n";
			} else {
				featureID += "\n";
			}
			idList.add(feature.getID());
			String gId = featureID;

			writer.write(gId);
			if (usemtl != null) {
				writer.write("usemtl " + usemtl + "\n");
			}

			Geometry geom = lineString.getGeometryN(g);
			if (!geom.getGeometryType().contains("LineString")) {
				return null;
			}

			Coordinate[] lineCoors = geom.getCoordinates();
			if (lineCoors[0].x > lineCoors[1].x && lineCoors[0].y > lineCoors[1].y) {
				geom = geom.reverse();
				lineCoors = geom.getCoordinates();
			}

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

				allCoordinates.add(new Coordinate(lineCoors[c].x, lineCoors[c].y, defaultDepth));
				vector3dList.add(new Vector3d(lineCoors[c].x, lineCoors[c].y, defaultDepth));
				vBuilder.append("v " + lineCoors[c].x + " " + lineCoors[c].y + " " + defaultDepth + "\n");
			}
			// arc face idx
			List<Integer> arcBottomFaceIdxs = new ArrayList<>(); // 첫점, 마지막점, 중간 부채꼴 밑면 face idx
			List<Integer> arcFirTopFaceIdxs = new ArrayList<>(); // 첫점, 마지막점, 중간 부채꼴 윗면 face idx
			List<Integer> arcLasTopFaceIdxs = new ArrayList<>(); // 첫점, 마지막점, 중간 부채꼴 윗면 face idx
			List<Integer> arcCentTopFaceIdxs = new ArrayList<>(); // 첫점, 마지막점, 중간 부채꼴 윗면 face idx
			List<Integer> arcSideFaceIdxs = new ArrayList<>(); // 첫점, 마지막점, 중간 부채꼴 옆면 face idx

			// rectangle face idx
			List<Integer> recBottomFaceIdxs = new ArrayList<>(); // 사각형 밑면 face idx
			List<Integer> recTopFaceIdxs = new ArrayList<>(); // 사각형 윗면 face idx
			List<Integer> recSideFaceIdxs = new ArrayList<>(); // 사각형 옆면 face idx

			Envelope firArc2dEv = null;
			Envelope lasArc2dEv = null;
			Envelope centerArc2dEv = null;

			double maxX = 0;
			double maxY = defaultWidth * 2;

			if (lineCoors.length > 3) {

				for (int c = 0; c < lineCoors.length - 2; c++) {
					Coordinate lineFirCoor = lineCoors[c];
					Coordinate lineSecCoor = lineCoors[c + 1];
					Coordinate lineThrCoor = lineCoors[c + 2];

					if (maxX < lineFirCoor.distance(lineSecCoor)) {
						maxX = lineFirCoor.distance(lineSecCoor);
					}
					if (maxX < lineSecCoor.distance(lineThrCoor)) {
						maxX = lineSecCoor.distance(lineThrCoor);
					}

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
						if (!CGAlgorithms.isCCW(firArcCoors)) {
							arcFir = arcFir.reverse();
							firArcCoors = arcFir.getCoordinates();
						}
						firArc2dEv = arcFir.getEnvelopeInternal();

						// 부채꼴 아랫면 vertex add
						for (int ac = 0; ac < firArcCoors.length; ac++) {
							vector2dList.add(new Vector2d(firArcCoors[ac].x, firArcCoors[ac].y));

							allCoordinates.add(firArcCoors[ac]);
							vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + 0 + "\n");
							vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, 0));

							allCoordinates.add(new Coordinate(firArcCoors[ac].x, firArcCoors[ac].y, defaultDepth));
							vBuilder.append(
									"v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + defaultDepth + "\n");
							vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, defaultDepth));
						}
						// 부채꼴 face 생성
						// 첫점 부채꼴 밑면, 윗면
						int lineFirBottomIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
							int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
							int thrIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
							// 첫점 부채꼴 밑면 face
							faces.add(new Face3(lineFirBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, lineFirBottomIdx, new Vector3d(0, 0, 0)));
							arcBottomFaceIdxs.add(faces.size() - 1);

							// 첫점 부채꼴 윗면 face
							faces.add(new Face3(lineFirBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
							arcFirTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx + 1, secIdx + 1, lineFirBottomIdx + 1, new Vector3d(0, 0, 0)));
							arcFirTopFaceIdxs.add(faces.size() - 1);
						}
						// 첫점 부채꼴 옆면
						for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
							int firIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
							int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
							int thrIdx = firIdx + 1;
							faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
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
						Geometry arcLas = f2.createArc(angle2, Math.toRadians(180));
						Coordinate[] lasArcCoors = arcLas.getCoordinates();
						if (!CGAlgorithms.isCCW(lasArcCoors)) {
							arcLas = arcLas.reverse();
							lasArcCoors = arcLas.getCoordinates();
						}
						lasArc2dEv = arcLas.getEnvelopeInternal();

						for (int ac = 0; ac < lasArcCoors.length; ac++) {
							vector2dList.add(new Vector2d(lasArcCoors[ac].x, lasArcCoors[ac].y));
							// 부채꼴 아랫면 vertex add
							allCoordinates.add(lasArcCoors[ac]);
							vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + 0 + "\n");
							vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, 0));
							// 부채꼴 윗면 vertex add
							allCoordinates.add(new Coordinate(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultDepth));
							vBuilder.append(
									"v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + defaultDepth + "\n");
							vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultDepth));
						}
						// 마지막점 부채꼴 밑면, 윗면
						int lineLasBottomIdx = vSize + allCoordinates.indexOf(lineThrCoor);
						for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
							int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
							int thrIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
							// 마지막점 부채꼴 밑면 face
							faces.add(new Face3(lineLasBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, lineLasBottomIdx, new Vector3d(0, 0, 0)));
							arcBottomFaceIdxs.add(faces.size() - 1);

							// 마지막점 부채꼴 윗면 face
							faces.add(new Face3(lineLasBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
							arcLasTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx + 1, secIdx + 1, lineLasBottomIdx + 1, new Vector3d(0, 0, 0)));
							arcLasTopFaceIdxs.add(faces.size() - 1);
						}
						// 마지막 부채꼴 옆면
						for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
							int firIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
							int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
							int thrIdx = firIdx + 1;

							faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
						}
					}

					double angle = Math.round(Math
							.abs(Angle.toDegrees(Angle.angleBetweenOriented(lineFirCoor, lineSecCoor, lineThrCoor))));
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
							allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
							vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
							vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

							vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
							allCoordinates.add(intersectionCoor);
							vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
							vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultDepth));
							vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultDepth));
							vBuilder.append(
									"v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultDepth + "\n");

							// line 1 bottom
							vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
							allCoordinates.add(firBottomCoor1);
							vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
							vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
							vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
							vBuilder.append(
									"v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

							vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
							allCoordinates.add(secBottomCoor1);
							vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
							vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
							vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
							vBuilder.append(
									"v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultDepth + "\n");

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
							if (!CGAlgorithms.isCCW(arcCenterCoors)) {
								arcCenter = arcCenter.reverse();
								arcCenterCoors = arcCenter.getCoordinates();
							}
							centerArc2dEv = arcCenter.getEnvelopeInternal();

							// 부채꼴의 모든 점 add
							for (int ac = 0; ac < arcCenterCoors.length; ac++) {
								vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
								allCoordinates.add(arcCenterCoors[ac]);
								vBuilder.append(
										"v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
								vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
								// 윗면 vertex add
								allCoordinates
										.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
								vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " "
										+ defaultDepth + "\n");
								vector3dList
										.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
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
								arcBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx, secIdx, lineSecBottomIdx, new Vector3d(0, 0, 0)));
								arcBottomFaceIdxs.add(faces.size() - 1);

								// top
								faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
								arcCentTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx + 1, secIdx + 1, lineSecTopIdx, new Vector3d(0, 0, 0)));
								arcCentTopFaceIdxs.add(faces.size() - 1);
							}
							// 부채꼴 옆면
							for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
								int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
								int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
								int thrIdx = firIdx + 1;
								// side
								faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(secIdx, secIdx, thrIdx + 1, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
							}

							// line 1 top line 밑면, 윗면
							int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
							int top1SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
							int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
							int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);

							// 밑면
							faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							// 윗면
							faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							// line 1 top line 옆면
							int topSide1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
							int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
							int topSide1ThrIdx = topSide1FirIdx + 1;
							int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

							faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							// line 1 bottom line 밑면, 윗면
							int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
							int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
							int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

							// 밑면
							faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							// 윗면
							faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							// line 1 bottom line 옆면
							int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
							int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor1) + 1;
							int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
							int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

							// 옆면
							faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							if (c + 2 == lineCoors.length - 1) {
								// line 2 top
								vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
								allCoordinates.add(secTopCoor2);
								vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
								vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
								vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

								// line 2 bottom
								vector2dList.add(new Vector2d(firBottomCoor2.x, firBottomCoor2.y));
								allCoordinates.add(firBottomCoor2);
								vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, 0));
								vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
								vBuilder.append(
										"v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + defaultDepth + "\n");

								vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
								allCoordinates.add(secBottomCoor2);
								vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
								vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
								vBuilder.append(
										"v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

								// line 2 top line 밑면, 윗면
								int top2FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
								int top2SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
								int top2ThrIdx = vSize + allCoordinates.indexOf(intersectionCoor);
								int top2FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

								// 밑면
								faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(top2FirIdx, top2FurIdx, top2SecIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2SecIdx, top2FurIdx, top2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								// 윗면
								faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(top2FirIdx + 1, top2FurIdx + 1, top2SecIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2SecIdx + 1, top2FurIdx + 1, top2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								// line 2 top line 옆면
								int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
								int topSide2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor) + 1;
								int topSide2ThrIdx = topSide2FirIdx + 1;
								int topSide2FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);

								faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(topSide2FirIdx, topSide2FurIdx, topSide2SecIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(topSide2SecIdx, topSide2FurIdx, topSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								// line 2 bottom line 밑면, 윗면
								int bottom2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
								int bottom2SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
								int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
								int bottom2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

								// 밑면
								faces.add(
										new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(
										new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								faces.add(
										new Face3(bottom2FirIdx, bottom2FurIdx, bottom2SecIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(
										new Face3(bottom2SecIdx, bottom2FurIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								// 윗면
								faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(bottom2FirIdx + 1, bottom2FurIdx + 1, bottom2SecIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottom2SecIdx + 1, bottom2FurIdx + 1, bottom2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								// line 2 bottom line 옆면
								int bottomSide2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
								int bottomSide2SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
								int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
								int bottomSide2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

								faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(bottomSide2FirIdx, bottomSide2FurIdx, bottomSide2SecIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottomSide2SecIdx, bottomSide2FurIdx, bottomSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

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
							if (!CGAlgorithms.isCCW(arcCenterCoors)) {
								arcCenter = arcCenter.reverse();
								arcCenterCoors = arcCenter.getCoordinates();
							}
							centerArc2dEv = arcCenter.getEnvelopeInternal();

							// 부채꼴의 모든 점 add
							for (int ac = 0; ac < arcCenterCoors.length; ac++) {
								vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
								allCoordinates.add(arcCenterCoors[ac]);
								vBuilder.append(
										"v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
								vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
								// 윗면 vertex add
								allCoordinates
										.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
								vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " "
										+ defaultDepth + "\n");
								vector3dList
										.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
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
								arcBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx, secIdx, lineSecBottomIdx, new Vector3d(0, 0, 0)));
								arcBottomFaceIdxs.add(faces.size() - 1);
								// top
								faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
								arcCentTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx + 1, secIdx + 1, lineSecTopIdx, new Vector3d(0, 0, 0)));
								arcCentTopFaceIdxs.add(faces.size() - 1);
							}
							// 부채꼴 옆면
							for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
								int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
								int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
								int thrIdx = firIdx + 1;
								// side
								faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
								arcSideFaceIdxs.add(faces.size() - 1);
							}

							// line 1 top
							vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
							allCoordinates.add(firTopCoor1);
							vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
							vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
							vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
							vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

							vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
							allCoordinates.add(secTopCoor1);
							vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
							vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultDepth));
							vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultDepth));
							vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultDepth + "\n");

							// line 1 bottom
							vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
							allCoordinates.add(firBottomCoor1);
							vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
							vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
							vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
							vBuilder.append(
									"v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

							vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
							allCoordinates.add(intersectionCoor);
							vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
							vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultDepth));
							vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultDepth));
							vBuilder.append(
									"v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultDepth + "\n");

							// line 1 top line 밑면, 윗면
							int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
							int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor1);
							int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
							int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);

							// 밑면
							faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							// 윗면
							faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							// line 1 top line 옆면
							int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
							int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
							int topSide1ThrIdx = topSide1FirIdx + 1;
							int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

							// 옆면
							faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							// line 1 bottom line 밑면, 윗면
							int bottom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
							int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
							int bottom1FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);

							// 밑면
							faces.add(new Face3(bottom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bottom1FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							// 윗면
							faces.add(new Face3(bottom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FirIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bottom1FirIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							// line 1 bottom line 옆면
							int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
							int bottomSide1SecIdx = vSize + allCoordinates.indexOf(intersectionCoor) + 1;
							int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
							int bottomSide1FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);

							// 옆면
							faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							if (c + 2 == lineCoors.length - 1) {
								// line 2 top
								vector2dList.add(new Vector2d(firTopCoor2.x, firTopCoor2.y));
								allCoordinates.add(firTopCoor2);
								vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, 0));
								vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(firTopCoor2.x, firTopCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, defaultDepth));
								vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + defaultDepth + "\n");

								vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
								allCoordinates.add(secTopCoor2);
								vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
								vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
								vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

								// line 2 bottom
								vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
								allCoordinates.add(secBottomCoor2);
								vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
								vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
								vBuilder.append(
										"v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

								// line 2 top line 밑면, 윗면
								int top2FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
								int top2SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
								int top2ThrIdx = vSize + allCoordinates.indexOf(firTopCoor2);
								int top2FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

								// 밑면
								faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(top2FirIdx, top2FurIdx, top2SecIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2SecIdx, top2FurIdx, top2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								// 윗면
								faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(top2FirIdx + 1, top2FurIdx + 1, top2SecIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top2SecIdx + 1, top2FurIdx + 1, top2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								// line 2 top line 옆면
								int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
								int topSide2SecIdx = vSize + allCoordinates.indexOf(firTopCoor2) + 1;
								int topSide2ThrIdx = topSide2FirIdx + 1;
								int topSide2FurIdx = vSize + allCoordinates.indexOf(firTopCoor2);
								// 옆면
								faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(topSide2FirIdx, topSide2FurIdx, topSide2SecIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(topSide2SecIdx, topSide2FurIdx, topSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								// line 2 bottom line 밑면, 윗면
								int bottom2FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
								int bottom2SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
								int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
								int bottom2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

								// 밑면
								faces.add(
										new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(
										new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								faces.add(
										new Face3(bottom2FirIdx, bottom2FurIdx, bottom2SecIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(
										new Face3(bottom2SecIdx, bottom2FurIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								// 윗면
								faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(bottom2FirIdx + 1, bottom2FurIdx + 1, bottom2SecIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottom2SecIdx + 1, bottom2FurIdx + 1, bottom2FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								// line 2 bottom line 옆면
								int bottomSide2FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
								int bottomSide2SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
								int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
								int bottomSide2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

								faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(bottomSide2FirIdx, bottomSide2FurIdx, bottomSide2SecIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottomSide2SecIdx, bottomSide2FurIdx, bottomSide2FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

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

						if (topInterset.isEmpty() && bottomIntersect.isEmpty()) {

							if (c + 2 == lineCoors.length - 1) {

								// line 1 top
								vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
								allCoordinates.add(firTopCoor1);
								vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
								vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
								vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
								vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

								// line 2 top
								vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
								allCoordinates.add(secTopCoor2);
								vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
								vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
								vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

								// line 1 bottom
								vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
								allCoordinates.add(firBottomCoor1);
								vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
								vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
								vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
								vBuilder.append(
										"v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

								// line 2 bottom
								vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
								allCoordinates.add(secBottomCoor2);
								vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
								vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
								allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
								vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
								vBuilder.append(
										"v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

								// line 1 top line 밑면, 윗면
								int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
								int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
								int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
								int top1FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

								// 밑면
								faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								// 윗면
								faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								// line 1 top line 옆면
								int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
								int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
								int topSide1ThrIdx = topSide1FirIdx + 1;
								int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

								// 옆면
								faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								// line 1 bottom line 밑면, 윗면
								int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
								int bottom1SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
								int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
								int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

								// 밑면
								faces.add(
										new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(
										new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								faces.add(
										new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);
								faces.add(
										new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
								recBottomFaceIdxs.add(faces.size() - 1);

								// 윗면
								faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1,
										new Vector3d(0, 0, 0)));
								recTopFaceIdxs.add(faces.size() - 1);

								// line 1 bottom line 옆면
								int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
								int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
								int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
								int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

								// 옆면
								faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);
								faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
										new Vector3d(0, 0, 0)));
								recSideFaceIdxs.add(faces.size() - 1);

								this.firTopCoor = null;
								this.secTopCoor = null;
								this.firBottomCoor = null;
								this.secBottomCoor = null;
								this.isNext = false;
							} else {
								// 다음 for 문 연산을 위해 저장
								this.firTopCoor = firTopCoor2;
								this.secTopCoor = secTopCoor2;
								this.firBottomCoor = firBottomCoor2;
								this.secBottomCoor = secBottomCoor2;
								this.isNext = true;
							}
						}

					} else {// 세 점이 평행

						// line 1 top
						vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
						allCoordinates.add(firTopCoor1);
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
						allCoordinates.add(secTopCoor1);
						vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
						vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultDepth));
						vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultDepth + "\n");

						// line 1 bottom
						vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
						allCoordinates.add(firBottomCoor1);
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
						allCoordinates.add(secBottomCoor1);
						vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
						vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
						vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultDepth + "\n");

						// line 1 top line 밑면, 윗면
						int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor1);
						int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);

						// 밑면
						faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 top line 옆면
						int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
						int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
						int topSide1ThrIdx = topSide1FirIdx + 1;
						int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

						// 옆면
						faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 밑면, 윗면
						int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

						// 밑면
						faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 옆면
						int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor1) + 1;
						int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
						int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

						// 옆면
						faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						if (c + 2 == lineCoors.length - 1) {

							// line 2 top
							vector2dList.add(new Vector2d(firTopCoor2.x, firTopCoor2.y));
							allCoordinates.add(firTopCoor2);
							vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, 0));
							vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firTopCoor2.x, firTopCoor2.y, defaultDepth));
							vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, defaultDepth));
							vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + defaultDepth + "\n");

							vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
							allCoordinates.add(secTopCoor2);
							vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
							vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
							vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
							vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

							// line 2 bottom
							vector2dList.add(new Vector2d(firBottomCoor2.x, firBottomCoor2.y));
							allCoordinates.add(firBottomCoor2);
							vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, 0));
							vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
							vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
							vBuilder.append(
									"v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + defaultDepth + "\n");

							vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
							allCoordinates.add(secBottomCoor2);
							vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
							vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
							allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
							vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
							vBuilder.append(
									"v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

							// line 2 top line 밑면, 윗면
							int top2FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							int top2SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
							int top2ThrIdx = vSize + allCoordinates.indexOf(firTopCoor2);
							int top2FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

							// 밑면
							faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(top2FirIdx, top2FurIdx, top2SecIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top2SecIdx, top2FurIdx, top2FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							// 윗면
							faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(top2FirIdx + 1, top2FurIdx + 1, top2SecIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(top2SecIdx + 1, top2FurIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							// line 2 top line 옆면
							int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
							int topSide2SecIdx = vSize + allCoordinates.indexOf(firTopCoor2) + 1;
							int topSide2ThrIdx = topSide2FirIdx + 1;
							int topSide2FurIdx = vSize + allCoordinates.indexOf(firTopCoor2);
							// 옆면
							faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(topSide2FirIdx, topSide2FurIdx, topSide2SecIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(topSide2SecIdx, topSide2FurIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							// line 2 bottom line 밑면, 윗면
							int bottom2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
							int bottom2SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
							int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
							int bottom2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

							// 밑면
							faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottom2FirIdx, bottom2FurIdx, bottom2SecIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom2SecIdx, bottom2FurIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
							recBottomFaceIdxs.add(faces.size() - 1);

							// 윗면
							faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FirIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottom2FirIdx + 1, bottom2FurIdx + 1, bottom2SecIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottom2SecIdx + 1, bottom2FurIdx + 1, bottom2FirIdx + 1,
									new Vector3d(0, 0, 0)));
							recTopFaceIdxs.add(faces.size() - 1);

							// line 2 bottom line 옆면
							int bottomSide2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
							int bottomSide2SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
							int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
							int bottomSide2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

							faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FirIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(bottomSide2FirIdx, bottomSide2FurIdx, bottomSide2SecIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(bottomSide2SecIdx, bottomSide2FurIdx, bottomSide2FirIdx,
									new Vector3d(0, 0, 0)));
							recSideFaceIdxs.add(faces.size() - 1);

							// 다음 for 문 연산을 위해 저장
							this.firTopCoor = null;
							this.secTopCoor = null;
							this.firBottomCoor = null;
							this.secBottomCoor = null;
							this.isNext = false;

						} else {
							// 다음 for 문 연산을 위해 저장
							this.firTopCoor = firTopCoor2;
							this.secTopCoor = secTopCoor2;
							this.firBottomCoor = firBottomCoor2;
							this.secBottomCoor = secBottomCoor2;
							this.isNext = true;
						}
					}
				}
			}
			if (lineCoors.length == 2) {

				Coordinate lineFirCoor = lineCoors[0];
				Coordinate lineSecCoor = lineCoors[1];

				if (maxX < lineFirCoor.distance(lineSecCoor)) {
					maxX = lineFirCoor.distance(lineSecCoor);
				}

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
				allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
				vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
				vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

				vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
				allCoordinates.add(secTopCoor1);
				vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
				vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
				allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultDepth));
				vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultDepth));
				vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultDepth + "\n");

				double ux1Bottom = -1 * defaultWidth * dx1 / len1;
				double uy1Bottom = -1 * defaultWidth * dy1 / len1;

				Coordinate firBottomCoor1 = new Coordinate(lineFirCoor.x - uy1Bottom, lineFirCoor.y + ux1Bottom);
				Coordinate secBottomCoor1 = new Coordinate(lineSecCoor.x - uy1Bottom, lineSecCoor.y + ux1Bottom);

				// line 1 bottom
				vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
				allCoordinates.add(firBottomCoor1);
				vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
				vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
				allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
				vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
				vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

				vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
				allCoordinates.add(secBottomCoor1);
				vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
				vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
				allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
				vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
				vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultDepth + "\n");

				double angle1 = Angle.angle(lineFirCoor, firTopCoor1);
				GeometricShapeFactory f1 = new GeometricShapeFactory();
				f1.setCentre(lineFirCoor);
				f1.setSize(defaultWidth * 2);
				f1.setNumPoints(50);
				f1.setRotation(0);
				Geometry arcFir = f1.createArc(angle1, Math.toRadians(180));
				Coordinate[] firArcCoors = arcFir.getCoordinates();
				if (!CGAlgorithms.isCCW(firArcCoors)) {
					arcFir = arcFir.reverse();
					firArcCoors = arcFir.getCoordinates();
				}
				firArc2dEv = arcFir.getEnvelopeInternal();

				for (int ac = 0; ac < firArcCoors.length; ac++) {
					// 부채꼴 아랫면 vertex add
					vector2dList.add(new Vector2d(firArcCoors[ac].x, firArcCoors[ac].y));
					allCoordinates.add(firArcCoors[ac]);
					vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + 0 + "\n");
					vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, 0));
					// 부채꼴 윗면 vertex add
					allCoordinates.add(new Coordinate(firArcCoors[ac].x, firArcCoors[ac].y, defaultDepth));
					vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + defaultDepth + "\n");
					vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, defaultDepth));
				}

				double angle2 = Angle.angle(lineSecCoor, secBottomCoor1);
				GeometricShapeFactory f2 = new GeometricShapeFactory();
				f2.setCentre(lineSecCoor);
				f2.setSize(defaultWidth * 2);
				f2.setNumPoints(50);
				f2.setRotation(0);
				Geometry arcLas = f2.createArc(angle2, Math.toRadians(180));
				Coordinate[] lasArcCoors = arcLas.getCoordinates();
				if (!CGAlgorithms.isCCW(lasArcCoors)) {
					arcLas = arcLas.reverse();
					lasArcCoors = arcLas.getCoordinates();
				}
				lasArc2dEv = arcLas.getEnvelopeInternal();

				for (int ac = 0; ac < lasArcCoors.length; ac++) {
					// 부채꼴 아랫면 vertex add
					vector2dList.add(new Vector2d(lasArcCoors[ac].x, lasArcCoors[ac].y));
					allCoordinates.add(lasArcCoors[ac]);
					vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + 0 + "\n");
					vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, 0));
					// 부채꼴 윗면 vertex add
					allCoordinates.add(new Coordinate(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultDepth));
					vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + defaultDepth + "\n");
					vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultDepth));
				}

				// 부채꼴 face 생성
				// 첫점 부채꼴 밑면, 윗면
				int lineFirBottomIdx = vSize + allCoordinates.indexOf(lineFirCoor);
				for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
					int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
					int thrIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
					// 첫점 부채꼴 밑면 face
					faces.add(new Face3(lineFirBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, lineFirBottomIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);

					// 첫점 부채꼴 윗면 face
					faces.add(new Face3(lineFirBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					arcFirTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx + 1, secIdx + 1, lineFirBottomIdx + 1, new Vector3d(0, 0, 0)));
					arcFirTopFaceIdxs.add(faces.size() - 1);
				}
				// 첫점 부채꼴 옆면
				for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
					int firIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
					int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
					int thrIdx = firIdx + 1;

					faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
				}
				// 마지막점 부채꼴 밑면, 윗면
				int lineLasBottomIdx = vSize + allCoordinates.indexOf(lineSecCoor);
				for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
					int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
					int thrIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
					// 마지막점 부채꼴 밑면 face
					faces.add(new Face3(lineLasBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, lineLasBottomIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);
					// 마지막점 부채꼴 윗면 face
					faces.add(new Face3(lineLasBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					arcLasTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx + 1, secIdx + 1, lineLasBottomIdx + 1, new Vector3d(0, 0, 0)));
					arcLasTopFaceIdxs.add(faces.size() - 1);
				}
				// 마지막 부채꼴 옆면
				for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
					int firIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
					int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
					int thrIdx = firIdx + 1;

					faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
				}

				// line 1 top line 밑면, 윗면
				int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
				int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor1);
				int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
				int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);
				// 밑면
				faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);

				faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);

				// 윗면
				faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);

				faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);

				// line 1 top line 옆면
				int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
				int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
				int topSide1ThrIdx = topSide1FirIdx + 1;
				int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

				// 옆면
				faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);

				faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);

				// line 1 bottom line 밑면, 윗면
				int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
				int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
				int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
				int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
				// 밑면
				faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);

				faces.add(new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
				recBottomFaceIdxs.add(faces.size() - 1);

				// 윗면
				faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);

				faces.add(new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1, new Vector3d(0, 0, 0)));
				recTopFaceIdxs.add(faces.size() - 1);

				// line 1 bottom line 옆면
				int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
				int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor1) + 1;
				int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
				int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);
				// 옆면
				faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);

				faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);
				faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx, new Vector3d(0, 0, 0)));
				recSideFaceIdxs.add(faces.size() - 1);

			} else if (lineCoors.length == 3) {

				Coordinate lineFirCoor = lineCoors[0];
				Coordinate lineSecCoor = lineCoors[1];
				Coordinate lineThrCoor = lineCoors[2];

				if (maxX < lineFirCoor.distance(lineSecCoor)) {
					maxX = lineFirCoor.distance(lineSecCoor);
				}
				if (maxX < lineSecCoor.distance(lineThrCoor)) {
					maxX = lineSecCoor.distance(lineThrCoor);
				}

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
				if (!CGAlgorithms.isCCW(firArcCoors)) {
					arcFir = arcFir.reverse();
					firArcCoors = arcFir.getCoordinates();
				}
				firArc2dEv = arcFir.getEnvelopeInternal();

				// 부채꼴 아랫면 vertex add
				for (int ac = 0; ac < firArcCoors.length; ac++) {
					vector2dList.add(new Vector2d(firArcCoors[ac].x, firArcCoors[ac].y));
					allCoordinates.add(firArcCoors[ac]);
					vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + 0 + "\n");
					vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, 0));
					allCoordinates.add(new Coordinate(firArcCoors[ac].x, firArcCoors[ac].y, defaultDepth));
					vBuilder.append("v " + firArcCoors[ac].x + " " + firArcCoors[ac].y + " " + defaultDepth + "\n");
					vector3dList.add(new Vector3d(firArcCoors[ac].x, firArcCoors[ac].y, defaultDepth));
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
				Geometry arcLas = f2.createArc(angle2, Math.toRadians(180));
				Coordinate[] lasArcCoors = arcLas.getCoordinates();
				if (!CGAlgorithms.isCCW(lasArcCoors)) {
					arcLas = arcLas.reverse();
					lasArcCoors = arcLas.getCoordinates();
				}
				lasArc2dEv = arcLas.getEnvelopeInternal();

				for (int ac = 0; ac < lasArcCoors.length; ac++) {
					vector2dList.add(new Vector2d(lasArcCoors[ac].x, lasArcCoors[ac].y));
					// 부채꼴 아랫면 vertex add
					allCoordinates.add(lasArcCoors[ac]);
					vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + 0 + "\n");
					vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, 0));
					// 부채꼴 윗면 vertex add
					allCoordinates.add(new Coordinate(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultDepth));
					vBuilder.append("v " + lasArcCoors[ac].x + " " + lasArcCoors[ac].y + " " + defaultDepth + "\n");
					vector3dList.add(new Vector3d(lasArcCoors[ac].x, lasArcCoors[ac].y, defaultDepth));
				}
				// 부채꼴 face 생성
				// 첫점 부채꼴 밑면, 윗면
				int lineFirBottomIdx = vSize + allCoordinates.indexOf(lineFirCoor);
				for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
					int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
					int thrIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
					// 첫점 부채꼴 밑면 face
					faces.add(new Face3(lineFirBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, lineFirBottomIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);

					// 첫점 부채꼴 윗면 face
					faces.add(new Face3(lineFirBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					arcFirTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx + 1, secIdx + 1, lineFirBottomIdx + 1, new Vector3d(0, 0, 0)));
					arcFirTopFaceIdxs.add(faces.size() - 1);

				}
				// 첫점 부채꼴 옆면
				for (int ac = 0; ac < firArcCoors.length - 1; ac++) {
					int firIdx = vSize + allCoordinates.indexOf(firArcCoors[ac]);
					int secIdx = vSize + allCoordinates.indexOf(firArcCoors[ac + 1]);
					int thrIdx = firIdx + 1;

					faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
				}
				// 마지막점 부채꼴 밑면, 윗면
				int lineLasBottomIdx = vSize + allCoordinates.indexOf(lineThrCoor);
				for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
					int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
					int thrIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
					// 마지막점 부채꼴 밑면 face
					faces.add(new Face3(lineLasBottomIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, lineLasBottomIdx, new Vector3d(0, 0, 0)));
					arcBottomFaceIdxs.add(faces.size() - 1);

					// 마지막점 부채꼴 윗면 face
					faces.add(new Face3(lineLasBottomIdx + 1, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
					arcLasTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx + 1, secIdx + 1, lineLasBottomIdx + 1, new Vector3d(0, 0, 0)));
					arcLasTopFaceIdxs.add(faces.size() - 1);
				}
				// 마지막 부채꼴 옆면
				for (int ac = 0; ac < lasArcCoors.length - 1; ac++) {
					int firIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac]);
					int secIdx = vSize + allCoordinates.indexOf(lasArcCoors[ac + 1]);
					int thrIdx = firIdx + 1;

					faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
					arcSideFaceIdxs.add(faces.size() - 1);
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
						allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
						allCoordinates.add(intersectionCoor);
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
						vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultDepth));
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultDepth));
						vBuilder.append(
								"v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultDepth + "\n");

						// line 1 bottom
						vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
						allCoordinates.add(firBottomCoor1);
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
						allCoordinates.add(secBottomCoor1);
						vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
						vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
						vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultDepth + "\n");

						// line 2 top
						// line 2 firTopCoor2는 intersection, line 1 secTopCoor1로 추가함
						vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
						allCoordinates.add(secTopCoor2);
						vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
						vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
						vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

						// line 2 bottom
						vector2dList.add(new Vector2d(firBottomCoor2.x, firBottomCoor2.y));
						allCoordinates.add(firBottomCoor2);
						vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, 0));
						vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
						vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
						allCoordinates.add(secBottomCoor2);
						vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
						vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
						vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

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
						if (!CGAlgorithms.isCCW(arcCenterCoors)) {
							arcCenter = arcCenter.reverse();
							arcCenterCoors = arcCenter.getCoordinates();
						}
						centerArc2dEv = arcCenter.getEnvelopeInternal();

						// 부채꼴의 모든 점 add
						for (int ac = 0; ac < arcCenterCoors.length; ac++) {
							vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
							allCoordinates.add(arcCenterCoors[ac]);
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
							// 윗면 vertex add
							allCoordinates
									.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " "
									+ defaultDepth + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
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
							arcBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, lineSecBottomIdx, new Vector3d(0, 0, 0)));
							arcBottomFaceIdxs.add(faces.size() - 1);
							// top
							faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
							arcCentTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx + 1, secIdx + 1, lineSecTopIdx, new Vector3d(0, 0, 0)));
							arcCentTopFaceIdxs.add(faces.size() - 1);
						}
						// 부채꼴 옆면
						for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
							int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
							int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
							int thrIdx = firIdx + 1;
							// side
							faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
						}

						// line 1 top line 밑면, 윗면
						int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int top1SecIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);

						// 밑면
						faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 top line 옆면
						int topSide1FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
						int topSide1ThrIdx = topSide1FirIdx + 1;
						int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;

						faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 밑면, 윗면
						int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

						// 밑면
						faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 옆면
						int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor1) + 1;
						int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
						int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

						// 옆면
						faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 2 top line 밑면, 윗면
						int top2FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int top2SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
						int top2ThrIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int top2FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

						// 밑면
						faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top2FirIdx, top2FurIdx, top2SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2SecIdx, top2FurIdx, top2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top2FirIdx + 1, top2FurIdx + 1, top2SecIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2SecIdx + 1, top2FurIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 2 top line 옆면
						int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
						int topSide2SecIdx = vSize + allCoordinates.indexOf(intersectionCoor) + 1;
						int topSide2ThrIdx = topSide2FirIdx + 1;
						int topSide2FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);

						faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(topSide2FirIdx, topSide2FurIdx, topSide2SecIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide2SecIdx, topSide2FurIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 2 bottom line 밑면, 윗면
						int bottom2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
						int bottom2SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
						int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

						// 밑면
						faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottom2FirIdx, bottom2FurIdx, bottom2SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2SecIdx, bottom2FurIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottom2FirIdx + 1, bottom2FurIdx + 1, bottom2SecIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2SecIdx + 1, bottom2FurIdx + 1, bottom2FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 2 bottom line 옆면
						int bottomSide2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
						int bottomSide2SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
						int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
						int bottomSide2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

						faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottomSide2FirIdx, bottomSide2FurIdx, bottomSide2SecIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide2SecIdx, bottomSide2FurIdx, bottomSide2FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
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
						if (!CGAlgorithms.isCCW(arcCenterCoors)) {
							arcCenter = arcCenter.reverse();
							arcCenterCoors = arcCenter.getCoordinates();
						}
						centerArc2dEv = arcCenter.getEnvelopeInternal();

						// 부채꼴의 모든 점 add
						for (int ac = 0; ac < arcCenterCoors.length; ac++) {
							vector2dList.add(new Vector2d(arcCenterCoors[ac].x, arcCenterCoors[ac].y));
							allCoordinates.add(arcCenterCoors[ac]);
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " " + 0 + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, 0));
							// 윗면 vertex add
							allCoordinates
									.add(new Coordinate(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
							vBuilder.append("v " + arcCenterCoors[ac].x + " " + arcCenterCoors[ac].y + " "
									+ defaultDepth + "\n");
							vector3dList.add(new Vector3d(arcCenterCoors[ac].x, arcCenterCoors[ac].y, defaultDepth));
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
							arcBottomFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, lineSecBottomIdx, new Vector3d(0, 0, 0)));
							arcBottomFaceIdxs.add(faces.size() - 1);

							// top
							faces.add(new Face3(lineSecTopIdx, secIdx + 1, thrIdx + 1, new Vector3d(0, 0, 0)));
							arcCentTopFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx + 1, lineSecTopIdx + 1, new Vector3d(0, 0, 0)));
							arcCentTopFaceIdxs.add(faces.size() - 1);
						}
						// 부채꼴 옆면
						for (int ac = 0; ac < arcCenterCoors.length - 1; ac++) {
							int firIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac]);
							int secIdx = vSize + allCoordinates.indexOf(arcCenterCoors[ac + 1]);
							int thrIdx = firIdx + 1;

							// side
							faces.add(new Face3(firIdx, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(thrIdx, secIdx, firIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);

							faces.add(new Face3(thrIdx, secIdx, secIdx + 1, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
							faces.add(new Face3(secIdx + 1, secIdx, thrIdx, new Vector3d(0, 0, 0)));
							arcSideFaceIdxs.add(faces.size() - 1);
						}

						// line 1 top
						vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
						allCoordinates.add(firTopCoor1);
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
						allCoordinates.add(secTopCoor1);
						vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
						vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultDepth));
						vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultDepth + "\n");

						// line 1 bottom
						vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
						allCoordinates.add(firBottomCoor1);
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(intersectionCoor.x, intersectionCoor.y));
						allCoordinates.add(intersectionCoor);
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, 0));
						vBuilder.append("v " + intersectionCoor.x + " " + intersectionCoor.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(intersectionCoor.x, intersectionCoor.y, defaultDepth));
						vector3dList.add(new Vector3d(intersectionCoor.x, intersectionCoor.y, defaultDepth));
						vBuilder.append(
								"v " + intersectionCoor.x + " " + intersectionCoor.y + " " + defaultDepth + "\n");

						// line 2 top
						vector2dList.add(new Vector2d(firTopCoor2.x, firTopCoor2.y));
						allCoordinates.add(firTopCoor2);
						vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, 0));
						vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firTopCoor2.x, firTopCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, defaultDepth));
						vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + defaultDepth + "\n");

						vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
						allCoordinates.add(secTopCoor2);
						vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
						vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
						vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

						// line 2 bottom
						// line 2 firBottomCoor2는 intersectionCoor, line 1 secBottomCoor1로 저장
						vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
						allCoordinates.add(secBottomCoor2);
						vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
						vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
						vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

						// line 1 top line 밑면, 윗면
						int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor1);
						int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);

						// 밑면
						faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 top line 옆면
						int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
						int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
						int topSide1ThrIdx = topSide1FirIdx + 1;
						int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

						// 옆면
						faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 밑면, 윗면
						int bottom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int bottom1FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);

						// 밑면
						faces.add(new Face3(bottom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bottom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bottom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(bottom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bottom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bottom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 옆면
						int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottomSide1SecIdx = vSize + allCoordinates.indexOf(intersectionCoor) + 1;
						int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
						int bottomSide1FurIdx = vSize + allCoordinates.indexOf(intersectionCoor);

						// 옆면
						faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 2 top line 밑면, 윗면
						int top2FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int top2SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
						int top2ThrIdx = vSize + allCoordinates.indexOf(firTopCoor2);
						int top2FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

						// 밑면
						faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top2FirIdx, top2FurIdx, top2SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2SecIdx, top2FurIdx, top2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top2FirIdx + 1, top2FurIdx + 1, top2SecIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top2SecIdx + 1, top2FurIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 2 top line 옆면
						int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
						int topSide2SecIdx = vSize + allCoordinates.indexOf(firTopCoor2) + 1;
						int topSide2ThrIdx = topSide2FirIdx + 1;
						int topSide2FurIdx = vSize + allCoordinates.indexOf(firTopCoor2);
						// 옆면
						faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(topSide2FirIdx, topSide2FurIdx, topSide2SecIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide2SecIdx, topSide2FurIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 2 bottom line 밑면, 윗면
						int bottom2FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int bottom2SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
						int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
						int bottom2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

						// 밑면
						faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottom2FirIdx, bottom2FurIdx, bottom2SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2SecIdx, bottom2FurIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottom2FirIdx + 1, bottom2FurIdx + 1, bottom2SecIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom2SecIdx + 1, bottom2FurIdx + 1, bottom2FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 2 bottom line 옆면
						int bottomSide2FirIdx = vSize + allCoordinates.indexOf(intersectionCoor);
						int bottomSide2SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
						int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
						int bottomSide2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

						faces.add(new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottomSide2FirIdx, bottomSide2FurIdx, bottomSide2SecIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide2SecIdx, bottomSide2FurIdx, bottomSide2FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
					}

					if (topInterset.isEmpty() && bottomIntersect.isEmpty()) {

						// line 1 top
						vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
						allCoordinates.add(firTopCoor1);
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
						vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

						// line 2 top
						vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
						allCoordinates.add(secTopCoor2);
						vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
						vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
						vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

						// line 1 bottom
						vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
						allCoordinates.add(firBottomCoor1);
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
						vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

						// line 2 bottom
						vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
						allCoordinates.add(secBottomCoor2);
						vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
						vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
						allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
						vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
						vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

						// line 1 top line 밑면, 윗면
						int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
						int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
						int top1FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

						// 밑면
						faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 top line 옆면
						int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
						int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
						int topSide1ThrIdx = topSide1FirIdx + 1;
						int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

						// 옆면
						faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 밑면, 윗면
						int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottom1SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
						int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
						int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

						// 밑면
						faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
						recBottomFaceIdxs.add(faces.size() - 1);

						// 윗면
						faces.add(new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1,
								new Vector3d(0, 0, 0)));
						recTopFaceIdxs.add(faces.size() - 1);

						// line 1 bottom line 옆면
						int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
						int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
						int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
						int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

						// 옆면
						faces.add(new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

						faces.add(new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);
						faces.add(new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx,
								new Vector3d(0, 0, 0)));
						recSideFaceIdxs.add(faces.size() - 1);

					}

				} else { // 세 점이 평행

					// line 1 top
					vector2dList.add(new Vector2d(firTopCoor1.x, firTopCoor1.y));
					allCoordinates.add(firTopCoor1);
					vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, 0));
					vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firTopCoor1.x, firTopCoor1.y, defaultDepth));
					vector3dList.add(new Vector3d(firTopCoor1.x, firTopCoor1.y, defaultDepth));
					vBuilder.append("v " + firTopCoor1.x + " " + firTopCoor1.y + " " + defaultDepth + "\n");

					vector2dList.add(new Vector2d(secTopCoor1.x, secTopCoor1.y));
					allCoordinates.add(secTopCoor1);
					vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, 0));
					vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secTopCoor1.x, secTopCoor1.y, defaultDepth));
					vector3dList.add(new Vector3d(secTopCoor1.x, secTopCoor1.y, defaultDepth));
					vBuilder.append("v " + secTopCoor1.x + " " + secTopCoor1.y + " " + defaultDepth + "\n");

					// line 1 bottom
					vector2dList.add(new Vector2d(firBottomCoor1.x, firBottomCoor1.y));
					allCoordinates.add(firBottomCoor1);
					vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, 0));
					vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
					vector3dList.add(new Vector3d(firBottomCoor1.x, firBottomCoor1.y, defaultDepth));
					vBuilder.append("v " + firBottomCoor1.x + " " + firBottomCoor1.y + " " + defaultDepth + "\n");

					vector2dList.add(new Vector2d(secBottomCoor1.x, secBottomCoor1.y));
					allCoordinates.add(secBottomCoor1);
					vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, 0));
					vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
					vector3dList.add(new Vector3d(secBottomCoor1.x, secBottomCoor1.y, defaultDepth));
					vBuilder.append("v " + secBottomCoor1.x + " " + secBottomCoor1.y + " " + defaultDepth + "\n");

					// line 2 top
					vector2dList.add(new Vector2d(firTopCoor2.x, firTopCoor2.y));
					allCoordinates.add(firTopCoor2);
					vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, 0));
					vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firTopCoor2.x, firTopCoor2.y, defaultDepth));
					vector3dList.add(new Vector3d(firTopCoor2.x, firTopCoor2.y, defaultDepth));
					vBuilder.append("v " + firTopCoor2.x + " " + firTopCoor2.y + " " + defaultDepth + "\n");

					vector2dList.add(new Vector2d(secTopCoor2.x, secTopCoor2.y));
					allCoordinates.add(secTopCoor2);
					vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, 0));
					vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secTopCoor2.x, secTopCoor2.y, defaultDepth));
					vector3dList.add(new Vector3d(secTopCoor2.x, secTopCoor2.y, defaultDepth));
					vBuilder.append("v " + secTopCoor2.x + " " + secTopCoor2.y + " " + defaultDepth + "\n");

					// line 2 bottom
					vector2dList.add(new Vector2d(firBottomCoor2.x, firBottomCoor2.y));
					allCoordinates.add(firBottomCoor2);
					vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, 0));
					vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
					vector3dList.add(new Vector3d(firBottomCoor2.x, firBottomCoor2.y, defaultDepth));
					vBuilder.append("v " + firBottomCoor2.x + " " + firBottomCoor2.y + " " + defaultDepth + "\n");

					vector2dList.add(new Vector2d(secBottomCoor2.x, secBottomCoor2.y));
					allCoordinates.add(secBottomCoor2);
					vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, 0));
					vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + 0 + "\n");
					allCoordinates.add(new Coordinate(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
					vector3dList.add(new Vector3d(secBottomCoor2.x, secBottomCoor2.y, defaultDepth));
					vBuilder.append("v " + secBottomCoor2.x + " " + secBottomCoor2.y + " " + defaultDepth + "\n");

					// line 1 top line 밑면, 윗면
					int top1FirIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					int top1SecIdx = vSize + allCoordinates.indexOf(secTopCoor1);
					int top1ThrIdx = vSize + allCoordinates.indexOf(firTopCoor1);
					int top1FurIdx = vSize + allCoordinates.indexOf(lineSecCoor);

					// 밑면
					faces.add(new Face3(top1FirIdx, top1SecIdx, top1ThrIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top1ThrIdx, top1SecIdx, top1FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(top1FirIdx, top1FurIdx, top1SecIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top1SecIdx, top1FurIdx, top1FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					// 윗면
					faces.add(new Face3(top1FirIdx + 1, top1SecIdx + 1, top1ThrIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top1ThrIdx + 1, top1SecIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(top1FirIdx + 1, top1FurIdx + 1, top1SecIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top1SecIdx + 1, top1FurIdx + 1, top1FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					// line 1 top line 옆면
					int topSide1FirIdx = vSize + allCoordinates.indexOf(secTopCoor1);
					int topSide1SecIdx = vSize + allCoordinates.indexOf(firTopCoor1) + 1;
					int topSide1ThrIdx = topSide1FirIdx + 1;
					int topSide1FurIdx = vSize + allCoordinates.indexOf(firTopCoor1);

					// 옆면
					faces.add(new Face3(topSide1FirIdx, topSide1SecIdx, topSide1ThrIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(topSide1ThrIdx, topSide1SecIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(topSide1FirIdx, topSide1FurIdx, topSide1SecIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(topSide1SecIdx, topSide1FurIdx, topSide1FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					// line 1 bottom line 밑면, 윗면
					int bopttom1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottom1SecIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int bottom1ThrIdx = vSize + allCoordinates.indexOf(lineFirCoor);
					int bottom1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

					// 밑면
					faces.add(new Face3(bopttom1FirIdx, bottom1SecIdx, bottom1ThrIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(bottom1ThrIdx, bottom1SecIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(bopttom1FirIdx, bottom1FurIdx, bottom1SecIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(bottom1SecIdx, bottom1FurIdx, bopttom1FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					// 윗면
					faces.add(
							new Face3(bopttom1FirIdx + 1, bottom1SecIdx + 1, bottom1ThrIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottom1ThrIdx + 1, bottom1SecIdx + 1, bopttom1FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					faces.add(
							new Face3(bopttom1FirIdx + 1, bottom1FurIdx + 1, bottom1SecIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottom1SecIdx + 1, bottom1FurIdx + 1, bopttom1FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					// line 1 bottom line 옆면
					int bottomSide1FirIdx = vSize + allCoordinates.indexOf(firBottomCoor1);
					int bottomSide1SecIdx = vSize + allCoordinates.indexOf(secBottomCoor1) + 1;
					int bottomSide1ThrIdx = bottomSide1FirIdx + 1;
					int bottomSide1FurIdx = vSize + allCoordinates.indexOf(secBottomCoor1);

					// 옆면
					faces.add(
							new Face3(bottomSide1FirIdx, bottomSide1SecIdx, bottomSide1ThrIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottomSide1ThrIdx, bottomSide1SecIdx, bottomSide1FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					faces.add(
							new Face3(bottomSide1FirIdx, bottomSide1FurIdx, bottomSide1SecIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottomSide1SecIdx, bottomSide1FurIdx, bottomSide1FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					// line 2 top line 밑면, 윗면
					int top2FirIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int top2SecIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int top2ThrIdx = vSize + allCoordinates.indexOf(firTopCoor2);
					int top2FurIdx = vSize + allCoordinates.indexOf(lineThrCoor);

					// 밑면
					faces.add(new Face3(top2FirIdx, top2SecIdx, top2ThrIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top2ThrIdx, top2SecIdx, top2FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(top2FirIdx, top2FurIdx, top2SecIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top2SecIdx, top2FurIdx, top2FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					// 윗면
					faces.add(new Face3(top2FirIdx + 1, top2SecIdx + 1, top2ThrIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top2ThrIdx + 1, top2SecIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(top2FirIdx + 1, top2FurIdx + 1, top2SecIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(top2SecIdx + 1, top2FurIdx + 1, top2FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					// line 2 top line 옆면
					int topSide2FirIdx = vSize + allCoordinates.indexOf(secTopCoor2);
					int topSide2SecIdx = vSize + allCoordinates.indexOf(firTopCoor2) + 1;
					int topSide2ThrIdx = topSide2FirIdx + 1;
					int topSide2FurIdx = vSize + allCoordinates.indexOf(firTopCoor2);
					// 옆면
					faces.add(new Face3(topSide2FirIdx, topSide2SecIdx, topSide2ThrIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(topSide2ThrIdx, topSide2SecIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(topSide2FirIdx, topSide2FurIdx, topSide2SecIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(topSide2SecIdx, topSide2FurIdx, topSide2FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					// line 2 bottom line 밑면, 윗면
					int bottom2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
					int bottom2SecIdx = vSize + allCoordinates.indexOf(lineThrCoor);
					int bottom2ThrIdx = vSize + allCoordinates.indexOf(lineSecCoor);
					int bottom2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

					// 밑면
					faces.add(new Face3(bottom2FirIdx, bottom2SecIdx, bottom2ThrIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(bottom2ThrIdx, bottom2SecIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					faces.add(new Face3(bottom2FirIdx, bottom2FurIdx, bottom2SecIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);
					faces.add(new Face3(bottom2SecIdx, bottom2FurIdx, bottom2FirIdx, new Vector3d(0, 0, 0)));
					recBottomFaceIdxs.add(faces.size() - 1);

					// 윗면
					faces.add(
							new Face3(bottom2FirIdx + 1, bottom2SecIdx + 1, bottom2ThrIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottom2ThrIdx + 1, bottom2SecIdx + 1, bottom2FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					faces.add(
							new Face3(bottom2FirIdx + 1, bottom2FurIdx + 1, bottom2SecIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottom2SecIdx + 1, bottom2FurIdx + 1, bottom2FirIdx + 1, new Vector3d(0, 0, 0)));
					recTopFaceIdxs.add(faces.size() - 1);

					// line 2 bottom line 옆면
					int bottomSide2FirIdx = vSize + allCoordinates.indexOf(firBottomCoor2);
					int bottomSide2SecIdx = vSize + allCoordinates.indexOf(secBottomCoor2) + 1;
					int bottomSide2ThrIdx = bottomSide2FirIdx + 1;
					int bottomSide2FurIdx = vSize + allCoordinates.indexOf(secBottomCoor2);

					faces.add(
							new Face3(bottomSide2FirIdx, bottomSide2SecIdx, bottomSide2ThrIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottomSide2ThrIdx, bottomSide2SecIdx, bottomSide2FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);

					faces.add(
							new Face3(bottomSide2FirIdx, bottomSide2FurIdx, bottomSide2SecIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
					faces.add(
							new Face3(bottomSide2SecIdx, bottomSide2FurIdx, bottomSide2FirIdx, new Vector3d(0, 0, 0)));
					recSideFaceIdxs.add(faces.size() - 1);
				}
			}
			vSize += allCoordinates.size();
			writer.write(vBuilder.toString());

			com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom = new com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry();
			threeGeom.faces = faces;
			threeGeom.vertices = vector3dList;
			threeGeom.computeBoundingBox();

			// 3d
			Vector3d boundingMax = threeGeom.getBoundingBox().getMax();
			Vector3d boundingMin = threeGeom.getBoundingBox().getMin();

//			Vector3d offset3d = new Vector3d(0 - boundingMin.x(), 0 - boundingMin.y(), 0 - boundingMin.z());
//			Vector3d range3d = new Vector3d(((boundingMin.x() - boundingMax.x()) * -1),
//					((boundingMin.y() - boundingMax.y()) * -1), ((boundingMin.z() - boundingMax.z()) * -1));
			//
//			// 2d
//			Envelope lineEv = geom.getEnvelopeInternal();
//			double range2dminX = lineEv.getMinX();
//			double range2dmaxX = lineEv.getMaxX();
//			double range2dminY = lineEv.getMinY();
//			double range2dmaxY = lineEv.getMaxY();
			//
//			Vector2d offset2d = new Vector2d(0 - range2dminX, 0 - range2dminY);
//			Vector2d range2d = new Vector2d(((range2dminX - range2dmaxX) * -1), ((range2dminY - range2dmaxY) * -1));

			// vt
			List<List<Vector2d>> faceVertexUvs = new ArrayList<>();

			Object[] tmpVertexUvs = new Object[faces.size()];
			// 양끝, 중간 부채꼴 밑면 - 0으로 없애기
			for (int i = 0; i < arcBottomFaceIdxs.size(); i++) {
				int idx = arcBottomFaceIdxs.get(i);
				List<Vector2d> innerFvt = new ArrayList<>();
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));
				tmpVertexUvs[idx] = innerFvt;
			}
			// 부채꼴 윗면
			// 첫점 부채꼴 윗면
			if (firArc2dEv != null) {

				Vector2d offset2dFirArc = new Vector2d(0 - firArc2dEv.getMinX(), 0 - firArc2dEv.getMinY());
				Vector2d range2dFirArc = new Vector2d(((firArc2dEv.getMinX() - firArc2dEv.getMaxX()) * -1),
						((firArc2dEv.getMinY() - firArc2dEv.getMaxY()) * -1));

				for (int i = 0; i < arcFirTopFaceIdxs.size(); i++) {
					int idx = arcFirTopFaceIdxs.get(i);
					Face3 face = threeGeom.faces.get(idx);
					List<Vector2d> innerFvt = new ArrayList<>();

					Vector3d v1 = threeGeom.vertices.get(face.a);
					Vector3d v2 = threeGeom.vertices.get(face.b);
					Vector3d v3 = threeGeom.vertices.get(face.c);

					Vector2d vt1 = new Vector2d((v1.x() + offset2dFirArc.x()) / range2dFirArc.x() * 0.4,
							(v1.y() + offset2dFirArc.y()) / range2dFirArc.y() * 0.4 + 0.2);
					Vector2d vt2 = new Vector2d((v2.x() + offset2dFirArc.x()) / range2dFirArc.x() * 0.4,
							(v2.y() + offset2dFirArc.y()) / range2dFirArc.y() * 0.4 + 0.2);
					Vector2d vt3 = new Vector2d((v3.x() + offset2dFirArc.x()) / range2dFirArc.x() * 0.4,
							(v3.y() + offset2dFirArc.y()) / range2dFirArc.y() * 0.4 + 0.2);

					innerFvt.add(vt1);
					innerFvt.add(vt2);
					innerFvt.add(vt3);

					tmpVertexUvs[idx] = innerFvt;
				}
			}
			// 마지막 부채꼴 윗면
			if (lasArc2dEv != null) {

				Vector2d offset2dLasArc = new Vector2d(0 - lasArc2dEv.getMinX(), 0 - lasArc2dEv.getMinY());
				Vector2d range2dLasArc = new Vector2d(((lasArc2dEv.getMinX() - lasArc2dEv.getMaxX()) * -1),
						((lasArc2dEv.getMinY() - lasArc2dEv.getMaxY()) * -1));

				for (int i = 0; i < arcLasTopFaceIdxs.size(); i++) {
					int idx = arcLasTopFaceIdxs.get(i);
					Face3 face = threeGeom.faces.get(idx);
					List<Vector2d> innerFvt = new ArrayList<>();

					Vector3d v1 = threeGeom.vertices.get(face.a);
					Vector3d v2 = threeGeom.vertices.get(face.b);
					Vector3d v3 = threeGeom.vertices.get(face.c);

					Vector2d vt1 = new Vector2d((v1.x() + offset2dLasArc.x()) / range2dLasArc.x() * 0.4,
							(v1.y() + offset2dLasArc.y()) / range2dLasArc.y() * 0.4 + 0.2);
					Vector2d vt2 = new Vector2d((v2.x() + offset2dLasArc.x()) / range2dLasArc.x() * 0.4,
							(v2.y() + offset2dLasArc.y()) / range2dLasArc.y() * 0.4 + 0.2);
					Vector2d vt3 = new Vector2d((v3.x() + offset2dLasArc.x()) / range2dLasArc.x() * 0.4,
							(v3.y() + offset2dLasArc.y()) / range2dLasArc.y() * 0.4 + 0.2);

					innerFvt.add(vt1);
					innerFvt.add(vt2);
					innerFvt.add(vt3);

					tmpVertexUvs[idx] = innerFvt;
				}
			}
			// 중간점 부채꼴 윗면
			if (centerArc2dEv != null) {
				for (int i = 0; i < arcCentTopFaceIdxs.size(); i++) {
					int idx = arcCentTopFaceIdxs.get(i);
					Face3 face = threeGeom.faces.get(idx);
					List<Vector2d> innerFvt = new ArrayList<>();
					Vector2d vt1 = new Vector2d(0.02, 0.8);
					Vector2d vt2 = new Vector2d(0.04, 1);
					Vector2d vt3 = new Vector2d(0, 1);
					innerFvt.add(vt1);
					innerFvt.add(vt2);
					innerFvt.add(vt3);
					tmpVertexUvs[idx] = innerFvt;
				}
			}
			// 텍스쳐 이미지에서 옆면의 높이 최고점 비율
			double topLimit = 0.2;
			// 텍스쳐 이미지에서 옆면의 높이 최저점 비율
			double bottomLimit = 0;
			// 양끝, 중간 부채꼴 옆면
			for (int i = 0; i < arcSideFaceIdxs.size(); i = i + 4) {
				int idx = arcSideFaceIdxs.get(i);
				Face3 face = threeGeom.faces.get(idx);

				Vector3d v1 = threeGeom.vertices.get(face.a);
				Vector3d v2 = threeGeom.vertices.get(face.b);
				Vector3d v3 = threeGeom.vertices.get(face.c);

				double from1to2 = v1.distanceTo(v2); // x축
				double ratioVal2 = from1to2 * 0.2 / maxY;
				if (ratioVal2 > 1) {
					ratioVal2 = 1;
					double ratioHeight = maxY / from1to2;
					bottomLimit = topLimit - ratioHeight;
				}

				List<Vector2d> innerFvt1 = new ArrayList<>();
				innerFvt1.add(new Vector2d(0, 0));
				innerFvt1.add(new Vector2d(ratioVal2, 0));
				innerFvt1.add(new Vector2d(0, topLimit));

				List<Vector2d> innerFvt1b = new ArrayList<>();
				innerFvt1b.add(new Vector2d(0, 0));
				innerFvt1b.add(new Vector2d(0, 0));
				innerFvt1b.add(new Vector2d(0, 0));

				List<Vector2d> innerFvt2 = new ArrayList<>();
				innerFvt2.add(new Vector2d(0, topLimit));
				innerFvt2.add(new Vector2d(ratioVal2, 0));
				innerFvt2.add(new Vector2d(ratioVal2, topLimit));

				List<Vector2d> innerFvt2b = new ArrayList<>();
				innerFvt2.add(new Vector2d(0, 0));
				innerFvt2.add(new Vector2d(0, 0));
				innerFvt2.add(new Vector2d(0, 0));

//				List<Vector2d> innerFvt1 = new ArrayList<>();
//				innerFvt1.add(new Vector2d(ratioVal2, 0));
//				innerFvt1.add(new Vector2d(0, bottomLimit));
//				innerFvt1.add(new Vector2d(ratioVal2, topLimit));
//				
//				List<Vector2d> innerFvt2 = new ArrayList<>();
//				innerFvt2.add(new Vector2d(ratioVal2, topLimit));
//				innerFvt2.add(new Vector2d(0, bottomLimit));
//				innerFvt2.add(new Vector2d(0, topLimit));

				tmpVertexUvs[idx] = innerFvt1;
				tmpVertexUvs[arcSideFaceIdxs.get(i + 1)] = innerFvt1b;
				tmpVertexUvs[arcSideFaceIdxs.get(i + 2)] = innerFvt2;
				tmpVertexUvs[arcSideFaceIdxs.get(i + 3)] = innerFvt2b;
			}

			// 사각형 밑면 - 0으로 없애기
			for (int i = 0; i < recBottomFaceIdxs.size(); i++) {
				int idx = recBottomFaceIdxs.get(i);
				List<Vector2d> innerFvt = new ArrayList<>();
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));
				tmpVertexUvs[idx] = innerFvt;
			}
			// 사각형 윗면
			// 텍스쳐 이미지에서 도로 윗면의 상한
			double rectangleTopLimit = 1;
			// 도로중심
			double rectangleMidLimit = 0.8;
			// 텍스쳐 이미지에서 도로 윗면의 하한
			double rectangleBottomLimit = 0.6;
			for (int i = 0; i < recTopFaceIdxs.size(); i = i + 8) {
				int idx = recTopFaceIdxs.get(i);
				Face3 face = threeGeom.faces.get(idx);

				Vector3d v1 = threeGeom.vertices.get(face.a);
				Vector3d v2 = threeGeom.vertices.get(face.b);
				Vector3d v3 = threeGeom.vertices.get(face.c);

				double from2to3 = v2.distanceTo(v3); // x축
				double ratioVal1 = from2to3 / maxX;

				double widthLimit = 1;
				if (ratioVal1 > 1) {
					ratioVal1 = 1;
					double ratioWidth = maxX / from2to3;
					widthLimit = widthLimit - ratioWidth;
				}

				List<Vector2d> innerFvt1 = new ArrayList<>();
				innerFvt1.add(new Vector2d(0, rectangleMidLimit));
				innerFvt1.add(new Vector2d(ratioVal1, rectangleTopLimit));
				innerFvt1.add(new Vector2d(0, rectangleTopLimit));

				List<Vector2d> innerFvt1b = new ArrayList<>();
				innerFvt1b.add(new Vector2d(0, 0));
				innerFvt1b.add(new Vector2d(0, 0));
				innerFvt1b.add(new Vector2d(0, 0));

				List<Vector2d> innerFvt2 = new ArrayList<>();
				innerFvt2.add(new Vector2d(0, rectangleMidLimit));
				innerFvt2.add(new Vector2d(ratioVal1, rectangleMidLimit));
				innerFvt2.add(new Vector2d(ratioVal1, rectangleTopLimit));

				List<Vector2d> innerFvt2b = new ArrayList<>();
				innerFvt2b.add(new Vector2d(0, 0));
				innerFvt2b.add(new Vector2d(0, 0));
				innerFvt2b.add(new Vector2d(0, 0));

				List<Vector2d> innerFvt3 = new ArrayList<>();
				innerFvt3.add(new Vector2d(0, rectangleBottomLimit));
				innerFvt3.add(new Vector2d(ratioVal1, rectangleMidLimit));
				innerFvt3.add(new Vector2d(0, rectangleMidLimit));

				List<Vector2d> innerFvt3b = new ArrayList<>();
				innerFvt3b.add(new Vector2d(0, 0));
				innerFvt3b.add(new Vector2d(0, 0));
				innerFvt3b.add(new Vector2d(0, 0));

				List<Vector2d> innerFvt4 = new ArrayList<>();
				innerFvt4.add(new Vector2d(0, rectangleBottomLimit));
				innerFvt4.add(new Vector2d(ratioVal1, rectangleBottomLimit));
				innerFvt4.add(new Vector2d(ratioVal1, rectangleMidLimit));

				List<Vector2d> innerFvt4b = new ArrayList<>();
				innerFvt4b.add(new Vector2d(0, 0));
				innerFvt4b.add(new Vector2d(0, 0));
				innerFvt4b.add(new Vector2d(0, 0));

				tmpVertexUvs[idx] = innerFvt1;
				tmpVertexUvs[recTopFaceIdxs.get(i + 1)] = innerFvt1b;
				tmpVertexUvs[recTopFaceIdxs.get(i + 2)] = innerFvt2;
				tmpVertexUvs[recTopFaceIdxs.get(i + 3)] = innerFvt2b;
				tmpVertexUvs[recTopFaceIdxs.get(i + 4)] = innerFvt3;
				tmpVertexUvs[recTopFaceIdxs.get(i + 5)] = innerFvt3b;
				tmpVertexUvs[recTopFaceIdxs.get(i + 6)] = innerFvt4;
				tmpVertexUvs[recTopFaceIdxs.get(i + 7)] = innerFvt4b;
			}
			// 사각형 옆면
			// 텍스쳐 이미지에서 건물 옆면의 비율
			double recTopLimit = 0.2;
			// 건물 바닥의 비율
			double recBottomLimit = 0;
			for (int i = 0; i < recSideFaceIdxs.size(); i = i + 4) {
				int idx = recSideFaceIdxs.get(i);
				Face3 face = threeGeom.faces.get(idx);

				Vector3d v1 = threeGeom.vertices.get(face.a);
				Vector3d v2 = threeGeom.vertices.get(face.b);
				Vector3d v3 = threeGeom.vertices.get(face.c);

				double from2to3 = v2.distanceTo(v3); // x축
				double ratioVal = from2to3 / maxY;
				if (ratioVal > 1) {
					ratioVal = 1;
					double ratioHeight = maxY / from2to3;
					bottomLimit = recTopLimit - ratioHeight;
				}

				List<Vector2d> innerFvt1 = new ArrayList<>();
				innerFvt1.add(new Vector2d(0, 0));
				innerFvt1.add(new Vector2d(ratioVal, recTopLimit));
				innerFvt1.add(new Vector2d(0, recTopLimit));

				List<Vector2d> innerFvt1b = new ArrayList<>();
				innerFvt1b.add(new Vector2d(0, 0));
				innerFvt1b.add(new Vector2d(0, 0));
				innerFvt1b.add(new Vector2d(0, 0));

				List<Vector2d> innerFvt2 = new ArrayList<>();
				innerFvt2.add(new Vector2d(0, 0));
				innerFvt2.add(new Vector2d(ratioVal, 0));
				innerFvt2.add(new Vector2d(ratioVal, recTopLimit));

				List<Vector2d> innerFvt2b = new ArrayList<>();
				innerFvt2b.add(new Vector2d(0, 0));
				innerFvt2b.add(new Vector2d(0, 0));
				innerFvt2b.add(new Vector2d(0, 0));

				tmpVertexUvs[idx] = innerFvt1;
				tmpVertexUvs[recSideFaceIdxs.get(i + 1)] = innerFvt1b;
				tmpVertexUvs[recSideFaceIdxs.get(i + 2)] = innerFvt2;
				tmpVertexUvs[recSideFaceIdxs.get(i + 3)] = innerFvt2b;
			}
			for (int t = 0; t < tmpVertexUvs.length; t++) {
				faceVertexUvs.add((List<Vector2d>) tmpVertexUvs[t]);
			}
			threeGeom.faceVertexUvs.add(faceVertexUvs);
			// vn
			threeGeom.computeFlatVertexNormals();
			threeGeom.computeFaceNormals();
			writeThreeGeometry(threeGeom, featureID);
		}
		return idList;
	}

	private void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom,
			String gId) throws IOException {

		// vt
		if (threeGeom.faceVertexUvs != null) {
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

}
