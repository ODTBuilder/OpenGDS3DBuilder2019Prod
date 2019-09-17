package com.gitrnd;

import java.io.File;

import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;

public class App {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		File buildingFile = new File("D:\\4326test\\4326_1.shp");
		// File buildingFile = new File("D:/test/clip/TL_building_clipped.shp");
		Filter filter = Filter.INCLUDE;

		try {
			new ShpToObjImpl(buildingFile, filter, 0.0005, "D:\\4326test\\carte_1.obj")
					.exec();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
