package com.gitrnd.gdsbuilder.geoserver.converter.type;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import com.gitrnd.gdsbuilder.geoserver.converter.unzip.ForestUnzip;

/**
 * Geoserver 데이터를 다운받아 임상도 구조로 변환하는 클래스
 * 
 * @author SG.Lee
 * @since 2018. 10. 30. 오전 9:53:18
 */
public class ForestExport {
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
	 * 작업공간
	 */
	private final String workspace;
	/**
	 * 레이어 리스트
	 */
	private final List<String> layerNames;
	/**
	 * Export 경로
	 */
	private final Path outputFolderPath;
	/**
	 * 좌표계
	 */
	private final String srs;
	/**
	 * 도곽 레이어명
	 */
	private final String nearLine;

	/**
	 * 임상도명
	 */
	private final static String FORESTFNAME = "forest";

	/**
	 * ForestExport 클래스 생성자
	 * 
	 * @param serverURL        Geoserver URL
	 * @param workspace        작업공간
	 * @param layerNames       레이어 리스트
	 * @param outputFolderPath export 경로
	 * @param srs              좌표계(ex. EPSG:4326)
	 * @param nearLine         도곽 레이어명
	 */
	public ForestExport(String serverURL, String workspace, List<String> layerNames, String outputFolderPath,
			String srs, String nearLine) {
		if (serverURL.isEmpty() || workspace.isEmpty() || layerNames == null || outputFolderPath.isEmpty()
				|| srs.isEmpty() || nearLine.isEmpty()) {
			throw new IllegalArgumentException("필수파라미터 입력안됨");
		}
		this.serverURL = serverURL;
		this.workspace = workspace;
		this.layerNames = layerNames;
		this.outputFolderPath = FileSystems.getDefault().getPath(outputFolderPath);
		this.srs = srs;
		this.nearLine = nearLine;
		layerNames.add(nearLine);
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
						String filePath = file.getPath();
						String fFullName = file.getName();

						int Idx = fFullName.lastIndexOf(".");
						String _fileName = fFullName.substring(0, Idx);

						String parentPath = file.getParent(); // 상위 폴더 경로

						if (fFullName.endsWith(".zip")) {
							ForestUnzip unZipFile = new ForestUnzip(file);
							try {
								flag = unZipFile.decompress();
								file.delete();
							} catch (Throwable e) {
								// TODO Auto-generated catch block
								flag = 702;
								file.delete();
								System.err.println("압축풀기 실패");
								return flag;
							}
						}
					}
				}
			}
			// 임상도 폴더 재생성
			createCollectionFolders(zipFolder, nearLine);
		} else {
			flag = 612;
			System.err.println("레이어 리스트 NULL");
		}
		return flag;
	}

	/**
	 * Downloads a file from a URL
	 * 
	 * @param fileURL HTTP URL of the file to be downloaded
	 * @param saveDir path of the directory to save the file
	 * @throws IOException
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

	/**
	 * 임상도 폴더 재생성
	 * 
	 * @author SG.Lee
	 * @since 2018. 4. 18. 오후 1:24:16
	 * @param unzipFolder void
	 */
	private static File[] createCollectionFolders(File unzipFolder, String nearLine) {
		boolean equalFlag = false; // 파일명이랑 압축파일명이랑 같을시 대비 flag값
		String unzipName = unzipFolder.getName();

		if (unzipFolder.exists() == false) {
			System.out.println("경로가 존재하지 않습니다");
		}

		File[] fileList = unzipFolder.listFiles();
		List<File> indexFiles = new ArrayList<File>();
		String folderPath = unzipFolder.getPath();
//		String parentPath = unzipFolder.getParent(); // 상위 폴더 경로

		for (int i = 0; i < fileList.length; i++) {
			if (fileList[i].isDirectory()) {
				/*
				 * String message = "[디렉토리] "; message = fileList[ i ].getName();
				 * System.out.println( message );
				 * 
				 * subDirList( fileList[ i ].getPath());//하위 폴더 탐색
				 */ } else {
				String filePath = fileList[i].getPath();
				String fFullName = fileList[i].getName();

				if (!fFullName.contains(".txt")) {
					int Idx = fFullName.lastIndexOf(".");
					String _fileName = fFullName.substring(0, Idx);
					String ext = fFullName.substring(Idx + 1);
					if (_fileName.equals(unzipName)) {
						equalFlag = true;
					}
					if (_fileName.endsWith(nearLine)) {
						indexFiles.add(fileList[i]);// 도곽파일 리스트 add(shp,shx...)
					} else {
						if (_fileName.contains(".")) {
							moveDirectory(_fileName.substring(0, _fileName.lastIndexOf(".")), FORESTFNAME + "." + ext,
									filePath, folderPath);
						} else {
							moveDirectory(_fileName, FORESTFNAME + "." + ext, filePath, folderPath);
						}
					}
				}
			}
		}

		fileList = unzipFolder.listFiles();

		// 도엽별 폴더 생성후 도곽파일 이동복사
		for (int i = 0; i < fileList.length; i++) {
			if (fileList[i].isDirectory()) {
				for (File iFile : indexFiles) {
					try {
						FileNio2Copy(iFile.getPath(), fileList[i].getPath() + File.separator + iFile.getName());
					} catch (IOException e) {
						// TODO Auto-generated catch block
						System.out.println(e.getMessage());
					}
				}
			}
		}

		// index파일 삭제
		for (File iFile : indexFiles) {
			iFile.delete();
		}

		// 원래 폴더 삭제
		if (!equalFlag) {
			unzipFolder.delete();
		}

		// 파일 사용후 객체초기화
		fileList = null;
		indexFiles = null;

		return new File(folderPath).listFiles();
	}

	/**
	 * 파일이동
	 * 
	 * @author SG.Lee
	 * @since 2018. 4. 18. 오전 9:46:27
	 * @param folderName     폴더명
	 * @param fileName       파일명
	 * @param beforeFilePath 이동전 경로
	 * @param afterFilePath  이동후 경로
	 * @return String 파일경로
	 */
	private static String moveDirectory(String folderName, String fileName, String beforeFilePath,
			String afterFilePath) {
		String path = afterFilePath + "/" + folderName;
		String filePath = path + "/" + fileName;

		File dir = new File(path);

		if (!dir.exists()) { // 폴더 없으면 폴더 생성
			dir.mkdirs();
		}

		try {
			File file = new File(beforeFilePath);

			if (file.renameTo(new File(filePath))) { // 파일 이동
				return filePath; // 성공시 성공 파일 경로 return
			} else {
				return null;
			}
		} catch (Exception e) {
			e.getMessage();
			return null;
		}
	}

	/**
	 * 파일복사
	 * 
	 * @author SG.Lee
	 * @since 2018. 4. 18. 오전 9:45:55
	 * @param source
	 * @param dest
	 * @throws IOException void
	 */
	private static void FileNio2Copy(String source, String dest) throws IOException {
		Files.copy(new File(source).toPath(), new File(dest).toPath());
	}

}
