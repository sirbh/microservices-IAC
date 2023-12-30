# Use an official Maven image as the base image
FROM maven:3.8.4-openjdk-17 
# Set the working directory in the container
WORKDIR /app
# Copy the pom.xml and the project files to the container
COPY pom.xml .
COPY src ./src
# Build the application using Maven
RUN mvn clean install
RUN mvn clean compile assembly:single


