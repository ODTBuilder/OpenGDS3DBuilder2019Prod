package com.gitrnd.qaproducer.controller;

import java.net.MalformedURLException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.file.service.DeleteFileService;
import com.gitrnd.qaproducer.file.service.DownloadService;
import com.gitrnd.qaproducer.file.service.RequestService;
import com.gitrnd.qaproducer.file.service.UploadService;
import com.gitrnd.qaproducer.geoserver.service.GeoserverService;
import com.gitrnd.qaproducer.preset.domain.Preset;
import com.gitrnd.qaproducer.preset.service.PresetService;
import com.gitrnd.qaproducer.qa.service.ValidationResultService;

@Controller
public class MainController {

	private static final Logger LOGGER = LoggerFactory.getLogger(MainController.class);

	@Autowired
	PresetService presetService;

	@Autowired
	RequestService requestService;

	@Autowired
	UploadService uploadService;

	@Autowired
	DownloadService downloadService;

	@Autowired
	DeleteFileService deleteFileService;

	@Autowired
	ValidationResultService validationResultService;
	
	
	@Autowired
	@Qualifier("geoService")
	private GeoserverService geoserverService;
	

	@Value("${gitrnd.apache.basedrive}")
	private String basedrive;

	@Value("${gitrnd.apache.basedir}")
	private String basedir;

	@Value("${gitrnd.apache.host}")
	private String apacheHost;

	@Value("${gitrnd.apache.port}")
	private String apachePort;

	@RequestMapping(value = "/{locale:en|ko}/locale.do", method = RequestMethod.GET)
	public String localeMainView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /locale.do");
		String redir = "redirect:/main.do";
		return redir;
	}

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public ModelAndView main(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /main.do");
		ModelAndView mav = new ModelAndView();
		if (loginUser != null) {
			mav.addObject("username", loginUser.getUsername());
			mav.addObject("fname", loginUser.getFname());
			mav.addObject("lname", loginUser.getLname());
			mav.setViewName("redirect:map.do");
		} else {
			mav.setViewName("/user/signin");
		}
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		return mav;
	}

	@RequestMapping(value = "/main.do", method = RequestMethod.GET)
	public ModelAndView mainView(HttpServletRequest request, HttpServletResponse response,
			@AuthenticationPrincipal LoginUser loginUser) throws MalformedURLException {
		
//		
//		JSONObject bodyJson = new JSONObject();
//
//		bodyJson.put("user", "admin");
//		bodyJson.put("time", "20191202_174155");
//		bodyJson.put("file", "20191202_174155_obj.zip");
//		bodyJson.put("path", "http:\\175.116.181.32:8081\\geodt\\downloadzip.do?user=admin&time=20191202_174155&file=20191202_174155_obj.zip");
//
//		String bodyString = bodyJson.toJSONString();
//
//		
//		HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
//		factory.setReadTimeout(5000);
//		factory.setConnectTimeout(3000);
//		CloseableHttpClient httpClient = HttpClientBuilder.create().setMaxConnTotal(100)
//				.setMaxConnPerRoute(5).build();
//		factory.setHttpClient(httpClient);
//		RestTemplate restTemplate = new RestTemplate(factory);
//
//		// header
//		HttpHeaders headers = new HttpHeaders();
//		headers.setContentType(MediaType.APPLICATION_JSON);
//
//		HttpEntity<String> requestEntity = new HttpEntity<>(bodyString, headers);
//		restTemplate.exchange("http://localhost:3000/convert/net", HttpMethod.POST, requestEntity, String.class);
//		
//		
		
		
		
		
		
		
		
		
		DTGeoserverManager geoserverManager = new DTGeoserverManager("http://175.116.181.32:9999/geoserver", "admin", "geoserver");
		
		try {
			geoserverService.geolayerTo3DTiles(geoserverManager, "node", "nodetest", "gis_osm_buildings_3052", "admin", 50);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		

		
		
		
		
		
		
	

		LOGGER.info("access: /main.do");
		ModelAndView mav = new ModelAndView();
		if (loginUser != null) {
			mav.addObject("username", loginUser.getUsername());
			mav.addObject("fname", loginUser.getFname());
			mav.addObject("lname", loginUser.getLname());
			mav.setViewName("redirect:map.do");
		} else {
			mav.setViewName("/user/signin");
		}
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		return mav;
	}

	@RequestMapping(value = "/map.do", method = RequestMethod.GET)
	public ModelAndView mapView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /map.do");
		ModelAndView mav = new ModelAndView();
		if (loginUser != null) {
			mav.addObject("username", loginUser.getUsername());
			mav.addObject("fname", loginUser.getFname());
			mav.addObject("lname", loginUser.getLname());
		}
		mav.setViewName("/map/map3d");
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		return mav;
	}

	@RequestMapping(value = "/setting.do", method = RequestMethod.GET)
	public ModelAndView settingView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /setting.do");
		LOGGER.info("login user: {}.", loginUser);
		ModelAndView mav = new ModelAndView();
		String pid = request.getParameter("pid");
		if (pid != null) {
			Preset ps = new Preset();
			ps.setPid(Integer.parseInt(pid));
			ps.setUidx(loginUser.getIdx());
			ps = presetService.retrievePresetByIdAndUidx(ps);
			System.out.println(ps);
			mav.addObject("pid", ps.getPid());
			mav.addObject("title", ps.getTitle());
			mav.addObject("name", ps.getName());
			mav.addObject("layer", ps.getLayerDef());
			mav.addObject("option", ps.getOptionDef());
		}
		mav.addObject("username", loginUser.getUsername());
		mav.addObject("fname", loginUser.getFname());
		mav.addObject("lname", loginUser.getLname());
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		mav.setViewName("/user/setting");
		return mav;
	}

	@RequestMapping(value = "/settinglist.do", method = RequestMethod.GET)
	public ModelAndView settingListView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /settinglist.do");
		LOGGER.info("login user: {}.", loginUser);
		ModelAndView mav = new ModelAndView();
		mav.addObject("username", loginUser.getUsername());
		mav.addObject("fname", loginUser.getFname());
		mav.addObject("lname", loginUser.getLname());
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		mav.setViewName("/user/settinglist");
		return mav;
	}

	@RequestMapping(value = "/validation.do", method = RequestMethod.GET)
	public ModelAndView validationView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /validation.do");
		LOGGER.info("login user: {}.", loginUser);
		ModelAndView mav = new ModelAndView();
		mav.addObject("username", loginUser.getUsername());
		mav.addObject("fname", loginUser.getFname());
		mav.addObject("lname", loginUser.getLname());
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		List<Preset> presets = presetService.retrievePresetByUidx(loginUser.getIdx());
		mav.addObject("presets", presets);

		mav.setViewName("/user/validation");
		return mav;
	}

	@RequestMapping(value = "/list.do", method = RequestMethod.GET)
	public ModelAndView errListView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /list.do");
		LOGGER.info("login user: {}.", loginUser);
		ModelAndView mav = new ModelAndView();
		mav.addObject("username", loginUser.getUsername());
		mav.addObject("fname", loginUser.getFname());
		mav.addObject("lname", loginUser.getLname());
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		// LinkedList<ValidationResult> list =
		// validationResultService.retrieveValidationResultByUidx(loginUser.getIdx());
		// mav.addObject("list", list);
		mav.setViewName("/user/list");
		return mav;
	}

}
