package com.gitrnd;

import java.io.File;

import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;

public class App {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
//		File buildingFile = new File("D:\\node\\objTo3d-tiles-master\\bin\\0809\\4326_1.shp");
//		File buildingFile = new File("D:/test/clip/TL_building_clipped.shp");
		File buildingFile = new File("D:/test/node_data/4326_1.shp");
		Filter filter = Filter.INCLUDE;

		try {
			new ShpToObjImpl(buildingFile, filter, 0.0005, "D:/test/node_data/4326_1.obj")
					.exec();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		;
	}

}
