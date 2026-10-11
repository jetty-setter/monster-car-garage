FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

COPY garage/ ./garage/
COPY dist/ ./dist/

WORKDIR /workspace/garage

RUN sh ./mvnw --batch-mode --no-transfer-progress verify


FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app

RUN useradd --user-group --uid 10001 --no-create-home garage \
    && mkdir -p /app/data \
    && chown garage:garage /app/data

COPY --from=build \
    /workspace/garage/target/garage-0.0.1-SNAPSHOT.jar \
    ./app.jar

ENV SERVER_ADDRESS=0.0.0.0

USER garage

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]