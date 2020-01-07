package com.gitrnd.qaproducer.edit3d.service;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.opengis.feature.Feature;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.gdsbuilder.geoserver.converter.type.GeneralMapExport;
import com.gitrnd.gdsbuilder.parse.impl.ObjParser;
import com.gitrnd.gdsbuilder.parse.impl.test.DefaultObjFace;
import com.gitrnd.gdsbuilder.parse.impl.test.ObjReader;

import de.javagl.obj.Obj;
import de.javagl.obj.ObjFace;
import de.javagl.obj.ObjGroup;
import de.javagl.obj.ObjUtils;
import de.javagl.obj.ObjWriter;
import de.javagl.obj.Objs;

@Service
@PropertySources({ @PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true),
		@PropertySource(value = "file:./application.yml", ignoreResourceNotFound = true) })
public class Edit3dService {

	@Value("${gitrnd.apache.basedrive}")
	private String basedrive;

	@Value("${gitrnd.apache.basedir}")
	private String basedir;

	@Value("${gitrnd.node.host}")
	private String nodeHost;

	@Value("${gitrnd.node.port}")
	private String nodePort;

	@Value("${gitrnd.serverhost}")
	private String serverIP;

	@Value("${server.port}")
	private String serverPort;

	@Value("${server.context-path}")
	private String context;

