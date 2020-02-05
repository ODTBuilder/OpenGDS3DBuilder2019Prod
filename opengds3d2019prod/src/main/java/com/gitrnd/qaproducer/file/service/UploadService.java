package com.gitrnd.qaproducer.file.service;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.filestatus.domain.FileStatus;
import com.gitrnd.qaproducer.filestatus.service.FileStatusService;

@Service
@PropertySources({ @PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true),
		@PropertySource(value = "file:./application.yml", ignoreResourceNotFound = true) })
public class UploadService {

	private static final Logger LOGGER = LoggerFactory.getLogger(UploadService.class);

	@Value("${gitrnd.serverhost}")
	private String serverIP;

	/*
	 * @Value("${gitrnd.apache.port}") private String apachePort;
	 */

	@Value("${gitrnd.apache.basedir}")
	private String baseDir;

	@Value("${server.port}")
	private String serverPort;

	@Value("${server.context-path}")
	private String context;

	@Value("${gitrnd.apache.host}")
	private String apachehost;

	@Value("${gitrnd.apache.port}")
	private String apacheport;

	@Autowired
	private FileStatusService fileStatusService;

	@Value("${gitrnd.apache.basedrive}")
	private String baseDrive;

	public List<FileStatus> SaveFile(MultipartHttpServletRequest request, LoginUser loginUser) throws Exception {
		String basePath = baseDrive + ":" + File.separator + baseDir;
		String uploadPath = basePath + File.separator + loginUser.getUsername() + File.separator + "upload";

		long date = System.currentTimeMillis();
		long tstamp = date;
		String uniquePath = uploadPath + File.separator + tstamp;
		String webPath = "http://" + serverIP + ":" + serverPort + context + "/downloadzip.do" + "?" + "user="
				+ loginUser.getUsername() + "&time=" + tstamp;

		// 최상위 디렉토리 생성
		File base = new File(basePath);
		if (!base.exists()) {
			base.mkdirs();
		}

		// 업로드 디렉토리 생성
		File upload = new File(uploadPath);
		if (!upload.exists()) {
			upload.mkdirs();
		}

		// 요청 고유 디렉토리 생성
		File unique = new File(uniquePath);
		if (!unique.exists()) {
			unique.mkdirs();
		}

		LinkedList<FileStatus> files = new LinkedList<FileStatus>();

		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;

		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());
			LOGGER.info("{} uploaded!", mpf.getOriginalFilename());

			try {
				// 2.3 create new fileMeta
				FileStatus fileStatus = new FileStatus();
				String trimFileName = mpf.getOriginalFilename().replaceAll(" ", "");
				String encodeFileName = URLEncoder.encode(trimFileName, "UTF-8");

				webPath = webPath + "&file=" + encodeFileName;
				fileStatus.setLocation(webPath);
				fileStatus.setFname(mpf.getOriginalFilename());
				// fileStatus.setCtime(new Timestamp(tstamp));
				fileStatus.setStatus(1);
				fileStatus.setUidx(loginUser.getIdx());
				// fileStatus.setBytes(mpf.getBytes());

				String saveFilePath = uniquePath + File.separator + trimFileName;

				BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(saveFilePath));

				// copy file to local disk (make sure the path "e.g.
				// D:/temp/files" exists)
				FileCopyUtils.copy(mpf.getBytes(), stream);

