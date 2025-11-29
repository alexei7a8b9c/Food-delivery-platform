package com.example.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 1. Exchange (точка маршрутизации сообщений)
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange("order.exchange");
    }

    // 2. Queue для событий создания заказа
    @Bean
    public Queue orderCreatedQueue() {
        return new Queue("order.created.queue", true); // true = durable (сохраняется при перезапуске)
    }

    // 3. Queue для событий изменения статуса заказа
    @Bean
    public Queue orderStatusQueue() {
        return new Queue("order.status.queue", true);
    }

    // 4. Binding: связывает очередь создания заказов с exchange
    @Bean
    public Binding orderCreatedBinding() {
        return BindingBuilder
                .bind(orderCreatedQueue())          // какую очередь связываем
                .to(orderExchange())                // с каким exchange
                .with("order.created");             // по какому routing key
    }

    // 5. Binding: связывает очередь статусов с exchange
    @Bean
    public Binding orderStatusBinding() {
        return BindingBuilder
                .bind(orderStatusQueue())           // какую очередь связываем
                .to(orderExchange())                // с каким exchange
                .with("order.status");              // по какому routing key
    }
}