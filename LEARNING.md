# How Monster Car Garage works

The garage connects a plain JavaScript frontend to a Spring Boot API and a SQL database. This walkthrough uses the default local H2 setup.

## Follow one Save click

```text
Browser: name + paint
        │ POST /api/trucks with JSON
        ▼
TruckController — receives the request and validates its fields
        ▼
TruckService — trims the name, normalizes paint, asks to save
        ▼
TruckRepository — asks Hibernate/JPA to write the truck
        ▼
H2 database — stores a row and assigns a numeric ID
        │ response returns through the same layers
        ▼
Browser — shows confirmation and adds the saved truck card
```

The response is `201 Created`, with JSON and a `Location` header identifying the new truck. Preview validates and formats a design without calling the Repository. Reopening reads a saved row; it does not create another one.

## Where to look

| File | Responsibility |
| --- | --- |
| `dist/app.js` | Button events, API calls, temporary screen state, feedback and garage cards |
| `TruckController.java` | HTTP routes, request validation, response status codes |
| `TruckService.java` | Design normalization and save/read orchestration |
| `Truck.java` | Maps a Java truck to the `trucks` table |
| `TruckRepository.java` | Database save and query operations supplied by Spring Data |
| `TruckDesignRequest.java` | Input rules: name up to 40 characters, six-digit hex paint |
| `TruckResponse.java` | JSON shape returned to the browser |
| `application.properties` | Local server and database settings |
| `TruckApiTests.java` | Automated checks using an isolated test database |
| `pom.xml` | Libraries, Java version, frontend copying, application packaging |

Java files are under `garage/src/main/java/com/bigwheel/garage/`. Tests are under `garage/src/test/java/com/bigwheel/garage/`.

## API map

| Method and path | Result | Writes data? |
| --- | --- | --- |
| `GET /api/trucks/demo` | Example truck | No |
| `POST /api/trucks/preview` | Validated preview | No |
| `POST /api/trucks` | New saved truck, 201 | Yes |
| `GET /api/trucks` | All saved trucks, newest first | No |
| `GET /api/trucks/123` | Stored truck, or 404 if missing | No |

Names and colors are the current stored fields. Body, tires, and decal values in responses are fixed defaults, not completed customization features. Each Save adds a new row; updating and deleting are not implemented.

## Trace a request in the browser

1. Start the app using README instructions. Open browser developer tools and the Network panel.
2. Choose a paint, name it `Blue Thunder`, and click Preview. Look for a POST to `/api/trucks/preview`.
3. Inspect its request body and response. The response ID is `preview`, not a saved ID.
4. Click Save truck. Inspect the POST to `/api/trucks`, status 201, numeric ID, and Location header.
5. Click New truck, then open Blue Thunder from Our garage. Look for the GET with its ID.
6. Refresh the page. The `?truck=...` URL tells the page which stored truck to reload.

## Check that a truck survives a restart

1. Save a distinctively named truck. Note its ID.
2. Stop the backend with Control+C. Restart from the same `garage` directory.
3. Open Our garage. The name, ID, and paint should still be there.

## API tests

Run `sh ./mvnw verify` from the `garage` directory.

The suite covers preview without saving, creation and readback, ordering, missing IDs, invalid inputs, startup, and serving frontend files.

Tests use a disposable in-memory H2 database so they can clear it between cases.

## Run the packaged app

`verify` produces `garage/target/garage-0.0.1-SNAPSHOT.jar`. It contains compiled Java, dependencies, and copied frontend files. Run it with Java from the `garage` directory to retain the same relative database location.

The H2 database stays in `garage/data` when you rebuild the JAR. The [README](README.md#run-locally) also documents the Docker Compose setup with PostgreSQL.
