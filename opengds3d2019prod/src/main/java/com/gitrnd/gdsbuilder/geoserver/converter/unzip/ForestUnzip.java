package com.gitrnd.gdsbuilder.geoserver.converter.unzip;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * 임상도 파일을 지정된 경로에 압축해제하는 기능을 제공하는 클래스 
 * @author SG.Lee
 * @since 2018. 10. 17. 오전 10:18:19
 * */
public class ForestUnzip {

	
	/**
	 * 대상 파일
	 * */
	private File zipFile;
	
	/**
	 * 압축해제 경로
	 */
	private String OUTPUT_DIR;
	/**
	 * 압축폴더명
	 */
	private String entryName;
	/**
	 * 압축파일 경로
	 */
	private String fileDirectory;

	/**
	 * 생성자
	 * @author SG.LEE
	 * @param zipFile 다운로드 받은 File 클래스
	 */
	public ForestUnzip(File zipFile){
		this.zipFile = zipFile;
		this.OUTPUT_DIR = zipFile.getParent();
	}
	
	/**
	 * 압축폴더명 반환
	 * 
	 * @return String 압축폴더명
	 */
	public String getEntryName() {
		return entryName;
	}

	/**
	 * 압축폴더명 설정
	 * 
	 * @param entryName
	 *            압축폴더명
	 */
	public void setEntryName(String entryName) {
		this.entryName = entryName;
	}


	/**
	 * 압축파일 경로 반환
	 * 
	 * @return String 압축파일 경로
	 */
	public String getFileDirectory() {
		return fileDirectory;
	}

	/**
	 * 압축파일 경로 설정
	 * 
	 * @param fileDirectory
	 *            압축파일 경로
	 */
	public void setFileDirectory(String fileDirectory) {
		this.fileDirectory = fileDirectory;
	}

	/**
	 * 압축해제 경로 반환
	 * 
	 * @return String
	 */
	public String getOUTPUT_DIR() {
		return OUTPUT_DIR;
	}

	/**
	 * zip 파일의 압축 해제 후 지정된 경로에 압축 해제
	 * @author SG.Lee
	 * @since 2018. 8. 1. 오전 11:37:15
	 * @return 에러코드 200 성공
	 *                 700 파일구조 에러
	 *                 
	 * @throws Throwable long
	 * */
	public int decompress() throws Throwable {
		int flagNum = 200;
		
		FileInputStream fis = null;
		ZipInputStream zis = null;
		ZipEntry zipentry = null;
		try {
			// 디렉토리생성
//			String zipFileName = this.zipFile.getName(); // 파일 이름.확장자
//			int comma = zipFileName.lastIndexOf(".");
//			this.entryName = zipFileName.substring(0, comma); // 파일 이름
//			this.fileDirectory = OUTPUT_DIR+ "\\" + entryName;
//			
//			
//			FileUtils.forceMkdir(new File(OUTPUT_DIR, entryName)); // 폴더 생성
			// 파일 스트림
			fis = new FileInputStream(this.zipFile);
			// Zip 파일 스트림
			zis = new ZipInputStream(fis);

			

			// Fentry가 없을때까지 뽑기
			while ((zipentry = zis.getNextEntry()) != null) {
				String zipentryName = zipentry.getName();
				File file = new File(OUTPUT_DIR, zipentryName);

				
				// entiry가 폴더면 구조에러
				if (zipentry.isDirectory()) {
					flagNum = 700;
					file.deleteOnExit();
					break;
				} else {
					// 파일이면 파일 만들기
					createFile(file, zis);
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
		return flagNum;
	}

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
		} catch (Exception e) {
			throw e;
		}
	}

}
