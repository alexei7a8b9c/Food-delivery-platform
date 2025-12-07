FROM eclipse-temurin:21-jre-jammy

VOLUME /tmp
VOLUME /images

RUN mkdir -p /images/restaurants /images/dishes
RUN chmod 755 /images/restaurants /images/dishes

COPY target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]