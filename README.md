# Monster Car Garage

Monster Car Garage is a family learning project for naming, painting, and collecting monster trucks. It uses a plain HTML, CSS, and JavaScript frontend with inline SVG artwork and a Java 21 Spring Boot backend.

## Run locally

With Java 21 installed, run these commands from the repository root.

```sh
cd garage
sh ./mvnw spring-boot:run
```

Open <http://localhost:8080/>. Spring Boot serves both the page and its API. The default H2 database is stored in `garage/data/garage.mv.db` and survives restarts.

To run the app with PostgreSQL, use Docker Compose from the repository root.

```sh
docker compose up --build
```

Open <http://localhost:8083/>. PostgreSQL stores the collection in the `monster-garage-postgres-data` Docker volume.

## What you can do

Preview checks a truck's name and paint without saving it. Save adds a truck to **Our garage**, which shows the newest trucks first. An opened truck stays selected when you refresh the page. Saving it again creates a copy.

The database stores the name and paint color. The body, tires, and decal use preset values. Jump mode and printing are placeholders.

## Test and package

From the repository root, run the Maven wrapper in `garage`.

```sh
cd garage
sh ./mvnw verify
```

The tests use separate in-memory databases. The build bundles the frontend and backend in a runnable JAR.

```sh
java -jar target/garage-0.0.1-SNAPSHOT.jar
```

Rebuild the JAR after changing frontend or backend files.

See [LEARNING.md](LEARNING.md) for a walkthrough of how the app saves a truck.
