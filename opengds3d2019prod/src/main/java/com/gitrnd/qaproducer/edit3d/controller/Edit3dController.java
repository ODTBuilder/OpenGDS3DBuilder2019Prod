package com.gitrnd.qaproducer.edit3d.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.controller.AbstractController;
import com.gitrnd.qaproducer.edit3d.service.Edit3dService;

@Controller
public class Edit3dController extends AbstractController {

	@Autowired
	Edit3dService edit3dSevice;

	private static final Logger LOGGER = LoggerFactory.getLogger(Edit3dController.class);

	@RequestMapping(value = "/objToGltf.do", method = RequestMethod.GET)
	public JSONObject convertObjToGltf(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("featureId") String featureId, @RequestParam("objPath") String objPath,
			@AuthenticationPrincipal LoginUser loginUser) throws IOException, ParseException {

//		@param featureId 편집 객체 id 
//		@param objPath 원본 obj 파일 경로
//		@reature {"path":"175.116.181.32:8888/guest/upload/20191213_185342/gltf/featureId.gltf", "succ": true}
		
		return edit3dSevice.convertObjToGltf(featureId, loginUser.getFname(), objPath);

	}
}
