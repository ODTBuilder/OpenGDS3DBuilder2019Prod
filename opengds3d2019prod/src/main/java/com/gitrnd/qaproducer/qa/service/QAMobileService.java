/**
 * 
 */
package com.gitrnd.qaproducer.qa.service;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gitrnd.qaproducer.common.worker.MobileProducer;

/**
 * @author GIT
 *
 */
@Service("mobileService")
public class QAMobileService {

	@Autowired
	private MobileProducer producer;

	/**
	 * @param param
	 * @return
	 */
	public JSONObject validate(JSONObject param) {

		param.put("type", "mobile");
		JSONObject test = (JSONObject) producer.produceMobileMsg(param.toString());
		return test;
	}
}
