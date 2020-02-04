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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

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

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/main.do", method = RequestMethod.GET)
	public ModelAndView mainView(HttpServletRequest request, HttpServletResponse response,
			@AuthenticationPrincipal LoginUser loginUser) throws Exception {

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