	public JSONObject convertObjToGltf(String featureId, String user, String objPath)
			throws ParseException, IOException {

		// 원본 obj read "20191212_173635/obj/1.obj"
		String originPath = basedrive + ":" + File.separator + basedir + File.separator + user + File.separator
				+ "upload" + File.separator + objPath;

		File originFile = new File(originPath);
		String fileDir = originFile.getAbsoluteFile().getParent();

		InputStream inputStream = new FileInputStream(originPath);
		Obj originObj = ObjUtils.convertToRenderable(ObjReader.read(inputStream));

		// featureId에 해당하는 feature get
		ObjGroup group = originObj.getGroup(featureId);

		// 단일 obj 파일로 write
		Obj newObj = Objs.create();
		int numFaces = group.getNumFaces();

		// face
		for (int n = 0; n < numFaces; n++) {
			ObjFace face = group.getFace(n);
			Set<String> activatedGroupNames = originObj.getActivatedGroupNames(face);
			if (activatedGroupNames != null) {
				newObj.setActiveGroupNames(activatedGroupNames);
			}
			String activatedMaterialGroupName = originObj.getActivatedMaterialGroupName(face);
			if (activatedMaterialGroupName != null) {
				newObj.setActiveMaterialGroupName(activatedMaterialGroupName);
			}
			List<Integer> vertexIndices = new ArrayList<>();
			List<Integer> texCoordIndices = new ArrayList<>();
			List<Integer> normalIndices = new ArrayList<>();
			int numVertices = face.getNumVertices();
			for (int v = 0; v < numVertices; v++) {
				int vertexIdx = face.getVertexIndex(v);
				int texCoordIdx = face.getTexCoordIndex(v);
				int normalIdx = face.getNormalIndex(v);

				newObj.addVertex(originObj.getVertex(vertexIdx));
				newObj.addTexCoord(originObj.getTexCoord(texCoordIdx));
				newObj.addNormal(originObj.getNormal(normalIdx));

				vertexIndices.add(newObj.getNumVertices() - 1);
				texCoordIndices.add(newObj.getNumTexCoords() - 1);
				normalIndices.add(newObj.getNumNormals() - 1);
			}
			DefaultObjFace newFace = new DefaultObjFace(vertexIndices.stream().mapToInt(i -> i).toArray(),
					texCoordIndices.stream().mapToInt(i -> i).toArray(),
					normalIndices.stream().mapToInt(i -> i).toArray());
			newObj.addFace(newFace);
		}
		// Write an OBJ file
		OutputStream objOutputStream = null;
		String fileName = featureId + ".obj";
		String newObjpath = fileDir + File.separator + fileName;
		try {
			objOutputStream = new FileOutputStream(newObjpath);
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			ObjWriter.write(newObj, objOutputStream);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		String[] splitArr = objPath.split("/");
		String timeStr = splitArr[0];

		// web path
		String webPath = "http://" + serverIP + ":" + serverPort + context + "/downloadObj.do" + "?" + "user=" + user
				+ "&time=" + timeStr + "&file=" + fileName;

		// obj to gltf
		// API 요청 파라미터 생성
		String nodeURL = "http://" + nodeHost + ":" + nodePort + "/convert/objTogltf"; // 압축폴더 업로드 경로

		// body
		JSONObject bodyJson = new JSONObject();
		bodyJson.put("user", user);
		bodyJson.put("time", timeStr);
		bodyJson.put("path", webPath);
		bodyJson.put("file", fileName);
		String bodyString = bodyJson.toJSONString();

		// restTemplate
		HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
		factory.setReadTimeout(0);
		factory.setConnectTimeout(0);
		CloseableHttpClient httpClient = HttpClientBuilder.create().setMaxConnTotal(100).setMaxConnPerRoute(5).build();
		factory.setHttpClient(httpClient);
		RestTemplate restTemplate = new RestTemplate(factory);

		// header
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<String> requestEntity = new HttpEntity<>(bodyString, headers);
		ResponseEntity<String> res = restTemplate.exchange(nodeURL, HttpMethod.POST, requestEntity, String.class);

		JSONParser parser = new JSONParser();
		return (JSONObject) parser.parse(res.getBody());
	}

	public JSONObject editObjFiles(MultipartHttpServletRequest request, String user, DTGeoserverManager dtGeoManager,
			String workspace, String datastore, JSONObject objFiles, JSONObject editObjJSON) throws Exception {

		// example
		// objFiles
// 		{
//		  "gis_osm_buildings_3052.2165":"C:/gdofiles/guest/edit/gis_osm_buildings_3052.2165.obj",
// 		}
		// editObjJSON
//	    {	
//		  "gis_osm_buildings_3052":[{
//			"featureId":"gis_osm_buildings_3052.2165",
//			"objPath":"20191212_172111/1/1.obj",	
//			"centerXedit":126.71496054348651,
//			"centerYedit":37.521413807577844, 	
//			"centerXtile":126.72189935,
//			"centerYtile":37.50048405,
//			"edit":"modify" or "delete" or "create" }]
//		}
		// return json
// 		{
//		  "gis_osm_buildings_3052":{
//				"succ":true,
//				"path":"C:/gdofiles/guest/upload/20200103_111444/3dtiles/tileset.json"
//			}
//		}

		// return json
		JSONObject resultJSON = new JSONObject();
		String serverURL = dtGeoManager.getRestURL();
		String uploadPath = basedrive + ":" + File.separator + basedir + File.separator + user + File.separator
				+ "upload";
		String editBasePath = basedrive + ":" + File.separator + basedir + File.separator + user + File.separator
				+ "edit";

		// API 요청 파라미터 생성
		String nodeURL = "http://" + nodeHost + ":" + nodePort + "/convert/editObjTo3dtiles";
		JSONParser jsonParser = new JSONParser();
		FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
		Iterator objIter = editObjJSON.keySet().iterator();
		while (objIter.hasNext()) {
			String layerId = (String) objIter.next();
			int downReNum = new GeneralMapExport(serverURL, workspace, layerId, editBasePath, "EPSG:4326").export();
			if (downReNum == 200) {
				// get shp collection
				String shpPath = editBasePath + File.separator + layerId + ".shp";
				// 레이어 별 결과 json 생성
				JSONObject reJSON = new JSONObject();
				// 최상위 tileset edit(dir 구조인 경우)
				boolean isDir = false;
				boolean isTilesetChaged = false;
				String tilesetPath = null;
				JSONObject tilesetObj = null;
				JSONObject root = null;
				JSONObject bv = null;
				JSONArray editRegionArr = null;

				// 편집 이력
				JSONArray editList = (JSONArray) editObjJSON.get(layerId);
				String timeStr = null;
				for (int i = 0; i < editList.size(); i++) {
					JSONObject editObj = (JSONObject) editList.get(i);
					String editkey = (String) editObj.get("edit");
					String featureId = (String) editObj.get("featureId");
					String objPath = (String) editObj.get("objPath");
					// 최상위 tileset 편집 여부 확인 (dir 구조인 경우)
					if (i == 0) {
						String[] pathArr = objPath.split("/");
						timeStr = pathArr[0];
						String tilesFolder = uploadPath + File.separator + timeStr + File.separator + "3dtiles";
						File tilesFolderFile = new File(tilesFolder);
						File[] folderList = tilesFolderFile.listFiles();
						for (int f = 0; f < folderList.length; f++) {
							if (folderList[f].isDirectory()) {
								isDir = true;
								tilesetPath = uploadPath + File.separator + timeStr + File.separator + "3dtiles"
										+ File.separator + "tileset.json";
								tilesetObj = (JSONObject) jsonParser.parse(new FileReader(tilesetPath));
								root = (JSONObject) tilesetObj.get("root");
								bv = (JSONObject) root.get("boundingVolume");
								editRegionArr = (JSONArray) bv.get("region");
							}
						}
					}

					// test
					editObj.get("mbrEdit");
					double editSouth = Math.toRadians(33.1205942); // 남 minY
					double editNorth = Math.toRadians(33.1205942); // 북 maxY
					double editEast = Math.toRadians(126.2669135); // 동 maxX
					double editWest = Math.toRadians(126.2667783); // 서 minX

					// 원본 obj read ex) objPath : "20191212_173635/obj/1.obj"
					String originObjPath = uploadPath + File.separator + objPath;
					Obj originObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(originObjPath)));

					// batch.json read
					String originBatchPath = originObjPath.replace(".obj", "batch.json");
					JSONObject batchObj = (JSONObject) jsonParser.parse(new FileReader(originBatchPath));

					// tile.json read
					String originTilePath = originObjPath.replace(".obj", "tile.json");
					JSONObject tileObj = (JSONObject) jsonParser.parse(new FileReader(originTilePath));

					// tile 영역 계산
					double originSouth = (double) tileObj.get("south");
					double originNorth = (double) tileObj.get("north");
					double originEast = (double) tileObj.get("east");
					double originWest = (double) tileObj.get("west");
					double originMaxHeight = (double) tileObj.get("maxHeight");
					// default minHeight = 0.0;

					// 편집 전 타일셋 영역을 편집 후 객체의 영역으로 갱신
					if (editSouth < originSouth) {
						tileObj.put("south", editSouth);
					}
					if (editNorth > originNorth) {
						tileObj.put("north", editSouth);
					}
					if (editEast > originEast) {
						tileObj.put("east", editEast);
					}
					if (editWest < originWest) {
						tileObj.put("west", editWest);
					}

					// 최상위 tileset 편집 전 타일셋 영역을 편집 후 객체의 영역으로 갱신 (dir 구조인 경우)
					if (isDir) {
						double west = (double) editRegionArr.get(0);
						double south = (double) editRegionArr.get(1);
						double east = (double) editRegionArr.get(2);
						double north = (double) editRegionArr.get(3);
						double minheight = (double) editRegionArr.get(4);
						if (editWest < west) {
							editRegionArr.add(0, editWest);
							isTilesetChaged = true;
						}
						if (editSouth < south) {
							editRegionArr.add(1, editSouth);
							isTilesetChaged = true;
						}
						if (editEast > east) {
							editRegionArr.add(2, editEast);
							isTilesetChaged = true;
						}
						if (editNorth > north) {
							editRegionArr.add(3, editNorth);
							isTilesetChaged = true;
						}
						editRegionArr.add(4, minheight);
					}

					// parse edit obj
					ObjParser parser = new ObjParser(originMaxHeight);
					// get geoserver 2d feature, get properties
					FeatureCollection<SimpleFeatureType, SimpleFeature> collection = getFeatureCollectionFromFileWithFilter(
							new File(shpPath), ff.id(Collections.singleton(ff.featureId(featureId))));
					FeatureIterator featureIter = collection.features();
					Feature feature = featureIter.next();
					// edit origin obj, 원본 obj 파일에 편집 이력 반영
					double centerXedit, centerYedit, centerXtile, centerYtile;
					Obj resultObj = null;
					if (editkey.equals("create")) {
						String editPath = (String) objFiles.get(featureId);
						Obj createObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(editPath)));
						centerXedit = (double) editObj.get("centerXedit");
						centerYedit = (double) editObj.get("centerYedit");
						centerXtile = (double) editObj.get("centerXtile");
						centerYtile = (double) editObj.get("centerYtile");
						resultObj = parser.combineObj(originObj, createObj, centerXedit, centerYedit, centerXtile,
								centerYtile);
						// set MaxHeight
						if (parser.getMaxHeight() > originMaxHeight) {
							tileObj.put("maxHeight", parser.getMaxHeight());
							if (isDir) {
								double maxheight = (double) editRegionArr.get(5);
								if (parser.getMaxHeight() > maxheight) {
									editRegionArr.add(5, maxheight);
									isTilesetChaged = true;
								}
							}
						}
						// batch에 feature id 추가
						JSONArray idProperties = (JSONArray) batchObj.get("featureId");
						idProperties.add(featureId);
						batchObj.put("featureId", idProperties);

						// batch에 feature id 제외한 속성 추가
						JSONObject tileProperties = (JSONObject) tileObj.get("properties");
						Iterator batchIter = batchObj.keySet().iterator();
						while (batchIter.hasNext()) {
							String batchKey = (String) batchIter.next();
							if (!batchKey.equals("featureId")) {
								// batch.json
								JSONArray batchProperty = (JSONArray) batchObj.get(batchKey);
								batchProperty.add(feature.getProperty(batchKey).getValue());
								batchObj.put(batchKey, batchProperty);
								// tile.json
								JSONObject tileProperty = (JSONObject) tileProperties.get(batchKey);
								tileProperty.put("minimum", Collections.max(batchProperty));
								tileProperty.put("maximum", Collections.min(batchProperty));
								tileObj.put("properties", tileProperties);
							}
						}
					} else if (editkey.equals("modify")) {
						String editPath = (String) objFiles.get(featureId);
						Obj modifyObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(editPath)));
						centerXedit = (double) editObj.get("centerXedit");
						centerYedit = (double) editObj.get("centerYedit");
						centerXtile = (double) editObj.get("centerXtile");
						centerYtile = (double) editObj.get("centerYtile");
						resultObj = parser.modifyObj(originObj, modifyObj, featureId, centerXedit, centerYedit,
								centerXtile, centerYtile);
						// set MaxHeight
						if (parser.getMaxHeight() > originMaxHeight) {
							tileObj.put("maxHeight", parser.getMaxHeight());
							if (isDir) {
								double maxheight = (double) editRegionArr.get(5);
								if (parser.getMaxHeight() > maxheight) {
									editRegionArr.add(5, maxheight);
									isTilesetChaged = true;
								}
							}
						}
						// batch에 feature id 찾아서
						JSONArray idProperties = (JSONArray) batchObj.get("featureId");
						int featureIdx = idProperties.indexOf(featureId);

