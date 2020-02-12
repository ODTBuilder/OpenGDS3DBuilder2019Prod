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
import com.gitrnd.gdsbuilder.parse.impl.objparser.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.objparser.ShpToObjImpl.EnShpToObjWidthType;
import com.gitrnd.gdsbuilder.parse.impl.quad.Quadtree;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Face3;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;

/**
 * Poine 타입의 2D FeatureCollection 객체를 3D Box Obj 객체로 변환하여 Obj 파일을 생성하는 클래스
 * 
 * @author DY.Oh
 *
 */
public class PointLayerToBoxObjImpl {

	/**
	 * 높이 고정값
	 */
	private double defaultDepth = 5; // 높이
	/**
	 * 가로 너비 고정값
	 */
	private double defaultWidth = 5; // 가로
	/**
	 * 세로 너비 고정값
	 */
	private double defaultHeight = 5; // 세로
	/**
	 * 높이 속성 값
	 */
	private String depthAttribute;
	/**
	 * 가로 너비 속성 값
	 */
	private String widthAttribute;
	/**
	 * 세로 너비 속성 값
	 */
	private String heightAttribute;

	/**
	 * 입력 높이 값
	 */
	private String depthValue;
	/**
	 * 입력 세로 너비 값
	 */
	private String heightValue;
	/**
	 * 입력 가로 너비 값
	 */
	private String widthValue;
	/**
	 * 변환 후 3D vertex 리스트
	 */
	private static List<Vector3d> vector3dList;
	/**
	 * 변환 전 2D vertex 리스트
	 */
	private static List<Vector2d> vector2dList;
	/**
	 * 생성된 Obj 파일 개수
	 */
	private int objfilenum = 0;
	/**
	 * Obj 파일 상위 경로
	 */
	private String outputPath;
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
	 * 세로 너비 입력값 타입
	 */
	private EnShpToObjHeightType hType;
	/**
	 * 높이 입력값 타입
	 */
	private EnShpToObjDepthType dType;
	/**
	 * 가로 너비 입력값 타입
	 */
	private EnShpToObjWidthType wType;
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
	 * BufferedWriter
	 */
	private static BufferedWriter writer;

	/**
	 * PointLayerToBoxObjImpl 생성자
	 * 
	 * @param buildingCollection Point 타입의 2D FeatureCollection
	 * @param texture            texture 명
	 * @param hType
	 * @param heightValue
	 * @param wType
	 * @param widthValue
	 * @param dType              높이 입력값 타입
	 * @param depthValue         높이 입력값
	 * @param outputPath         Obj 파일 상위 경로
	 */
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

