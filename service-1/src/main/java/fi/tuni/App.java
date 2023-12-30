package fi.tuni;

import static fi.tuni.utility.Utility.*;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URLEncoder;

import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 
 * Hello world!
 *
 */
public class App {

    private static int counter = 0;
    private static String host;
    private static String port;


    private static Runnable task = () -> {
        ++counter;
        System.out.println("Sending message " + counter + " to the exchange.");
        try {
            serverUrl = "http://" + host + ":" + port + "/" + "?text=";
            // message to be sent to the exchange and http request
            String message = "SND " + counter + " " + LocalDateTime.now().toString() + " "
                    + InetAddress.getByName(host).getHostAddress() + ":" + port;

            // send message to the exchange
            channel.basicPublish(EXCHANGE_NAME, ROUTING_KEY_MESSAGE, null, message.getBytes("UTF-8"));

            // send http request by encoding the message
            String encodedMessage = URLEncoder.encode(message, "UTF-8");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(serverUrl + encodedMessage))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // send log to the exchange
            if (response.statusCode() == 200) {
                channel.basicPublish(EXCHANGE_NAME, ROUTING_KEY_LOG, null,
                        ("200 " + LocalDateTime.now().toString()).getBytes("UTF-8"));
            } else {
                channel.basicPublish(EXCHANGE_NAME, ROUTING_KEY_LOG, null,
                        "something unexpected happend".getBytes("UTF-8"));
            }

        } catch (IOException | InterruptedException e) {
            try {

                channel.basicPublish(EXCHANGE_NAME, ROUTING_KEY_LOG, null,
                        "something unexpected happend".getBytes("UTF-8"));
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    };

    public static void main(String[] args) throws Exception {
        host = System.getenv("HOST");
        port = System.getenv("PORT");
        // host = "localhost";
        // port = "3000";
        createChannelAndExchange();

        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        scheduler.scheduleAtFixedRate(task, 0, 2, TimeUnit.SECONDS);
        scheduler.schedule(() -> {
            scheduler.shutdown();
            System.out.println("Scheduler stopped.");

        }, 400, TimeUnit.SECONDS);
    }
}