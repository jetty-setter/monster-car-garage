# From writing code to running a platform

You built the first working request, the Controller/Service separation, the frontend connection, and the database types. This accelerated pass completes saving and reopening trucks, adds automated checks, and packages the frontend with Java. We can now learn the surrounding platform using a real application.

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

## Lesson 1: observe the network

1. Start the app using README instructions. Open browser developer tools and the Network panel.
2. Choose a paint, name it `Blue Thunder`, and click Preview. Look for a POST to `/api/trucks/preview`.
3. Inspect its request body and response. The response ID is `preview`, not a saved ID.
4. Click Save truck. Inspect the POST to `/api/trucks`, status 201, numeric ID, and Location header.
5. Click New truck, then open Blue Thunder from Our garage. Look for the GET with its ID.
6. Refresh the page. The `?truck=...` URL tells the page which stored truck to reload.

Explain it aloud: “The screen makes a request. The backend checks it and stores the design. The database gives it an ID, and the screen uses that ID to reopen it.”

## Lesson 2: prove persistence

1. Save a distinctively named truck. Note its ID.
2. Stop the backend with Control+C. Restart from the same `garage` directory.
3. Open Our garage. The name, ID, and paint should still be there.
4. Next, we can inspect the `trucks` table with SQL while respecting H2's file locking. Do not delete or replace the database to inspect it.

The browser's current selection is temporary JavaScript state. The saved collection is SQL data on disk. These are separate things.

## Lesson 3: tests are repeatable checks

Run `sh ./mvnw verify` from the `garage` directory.

Read one test at a time: send a request, check its response, check the database result. The suite covers preview without saving, creation and readback, ordering, missing IDs, invalid inputs, startup, and serving frontend files.

Tests use `jdbc:h2:mem:...`: disposable memory databases, not `data/garage.mv.db`. Their table-clearing operations affect only those test databases. Automated tests do not replace browser checks or a restart-persistence check.

## Lesson 4: a build is a deliverable

`verify` produces `garage/target/garage-0.0.1-SNAPSHOT.jar`. It contains compiled Java, dependencies, and copied frontend files. Run it with Java from the `garage` directory to retain the same relative database location.

The database is **not** inside the JAR. Replacing an application package should not erase its data. The current H2 file would still need a persistent disk if the application were hosted.

## Next: pipeline, deployment, and operations

We have not configured these yet. Learn them in this order:

1. **CI:** a change triggers checkout, Java setup, `verify`, and a saved build artifact. A failing test stops that candidate.
2. **Deployment:** run that same artifact in a separate environment with its own database and settings. Keep development data separate.
3. **Production readiness:** authentication/ownership, credentials, schema migrations, persistent storage, backups, HTTPS, and recovery plans.
4. **Operations:** logs explain events; health checks say whether it is responding; metrics show patterns. Practice a failed request and a stopped backend locally first.
5. **Background jobs:** add queues/retries only when there is an actual slow task, such as generating a printable asset. Then make duplicate messages safe before retrying them automatically.

The next useful exercise is tracing your saved truck all the way to its database row. After that, we can turn the existing build command into a CI pipeline together.
