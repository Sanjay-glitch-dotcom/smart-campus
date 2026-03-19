#!/bin/bash
mvn clean package -DskipTests
java -jar target/smart_campus-0.0.1-SNAPSHOT.jar
