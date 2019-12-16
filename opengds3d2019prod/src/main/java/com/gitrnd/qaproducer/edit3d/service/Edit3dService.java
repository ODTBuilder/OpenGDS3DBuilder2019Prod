package com.gitrnd.qaproducer.edit3d.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
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

}