						// batch에 feature id 제외한 속성 수정
						JSONObject tileProperties = (JSONObject) tileObj.get("properties");
						Iterator batchIter = batchObj.keySet().iterator();
						while (batchIter.hasNext()) {
							String batchKey = (String) batchIter.next();
							if (!batchKey.equals("featureId")) {
								// batch.json
								JSONArray batchProperty = (JSONArray) batchObj.get(batchKey);
								batchProperty.add(featureIdx, feature.getProperty(batchKey).getValue());
								batchObj.put(batchKey, batchProperty);
								// tile.json
								JSONObject tileProperty = (JSONObject) tileProperties.get(batchKey);
								tileProperty.put("minimum", Collections.max(batchProperty));
								tileProperty.put("maximum", Collections.min(batchProperty));
								tileObj.put("properties", tileProperties);
							}
						}
					} else if (editkey.equals("delete")) {
						resultObj = parser.deleteObj(originObj, featureId);
						// batch에 feature id 제거
						JSONArray idProperties = (JSONArray) batchObj.get("featureId");
						int featureIdx = idProperties.indexOf(featureId);
						idProperties.remove(featureIdx);
						batchObj.put("featureId", idProperties);
						// batch에 feature id 에 해당하는 속성 제거
						JSONObject tileProperties = (JSONObject) tileObj.get("properties");
						Iterator batchIter = batchObj.keySet().iterator();
						while (batchIter.hasNext()) {
							String batchKey = (String) batchIter.next();
							if (!batchKey.equals("featureId")) {
								// batch.json
								JSONArray batchProperty = (JSONArray) batchObj.get(batchKey);
								batchProperty.remove(featureIdx);
								batchObj.put(batchKey, batchProperty);
								// tile.json
								JSONObject tileProperty = (JSONObject) tileProperties.get(batchKey);
								tileProperty.put("minimum", Collections.max(batchProperty));
								tileProperty.put("maximum", Collections.min(batchProperty));
								tileObj.put("properties", tileProperties);
							}
						}
					}
					if (resultObj != null) {
						// write obj
						ObjWriter.write(resultObj, new FileOutputStream(originObjPath));
						// write batch.json
						try (FileWriter file = new FileWriter(originBatchPath)) {
							file.write(batchObj.toJSONString());
						}
						// write tile.json
						try (FileWriter file = new FileWriter(originTilePath)) {
							file.write(tileObj.toJSONString());
						}
						// write tileset.json
						if (isDir && isTilesetChaged) {
							bv.put("region", editRegionArr);
							root.put("boundingVolume", bv);
							tilesetObj.put("root", root);
							try (FileWriter file = new FileWriter(tilesetPath)) {
								file.write(tilesetObj.toJSONString());
							}
						}
						// 편집 obj 파일 -> 3d tiles로 변환
						// obj 압축
						String zipfile = "edit_obj.zip";
						String zipPath = new File(originObjPath).getParent() + File.separator + zipfile;
						List<File> zipFiles = new ArrayList<File>();
						zipFiles.add(new File(originObjPath));
						zipFiles.add(new File(originBatchPath));
						zipFiles.add(new File(originTilePath));
						createZipFile(zipFiles, zipPath);

						String downloadURL = "http://" + serverIP + ":" + serverPort + context + "/downloadObj.do" + "?"
								+ "user=" + user + "&time=" + timeStr + "&file=" + zipfile;
						// body
						JSONObject bodyJson = new JSONObject();
						bodyJson.put("user", user);
						bodyJson.put("time", timeStr);
						bodyJson.put("file", zipfile);
						bodyJson.put("path", downloadURL);
						bodyJson.put("originObjFolder", new File(originObjPath).getParent().replace("obj", "3dtiles")); // "objPath":"20191212_172111/obj/1
						String bodyString = bodyJson.toJSONString();

						// restTemplate
						HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
						factory.setReadTimeout(0);
						factory.setConnectTimeout(0);
						CloseableHttpClient httpClient = HttpClientBuilder.create().setMaxConnTotal(100)
								.setMaxConnPerRoute(5).build();
						factory.setHttpClient(httpClient);
						RestTemplate restTemplate = new RestTemplate(factory);

						// header
						HttpHeaders headers = new HttpHeaders();
						headers.setContentType(MediaType.APPLICATION_JSON);

						HttpEntity<String> requestEntity = new HttpEntity<>(bodyString, headers);
						ResponseEntity<String> res = restTemplate.exchange(nodeURL, HttpMethod.POST, requestEntity,
								String.class);
						Object obj = jsonParser.parse(res.getBody());
						reJSON = (JSONObject) obj;
					}
				}
				resultJSON.put(layerId, reJSON);
			}
		}
		File editDir = new File(editBasePath);
		deleteDirectory(editDir);
		return resultJSON;
	}

	public void createZipFile(List<File> files, String toPath) {

		try {
			ZipOutputStream zip_out = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(toPath), 2048));
			for (int i = 0; i < files.size(); i++) {
				File file = files.get(i);
				zip_folder(file.getAbsolutePath(), "", file, zip_out);
			}
			zip_out.close();
		} catch (FileNotFoundException e) {
			e.getMessage();
		} catch (IOException e) {
			e.getMessage();
		}
	}

	public void createZipFile(String path, String toPath) {

		File dir = new File(path);
		String[] list = dir.list();
		String _path;

		if (!dir.canRead() || !dir.canWrite())
			return;

		int len = list.length;

		if (path.charAt(path.length() - 1) != '/')
			_path = path + "/";
		else
			_path = path;

		try {
			ZipOutputStream zip_out = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(toPath), 2048));
			for (int i = 0; i < len; i++)
				zip_folder(path, "", new File(_path + list[i]), zip_out);
			zip_out.close();
		} catch (FileNotFoundException e) {
			e.getMessage();
		} catch (IOException e) {
			e.getMessage();
		} finally {

		}
	}

	private void zip_folder(String ZIP_FROM_PATH, String parent, File file, ZipOutputStream zout) throws IOException {

		byte[] data = new byte[2048];
		int read;

		if (file.isFile()) {
			ZipEntry entry = new ZipEntry(parent + file.getName());

			zout.putNextEntry(entry);
			BufferedInputStream instream = new BufferedInputStream(new FileInputStream(file));

			while ((read = instream.read(data, 0, 2048)) != -1)
				zout.write(data, 0, read);

			zout.flush();
			zout.closeEntry();
			instream.close();
		} else if (file.isDirectory()) {
			String parentString = file.getPath().replace(ZIP_FROM_PATH, "");
			parentString = parentString.substring(0, parentString.length() - file.getName().length());
			ZipEntry entry = new ZipEntry(parentString + file.getName() + "/");

			zout.putNextEntry(entry);

			String[] list = file.list();
			if (list != null) {
				int len = list.length;
				for (int i = 0; i < len; i++) {
					zip_folder(ZIP_FROM_PATH, entry.getName(), new File(file.getPath() + "/" + list[i]), zout);
				}
			}
		}

	}

	private void deleteDirectory(File dir) {

		if (dir.exists()) {
			File[] files = dir.listFiles();
			for (File file : files) {
				if (file.isDirectory()) {
					deleteDirectory(file);
				} else {
					file.delete();
				}
			}
		}
		dir.delete();
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
}
