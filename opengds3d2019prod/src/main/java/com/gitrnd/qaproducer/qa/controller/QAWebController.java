/**
 * 
 */
package com.gitrnd.qaproducer.qa.controller;

import javax.servlet.http.HttpServletRequest;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.qaproducer.common.exception.ValidationAuthException;
import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.controller.AbstractController;
import com.gitrnd.qaproducer.preset.domain.Preset;
import com.gitrnd.qaproducer.preset.service.PresetService;
import com.gitrnd.qaproducer.qa.service.QAWebService;

/**
 * Geoserver 검수 요청 Controller
 * 
 * @author DY.Oh
 *
 */
@Controller
@RequestMapping("/web")
public class QAWebController extends AbstractController {

	@Autowired
	@Qualifier("webService")
	QAWebService webService;

	@Autowired
	PresetService presetService;

	@RequestMapping(value = "/validate.do", method = RequestMethod.POST)
	@ResponseBody
	public boolean validate(HttpServletRequest request, @RequestBody String jsonStr,
			@AuthenticationPrincipal LoginUser loginUser) throws Exception {

		boolean success = false;

		JSONParser parser = new JSONParser();
		JSONObject jsonObject = (JSONObject) parser.parse(jsonStr);

		JSONObject geoserver = (JSONObject) jsonObject.get("geoserver");
		String crs = (String) jsonObject.get("crs");
		String prid = (String) jsonObject.get("prid");

		String qaVer = (String) jsonObject.get("qaVer");
		String qaType = (String) jsonObject.get("qaType");

		Preset prst = null;
		if (prid.equals("nonset")) {
			if (qaVer.equals("qa1")) {
				switch (qaType) {
				case "nm1":
					break;
				case "nm5":
					prst = presetService.retrievePridByBasePreset(1);
					break;
				case "nm25":
					break;
				case "ug1":
					break;
				case "ug5":
					prst = presetService.retrievePridByBasePreset(3);
					break;
				case "ug25":
					break;
				case "fr1":
					break;
				case "fr5":
					prst = presetService.retrievePridByBasePreset(5);
					break;
				case "fr25":
					break;
				default:
					break;
				}
			} else if (qaVer.equals("qa2")) {
				switch (qaType) {
				case "nm1":
					break;
				case "nm5":
					prst = presetService.retrievePridByBasePreset(2);
					break;
				case "nm25":
					break;
				case "ug1":
					break;
				case "ug5":
					prst = presetService.retrievePridByBasePreset(4);
					break;
				case "ug25":
					break;
				case "fr1":
					break;
				case "fr5":
					prst = presetService.retrievePridByBasePreset(5);
					break;
				case "fr25":
					break;
				default:
					break;
				}
			}
		} else {
			prst = presetService.retrieveCatByPreset(Integer.parseInt(prid));
		}

		int nowCat = prst.getCat();
		String nowAuthString = "";
		if (nowCat == 1 || nowCat == 2) {
			nowAuthString = "DIGITAL";
		} else if (nowCat == 3 || nowCat == 4) {
			nowAuthString = "UNDERGROUND";
		} else if (nowCat == 5) {
			nowAuthString = "FOREST";
		}
		GrantedAuthority digital = new SimpleGrantedAuthority("DIGITAL");
		GrantedAuthority under = new SimpleGrantedAuthority("UNDERGROUND");
		GrantedAuthority forest = new SimpleGrantedAuthority("FOREST");
		GrantedAuthority allpass = new SimpleGrantedAuthority("ALLPASS");
		GrantedAuthority admin = new SimpleGrantedAuthority("ADMIN");

		boolean isAuthorized = false;

		if (nowAuthString.equals("DIGITAL") && (loginUser.getAuthorities().contains(digital)
				|| loginUser.getAuthorities().contains(allpass) || loginUser.getAuthorities().contains(admin))) {
			isAuthorized = true;
		} else if (nowAuthString.equals("UNDERGROUND") && (loginUser.getAuthorities().contains(under)
				|| loginUser.getAuthorities().contains(allpass) || loginUser.getAuthorities().contains(admin))) {
			isAuthorized = true;
		} else if (nowAuthString.equals("FOREST") && (loginUser.getAuthorities().contains(forest)
				|| loginUser.getAuthorities().contains(allpass) || loginUser.getAuthorities().contains(admin))) {
			isAuthorized = true;
		}

		if (isAuthorized) {
			// 옵션또는 파일이 제대로 넘어오지 않았을때 강제로 예외발생
			if (qaVer == null || qaType == null || prid == null || prst == null) {
				success = false;
				throw new Exception("인자가 부족합니다. 다시 요청해주세요.");
			} else {
				String serverName = (String) geoserver.get("servername");
				JSONObject layers = (JSONObject) geoserver.get("layers");
				DTGeoserverManager geoserverManager = super.getGeoserverManagerToSession(request, loginUser,
						serverName);
				String serverURL = geoserverManager.getRestURL();
				success = webService.validate(serverURL, layers, prst.getCat(), crs, qaVer, qaType, prid, prst.getPid(),
						loginUser.getIdx());
			}
		} else {
			throw new ValidationAuthException("해당 검수 요청 권한이 없습니다.");
		}
		return success;
	}
}
