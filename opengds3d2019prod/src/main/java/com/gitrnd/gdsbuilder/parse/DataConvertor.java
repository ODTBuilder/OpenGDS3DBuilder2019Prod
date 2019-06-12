package com.gitrnd.gdsbuilder.parse;

import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.SchemaException;
import org.json.simple.JSONObject;

/**
 * {@link SimpleFeatureCollection}와 {@link JSONObject} 간의 데이터 변환을 지원하는 인터페이스
 * @author SG.Lee
 * @since 2017. 5. 11. 오전 12:06:59
 * */
public interface DataConvertor {

	/**
	 * SimpleFeatureCollection클래스를 JSONObject클래스로 변환
	 * @author SG.Lee
	 * @since 2017. 2
	 * @param collection {@link SimpleFeatureCollection}을 JSONObject 타입으로 변환
	 * @return JSONObject 변환된 {@link JSONObject}  
	 * @throws
	 * */
	public JSONObject simpleToGeojson(SimpleFeatureCollection collection);
	
	/**
	 * 속성을 가진 JSONObject를 SimpleFeatureCollection으로 변환하여 반환
	 * @author SG.Lee
	 * @since 2017. 2
	 * @param geojson Geojson
	 * @param attribute {"colunm1" :"String", "colunm2":"Long"}
	 * @return SimpleFeatureCollection 변환된 {@link SimpleFeatureCollection}
	 * @throws SchemaException
	 * */
	public SimpleFeatureCollection geoJsonToSimpleFeatureCollecion(JSONObject geojson, JSONObject attribute) throws SchemaException;
	
	/**
	 * 속성이 없는 JSONObject를 SimpleFeatureCollection으로 변환하여 반환
	 * @author SG.Lee
	 * @since 2017. 2
	 * @param geojson Geojson
	 * @return SimpleFeatureCollection 변환된 {@link SimpleFeatureCollection}
	 * @throws
	 * */
	public SimpleFeatureCollection geoJsonToSimpleFeatureCollecion(JSONObject geojson) throws SchemaException;
}