				fileStatusService.createFileStatus(fileStatus);
				files.add(fileStatus);

			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return files;
	}

	public JSONObject upload3dtilesZip(MultipartHttpServletRequest request, String user) {

		JSONObject returnJson = new JSONObject();

		SimpleDateFormat format = new SimpleDateFormat("yyyyMMdd_HHmmss");
		Date time = new Date();
		String timeStr = format.format(time);
		String basePath = baseDrive + ":" + File.separator + baseDir + File.separator + user + File.separator + "upload"
				+ File.separator + timeStr + File.separator + "3dtiles";

		String apachePath = "http://" + apachehost + ":" + apacheport + "/" + user + "/" + "upload" + "/" + time + "/"
				+ "3dtiles" + "/" + "tileset.json";

		File path = new File(basePath);
		if (!path.exists()) {
			path.mkdirs();
		}

		boolean isSucc = true;
		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;
		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());
			LOGGER.info("{} uploaded!", mpf.getOriginalFilename());
			try {
				String zipFile = path + File.separator + mpf.getOriginalFilename();
				LOGGER.info("저장 파일 경로:{}", zipFile);
				// copy file to local disk (make sure the path "e.g.
				// D:/temp/files" exists)
				FileCopyUtils.copy(mpf.getBytes(), new FileOutputStream(zipFile));
				try {
					decompress(zipFile, basePath);
					// tileset.json 유무 확인
					File baseFile = new File(basePath);
					boolean isture = false;
					File[] files = baseFile.listFiles();
					for (File file : files) {
						if (!file.isDirectory()) {
							if (file.getName().contains("tileset.json")) {
								isture = true;
							}
						}
					}
					if (!isture) {
						isSucc = false;
						deleteDirectory(baseFile);
					}
					// zip 파일 삭제
					File file = new File(zipFile);
					file.delete();
				} catch (Throwable e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					isSucc = false;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				isSucc = false;
			}
		}

		if (!isSucc) {
			deleteDirectory(path.getParentFile());
		}

		returnJson.put("succ", isSucc);
		returnJson.put("path", apachePath);

		return returnJson;
	}

	public JSONObject saveObjFiles(MultipartHttpServletRequest request, String user) {

		JSONObject objMap = new JSONObject();

		String basePath = baseDrive + ":/" + baseDir;
		String uploadPath = basePath + File.separator + user + File.separator + "edit";

		File path = new File(uploadPath);
		if (!path.exists()) {
			path.mkdirs();
		}

		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;

		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());

			String name = mpf.getOriginalFilename();
			LOGGER.info("{} uploaded!", name);
			try {
				String gltfFile = path + File.separator + name;
				LOGGER.info("저장 파일 경로:{}", gltfFile);
				objMap.put(name, gltfFile);
				FileCopyUtils.copy(mpf.getBytes(), new FileOutputStream(gltfFile));
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return objMap;
	}

	public JSONObject saveGltfFile(MultipartHttpServletRequest request) {

		JSONObject obj = new JSONObject();
		boolean succ = true;

		String user = request.getParameter("user");
//		String time = request.getParameter("time");

		String basePath = baseDrive + ":/" + baseDir;
//		String uploadPath = basePath + File.separator + user + File.separator + "upload" + File.separator + time
//				+ File.separator + "gltf";

		String uploadPath = basePath + File.separator + user + File.separator + "edit";

		File path = new File(uploadPath);
		if (!path.exists()) {
			path.mkdirs();
		}

		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;

		String filename = null;
		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());
			filename = mpf.getOriginalFilename();
			LOGGER.info("{} uploaded!", mpf.getOriginalFilename());
			try {
				String gltfFile = path + File.separator + mpf.getOriginalFilename();
				LOGGER.info("저장 파일 경로:{}", gltfFile);
				FileCopyUtils.copy(mpf.getBytes(), new FileOutputStream(gltfFile));
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				succ = false;
			}
		}

