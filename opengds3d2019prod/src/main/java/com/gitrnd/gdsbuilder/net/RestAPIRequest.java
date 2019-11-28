package com.gitrnd.gdsbuilder.net;

import org.json.simple.JSONObject;
import org.springframework.http.HttpMethod;

/**
 * REST 요청 인터페이스
 * @author SG.LEE
 *
 */
public interface RestAPIRequest {

	/**
	 * 일반 REST 요청
	 * @author SG.LEE
	 * @param method 요청타입
	 * @param path 경로
	 * @param body Request body
	 * @return 요청결과 JSON
	 */
	public JSONObject requestRestAPI(HttpMethod method, String url, String body);
	
	/**
	 * 권한 REST 요청
	 * @author SG.LEE
	 * @param method 요청타입
	 * @param path 경로
	 * @param id 아이디
	 * @param pw 패스워드
	 * @param body Request Body
	 * @return 요청결과 JSON
	 */
	public JSONObject requestRestAPI(HttpMethod method, String url, String id, String pw, String body);
}