	/**
	 * Point 타입의 2D FeatureCollection 객체를 3D Box Obj 객체로 변환
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
		double maxDepth = 0.0;
		if (this.dType == EnShpToObjDepthType.DEFAULT) {
			defaultDepth = Double.valueOf(depthValue);
			maxDepth = defaultDepth;
		}
		if (this.hType == EnShpToObjHeightType.DEFAULT) {
			defaultHeight = Double.valueOf(heightValue);
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
			// tileset option file
			double maxX = reEnv.getMaxX(); // east
			double maxY = reEnv.getMaxY(); // north
			double minX = reEnv.getMinX(); // west
			double minY = reEnv.getMinY(); // south

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

				double x1 = xDistance + (defaultWidth / 2);
				double y1 = yDistance + (defaultHeight / 2);

				double x2 = xDistance - (defaultWidth / 2);
				double y2 = yDistance + (defaultHeight / 2);

				double x3 = xDistance - (defaultWidth / 2);
				double y3 = yDistance - (defaultHeight / 2);

				double x4 = xDistance + (defaultWidth / 2);
				double y4 = yDistance - (defaultHeight / 2);

				// 밑면
				Coordinate coorBottom1 = new Coordinate(x1, y1, 0);
				Coordinate coorBottom2 = new Coordinate(x2, y2, 0);
				Coordinate coorBottom3 = new Coordinate(x3, y3, 0);
				Coordinate coorBottom4 = new Coordinate(x4, y4, 0);

				vector2dList.add(new Vector2d(x1, y1));
				vector2dList.add(new Vector2d(x2, y2));
				vector2dList.add(new Vector2d(x3, y3));
				vector2dList.add(new Vector2d(x4, y4));

				// 윗면
				Coordinate coorTop1 = new Coordinate(x1, y1, defaultDepth);
				Coordinate coorTop2 = new Coordinate(x2, y2, defaultDepth);
				Coordinate coorTop3 = new Coordinate(x3, y3, defaultDepth);
				Coordinate coorTop4 = new Coordinate(x4, y4, defaultDepth);

				allCoordinates.add(coorBottom1);
				allCoordinates.add(coorTop1);
				allCoordinates.add(coorBottom2);
				allCoordinates.add(coorTop2);
				allCoordinates.add(coorBottom3);
				allCoordinates.add(coorTop3);
				allCoordinates.add(coorBottom4);
				allCoordinates.add(coorTop4);

				vector3dList.add(new Vector3d(coorBottom1.x, coorBottom1.y, 0));
				vector3dList.add(new Vector3d(coorTop1.x, coorTop1.y, defaultDepth));
				vector3dList.add(new Vector3d(coorBottom2.x, coorBottom2.y, 0));
				vector3dList.add(new Vector3d(coorTop2.x, coorTop2.y, defaultDepth));
				vector3dList.add(new Vector3d(coorBottom3.x, coorBottom3.y, 0));
				vector3dList.add(new Vector3d(coorTop3.x, coorTop3.y, defaultDepth));
				vector3dList.add(new Vector3d(coorBottom4.x, coorBottom4.y, 0));
				vector3dList.add(new Vector3d(coorTop4.x, coorTop4.y, defaultDepth));

				vBuilder.append("v " + coorBottom1.x + " " + coorBottom1.y + " " + 0 + "\n");
				vBuilder.append("v " + coorTop1.x + " " + coorTop1.y + " " + defaultDepth + "\n");
				vBuilder.append("v " + coorBottom2.x + " " + coorBottom2.y + " " + 0 + "\n");
				vBuilder.append("v " + coorTop2.x + " " + coorTop2.y + " " + defaultDepth + "\n");
				vBuilder.append("v " + coorBottom3.x + " " + coorBottom3.y + " " + 0 + "\n");
				vBuilder.append("v " + coorTop3.x + " " + coorTop3.y + " " + defaultDepth + "\n");
				vBuilder.append("v " + coorBottom4.x + " " + coorBottom4.y + " " + 0 + "\n");
				vBuilder.append("v " + coorTop4.x + " " + coorTop4.y + " " + defaultDepth + "\n");

				// 밑면 face
				int firBottomIdx = vSize + allCoordinates.indexOf(coorBottom3);
				int secBottomIdx = vSize + allCoordinates.indexOf(coorBottom4);
				int thrBottomIdx = vSize + allCoordinates.indexOf(coorBottom2);
				int furBottomIdx = vSize + allCoordinates.indexOf(coorBottom1);

				faces.add(new Face3(firBottomIdx, secBottomIdx, thrBottomIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrBottomIdx, secBottomIdx, firBottomIdx, new Vector3d(0, 0, 0)));

				faces.add(new Face3(thrBottomIdx, secBottomIdx, furBottomIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(furBottomIdx, secBottomIdx, thrBottomIdx, new Vector3d(0, 0, 0)));

				bottomend = faces.size();

				// 윗면 face
				int firTopIdx = firBottomIdx + 1;
				int secTopIdx = secBottomIdx + 1;
				int thrTopIdx = thrBottomIdx + 1;
				int furTopIdx = furBottomIdx + 1;

				faces.add(new Face3(firTopIdx, secTopIdx, thrTopIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrTopIdx, secTopIdx, firTopIdx, new Vector3d(0, 0, 0)));

				faces.add(new Face3(thrTopIdx, secTopIdx, furTopIdx, new Vector3d(0, 0, 0)));
				faces.add(new Face3(furTopIdx, secTopIdx, thrTopIdx, new Vector3d(0, 0, 0)));

				topend = faces.size();

				// 옆면 face 1
				int firSideIdx1 = vSize + allCoordinates.indexOf(coorBottom3);
				int secSideIdx1 = vSize + allCoordinates.indexOf(coorBottom4);
				int thrSideIdx1 = firSideIdx1 + 1;
				int furSideIdx1 = secSideIdx1 + 1;

				faces.add(new Face3(firSideIdx1, secSideIdx1, thrSideIdx1, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrSideIdx1, secSideIdx1, firSideIdx1, new Vector3d(0, 0, 0)));

				faces.add(new Face3(thrSideIdx1, secSideIdx1, furSideIdx1, new Vector3d(0, 0, 0)));
				faces.add(new Face3(furSideIdx1, secSideIdx1, thrSideIdx1, new Vector3d(0, 0, 0)));

				// 옆면 face 2
				int firSideIdx2 = vSize + allCoordinates.indexOf(coorBottom2);
				int secSideIdx2 = vSize + allCoordinates.indexOf(coorBottom3);
				int thrSideIdx2 = firSideIdx2 + 1;
				int furSideIdx2 = secSideIdx2 + 1;

				faces.add(new Face3(firSideIdx2, secSideIdx2, thrSideIdx2, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrSideIdx2, secSideIdx2, firSideIdx2, new Vector3d(0, 0, 0)));

				faces.add(new Face3(thrSideIdx2, secSideIdx2, furSideIdx2, new Vector3d(0, 0, 0)));
				faces.add(new Face3(furSideIdx2, secSideIdx2, thrSideIdx2, new Vector3d(0, 0, 0)));

				// 옆면 face 3
				int firSideIdx3 = vSize + allCoordinates.indexOf(coorBottom1);
				int secSideIdx3 = vSize + allCoordinates.indexOf(coorBottom2);
				int thrSideIdx3 = firSideIdx3 + 1;
				int furSideIdx3 = secSideIdx3 + 1;

				faces.add(new Face3(firSideIdx3, secSideIdx3, thrSideIdx3, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrSideIdx3, secSideIdx3, firSideIdx3, new Vector3d(0, 0, 0)));

				faces.add(new Face3(thrSideIdx3, secSideIdx3, furSideIdx3, new Vector3d(0, 0, 0)));
				faces.add(new Face3(furSideIdx3, secSideIdx3, thrSideIdx3, new Vector3d(0, 0, 0)));

				// 옆면 face 4
				int firSideIdx4 = vSize + allCoordinates.indexOf(coorBottom4);
				int secSideIdx4 = vSize + allCoordinates.indexOf(coorBottom1);
				int thrSideIdx4 = firSideIdx4 + 1;
				int furSideIdx4 = secSideIdx4 + 1;

				faces.add(new Face3(firSideIdx4, secSideIdx4, thrSideIdx4, new Vector3d(0, 0, 0)));
				faces.add(new Face3(thrSideIdx4, secSideIdx4, firSideIdx4, new Vector3d(0, 0, 0)));

				faces.add(new Face3(thrSideIdx4, secSideIdx4, furSideIdx4, new Vector3d(0, 0, 0)));
				faces.add(new Face3(furSideIdx4, secSideIdx4, thrSideIdx4, new Vector3d(0, 0, 0)));

				sideend = faces.size();
			}

			writer.write(vBuilder.toString());
			com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom = new com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry();
			threeGeom.faces = faces;
			threeGeom.vertices = vector3dList;
			threeGeom.computeBoundingBox();

			// vt
			List<List<Vector2d>> faceVertexUvs = new ArrayList<>();

			// 바닥
			for (int i = 0; i < bottomend; i++) {
				List<Vector2d> innerFvt = new ArrayList<>();
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));
				innerFvt.add(new Vector2d(0, 0));

				faceVertexUvs.add(innerFvt);
			}

			// 윗면
			for (int i = bottomend; i < topend; i = i + 4) {
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

			// 옆면
			for (int i = topend; i < sideend; i = i + 4) {
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
		return idList;
	}

	public void writeThreeGeometry(com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Geometry threeGeom)
			throws IOException {

//		// v
//		if (threeGeom.getVertices() != null) {
//			if (threeGeom.getVertices().size() > 0) {
//				StringBuilder vBuilder = new StringBuilder();
//				List<Vector3d> vertices = threeGeom.getVertices();
//				for (Vector3d vertice : vertices) {
//					vBuilder.append("v " + vertice.x() + " " + vertice.y() + " " + vertice.z() + "\n");
//				}
//				writer.write(vBuilder.toString());
//			}
//		}
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
