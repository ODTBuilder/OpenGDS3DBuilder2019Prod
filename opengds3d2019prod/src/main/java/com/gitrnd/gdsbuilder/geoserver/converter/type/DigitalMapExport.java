package com.gitrnd.gdsbuilder.geoserver.converter.type;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.gitrnd.gdsbuilder.geoserver.converter.unzip.DigitalUnzip;

/**
 * Geoserver 데이터를 다운받아 수치지도 구조로 변환하는 클래스
 * 
 * @author SG.Lee
 * @since 2018. 10. 30. 오전 9:53:18
 */
public class DigitalMapExport {
	/**
	 * 버퍼사이즈
	 */
	private static final int BUFFER_SIZE = 4096;
	/**
	 * Geoserver Service Type
	 */
	private final static String SERVICE = "WFS";
	/**
	 * WFS Request 유형
	 */
	private final static String REQUEST = "GetFeature";
	/**
	 * Geoserver 버전
	 */
	private final static String VERSION = "1.0.0";
	/**
	 * Output포맷
	 */
	private final static String OUTPUTFORMAT = "SHAPE-ZIP";

	/**
	 * Geoserver URL
	 */
	private final String serverURL;
	/**
	 * layerMaps Map<작업공간,레이어리스트>
	 */
	private final Map<String, List<String>> layerMaps;
	/**
	 * Export 경로
	 */
	private final Path outputFolderPath;
	/**
	 * 좌표계
	 */
	private final String srs;

	/**
	 * 생성자
	 * 
	 * @param serverURL        Geoserver URL
	 * @param layerMaps        key : 작업공간, value : 레이어리스트
	 * @param outputFolderPath export 경로
	 * @param srs              좌표계(ex. EPSG:4326)
	 */
	public DigitalMapExport(String serverURL, Map<String, List<String>> layerMaps, String outputFolderPath,
			String srs) {
		if (serverURL.isEmpty() || layerMaps == null || outputFolderPath.isEmpty() || srs.isEmpty()) {
			throw new IllegalArgumentException("필수파라미터 입력안됨");
		}
		this.serverURL = serverURL;
		this.layerMaps = layerMaps;
		this.outputFolderPath = FileSystems.getDefault().getPath(outputFolderPath);
		this.srs = srs;
		this.createFileDirectory(outputFolderPath);

		// 기본 폴더에 현재시간 및 난수 추가
		/*
		 * long time = System.currentTimeMillis(); SimpleDateFormat dayTime = new
		 * SimpleDateFormat("yyyymmddhhmmss"); this.outputFolderPath = outputFolderPath
		 * + File.separator + dayTime.format(new Date(time)) + new
		 * Random().nextInt(10000); createFileDirectory(this.outputFolderPath);
		 */
	}

	/**
	 * 파일 Export
	 * 
	 * @author SG.Lee
	 * @since 2018. 10. 29. 오후 3:48:38
	 * @return int 200 성공 500 내부에러 700 파일구조에러 612 레이어 리스트 NULL 702 파일손상 703
	 *         Geoserver Layer 다운에러
	 */
	public int export() {
		int flag = 500;
		if (layerMaps != null) {
			Iterator<String> keys = layerMaps.keySet().iterator();
			while (keys.hasNext()) {
				String workspace = keys.next();
				List<String> layerNames = layerMaps.get(workspace);

				if (layerNames != null) {
					for (String layerName : layerNames) {
						StringBuffer urlBuffer = new StringBuffer();
						urlBuffer.append(serverURL);
						urlBuffer.append("/" + workspace + "/ows?");
						urlBuffer.append("service=" + SERVICE);
						urlBuffer.append("&");
						urlBuffer.append("version=" + VERSION);
						urlBuffer.append("&");
						urlBuffer.append("request=" + REQUEST);
						urlBuffer.append("&");
						urlBuffer.append("typeName=" + workspace + ":" + layerName);
						urlBuffer.append("&");
						urlBuffer.append("outputFormat=" + OUTPUTFORMAT);
						urlBuffer.append("&");
						urlBuffer.append("srsname=" + srs);
						try {
							this.downloadFile(urlBuffer.toString(), outputFolderPath.toString());// 다운로드 요청
						} catch (IOException e) {
							// TODO Auto-generated catch block
							flag = 703;
							System.err.println(layerName + " 레이어 다운로드 에러");
							return flag;
						}
					}
					File zipFolder = new File(outputFolderPath.toString());
					if (!zipFolder.exists()) {
						System.err.println("폴더가 존재하지 않습니다");
					} else {
						File[] fileList = zipFolder.listFiles();
						for (int i = 0; i < fileList.length; i++) {
							File file = fileList[i];
							if (file.isFile()) {
//										String filePath = file.getPath();
								String fFullName = file.getName();

//										int Idx = fFullName.lastIndexOf(".");
//										String _fileName = fFullName.substring(0, Idx);

//										String parentPath = file.getParent(); // 상위 폴더 경로

								if (fFullName.endsWith(".zip")) {
									DigitalUnzip unZipFile = new DigitalUnzip(file,
											outputFolderPath.toString() + File.separator + workspace);
									try {
										flag = unZipFile.decompress();
										file.delete();
									} catch (Throwable e) {
										// TODO Auto-generated catch block
										flag = 702;
										System.err.println("압축풀기 실패");
										file.delete();
										return flag;
									}
								}
							}
						}
					}
				} else {
					flag = 612;
					System.err.println("레이어 리스트 NULL");
				}
			}
		}
		return flag;
	}

	/**
	 * Downloads a file from a URL
	 * 
	 * @param fileURL HTTP URL of the file to be downloaded
	 * @param saveDir path of the directory to save the file
	 * @throws IOException {@link IOException}
	 */
	private void downloadFile(String fileURL, String saveDir) throws IOException {
		URL url = new URL(fileURL);
		HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
		int responseCode = httpConn.getResponseCode();

		// always check HTTP response code first
		if (responseCode == HttpURLConnection.HTTP_OK) {
			String fileName = "";
			String disposition = httpConn.getHeaderField("Content-Disposition");
			String contentType = httpConn.getContentType();
			int contentLength = httpConn.getContentLength();

			if (disposition != null) {
				// extracts file name from header field
				int index = disposition.indexOf("filename=");
				if (index > 0) {
					fileName = disposition.substring(index + 9, disposition.length());
				}
			} else {
				// extracts file name from URL
				fileName = fileURL.substring(fileURL.lastIndexOf("/") + 1, fileURL.length());
			}

			System.out.println("Content-Type = " + contentType);
			System.out.println("Content-Disposition = " + disposition);
			System.out.println("Content-Length = " + contentLength);
			System.out.println("fileName = " + fileName);

			// opens input stream from the HTTP connection
			InputStream inputStream = httpConn.getInputStream();
			String saveFilePath = saveDir + File.separator + fileName;

			// opens an output stream to save into file
			FileOutputStream outputStream = new FileOutputStream(saveFilePath);

			int bytesRead = -1;
			byte[] buffer = new byte[BUFFER_SIZE];
			while ((bytesRead = inputStream.read(buffer)) != -1) {
				outputStream.write(buffer, 0, bytesRead);
			}

			outputStream.close();
			inputStream.close();

			System.out.println("File downloaded");
		} else {
			System.out.println("No file to download. Server replied HTTP code: " + responseCode);
		}
		httpConn.disconnect();
	}

	private void createFileDirectory(String directory) {
		File file = new File(directory);
		if (!file.exists()) {
			file.mkdirs();
		}
	}
}
