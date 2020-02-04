package com.gitrnd.qaproducer.edit3d.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

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

	@RequestMapping(value = "/objToGltf.ajax", method = RequestMethod.POST)
	@ResponseBody
	public JSONObject convertObjToGltf(HttpServletRequest request, HttpServletResponse response,
			@RequestBody JSONObject params, @AuthenticationPrincipal LoginUser loginUser)
			throws IOException, ParseException {

		String objPath = (String) params.get("objPath");
		List objCenterArr = (ArrayList) params.get("objCenter");
		String featureId = (String) params.get("featureId");
		List featureCenterArr = (ArrayList) params.get("featureCenter");

		double centerXtile = (double) objCenterArr.get(0);
		double centerYtile = (double) objCenterArr.get(1);
		double centerXedit = (double) featureCenterArr.get(0);
		double centerYedit = (double) featureCenterArr.get(1);

		return edit3dSevice.convertObjToGltf(loginUser.getUsername(), objPath, centerXtile, centerYtile, featureId,
				centerXedit, centerYedit);

	}

	@RequestMapping(value = "/edit3dLayers.do", method = RequestMethod.POST)
	@ResponseBody
	public JSONObject editSingleObj(HttpServletRequest request, HttpServletResponse response,
			@RequestBody String editInfo, @AuthenticationPrincipal LoginUser loginUser) throws Exception {

		JSONParser parser = new JSONParser();
		JSONObject editInfoObj = (JSONObject) parser.parse(editInfo);
		JSONObject resultJSON = new JSONObject();

		Iterator objIter = editInfoObj.keySet().iterator();
		while (objIter.hasNext()) {
			String geoInfo = (String) objIter.next(); // "geo42:testworkspace:testdatastore:TN_BULD_TEST"
			String[] infos = geoInfo.split(":");
			String geoserver = infos[0];
			String workspace = infos[1];
			String datastore = infos[2];
			String layer = infos[3];

			DTGeoserverManager dtGeoserverManager = super.getGeoserverManagerToSession(request, loginUser, geoserver);
			JSONObject layerResult = edit3dSevice.editObjFiles(dtGeoserverManager, workspace, datastore, layer,
					loginUser.getUsername(), (JSONObject) editInfoObj.get(geoInfo));
			resultJSON.put(layer, layerResult);
		}
		return resultJSON;
	}
}
