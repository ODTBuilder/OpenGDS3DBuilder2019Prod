package com.gitrnd.gdsbuilder.geoserver.converter.impl;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.gitrnd.gdsbuilder.geoserver.converter.GeoserverDataConverter;
import com.gitrnd.gdsbuilder.geoserver.converter.type.DigitalMapExport;
import com.gitrnd.gdsbuilder.geoserver.converter.type.ForestExport;
import com.gitrnd.gdsbuilder.geoserver.converter.type.UndergroundExport;

/**
 * Geoserver 데이터를 검수 유형에 따라 파일로 변환하는 클래스 수치지도, 임상도, 지하시설물 검수유형을 지원함
 * 
 * @author SG.Lee
 * @since 2018. 10. 30. 오전 9:52:33
 */
public class GeoserverDataConverterImpl implements GeoserverDataConverter {
	private final String serverURL;
	private final Map<String, List<String>> layerMaps;
	private final String outputFolderPath;
	private final String srs;

	/**
	 * GeoserverDataConverterImpl 생성자
	 * 
	 * @author SG.LEE
	 * @param serverURL        Geoserver URL
	 * @param layerMaps        key : 작업공간, value : 레이어명
	 * @param outputFolderPath Export 경로
	 * @param srs              좌표계
	 */
	public GeoserverDataConverterImpl(String serverURL, Map<String, List<String>> layerMaps, String outputFolderPath,
			String srs) {
		if (serverURL.isEmpty() || layerMaps == null || outputFolderPath.isEmpty() || srs.isEmpty()) {
			throw new IllegalArgumentException("필수파라미터 입력안됨");
		}
		this.serverURL = serverURL;
		this.layerMaps = layerMaps;
		this.outputFolderPath = outputFolderPath;
		this.srs = srs;
	}

	public String getSrs() {
		return srs;
	}

	public String getServerURL() {
		return serverURL;
	}

	public Map<String, List<String>> getLayerMaps() {
		return layerMaps;
	}

	public String getOutputFolderPath() {
		return outputFolderPath;
	}

	/**
	 * @since 2018. 10. 30.
	 * @author SG.Lee
	 * @return int
	 * @see com.git.gdsbuilder.geoserver.converter.GeoserverDataConverter#digitalExport()
	 */
	public int digitalExport() {
		return new DigitalMapExport(serverURL, layerMaps, outputFolderPath, srs).export();
	}

	/**
	 * @since 2018. 10. 30.
	 * @author SG.Lee
	 * @return int
	 * @see com.git.gdsbuilder.geoserver.converter.GeoserverDataConverter#undergroundExport()
	 */
	public int undergroundExport() {
		int flag = 500;
		if (layerMaps != null) {
			int mapSize = layerMaps.size();

			if (mapSize > 1) {
				System.err.println("지하시설물은 workspace 하나만 가능합니다");
				flag = 700;
			} else {
				Iterator<String> keys = layerMaps.keySet().iterator();
				while (keys.hasNext()) {
					String workspace = keys.next();
					List<String> layerNames = layerMaps.get(workspace);
					if (layerNames != null) {
						flag = new UndergroundExport(serverURL, workspace, layerNames, outputFolderPath, srs).export();
					} else {
						flag = 612;
						System.err.println("레이어 리스트 NULL");
					}
				}
			}
		}
		return flag;
	}

	/**
	 * @since 2018. 10. 30.
	 * @author SG.Lee
	 * @param nearLine 검수 영역 레이어명
	 * @return int
	 * @see com.git.gdsbuilder.geoserver.converter.GeoserverDataConverter#forestExport(java.lang.String)
	 */
	public int forestExport(String nearLine) {
		int flag = 500;
		if (layerMaps != null) {
			int mapSize = layerMaps.size();

			if (mapSize > 1) {
				System.err.println("임상도는 workspace 하나만 가능합니다");
				flag = 700;
			} else {
				Iterator<String> keys = layerMaps.keySet().iterator();
				while (keys.hasNext()) {
					String workspace = keys.next();
					List<String> layerNames = layerMaps.get(workspace);
					if (layerNames != null) {
						flag = new ForestExport(serverURL, workspace, layerNames, outputFolderPath, srs, nearLine)
								.export();
					} else {
						flag = 612;
						System.err.println("레이어 리스트 NULL");
					}
				}
			}
		}
		return flag;
	}
}
