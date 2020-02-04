package com.gitrnd.qaproducer.edit3d.service;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
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
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.commons.codec.binary.Base64;
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
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.PropertyDescriptor;
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

import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.gdsbuilder.geoserver.converter.type.GeneralMapExport;
import com.gitrnd.gdsbuilder.parse.impl.ObjParser;
import com.gitrnd.gdsbuilder.parse.impl.test.DefaultObjFace;
import com.gitrnd.gdsbuilder.parse.impl.test.ObjReader;

import de.javagl.obj.FloatTuple;
import de.javagl.obj.Obj;
import de.javagl.obj.ObjFace;
import de.javagl.obj.ObjGroup;
import de.javagl.obj.ObjUtils;
import de.javagl.obj.ObjWriter;
import de.javagl.obj.Objs;
import net.sf.json.JSON;

@Service
@PropertySources({ @PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true),
		@PropertySource(value = "file:./application.yml", ignoreResourceNotFound = true) })
public class Edit3dService {

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

	@Value("${gitrnd.apache.host}")
	private String apacheHost;

	@Value("${gitrnd.apache.port}")
	private String apachePort;

	@Value("${gitrnd.apache.basedrive}")
	private String apachBasedrive;

	@Value("${gitrnd.apache.basedir}")
	private String apacheBasedir;

