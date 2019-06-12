/**
 * 
 */
package com.gitrnd.qaproducer.geogig.controller;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gitrnd.gdsbuilder.geogig.type.GeogigDiff;
import com.gitrnd.gdsbuilder.geogig.type.GeogigLayerSimpleLog;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRemove;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.controller.AbstractController;
import com.gitrnd.qaproducer.geogig.service.GeogigLayerService;

/**
 * @author GIT
 *
 */
@Controller
@RequestMapping("/geogig")
public class GeogigLayerController extends AbstractController {

	@Autowired
	@Qualifier("layerService")
	GeogigLayerService layerService;

	@RequestMapping(value = "/logLayer.do", method = RequestMethod.POST)
	@ResponseBody
	public GeogigLayerSimpleLog logLayer(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser,
			@RequestParam(value = "serverName", required = false) String serverName,
			@RequestParam(value = "repoName", required = false) String repoName,
			@RequestParam(value = "path", required = false) String path,
			@RequestParam(value = "limit", required = false) String limit,
			@RequestParam(value = "until", required = false) String until) throws JAXBException {

		DTGeoserverManager geoserverManager = super.getGeoserverManagerToSession(request, loginUser, serverName);
		return layerService.logLayer(geoserverManager, repoName, path, limit, until);
	}

	@RequestMapping(value = "/diffLayer.do", method = RequestMethod.POST)
	@ResponseBody
	public GeogigDiff diffLayer(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser,
			@RequestParam(value = "serverName", required = false) String serverName,
			@RequestParam(value = "repoName", required = false) String repoName,
			@RequestParam(value = "newIndex", required = false) int newIndex,
			@RequestParam(value = "oldIndex", required = false) int oldIndex,
			@RequestParam(value = "layerName", required = false) String layerName) throws JAXBException {

		DTGeoserverManager geoserverManager = super.getGeoserverManagerToSession(request, loginUser, serverName);
		return layerService.diffLayer(geoserverManager, repoName, newIndex, oldIndex, layerName);
	}

	@RequestMapping(value = "/diffLayerById.do", method = RequestMethod.POST)
	@ResponseBody
	public GeogigDiff diffLayerById(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser,
			@RequestParam(value = "serverName", required = false) String serverName,
			@RequestParam(value = "repoName", required = false) String repoName,
			@RequestParam(value = "new", required = false) String newId,
			@RequestParam(value = "old", required = false) String oldId,
			@RequestParam(value = "layerName", required = false) String layerName) throws JAXBException {

		DTGeoserverManager geoserverManager = super.getGeoserverManagerToSession(request, loginUser, serverName);
		return layerService.diffLayerById(geoserverManager, repoName, newId, oldId, layerName);
	}

	@RequestMapping(value = "/removeLayer.do", method = RequestMethod.POST)
	@ResponseBody
	public GeogigRemove removeLayer(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser,
			@RequestParam(value = "serverName", required = false) String serverName,
			@RequestParam(value = "repoName", required = false) String repoName,
			@RequestParam(value = "transactionId", required = false) String transactionId,
			@RequestParam(value = "path", required = false) String path,
			@RequestParam(value = "recursive", required = false) boolean recursive) throws JAXBException {

		DTGeoserverManager geoserverManager = super.getGeoserverManagerToSession(request, loginUser, serverName);
		return layerService.removeLayer(geoserverManager, repoName, transactionId, path, recursive);
	}
}
