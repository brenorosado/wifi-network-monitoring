# Use an OpenJDK image
FROM eclipse-temurin:17-jdk

# Set the working directory inside the container
WORKDIR /app

# Copy the Java source code
COPY HelloWorld.java /app/

# Compile the Java code
RUN javac HelloWorld.java

# Define the command to run the Java program
CMD ["java", "HelloWorld"]
