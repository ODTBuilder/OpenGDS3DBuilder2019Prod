package com.gitrnd.gdsbuilder.parse.impl;

import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.SchemaException;
import org.json.simple.JSONObject;

import com.gitrnd.gdsbuilder.parse.DataConvertor;

/**
 * 데이터 변환을 하는 클래스
 * @author SG.LEE
 */
public class DataConvertorImpl implements DataConvertor {
	
	/* (non-Javadoc)
	 * @see com.gitrnd.gdsbuilder.parse.DataConvertor#simpleToGeojson(org.geotools.data.simple.SimpleFeatureCollection)
	 */
	@Override
	public JSONObject simpleToGeojson(SimpleFeatureCollection collection) {
		return new SimpleToGeojsonImpl().build(collection);
	};

	/* (non-Javadoc)
	 * @see com.gitrnd.gdsbuilder.parse.DataConvertor#geoJsonToSimpleFeatureCollecion(org.json.simple.JSONObject, org.json.simple.JSONObject)
	 */
	@Override
	public SimpleFeatureCollection geoJsonToSimpleFeatureCollecion(JSONObject geojson, JSONObject attribute) throws SchemaException {
		return new GeoJsonToSimpleImpl().converToSimpleFeatureCollection(geojson, attribute);
	};

	/* (non-Javadoc)
	 * @see com.gitrnd.gdsbuilder.parse.DataConvertor#geoJsonToSimpleFeatureCollecion(org.json.simple.JSONObject)
	 */
	@Override
	public SimpleFeatureCollection geoJsonToSimpleFeatureCollecion(JSONObject geojson) throws SchemaException {
		return new GeoJsonToSimpleImpl().converToSimpleFeatureCollection(geojson);
	};

}
