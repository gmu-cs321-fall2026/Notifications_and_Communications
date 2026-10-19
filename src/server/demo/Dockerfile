# syntax=docker/dockerfile:1

FROM eclipse-temurin:17-jdk-jammy as builder

WORKDIR /build

COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/
COPY pom.xml .
COPY ./src/main/java src/main/java
COPY ./src/main/resources src/main/resources

RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-jammy as final

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "app.jar"]