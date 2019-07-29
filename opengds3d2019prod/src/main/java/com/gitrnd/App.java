package com.gitrnd;

import java.io.File;

import org.opengis.filter.Filter;

import com.gitrnd.gdsbuilder.parse.impl.ShpToObjImpl;

public class App {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		File buildingFile = new File("D:/test/제천99%/TN_BULD_E.shp");
//		File buildingFile = new File("D:/test/clip/TL_building_clipped.shp");
		Filter filter = Filter.INCLUDE;
		
		try {
			new ShpToObjImpl(buildingFile, filter, "BFLR_CO","D:/test/result").exec();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		};
	}

}
