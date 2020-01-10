package com.gitrnd.qaproducer.controller;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;

import com.gitrnd.gdsbuilder.geoserver.converter.type.GeneralMapExport;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjWidthType;
import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.edit3d.service.Edit3dService;
import com.gitrnd.qaproducer.file.service.DeleteFileService;
import com.gitrnd.qaproducer.file.service.DownloadService;
import com.gitrnd.qaproducer.file.service.RequestService;
import com.gitrnd.qaproducer.file.service.UploadService;
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
	Edit3dService edit3dSevice;

	@Value("${gitrnd.apache.basedrive}")
	private String basedrive;

	@Value("${gitrnd.apache.basedir}")
	private String basedir;

	@Value("${gitrnd.apache.host}")
	private String apacheHost;

	@Value("${gitrnd.apache.port}")
	private String apachePort;

	@Value("${gitrnd.serverhost}")
	private String serverIP;

	@Value("${server.port}")
	private String serverPort;

	@Value("${server.context-path}")
	private String context;

	@Value("${gitrnd.node.protocol}")
	private String protocol;

	@Value("${gitrnd.node.host}")
	private String nodeHost;

	@Value("${gitrnd.node.port}")
	private String nodePort;

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

	public void fileCopy(InputStream is, OutputStream os) {
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

	private void createFileDirectory(String directory) {
		File file = new File(directory);
		if (!file.exists()) {
			file.mkdirs();
		}
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/main.do", method = RequestMethod.GET)
	public ModelAndView mainView(HttpServletRequest request, HttpServletResponse response,
			@AuthenticationPrincipal LoginUser loginUser) throws Exception {

		String user = "guest";
		SimpleDateFormat format = new SimpleDateFormat("yyyyMMdd_HHmmss");
		Date time = new Date();
		String timeStr = format.format(time);
		String basePath = basedrive + ":" + File.separator + basedir + File.separator + user + File.separator + "upload"
				+ File.separator + timeStr;

		// shp 경로
		String shpPath = basePath + File.separator + "shp";
		createFileDirectory(shpPath);

		int downReNum = new GeneralMapExport("http://175.116.181.32:9999/geoserver", "node", "gis_osm_roads_160",
				shpPath, "EPSG:4326").export();
		if (downReNum == 200) {
			// shp 파일 경로
			File buildingFile = new File(shpPath);
			Filter filter = Filter.INCLUDE;

			// obj 경로
			String objPath = basePath + File.separator + "obj";
			createFileDirectory(objPath);

			// copy mtl, texture image to obj path
			// polygon
//			String mtl = "building.mtl";
//			String image = "building.jpg";
//
//			InputStream mtlIs = this.getClass().getResourceAsStream("/textures/" + mtl);
//			OutputStream mtlOs = new FileOutputStream(objPath + File.separator + mtl);
//			fileCopy(mtlIs, mtlOs);
//			InputStream imageIs = this.getClass().getResourceAsStream("/textures/" + image);
//			OutputStream imageOs = new FileOutputStream(objPath + File.separator + image);
//			fileCopy(imageIs, imageOs);

			// shp to obj
			ShpToObjImpl shpToObj = new ShpToObjImpl(buildingFile, filter, objPath);
//			shpToObj.setMtl(mtl);
			shpToObj.sethType(EnShpToObjHeightType.DEFAULT);
			shpToObj.setDefaultHeight(5);
			shpToObj.setwType(EnShpToObjWidthType.DEFAULT);
			shpToObj.setDefaultWidth(0.00001);

//			// set height
//			if (heightType.equals(EnShpToObjHeightType.DEFAULT.getType())) {
//				shpToObj.sethType(EnShpToObjHeightType.DEFAULT);
//				shpToObj.setDefaultHeight(Double.parseDouble(heightValue));
//			} else if (heightType.equals(EnShpToObjHeightType.FIX.getType())) {
//				shpToObj.sethType(EnShpToObjHeightType.FIX);
//				shpToObj.setHeightAttribute(heightValue);
//			}
//			// set width
//			if (widthType.equals(EnShpToObjWidthType.DEFAULT.getType())) {
//				shpToObj.setwType(EnShpToObjWidthType.DEFAULT);
//				shpToObj.setDefaultWidth(Double.parseDouble(heightValue));
//			} else if (heightType.equals(EnShpToObjWidthType.FIX.getType())) {
//				shpToObj.setwType(EnShpToObjWidthType.FIX);
//				shpToObj.setWidthAttribute(heightValue);
//			}

			try {
				shpToObj.exec();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			boolean combineFlag = false;
			int objnum = shpToObj.getObjfilenum();
			if (objnum > 1) {
				combineFlag = true;
			}

			// obj 및 tileset option 파일 폴더 경로
			String folderPath = shpToObj.getOutputPath();

			// 파일 폴더 압축
			String zipfile = timeStr + "_obj.zip";
			String zipPath = basePath + File.separator + zipfile; // zip 파일 이름
			createZipFile(folderPath, zipPath);

			String path = "http://" + serverIP + ":" + serverPort + context + "/downloadzip.do" + "?" + "user=" + user
					+ "&time=" + timeStr + "&file=" + zipfile;

			// API 요청 파라미터 생성
			String nodeURL = protocol + "://" + nodeHost + ":" + nodePort + "/convert/objTo3dtiles"; // 압축폴더
																										// 업로드
																										// 경로

			// body
			JSONObject bodyJson = new JSONObject();

			bodyJson.put("user", user);
			bodyJson.put("time", timeStr);
			bodyJson.put("file", zipfile);
			bodyJson.put("path", path);
			bodyJson.put("objnum", objnum);
			bodyJson.put("combine", combineFlag);

			String bodyString = bodyJson.toJSONString();

			// restTemplate
			HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
			factory.setReadTimeout(0);
			factory.setConnectTimeout(0);
			CloseableHttpClient httpClient = HttpClientBuilder.create().setMaxConnTotal(100).setMaxConnPerRoute(5)
					.build();
			factory.setHttpClient(httpClient);
			RestTemplate restTemplate = new RestTemplate(factory);

			// header
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			HttpEntity<String> requestEntity = new HttpEntity<>(bodyString, headers);
			ResponseEntity<String> res = restTemplate.exchange(nodeURL, HttpMethod.POST, requestEntity, String.class);

			JSONParser parser = new JSONParser();
			Object obj = parser.parse(res.getBody());
			JSONObject returnJSON = (JSONObject) obj;
			// 다 처리하고 zip 삭제
			System.out.println("");
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

	int objnum = 0;

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
		}
	}

	private void zip_folder(String ZIP_FROM_PATH, String parent, File file, ZipOutputStream zout) throws IOException {

		byte[] data = new byte[2048];
		int read;

		if (file.isFile()) {
			if (file.getAbsolutePath().contains(".obj")) {
				objnum++;
			}
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