//		String apachePath = "http://" + apachehost + ":" + apacheport + "/" + user + "/" + "upload" + "/" + time + "/"
//				+ "gltf" + "/" + filename;
		String apachePath = "http://" + apachehost + ":" + apacheport + "/" + user + "/edit/" + filename;
		obj.put("succ", succ);
		obj.put("path", apachePath);
		return obj;
	}

	public JSONObject save3dtilesFile(MultipartHttpServletRequest request) throws Exception {

		boolean succ = true;
		JSONObject obj = new JSONObject();
		String user = request.getParameter("user");
		String time = request.getParameter("time");

		String basePath = baseDrive + ":/" + baseDir;
		String uploadPath = basePath + File.separator + user + File.separator + "upload" + File.separator + time
				+ File.separator + "3dtiles";

		String apachePath = "http://" + apachehost + ":" + apacheport + "/" + user + "/" + "upload" + "/" + time + "/"
				+ "3dtiles" + "/" + "tileset.json";

//		String apachePath = "http://" + apachehost + ":" + apacheport + "/guest/upload/20191211_100931/3dtiles/tileset.json";

		File path = new File(uploadPath);
		if (!path.exists()) {
			path.mkdirs();
		}

		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;

		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());
			LOGGER.info("{} uploaded!", mpf.getOriginalFilename());
			try {
				String zipFile = path + File.separator + mpf.getOriginalFilename();
				LOGGER.info("저장 파일 경로:{}", zipFile);
				// copy file to local disk (make sure the path "e.g.
				// D:/temp/files" exists)
				FileCopyUtils.copy(mpf.getBytes(), new FileOutputStream(zipFile));
				try {
					decompress(zipFile, uploadPath);
					File file = new File(zipFile);
					file.delete();
				} catch (Throwable e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					succ = false;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				succ = false;
			}
		}

		obj.put("succ", succ);
		obj.put("path", apachePath);

		return obj;

	}

	public JSONObject saveEdit3dtilesFile(MultipartHttpServletRequest request) throws Exception {

		boolean succ = true;
		JSONObject obj = new JSONObject();
		String user = request.getParameter("user");
		String time = request.getParameter("time");
		String originObjFolder = request.getParameter("originObjFolder"); // "objPath":"20200103_111444/3dtiles"

//		String basePath = baseDrive + ":/" + baseDir;
//		String uploadPath = basePath + File.separator + user + File.separator + "upload" + File.separator
//				+ originObjFolder;

		String apachePath = "http://" + apachehost + ":" + apacheport + "/" + user + "/" + "upload" + "/" + time + "/"
				+ "3dtiles" + "/" + "tileset.json";

		File path = new File(originObjFolder);
		if (!path.exists()) {
			path.mkdirs();
		}

		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;

		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());
			LOGGER.info("{} uploaded!", mpf.getOriginalFilename());
			try {
				String zipFile = path + File.separator + mpf.getOriginalFilename();
				LOGGER.info("저장 파일 경로:{}", zipFile);
				// copy file to local disk (make sure the path "e.g.
				// D:/temp/files" exists)
				FileCopyUtils.copy(mpf.getBytes(), new FileOutputStream(zipFile));
				try {
					decompress(zipFile, originObjFolder);
					File file = new File(zipFile);
					file.delete();
				} catch (Throwable e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					succ = false;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				succ = false;
			}
		}
		obj.put("succ", succ);
		obj.put("path", apachePath);
		return obj;
	}

	public void SaveErrorFile(MultipartHttpServletRequest request) throws Exception {
		String basePath = baseDrive + ":" + File.separator + baseDir;
		String uploadPath = basePath + File.separator + request.getParameter("user") + File.separator + "error";
		String uniquePath = uploadPath + File.separator + request.getParameter("time");

		// 최상위 디렉토리 생성
		File base = new File(basePath);
		if (!base.exists()) {
			base.mkdirs();
		}

		// 업로드 디렉토리 생성
		File upload = new File(uploadPath);
		if (!upload.exists()) {
			upload.mkdirs();
		}

		// 요청 고유 디렉토리 생성
		File unique = new File(uniquePath);
		if (!unique.exists()) {
			unique.mkdirs();
		}

		// 1. build an iterator
		Iterator<String> itr = request.getFileNames();
		MultipartFile mpf = null;

		// 2. get each file
		while (itr.hasNext()) {
			// 2.1 get next MultipartFile
			mpf = request.getFile(itr.next());
			LOGGER.info("{} uploaded!", mpf.getOriginalFilename());
			try {
				String saveFilePath = uniquePath + File.separator + mpf.getOriginalFilename();
				LOGGER.info("저장 파일 경로:{}", saveFilePath);
				// copy file to local disk (make sure the path "e.g.
				// D:/temp/files" exists)
				FileCopyUtils.copy(mpf.getBytes(), new FileOutputStream(saveFilePath));
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	private void decompress(String zipFileName, String directory) throws Throwable {

		File zipFile = new File(zipFileName);
		FileInputStream fis = null;
		ZipInputStream zis = null;
		ZipEntry zipentry = null;
		try {
			// 파일 스트림
			fis = new FileInputStream(zipFile);
			// Zip 파일 스트림
			zis = new ZipInputStream(fis);
			// entry가 없을때까지 뽑기
			while ((zipentry = zis.getNextEntry()) != null) {
				String filename = zipentry.getName();
				File file = new File(directory, filename);
				// entiry가 폴더면 폴더 생성
				if (zipentry.isDirectory()) {
					file.mkdirs();
				} else {
					// 파일이면 파일 만들기
					if (file.getName().contains(".mtl") || file.getName().contains(".jpg")) {
						continue;
					} else {
						createFile(file, zis);
					}
				}
			}
		} catch (Throwable e) {
			throw e;
		} finally {
			if (zis != null)
				zis.close();
			if (fis != null)
				fis.close();
		}
	}

	/**
	 * 파일 만들기 메소드
	 * 
	 * @param file 파일
	 * @param zis  Zip스트림
	 */
	private void createFile(File file, ZipInputStream zis) throws Throwable {
		// 디렉토리 확인
		File parentDir = new File(file.getParent());
		// 디렉토리가 없으면 생성하자
		if (!parentDir.exists()) {
			parentDir.mkdirs();
		}
		// 파일 스트림 선언
		try (FileOutputStream fos = new FileOutputStream(file)) {
			byte[] buffer = new byte[256];
			int size = 0;
			// Zip스트림으로부터 byte뽑아내기
			while ((size = zis.read(buffer)) > 0) {
				// byte로 파일 만들기
				fos.write(buffer, 0, size);
			}
		} catch (Throwable e) {
			throw e;
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
}
