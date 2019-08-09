package com.gitrnd;

import java.io.File;

import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;

public class App {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
//		File buildingFile = new File("D:/test/제천99%/TN_BULD_E.shp");
		File buildingFile = new File("D:/test/3857/gis_osm_building_3857.shp");
		Filter filter = Filter.INCLUDE;
		
		try {
			new ShpToObjImpl(buildingFile, filter, 20,"D:/test/3857/gis_osm_building_3857_2.obj").exec();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		};
	}

}
