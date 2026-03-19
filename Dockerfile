FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

# Use system Maven instead of wrapper
RUN apt-get update && apt-get install -y maven
RUN mvn clean package -DskipTests

# Ensure target directory exists and list contents
RUN ls -la target/ || echo "Target directory not found"

EXPOSE 8082

CMD ["java", "-jar", "target/smart_campus-0.0.1-SNAPSHOT.jar"]
