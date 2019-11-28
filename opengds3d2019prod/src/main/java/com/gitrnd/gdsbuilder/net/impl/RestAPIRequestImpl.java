package com.gitrnd.gdsbuilder.net.impl;

import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.Base64;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.gitrnd.gdsbuilder.net.RestAPIRequest;

/**
 * REST 요청 클래스
 * @author SG.LEE
 *
 */
public class RestAPIRequestImpl extends RestTemplate implements RestAPIRequest{
	
	private static final Logger LOGGER = LoggerFactory.getLogger(RestAPIRequestImpl.class);
	
	/* (non-Javadoc)
	 * @see com.gitrnd.gdsbuilder.net.RestAPIRequest#requestRestAPI(org.springframework.http.HttpMethod, java.lang.String, java.lang.String)
	 */
	@Override
	public JSONObject requestRestAPI(HttpMethod method, String url, String body){
		HttpHeaders headers = new HttpHeaders();
		headers.setAcceptCharset(Arrays.asList(Charset.forName("UTF-8")));
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		
		return this.exec(method, headers, url, body);
	}
	
	/* (non-Javadoc)
	 * @see com.gitrnd.gdsbuilder.net.RestAPIRequest#requestRestAPI(org.springframework.http.HttpMethod, java.lang.String, java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public JSONObject requestRestAPI(HttpMethod method, String url, String id, String pw, String body){
		String user = id + ":" + pw;
		String encodedAuth = "Basic " + Base64.getEncoder().encodeToString(user.getBytes());
		
		HttpHeaders headers = new HttpHeaders();
		headers.setAcceptCharset(Arrays.asList(Charset.forName("UTF-8")));
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
		headers.add("Authorization", encodedAuth);
		
		return this.exec(method, headers, url, body);
	}
	
	/**
	 * REST 요청 실행 메서드
	 * @author SG.LEE
	 * @param method
	 * @param headers
	 * @param url
	 * @param body
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private JSONObject exec(HttpMethod method,HttpHeaders headers
			  , String url
			  , String body){
		JSONObject jsonObject = new JSONObject();
		JSONParser parser = new JSONParser();

		try{
			LOGGER.info("### start exec() ................");
			
			HttpEntity<String> entity;
			if(body == null){
				entity = new HttpEntity<String>(headers);
			}else{
				headers.setContentLength(body.length());
				entity = new HttpEntity<String>(body, headers);
			}
			
			ResponseEntity<String> result = null;
			
			result = super.exchange(url,method,entity,String.class);
			LOGGER.info("### entity : " + entity.toString());
			
			jsonObject = (JSONObject) parser.parse(result.getBody());
			jsonObject.put("status", result.getStatusCode().value());
			
			return jsonObject;
		}catch (Exception e) {
			jsonObject.put("status" , 500);
			jsonObject.put("message", e.getMessage());
			return jsonObject;
		}
	}
}
