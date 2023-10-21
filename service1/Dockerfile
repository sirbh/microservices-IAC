FROM openjdk:17

WORKDIR /app


COPY . .

RUN mkdir target
RUN javac -cp ".:lib/amqp-client-5.19.0.jar" -d "./target" utility/Utility.java
RUN javac -cp ".:./target/utility/:./lib/amqp-client-5.19.0.jar" -d "./target" App.java