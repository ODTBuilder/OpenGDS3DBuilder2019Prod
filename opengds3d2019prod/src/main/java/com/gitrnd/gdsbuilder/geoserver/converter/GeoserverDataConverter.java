package com.gitrnd.gdsbuilder.geoserver.converter;

/**
 * Geoserver 데이터를 검수 유형에 따라 파일로 변환하는 인터페이스 수치지도, 임상도, 지하시설물 검수유형을 지원함
 * 
 * @author SG.Lee
 * @since 2018. 10. 30. 오전 9:52:33
 */
public interface GeoserverDataConverter {
	/**
	 * Geoserver WFS를 활용해 Data를 수치지도 파일구조에 맞게 다운로드함
	 * 
	 * @author SG.Lee
	 * @since 2018. 10. 30. 오전 9:57:15
	 * @return int 200 성공 500 내부에러 700 파일구조에러 612 레이어 리스트 NULL 702 파일손상 611
	 *         Geoserver Layer 다운에러
	 */
	public int digitalExport();

	/**
	 * Geoserver WFS를 활용해 Data를 지하시설물 파일구조에 맞게 다운로드함
	 * 
	 * @author SG.Lee
	 * @since 2018. 10. 29. 오후 3:48:38
	 * @return int 200 성공 500 내부에러 700 파일구조에러 612 레이어 리스트 NULL 702 파일손상 611
	 *         Geoserver Layer 다운에러
	 */
	public int undergroundExport();

	/**
	 * Geoserver WFS를 활용해 Data를 임상도 파일구조에 맞게 다운로드함
	 * 
	 * @author SG.Lee
	 * @since 2018. 10. 29. 오후 3:48:38
	 * @param nearLine 검수 영역 레이어명
	 * @return int 200 성공 500 내부에러 700 파일구조에러 612 레이어 리스트 NULL 702 파일손상 611
	 *         Geoserver Layer 다운에러
	 */
	public int forestExport(String nearLine);
}
