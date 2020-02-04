package com.gitrnd;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import org.opengis.filter.Filter;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;
import org.opengis.referencing.operation.TransformException;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;

public class App {

	public static void main(String[] args) throws IOException, NoSuchAuthorityCodeException, FactoryException,
			MismatchedDimensionException, TransformException {


		try {
			decompress("C:\\gdofiles\\admin\\upload\\20191202_163529\\20191202_163529_obj.zip", "D:\\test");
		} catch (Throwable e) {
			e.printStackTrace();
		}

		File buildingFile = new File("D:\\node\\objTo3d-tiles-master\\bin\\shptoobj\\hoho\\4.shp");
		Filter filter = Filter.INCLUDE;

		try {
//			new ShpToObjImpl(buildingFile, filter, 50, "D:\\node\\objTo3d-tiles-master\\bin\\shptoobj\\hoho\\obj")
//					.exec();
		} catch (Exception e) {
			e.printStackTrace();
		}

//		FileDataStore store = FileDataStoreFinder.getDataStore(file);
//		SimpleFeatureSource fs = store.getFeatureSource();
//
//		CoordinateReferenceSystem sourceCRS = fs.getSchema().getCoordinateReferenceSystem();
//		CoordinateReferenceSystem worldCRS = CRS.decode("EPSG:4326");
//
//		Query query = new Query("Reproject");
//		query.setCoordinateSystem(sourceCRS);
//		query.setCoordinateSystemReproject(worldCRS);
//		SimpleFeatureCollection sfc = fs.getFeatures(query);
//		SimpleFeatureIterator sfIter = sfc.features();
//		
//		while (sfIter.hasNext()) {
//			SimpleFeature feature = sfIter.next();
//			Geometry geom = (Geometry) feature.getDefaultGeometry();
//			if (geom instanceof Point) {
//				
//			} else if (geom instanceof LineString) {
//
//			} else if (geom instanceof Polygon) {
//
//			} else if (geom instanceof MultiPoint) {
//
//			} else if (geom instanceof MultiLineString) {
//
//			} else if (geom instanceof MultiPolygon) {
//
//			} else {
//				throw new IllegalArgumentException("Unsupported geometry type " + geom.getClass());
//			}
//
//		}
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

}
