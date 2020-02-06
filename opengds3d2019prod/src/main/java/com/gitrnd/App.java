package com.gitrnd;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.FeatureSource;
import org.geotools.feature.FeatureCollection;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.parse.impl.LineLayerToObjImpl;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjHeightType;
import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl.EnShpToObjWidthType;

public class App {

	public static FeatureCollection<SimpleFeatureType, SimpleFeature> getFeatureCollectionFromFileWithFilter(File file,
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

	public static void main(String[] args) throws Exception {

//		Obj originObj = ObjReader.read(new FileInputStream("C:\\gdofiles\\guest\\upload\\20200205_162328\\obj\\1.obj"));
//		ObjWriter.write(originObj, new FileOutputStream("C:\\gdofiles\\guest\\upload\\20200205_162328\\obj\\test.obj"));

		File file = new File("D:\\admin_shp\\geogig_files\\gis_osm_roads_160.shp");
		FeatureCollection<SimpleFeatureType, SimpleFeature> buildingCollection = getFeatureCollectionFromFileWithFilter(
				file, Filter.INCLUDE);

//		PolygonLayerToObjImpl polyToObj = new PolygonLayerToObjImpl(buildingCollection, null, null,
//				EnShpToObjHeightType.DEFAULT, 5, "D:\\test");
//		polyToObj.parseToObjFile();

		LineLayerToObjImpl lineToObj = new LineLayerToObjImpl(buildingCollection, "road", EnShpToObjHeightType.DEFAULT,
				EnShpToObjWidthType.DEFAULT, 5, 5, "D:\\test\\linetest");
		lineToObj.parseToObjFile();

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
	}

	/**
	 * 파일 만들기 메소드
	 * 
	 * @param file 파일
	 * @param zis  Zip스트림
	 */
	private static void createFile(File file, ZipInputStream zis) throws Throwable {
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

	public static FeatureCollection<SimpleFeatureType, SimpleFeature> getFeatureCollectionFromFileWithFilter(File file)
			throws Exception {
		if (!file.exists()) {
			throw new FileNotFoundException("Failed to find file: " + file.getAbsolutePath());
		}

		Map<String, Object> map = new HashMap<>();
		map.put("url", file.toURI().toURL());

		DataStore dataStore = DataStoreFinder.getDataStore(map);
		String typeName = dataStore.getTypeNames()[0];

		FeatureSource<SimpleFeatureType, SimpleFeature> source = dataStore.getFeatureSource(typeName);
		FeatureCollection<SimpleFeatureType, SimpleFeature> collection = source.getFeatures();
		return collection;
	}
}
