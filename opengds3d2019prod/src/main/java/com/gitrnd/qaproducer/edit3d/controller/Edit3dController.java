package com.gitrnd.qaproducer.edit3d.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.controller.AbstractController;
import com.gitrnd.qaproducer.edit3d.service.Edit3dService;
import com.gitrnd.qaproducer.file.service.UploadService;

@Controller
public class Edit3dController extends AbstractController {

	@Autowired
	Edit3dService edit3dSevice;

	@Autowired
	UploadService uploadService;

	private static final Logger LOGGER = LoggerFactory.getLogger(Edit3dController.class);

	@RequestMapping(value = "/objToGltf.ajax", method = RequestMethod.GET)
	@ResponseBody
	public JSONObject convertObjToGltf(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("params") JSONObject params, @AuthenticationPrincipal LoginUser loginUser)
			throws IOException, ParseException {

//		@return {"path":"175.116.181.32:8888/guest/upload/20191213_185342/gltf/featureId.gltf", "succ": true}

		String objPath = (String) params.get("objPath");
		JSONArray objCenterArr = (JSONArray) params.get("objCenter");
		String featureId = (String) params.get("featureId");
		JSONArray featureCenterArr = (JSONArray) params.get("featureCenter");

		double centerXtile = (double) objCenterArr.get(0);
		double centerYtile = (double) objCenterArr.get(1);
		double centerXedit = (double) featureCenterArr.get(0);
		double centerYedit = (double) featureCenterArr.get(1);

		return edit3dSevice.convertObjToGltf(loginUser.getUsername(), objPath, centerXtile, centerYtile, featureId,
				centerXedit, centerYedit);

	}

	@RequestMapping(value = "/edit3dLayers.do", method = RequestMethod.GET)
	@ResponseBody
	public JSONObject editSingleObj(MultipartHttpServletRequest request, HttpServletResponse response,
			@RequestParam("editInfo") JSONObject editInfo, @AuthenticationPrincipal LoginUser loginUser)
			throws Exception {

//			{
//			  "geoserver": {
//			    "serverName": "geo32",
//			    "workspace": "node",
//			    "datastore": "nodetest"
//			  },
//			  "layer": {
//			    "gis_osm_buildings_3052": [
//			      {
//			        "featureId": "gis_osm_buildings_3052.2165",
//			        "objPath": "20191212_172111/1/1.obj",
//			        "centerXedit": 126.71496054348651,
//			        "centerYedit": 37.521413807577844,
//			        "centerXtile": 126.72189935,
//			        "centerYtile": 37.50048405,
//			        "edit": "modify" or "delete" or "create"
//			      }
//			    ]
//			  }
//			}

		// geoserver 2d layer shp 파일 조회
		JSONObject geoserverInfo = (JSONObject) editInfo.get("geoserver");
		String serverName = (String) geoserverInfo.get("serverName");
		DTGeoserverManager dtGeoserverManager = super.getGeoserverManagerToSession(request, loginUser, serverName);
		String workspace = (String) geoserverInfo.get("workspace");
		String datastore = (String) geoserverInfo.get("datastore");

		// edit obj 파일 아파치 경로 저장, 저장경로 return
		JSONObject objFiles = uploadService.saveObjFiles(request, loginUser.getFname());
		JSONObject layerInfo = (JSONObject) editInfo.get("layer");

		return edit3dSevice.editObjFiles(request, loginUser.getFname(), dtGeoserverManager, workspace, datastore,
				objFiles, layerInfo);
	}
}