	public JSONObject convertObjToGltf(String user, String objPath, double centerXtile, double centerYtile,
			String featureId, double centerXedit, double centerYedit) throws ParseException, IOException {

		// 원본 obj read "20191212_173635/obj/1.obj"
		String originPath = apachBasedrive + ":" + File.separator + apacheBasedir + File.separator + user
				+ File.separator + "upload" + File.separator + objPath;

		File originFile = new File(originPath);
		String fileDir = originFile.getAbsoluteFile().getParent();

		InputStream inputStream = new FileInputStream(originPath);
		Obj originObj = ObjUtils.convertToRenderable(ObjReader.read(inputStream));

		ObjParser objParser = new ObjParser();
		Obj groupObj = objParser.groupToObj(originObj, featureId, centerXedit, centerYedit, centerXtile, centerYtile);

		String mtlPath = null;
		String image = null;
		List<String> mtls = groupObj.getMtlFileNames();
		for (String mtl : mtls) {
			mtlPath = originFile.getParent() + File.separator + mtl;
			try {
				// 파일 객체 생성
				File mtlfile = new File(mtlPath);
				// 입력 스트림 생성
				FileReader filereader = new FileReader(mtlfile);
				// 입력 버퍼 생성
				BufferedReader bufReader = new BufferedReader(filereader);
				String line = "";

				while ((line = bufReader.readLine()) != null) {
					if (line.contains("map_Kd ")) {
						image = line.replace("\t", "");
						image = image.replace(" ", "");
						image = originFile.getParent() + File.separator + image.replace("map_Kd", "");
					}
				}
				// .readLine()은 끝에 개행문자를 읽지 않는다.
				bufReader.close();
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		String directory = originFile.getParent() + File.separator + "edit";
		createFileDirectory(directory);
		// Write an Mtl, Image file
		if (mtlPath != null && image != null) {
			File mtlFile = new File(mtlPath);
			InputStream mtlIs = new FileInputStream(mtlFile);
			OutputStream mtlOs = new FileOutputStream(directory + File.separator + mtlFile.getName());
			fileCopy(mtlIs, mtlOs);
			File imageFile = new File(image);
			InputStream imageIs = new FileInputStream(imageFile);
			OutputStream imageOs = new FileOutputStream(directory + File.separator + imageFile.getName());
			fileCopy(imageIs, imageOs);
		}
		// Write an OBJ file
		OutputStream objOutputStream = null;
		String fileName = featureId + ".obj";
		String newObjpath = directory + File.separator + fileName;
		try {
			objOutputStream = new FileOutputStream(newObjpath);
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			ObjWriter.write(groupObj, objOutputStream);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		objOutputStream.close();

		String[] splitArr = objPath.split("/");
		String timeStr = splitArr[0];

		// 파일 폴더 압축
		String zipfile = timeStr + "_obj.zip";
		String zipPath = originFile.getParent() + File.separator + zipfile; // zip 파일 이름
		createZipFile(directory, zipPath);

		// web path
		String webPath = "http://" + serverIP + ":" + serverPort + context + "/downloadObj.do" + "?" + "user=" + user
				+ "&time=" + timeStr + "&file=" + zipfile;

		// obj to gltf
		// API 요청 파라미터 생성
		String nodeURL = "http://" + nodeHost + ":" + nodePort + "/convert/objTogltf"; // 압축폴더 업로드 경로

		// body
		JSONObject bodyJson = new JSONObject();
		bodyJson.put("user", user);
		bodyJson.put("time", timeStr);
		bodyJson.put("path", webPath);
		bodyJson.put("file", zipfile);
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

		JSONParser jsonParser = new JSONParser();
		JSONObject returnJson = (JSONObject) jsonParser.parse(res.getBody());

		// 다 처리하고 zip 삭제
		File zipFile = new File(zipPath);
		if (zipFile.exists()) {
			zipFile.delete();
		}
		// edit 폴더 삭제
		deleteDirectory(new File(directory));

		return returnJson;
	}

	@SuppressWarnings("unchecked")
	public JSONObject editObjFiles(DTGeoserverManager dtGeoserverManager, String workspace, String datastore,
			String layerId, String user, JSONObject editObjJSON) throws Exception {

		String tilesetPath = (String) editObjJSON.get("tileset");

		String[] tilesetSplit = tilesetPath.split("/");
		String timeStr = tilesetSplit[5];

		String tilesetLocalPath = tilesetPath.replace("http://", "")
				.replace(apacheHost + ":" + apachePort, apachBasedrive + ":" + File.separator + apacheBasedir)
				.replace("/", "\\");
		File tilesetFile = new File(tilesetLocalPath);

		String objBasePath = apachBasedrive + ":" + File.separator + apacheBasedir + File.separator + user
				+ File.separator + "upload" + File.separator + timeStr + File.separator + "obj";

		String editBasePath = apachBasedrive + ":" + File.separator + apacheBasedir + File.separator + user
				+ File.separator + "edit";
		String uploadPath = apachBasedrive + ":" + File.separator + apacheBasedir + File.separator + user
				+ File.separator + "upload";
		String serverURL = dtGeoserverManager.getRestURL();

		JSONParser jsonParser = new JSONParser();
		FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
		String nodeURL = "http://" + nodeHost + ":" + nodePort + "/convert/editObjTo3dtiles";
		JSONObject resultJSON = new JSONObject();
		resultJSON.put(layerId, tilesetPath);

		int downReNum = new GeneralMapExport(serverURL, workspace, layerId, editBasePath, "EPSG:4326").export();
		if (downReNum == 200) {
			// get shp collection
			String shpPath = editBasePath + File.separator + layerId + ".shp";
			String totalFeautresStr = null;

			// editkey
			if (editObjJSON.get("created") != null) {

				JSONObject createResult = new JSONObject();
				JSONObject createdFeatureObj = (JSONObject) editObjJSON.get("created");
				totalFeautresStr = editObjJSON.get("totalFeatures").toString();
				int feautreCount = Integer.valueOf(totalFeautresStr);

				File tilesetParent = tilesetFile.getParentFile();
				int dirnum = 0;
				File[] filelist = tilesetParent.listFiles();
				for (File file : filelist) {
					if (file.isDirectory()) {
						dirnum++;
					}
				}

				Iterator featureIter = createdFeatureObj.keySet().iterator();
				while (featureIter.hasNext()) {

					if (dirnum == 0) {
						// 폴더 생성
						dirnum++;
						String originFilePath = tilesetParent + File.separator + dirnum;
						File originFolder = new File(originFilePath);
						originFolder.mkdir();
						for (File file : filelist) {
							if (!file.isDirectory()) {
								File fileToMove = new File(originFilePath + File.separator + file.getName());
								file.renameTo(fileToMove);
							}
						}
					}
					dirnum++;
					String createPath = tilesetParent + File.separator + dirnum;
					File createFolder = new File(createPath);
					createFolder.mkdir();

					String featureId = (String) featureIter.next(); // "TN_BULD_TEST.2796"
					JSONObject editInfo = (JSONObject) createdFeatureObj.get(featureId);

					// geoserver feature 조회
					feautreCount = feautreCount + 1;
					featureId = layerId + "." + feautreCount;

					FeatureCollection<SimpleFeatureType, SimpleFeature> collection = getFeatureCollectionFromFileWithFilter(
							new File(shpPath), ff.id(Collections.singleton(ff.featureId(featureId))));
					FeatureIterator<SimpleFeature> fcIter = collection.features();
					SimpleFeature feature = fcIter.next();

					// mbr
					JSONArray mbrArr = (JSONArray) editInfo.get("mbr");
					double minX = (double) mbrArr.get(0);
					double minY = (double) mbrArr.get(1);
					double maxX = (double) mbrArr.get(2);
					double maxY = (double) mbrArr.get(3);

					// model center
					JSONArray modelCenterArr = (JSONArray) editInfo.get("modelCenter");
					double modelX = (double) modelCenterArr.get(0);
					double modelY = (double) modelCenterArr.get(1);

					// write edit obj file
					String editObjStr = (String) editInfo.get("obj");
					String editObjPath = editBasePath + File.separator + featureId + ".obj";
					File editObjFile = new File(editObjPath);
					FileOutputStream outputStream = new FileOutputStream(editObjFile);
					byte[] strToBytes = editObjStr.getBytes();
					outputStream.write(strToBytes);
					outputStream.close();

					// write edit texture file
					String editTextureStr = (String) editInfo.get("texture");
					String editTexturePath = null;
					if (!editTextureStr.equals("notset")) {
						editTexturePath = objBasePath + File.separator + featureId + ".jpg";
						String data = editTextureStr.split(",")[1];
						BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(editTexturePath));
						bos.write(Base64.decodeBase64(data));
						bos.close();

						String mtl = "newmtl " + featureId + "\n";
						mtl += "Ka 0.5 0.5 0.5" + "\n";
						mtl += "Kd 1 1 1" + "\n";
						mtl += "Ks 0.5 0.5 0.5" + "\n";
						mtl += "illum 2" + "\n";
						mtl += featureId + ".jpg" + "\n";
						File file = new File(objBasePath + File.separator + featureId + ".mtl");
						FileWriter writer = null;
						writer = new FileWriter(file, false);
						writer.write(mtl);
						writer.flush();
						if (writer != null)
							writer.close();
					}

					// batch table file 생성
					JSONObject batchTable = new JSONObject();
					// featgureId
					JSONArray featureIdArr = new JSONArray();
					featureIdArr.add(featureId);
					batchTable.put("featureId", featureIdArr);
					// attribute
					Collection<PropertyDescriptor> properties = collection.getSchema().getDescriptors();
					for (PropertyDescriptor property : properties) {
						String name = property.getName().toString();
						String type = property.getType().getBinding().getSimpleName();
						if (type.equals("Double") || type.equals("Integer") || type.equals("Long")) {
							JSONArray propertiesArr = new JSONArray();
							propertiesArr.add(feature.getAttribute(name));
							batchTable.put(name, propertiesArr);
						}
					}

					// create obj 생성
					Obj createObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(editObjPath)));

					Obj resultObj = Objs.create();
					ObjGroup group = createObj.getGroup(0);
					// face
					int numFaces = group.getNumFaces();
					for (int n = 0; n < numFaces; n++) {
						ObjFace face = group.getFace(n);
						List<String> groupnames = new ArrayList<>();
						groupnames.add(featureId);
						resultObj.setActiveGroupNames(groupnames);

						if (!editTextureStr.equals("notset")) {
							List<String> mtlNames = new ArrayList<>();
							mtlNames.add(featureId + ".mtl");
							resultObj.setMtlFileNames(mtlNames);
							resultObj.setActiveMaterialGroupName(featureId);
						}
						List<Integer> vertexIndices = new ArrayList<>();
						List<Integer> texCoordIndices = new ArrayList<>();
						List<Integer> normalIndices = new ArrayList<>();
						int numVertices = face.getNumVertices();

						for (int v = 0; v < numVertices; v++) {
							int vertexIdx = face.getVertexIndex(v);
							int texCoordIdx = face.getTexCoordIndex(v);
							int normalIdx = face.getNormalIndex(v);

							FloatTuple vertex = createObj.getVertex(vertexIdx);
							resultObj.addVertex(vertex);
							resultObj.addTexCoord(createObj.getTexCoord(texCoordIdx));
							resultObj.addNormal(createObj.getNormal(normalIdx));

							vertexIndices.add(resultObj.getNumVertices() - 1);
							texCoordIndices.add(resultObj.getNumTexCoords() - 1);
							normalIndices.add(resultObj.getNumNormals() - 1);
						}
						DefaultObjFace newFace = new DefaultObjFace(vertexIndices.stream().mapToInt(i -> i).toArray(),
								texCoordIndices.stream().mapToInt(i -> i).toArray(),
								normalIndices.stream().mapToInt(i -> i).toArray());
						resultObj.addFace(newFace);
					}

					double maxHeight = 0;
					int vnum = resultObj.getNumVertices();
					for (int v = 0; v < vnum; v++) {
						double z = resultObj.getVertex(v).getZ();
						if (maxHeight < z) {
							maxHeight = z;
						}
					}

					// tileset option 생성
					JSONObject tileOption = new JSONObject();
					tileOption.put("longitude", Math.toRadians(modelX));
					tileOption.put("latitude", Math.toRadians(modelY));
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

					// tile propertiles 입력
					JSONObject tilesPropeties = new JSONObject();
					Iterator batchIter = batchTable.keySet().iterator();
					while (batchIter.hasNext()) {
						String batchKey = (String) batchIter.next();
						JSONArray propertiesArr = (JSONArray) batchTable.get(batchKey);
						JSONObject minmaxObj = new JSONObject();
						minmaxObj.put("minimum", Collections.max(propertiesArr));
						minmaxObj.put("maximum", Collections.min(propertiesArr));
						tilesPropeties.put(batchKey, minmaxObj);
					}
					tileOption.put("properties", tilesPropeties);

					// write obj
					String originObjPath = objBasePath + File.separator + featureId + ".obj";
					ObjWriter.write(resultObj, new FileOutputStream(originObjPath));
					// write batch.json
					String originBatchPath = objBasePath + File.separator + featureId + "batch.json";
					try (FileWriter file = new FileWriter(originBatchPath)) {
						file.write(batchTable.toJSONString());
					}
					// write tile.json
					String originTilePath = objBasePath + File.separator + featureId + "tile.json";
					try (FileWriter file = new FileWriter(originTilePath)) {
						file.write(tileOption.toJSONString());
					}

					// 편집 obj 파일 -> 3d tiles로 변환
					// obj 압축
					String zipfile = "edit_obj.zip";
					String zipPath = new File(objBasePath) + File.separator + zipfile;
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
					JSONObject reJSON = (JSONObject) obj;

					if ((boolean) reJSON.get("succ") == true) {
						File[] createFilelist = tilesetParent.listFiles();
						for (File file : createFilelist) {
							if (!file.isDirectory()) {
								File fileToMove = new File(createPath + File.separator + file.getName());
								file.renameTo(fileToMove);
							}
						}

						String combinezipfile = "combine.zip";
						String combinezipPath = tilesetParent.getPath() + File.separator + combinezipfile;
						createZipFile(tilesetParent.getPath(), combinezipPath);

						String downloadUrl = "http://" + serverIP + ":" + serverPort + context + "/download3dtiles.do"
								+ "?" + "user=" + user + "&time=" + timeStr + "&file=" + combinezipfile;
						String combineNodeUrl = "http://" + nodeHost + ":" + nodePort + "/convert/combineTileset";

						// body
						JSONObject combinebodyJson = new JSONObject();
						combinebodyJson.put("user", user);
						combinebodyJson.put("time", timeStr);
						combinebodyJson.put("file", combinezipfile);
						combinebodyJson.put("path", downloadUrl);
						combinebodyJson.put("originObjFolder",
								new File(originObjPath).getParent().replace("obj", "3dtiles")); // "objPath":"20191212_172111/obj/1
						String combinebodyString = combinebodyJson.toJSONString();

						HttpEntity<String> combinerequestEntity = new HttpEntity<>(combinebodyString, headers);
						ResponseEntity<String> combineres = restTemplate.exchange(combineNodeUrl, HttpMethod.POST,
								combinerequestEntity, String.class);
						Object combineobj = jsonParser.parse(combineres.getBody());
						JSONObject combinreeJSON = (JSONObject) combineobj;
						if ((boolean) combinreeJSON.get("succ")) {
							createResult.put(featureId, "success");
						}
						new File(combinezipPath).delete();
					}
				}
				resultJSON.put("created", createResult);
			}
			if (editObjJSON.get("modified") != null) {

				JSONObject modifiedResult = new JSONObject();

				JSONObject modifiedFeatureObj = (JSONObject) editObjJSON.get("modified");
				totalFeautresStr = editObjJSON.get("totalFeatures").toString();

				Iterator featureIter = modifiedFeatureObj.keySet().iterator();
				while (featureIter.hasNext()) {

					String featureId = (String) featureIter.next(); // "TN_BULD_TEST.2796"
					JSONObject editInfo = (JSONObject) modifiedFeatureObj.get(featureId);

					// mbr
					JSONArray mbrArr = (JSONArray) editInfo.get("mbr");
					double minX = (double) mbrArr.get(0);
					double minY = (double) mbrArr.get(1);
					double maxX = (double) mbrArr.get(2);
					double maxY = (double) mbrArr.get(3);

					// model center
					JSONArray modelCenterArr = (JSONArray) editInfo.get("modelCenter");
					double modelX = (double) modelCenterArr.get(0);
					double modelY = (double) modelCenterArr.get(1);

					// write edit obj file
					String editObjStr = (String) editInfo.get("obj");
					String editObjPath = editBasePath + File.separator + featureId + ".obj";
					File editObjFile = new File(editObjPath);
					FileOutputStream outputStream = new FileOutputStream(editObjFile);
					byte[] strToBytes = editObjStr.getBytes();
					outputStream.write(strToBytes);
					outputStream.close();

					// write edit text file
					String editTextureStr = (String) editInfo.get("texture");
					String editTexturePath = null;
					if (!editTextureStr.equals("notset")) {
						editTexturePath = editBasePath + File.separator + featureId + ".jpg";
						String data = editTextureStr.split(",")[1];
						BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(editTexturePath));
						bos.write(Base64.decodeBase64(data));
						bos.close();
					}

					// obj path param
					String objPath = (String) editInfo.get("objPath"); // "20191212_173635/obj/1.obj"

					// tile center param
					JSONArray tileCenterArr = (JSONArray) editInfo.get("tileCenter");
					double tileX = (double) tileCenterArr.get(0);
					double tileY = (double) tileCenterArr.get(1);

					// 최상위 tileset edit(dir 구조인 경우)
					boolean isDir = false;
					boolean isTilesetChaged = false;
					JSONObject tilesetObj = null;
					JSONObject root = null;
					JSONObject boundingVolume = null;
					JSONArray editRegionArr = null;

					File tilesFolderFile = new File(tilesetLocalPath).getParentFile();
					File[] folderList = tilesFolderFile.listFiles();
					for (int f = 0; f < folderList.length; f++) {
						if (folderList[f].isDirectory()) {
							isDir = true;
							tilesetObj = (JSONObject) jsonParser.parse(new FileReader(tilesetLocalPath));
							root = (JSONObject) tilesetObj.get("root");
							boundingVolume = (JSONObject) root.get("boundingVolume");
							editRegionArr = (JSONArray) boundingVolume.get("region");
						}
					}

					// 원본 obj read
					String originObjPath = uploadPath + File.separator + objPath;
					Obj originObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(originObjPath)));
					// 원본 batch.json read
					String originBatchPath = originObjPath.replace(".obj", "batch.json");
					JSONObject batchObj = (JSONObject) jsonParser.parse(new FileReader(originBatchPath));
					// 원본 tile.json read
					String originTilePath = originObjPath.replace(".obj", "tile.json");
					JSONObject tileObj = (JSONObject) jsonParser.parse(new FileReader(originTilePath));

					// 원본 타일셋 영역
					double originSouth = (double) tileObj.get("south");
					double originNorth = (double) tileObj.get("north");
					double originEast = (double) tileObj.get("east");
					double originWest = (double) tileObj.get("west");
					double originMaxHeight = (double) tileObj.get("maxHeight");

					// 편집 전 타일셋 영역을 편집 후 객체의 영역으로 갱신
					double minXRaidan = Math.toRadians(minX);
					double minYRaidan = Math.toRadians(minY);
					double maxXRaidan = Math.toRadians(maxX);
					double maxYRaidan = Math.toRadians(maxY);

					if (minYRaidan < originSouth) {
						tileObj.put("south", minYRaidan);
					}
					if (maxYRaidan > originNorth) {
						tileObj.put("north", maxYRaidan);
					}
					if (maxXRaidan > originEast) {
						tileObj.put("east", maxXRaidan);
					}
					if (minXRaidan < originWest) {
						tileObj.put("west", minXRaidan);
					}

					// 최상위 tileset 편집 전 타일셋 영역을 편집 후 객체의 영역으로 갱신 (dir 구조인 경우)
					if (isDir) {
						double west = (double) editRegionArr.get(0);
						double south = (double) editRegionArr.get(1);
						double east = (double) editRegionArr.get(2);
						double north = (double) editRegionArr.get(3);
						double minheight = (double) editRegionArr.get(4);

						if (minXRaidan < west) {
							editRegionArr.add(0, minXRaidan);
							isTilesetChaged = true;
						}
						if (minYRaidan < south) {
							editRegionArr.add(1, minYRaidan);
							isTilesetChaged = true;
						}
						if (maxXRaidan > east) {
							editRegionArr.add(2, maxXRaidan);
							isTilesetChaged = true;
						}
						if (maxYRaidan > north) {
							editRegionArr.add(3, maxYRaidan);
							isTilesetChaged = true;
						}
						editRegionArr.add(4, minheight);
					}
					// parse edit obj
					ObjParser parser = new ObjParser(originMaxHeight);
					FeatureCollection<SimpleFeatureType, SimpleFeature> collection = getFeatureCollectionFromFileWithFilter(
							new File(shpPath), ff.id(Collections.singleton(ff.featureId(featureId))));
					FeatureIterator<SimpleFeature> fcIter = collection.features();
					SimpleFeature feature = fcIter.next();

					Obj modifyObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(editObjPath)));
					Obj resultObj = parser.modifyObj(originObj, modifyObj, featureId, modelX, modelY, tileX, tileY);
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
							batchProperty.set(featureIdx, feature.getProperty(batchKey).getValue());
							batchObj.put(batchKey, batchProperty);
							// tile.json
							JSONObject tileProperty = (JSONObject) tileProperties.get(batchKey);
							tileProperty.put("minimum", Collections.max(batchProperty));
							tileProperty.put("maximum", Collections.min(batchProperty));
							tileObj.put("properties", tileProperties);
						}
					}

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
						boundingVolume.put("region", editRegionArr);
						root.put("boundingVolume", boundingVolume);
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
					JSONObject reJSON = (JSONObject) obj;
					if ((boolean) reJSON.get("succ")) {
						modifiedResult.put(featureId, "success");
					}
				}
				resultJSON.put("modified", modifiedResult);
			}
			if (editObjJSON.get("deleted") != null) {

				JSONObject deletedResult = new JSONObject();

				JSONObject deletedFeatureObj = (JSONObject) editObjJSON.get("deleted");
				Iterator featureIter = deletedFeatureObj.keySet().iterator();
				while (featureIter.hasNext()) {

					String featureId = (String) featureIter.next(); // "TN_BULD_TEST.2796"
					JSONObject editInfo = (JSONObject) deletedFeatureObj.get(featureId);

					// mbr
					JSONArray mbrArr = (JSONArray) editInfo.get("mbr");
					double minX = (double) mbrArr.get(0);
					double minY = (double) mbrArr.get(1);
					double maxX = (double) mbrArr.get(2);
					double maxY = (double) mbrArr.get(3);

					// write edit obj file
					String editObjStr = (String) editInfo.get("obj");
					String editObjPath = editBasePath + File.separator + featureId + ".obj";
					File editObjFile = new File(editObjPath);
					FileOutputStream outputStream = new FileOutputStream(editObjFile);
					byte[] strToBytes = editObjStr.getBytes();
					outputStream.write(strToBytes);
					outputStream.close();

					// write edit text file
					String editTextureStr = (String) editInfo.get("texture");
					String editTexturePath = null;
					if (!editTextureStr.equals("notset")) {
						editTexturePath = editBasePath + File.separator + featureId + ".jpg";
						String data = editTextureStr.split(",")[1];
						BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(editTexturePath));
						bos.write(Base64.decodeBase64(data));
						bos.close();
					}

					// obj path param
					String objPath = (String) editInfo.get("objPath"); // "20191212_173635/obj/1.obj"

					// 최상위 tileset edit(dir 구조인 경우)
					boolean isDir = false;
					boolean isTilesetChaged = false;
					JSONObject tilesetObj = null;
					JSONObject root = null;
					JSONObject boundingVolume = null;
					JSONArray editRegionArr = null;

					File tilesFolderFile = new File(tilesetLocalPath).getParentFile();
					File[] folderList = tilesFolderFile.listFiles();
					for (int f = 0; f < folderList.length; f++) {
						if (folderList[f].isDirectory()) {
							isDir = true;
							tilesetObj = (JSONObject) jsonParser.parse(new FileReader(tilesetLocalPath));
							root = (JSONObject) tilesetObj.get("root");
							boundingVolume = (JSONObject) root.get("boundingVolume");
							editRegionArr = (JSONArray) boundingVolume.get("region");
						}
					}

					// 원본 obj read
					String originObjPath = uploadPath + File.separator + objPath;
					Obj originObj = ObjUtils.convertToRenderable(ObjReader.read(new FileInputStream(originObjPath)));
					// 원본 batch.json read
					String originBatchPath = originObjPath.replace(".obj", "batch.json");
					JSONObject batchObj = (JSONObject) jsonParser.parse(new FileReader(originBatchPath));
					// 원본 tile.json read
					String originTilePath = originObjPath.replace(".obj", "tile.json");
					JSONObject tileObj = (JSONObject) jsonParser.parse(new FileReader(originTilePath));

					// 원본 타일셋 영역
					double originSouth = (double) tileObj.get("south");
					double originNorth = (double) tileObj.get("north");
					double originEast = (double) tileObj.get("east");
					double originWest = (double) tileObj.get("west");
					double originMaxHeight = (double) tileObj.get("maxHeight");

					// 편집 전 타일셋 영역을 편집 후 객체의 영역으로 갱신
					double minXRaidan = Math.toRadians(minX);
					double minYRaidan = Math.toRadians(minY);
					double maxXRaidan = Math.toRadians(maxX);
					double maxYRaidan = Math.toRadians(maxY);

					if (minYRaidan < originSouth) {
						tileObj.put("south", minYRaidan);
					}
					if (maxYRaidan > originNorth) {
						tileObj.put("north", maxYRaidan);
					}
					if (maxXRaidan > originEast) {
						tileObj.put("east", maxXRaidan);
					}
					if (minXRaidan < originWest) {
						tileObj.put("west", minXRaidan);
					}

					// 최상위 tileset 편집 전 타일셋 영역을 편집 후 객체의 영역으로 갱신 (dir 구조인 경우)
					if (isDir) {
						double west = (double) editRegionArr.get(0);
						double south = (double) editRegionArr.get(1);
						double east = (double) editRegionArr.get(2);
						double north = (double) editRegionArr.get(3);
						double minheight = (double) editRegionArr.get(4);

						if (minXRaidan < west) {
							editRegionArr.add(0, minXRaidan);
							isTilesetChaged = true;
						}
						if (minYRaidan < south) {
							editRegionArr.add(1, minYRaidan);
							isTilesetChaged = true;
						}
						if (maxXRaidan > east) {
							editRegionArr.add(2, maxXRaidan);
							isTilesetChaged = true;
						}
						if (maxYRaidan > north) {
							editRegionArr.add(3, maxYRaidan);
							isTilesetChaged = true;
						}
						editRegionArr.add(4, minheight);
					}
					// parse edit obj
					ObjParser parser = new ObjParser(originMaxHeight);
					Obj resultObj = parser.deleteObj(originObj, featureId);
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
						boundingVolume.put("region", editRegionArr);
						root.put("boundingVolume", boundingVolume);
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
					JSONObject reJSON = (JSONObject) obj;

					if ((boolean) reJSON.get("succ")) {
						deletedResult.put(featureId, "success");
					}
				}
				resultJSON.put("deleted", deletedResult);
			}
		}
		return resultJSON;
	}

	public void createZipPathFile(String path, String toPath) {

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

	private void createFileDirectory(String directory) {
		File file = new File(directory);
		if (!file.exists()) {
			file.mkdirs();
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

	private void fileCopy(InputStream is, OutputStream os) {
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
