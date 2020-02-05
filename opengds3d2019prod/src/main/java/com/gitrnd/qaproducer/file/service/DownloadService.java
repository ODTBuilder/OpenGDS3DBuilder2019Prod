package com.gitrnd.qaproducer.file.service;

import static org.hamcrest.CoreMatchers.both;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.stereotype.Service;

import com.gitrnd.qaproducer.common.security.LoginUser;

@Service
@PropertySources({ @PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true),
		@PropertySource(value = "file:./application.yml", ignoreResourceNotFound = true) })
public class DownloadService {

	private static final Logger LOGGER = LoggerFactory.getLogger(DownloadService.class);

	@Value("${gitrnd.apache.host}")
	private String apacheHost;

	@Value("${gitrnd.apache.port}")
	private String apachePort;

	@Value("${gitrnd.apache.basedrive}")
	private String apachBasedrive;

	@Value("${gitrnd.apache.basedir}")
	private String apacheBasedir;

	public JSONObject download3dtilesZip(String path) {

		// http://175.116.181.32:9999/upload/20200204_154449/3dtiles/tileset.json

		String apachepath = apacheHost + ":" + apachePort;
		String apachelocalpath = apachBasedrive + ":" + File.separator + apacheBasedir;

		String localpath = path.replace("http://", "").replace(apachepath, apachelocalpath).replace("/", "\\");
		String tilespath = new File(localpath).getParentFile().getPath();
		String zipname = "3dtiles.zip";
		String zippath = tilespath + File.pathSeparator + zipname;
		boolean succ = createZipPathFile(tilespath, zippath);

		zippath = "http://" + zippath;
		zippath = zippath.replace(apachelocalpath, apachepath);

		JSONObject returnJson = new JSONObject();
		returnJson.put("path", zippath);
		returnJson.put("succ", succ);

		return returnJson;
	}

	public void download3dtiles(HttpServletResponse response, String time, String file, String user)
			throws UnsupportedEncodingException {
		String encodeName = URLEncoder.encode(file, "UTF-8");
		String path = "http://" + apacheHost + ":" + apachePort + "/" + user + "/upload/" + time + "/3dtiles/"
				+ encodeName;
		try {
			URL url = new URL(path);
			LOGGER.info("{} has been requested [origin layer]", file);
			InputStream in = url.openStream();
			response.setContentType("application/octet-stream");
			String txt = file;
			char[] txtChar = txt.toCharArray();
			for (int j = 0; j < txtChar.length; j++) {
				if (txtChar[j] >= '\uAC00' && txtChar[j] <= '\uD7A3') {
					String targetText = String.valueOf(txtChar[j]);
					try {
						txt = txt.replace(targetText, URLEncoder.encode(targetText, "UTF-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
				}
			}
			response.setHeader("Content-disposition", "attachment; filename=" + txt);
			IOUtils.copy(in, response.getOutputStream());
			response.flushBuffer();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void downloadObj(HttpServletResponse response, String time, String file, String user)
			throws UnsupportedEncodingException {
		String encodeName = URLEncoder.encode(file, "UTF-8");
		String path = "http://" + apacheHost + ":" + apachePort + "/" + user + "/upload/" + time + "/obj/" + encodeName;
		try {
			URL url = new URL(path);
			LOGGER.info("{} has been requested [origin layer]", file);
			InputStream in = url.openStream();
			response.setContentType("application/octet-stream");
			String txt = file;
			char[] txtChar = txt.toCharArray();
			for (int j = 0; j < txtChar.length; j++) {
				if (txtChar[j] >= '\uAC00' && txtChar[j] <= '\uD7A3') {
					String targetText = String.valueOf(txtChar[j]);
					try {
						txt = txt.replace(targetText, URLEncoder.encode(targetText, "UTF-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
				}
			}
			response.setHeader("Content-disposition", "attachment; filename=" + txt);
			IOUtils.copy(in, response.getOutputStream());
			response.flushBuffer();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void downloadZip(HttpServletResponse response, String time, String file, String user)
			throws UnsupportedEncodingException {
		String encodeName = URLEncoder.encode(file, "UTF-8");
		String path = "http://" + apacheHost + ":" + apachePort + "/" + user + "/upload/" + time + "/" + encodeName;
		try {
			URL url = new URL(path);
			LOGGER.info("{} has been requested [origin layer]", file);
			InputStream in = url.openStream();
			response.setContentType("application/octet-stream");
			String txt = file;
			char[] txtChar = txt.toCharArray();
			for (int j = 0; j < txtChar.length; j++) {
				if (txtChar[j] >= '\uAC00' && txtChar[j] <= '\uD7A3') {
					String targetText = String.valueOf(txtChar[j]);
					try {
						txt = txt.replace(targetText, URLEncoder.encode(targetText, "UTF-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
				}
			}
			response.setHeader("Content-disposition", "attachment; filename=" + txt);
			IOUtils.copy(in, response.getOutputStream());
			response.flushBuffer();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void downloadError(HttpServletResponse response, String time, String file, LoginUser loginUser)
			throws UnsupportedEncodingException {
		String encodeName = URLEncoder.encode(file, "UTF-8");
		String path = "http://" + apacheHost + ":" + apachePort + "/" + loginUser.getUsername() + "/error/" + time + "/"
				+ encodeName;
		try {
			URL url = new URL(path);
			LOGGER.info("{} has been requested [error layer]", file);
			InputStream in = url.openStream();
			response.setContentType("application/octet-stream");
			String txt = file;
			char[] txtChar = txt.toCharArray();
			for (int j = 0; j < txtChar.length; j++) {
				if (txtChar[j] >= '\uAC00' && txtChar[j] <= '\uD7A3') {
					String targetText = String.valueOf(txtChar[j]);
					try {
						txt = txt.replace(targetText, URLEncoder.encode(targetText, "UTF-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
				}
			}
			response.setHeader("Content-disposition", "attachment; filename=" + txt);
			IOUtils.copy(in, response.getOutputStream());
			response.flushBuffer();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private boolean createZipPathFile(String path, String toPath) {

		File dir = new File(path);
		String[] list = dir.list();
		String _path;

		boolean succ = false;

		if (!dir.canRead() || !dir.canWrite())
			return succ;

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
			succ = true;
		} catch (FileNotFoundException e) {
			e.getMessage();
		} catch (IOException e) {
			e.getMessage();
		}
		return succ;
	}

	private void zip_folder(String ZIP_FROM_PATH, String parent, File file, ZipOutputStream zout) throws IOException {

		byte[] data = new byte[2048];
		int read;

		if (file.isFile()) {
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

}
