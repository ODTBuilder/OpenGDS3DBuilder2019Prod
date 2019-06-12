package com.gitrnd.qaproducer.common.worker;

import java.util.LinkedList;

import org.json.simple.JSONObject;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MobileProducer {

	@Autowired
	private RabbitTemplate template;

	@Value("${spring.rabbitmq.template.exchange}")
	private String exchange;
	@Value("${spring.rabbitmq.template.routing-key-mobile}")
	private String routingKey;

	public JSONObject produceMobileMsg(String msg) {

		System.out.println("Send msg = " + msg);
		template.setExchange(exchange);
		template.setRoutingKey(routingKey);
		template.setReplyTimeout(Long.MAX_VALUE);
		JSONObject response = (JSONObject) template.convertSendAndReceive(msg);
		LinkedList arry = (LinkedList) response.get("features");
		if (arry.size() > 0) {
			return response;
		} else {
			return null;
		}
	}
}
