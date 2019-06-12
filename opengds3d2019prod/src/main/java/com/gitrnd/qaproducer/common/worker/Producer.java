package com.gitrnd.qaproducer.common.worker;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Producer {

	@Autowired
	private RabbitTemplate template;

	@Value("${spring.rabbitmq.template.exchange}")
	private String exchange;
	@Value("${spring.rabbitmq.template.routing-key}")
	private String routingKey;

	public void produceMsg(String msg) {
		System.out.println("Send msg = " + msg);
		template.setExchange(exchange);
		template.setRoutingKey(routingKey);
		template.setReplyTimeout(Long.MAX_VALUE);
		template.convertAndSend(msg);
	}

	public void produceWebMsg(String msg) {

		System.out.println("Send msg = " + msg);
		template.setExchange(exchange);
		template.setRoutingKey(routingKey);
		template.setReplyTimeout(Long.MAX_VALUE);
		template.convertAndSend(msg);
	}

}
