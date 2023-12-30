package fi.tuni.utility;

import java.net.http.HttpClient;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

public class Utility {
    public final static String EXCHANGE_NAME = "The_Exchange";
    public final static String ROUTING_KEY_MESSAGE = "message";
    public final static String ROUTING_KEY_LOG = "log";

    public static HttpClient client = HttpClient.newBuilder().build();
    public static String serverUrl;
    public static Channel channel = null;

    public static void createChannelAndExchange() {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(System.getenv("RABBIT_MQ_HOST")); // Replace with your RabbitMQ server's hostname or IP address
        try {
            Connection connection = factory.newConnection();
            channel = connection.createChannel();
            channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.DIRECT, true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
