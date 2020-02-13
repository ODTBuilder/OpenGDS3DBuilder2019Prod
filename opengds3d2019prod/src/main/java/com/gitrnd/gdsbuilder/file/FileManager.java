package com.gitrnd.gdsbuilder.file;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * File 관리 클래스
 * 
 * @author DY.Oh
 *
 */
public class FileManager {

	/**
	 * 디렉토리 생성
	 * 
	 * @param directory 디렉토리 경로
	 * 
	 * @author DY.Oh
	 */
	public static void createFileDirectory(String directory) {
		File file = new File(directory);
		if (!file.exists()) {
			file.mkdirs();
		}
	}

	/**
	 * 압축파일 생성
	 * 
	 * @param path   압축폴더 경로
	 * @param toPath 압축파일 경로
	 * 
	 * @author DY.Oh
	 */
	public static void createZipFile(String path, String toPath) {

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
		} finally {

		}
	}

	/**
	 * 파일 압축
	 * 
	 * @param zipPath 압축파일 경로
	 * @param parent  상위 폴더 경로
	 * @param file    압축폴더 내 파일
	 * @param zout    ZipOutputStream
	 * @throws IOException
	 * 
	 * @author DY.Oh
	 */
	public static void zip_folder(String zipPath, String parent, File file, ZipOutputStream zout) throws IOException {

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
			String parentString = file.getPath().replace(zipPath, "");
			parentString = parentString.substring(0, parentString.length() - file.getName().length());
			ZipEntry entry = new ZipEntry(parentString + file.getName() + "/");

			zout.putNextEntry(entry);

			String[] list = file.list();
			if (list != null) {
				int len = list.length;
				for (int i = 0; i < len; i++) {
					zip_folder(zipPath, entry.getName(), new File(file.getPath() + "/" + list[i]), zout);
				}
			}
		}

	}

	/**
	 * ZipOutputStream를 넘겨 받아서 하나의 압축파일로 만든다.
	 * 
	 * @param parent 상위폴더명
	 * @param file   압축할 파일
	 * @param zout   압축전체스트림
	 * @throws IOException
	 */
	public static void zip_folder(String parent, File file, ZipOutputStream zout) throws IOException {
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
		}
	}

	/**
	 * 파일이동
	 * 
	 * @author SG.Lee
	 * @since 2018. 4. 18. 오전 9:46:27
	 * @param folderName
	 * @param fileName
	 * @param beforeFilePath
	 * @param afterFilePath
	 * @return String
	 */
	public static String moveDirectory(String folderName, String fileName, String beforeFilePath,
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
	public static void FileNio2Copy(String source, String dest) throws IOException {
		Files.copy(new File(source).toPath(), new File(dest).toPath());
	}

	/**
	 * 파일 삭제
	 * 
	 * @param dir 파일 객체
	 * 
	 * @author DY.Oh
	 */
	public static void deleteDirectory(File dir) {

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
	
	public static void deleteDirectoryFiles(File dir) {

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
	}

	/**
	 * 파일 삭제
	 * 
	 * @param path 파일 경로
	 * 
	 * @author DY.Oh
	 */
	public static void deleteDirectory(String path) {

		File dir = new File(path);
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

	/**
	 * 파일 복사
	 * 
	 * @param is InputStream
	 * @param os OutputStream
	 * 
	 * @author DY.Oh
	 */
	public static void fileCopy(InputStream is, OutputStream os) {
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

	public static void createZipFile(List<File> files, String toPath) {
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

	public static void decompress(String zipFileName, String directory) throws Throwable {

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
	public static void createFile(File file, ZipInputStream zis) throws Throwable {
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

	public static boolean createZipPathFile(String path, String toPath) {

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

}
