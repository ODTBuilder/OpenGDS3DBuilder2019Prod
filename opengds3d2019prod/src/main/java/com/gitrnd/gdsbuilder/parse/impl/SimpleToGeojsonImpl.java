package com.gitrnd.gdsbuilder.parse.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.geojson.geom.GeometryJSON;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.opengis.feature.Property;
import org.opengis.feature.simple.SimpleFeature;

import com.vividsolutions.jts.geom.Geometry;

/**
 * {@link SimpleFeatureCollection} 인터페이스를 Geojson 구조의 {@link JSONObject} 객체로
 * 변환하는 클래스
 * 
 * @author SG.LEE
 *
 */
public class SimpleToGeojsonImpl {

	/**
	 * SimpleFeatureCollection을 JSONObject로 변환하여 반환한다.
	 * 
	 * @author dayeon.oh
	 * @param simpleFeatureCollection 변환할 SimpleFeatureCollection
	 * @return JSONObject 변환된 {@link JSONObject}
	 */
	public JSONObject build(SimpleFeatureCollection simpleFeatureCollection) {

		return buildFeatureCollection(simpleFeatureCollection);
	}

	/**
	 * {@link JSONObject} 형태의 {@link SimpleFeatureCollection} 객체 생성
	 * 
	 * @author SG.LEE
	 * @param featureCollection 변환할 SimpleFeatureCollection
	 * @return JSONObject 변환된 {@link JSONObject}
	 */
	@SuppressWarnings("unchecked")
	private JSONObject buildFeatureCollection(SimpleFeatureCollection featureCollection) {

		JSONArray features = new JSONArray();

		JSONObject obj = new JSONObject();
		obj.put("type", "FeatureCollection");
		obj.put("features", features);
		SimpleFeatureIterator simpleFeatureIterator = featureCollection.features();

		// int i = 0;
		while (simpleFeatureIterator.hasNext()) {
			SimpleFeature simpleFeature = simpleFeatureIterator.next();
		}
		return obj;
	}

	/**
	 * @author SG.LEE
	 * @param simpleFeature
	 * @return JSONObject 변환된 {@link JSONObject}
	 */
	@SuppressWarnings("unchecked")
	private JSONObject buildFeature(SimpleFeature simpleFeature) {

		JSONObject obj = new JSONObject();
		obj.put("type", "Feature");
		obj.put("id", simpleFeature.getID());
		obj.put("geometry", buildGeometry((Geometry) simpleFeature.getDefaultGeometry()));
		obj.put("properties", buildProperties(simpleFeature));
		return obj;
	}

	/**
	 * @author SG.LEE
	 * @param simpleFeature
	 * @return JSONObject 변환된 {@link JSONObject}
	 */
	@SuppressWarnings("unchecked")
	private JSONObject buildProperties(SimpleFeature simpleFeature) {

		JSONObject obj = new JSONObject();
		Collection<Property> properties = simpleFeature.getProperties();

		for (Property property : properties) {
			obj.put(property.getName().toString(), property.getValue() == null ? "" : property.getValue().toString());
		}
		return obj;
	}

	/**
	 * @author SG.LEE
	 * @param simpleFeature
	 * @return JSONObject 변환된 {@link JSONObject}
	 */
	private List<String> buildPropertiesType(SimpleFeature simpleFeature) {

		Collection<Property> properties = simpleFeature.getProperties();
		List<String> typeArray = new ArrayList<String>();
		for (Property property : properties) {
			String tempType = property.getType().toString();
			int firstIndex = tempType.indexOf("<");
			int lastIndex = tempType.lastIndexOf(">");
			String propertyType = tempType.substring(firstIndex + 1, lastIndex);
			typeArray.add(propertyType);
		}
		return typeArray;
	}

	private JSONObject buildGeometry(Geometry geometry) {
		GeometryJSON gjson = new GeometryJSON();
		Object obj = JSONValue.parse(gjson.toString(geometry));
		JSONObject jsonObj = (JSONObject) obj;
		return jsonObj;
	}
}
