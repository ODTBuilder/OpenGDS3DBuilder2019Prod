package com.gitrnd;

import java.io.File;

import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;

public class App {

	public static void main(String[] args) {

//		List<Integer> triangles = Earcut.earcut(
//				new double[] { 0, 0, 100, 0, 100, 100, 0, 100, 20, 20, 80, 20, 80, 80, 20, 80 }, new int[] { 4 }, 2);

		// TODO Auto-generated method stub
		File buildingFile = new File("D:\\node\\objTo3d-tiles-master\\bin\\0909\\shp\\gis_osm_building_4326_622.shp");
		// File buildingFile = new File("D:/test/clip/TL_building_clipped.shp");
		Filter filter = Filter.INCLUDE;

		try {
			new ShpToObjImpl(buildingFile, filter, 50,
					"D:\\node\\objTo3d-tiles-master\\bin\\0909\\gis_osm_building_4326_622.obj").exec();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

}
