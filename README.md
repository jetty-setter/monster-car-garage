# Monster Car Garage

A standalone family learning project, separate from RabbitHole. Customize a truck's name and paint, preview it, save it to a local SQL database, and reopen it from **Our garage**.

The frontend is plain HTML/CSS/JavaScript with original inline SVG artwork. The backend is Java 21, Spring Boot, Spring Data JPA, and a local H2 database. No accounts, tracking, external assets, or public deployment are included.

## Run locally

Stop your previous backend with Control+C in its terminal, then run:

```sh
cd /Users/stephsimmons/monster-car-garage/garage
sh ./mvnw spring-boot:run
```

Open <http://localhost:8080/>. Do not open the HTML file directly: the page needs its API, which Java serves at the same address.

The database is `garage/data/garage.mv.db` when you start from the `garage` directory. It survives application restarts and is ignored by Git. Do not delete that file unless you intend to erase the local collection. Never run two copies against the same database file.

## What works

- Paint selection and naming.
- Preview validates the design without saving a database row.
- Save creates a truck with a permanent database ID.
- Our garage lists saved trucks, newest first, and reopens them.
- The page URL remembers the opened truck for browser refreshes.
- Visible loading, success, and error messages, with controls locked during requests.

Saving an opened truck creates a **new copy**, not an update. Only the name and color are stored. Body, tire, and decal selections, jump mode, and printing are still disabled placeholders.

## Tests and packaging

```sh
cd /Users/stephsimmons/monster-car-garage/garage
sh ./mvnw verify
```

This compiles Java, runs automated tests against separate in-memory databases, and creates a runnable package containing both the backend and frontend:

```sh
java -jar target/garage-0.0.1-SNAPSHOT.jar
```

Use only one of the two run commands at a time. After source changes, restart the Maven run command; it copies the latest `dist` assets into the runtime. If running the JAR instead, run `verify` again first. Then refresh the browser. A JAR is a built snapshot, not a live view of your source files.

## Scope and safety

This is local development: loopback-only server, blank local H2 password, and automatic development schema updates. Before public hosting we need ownership/authentication, production credentials, controlled database migrations, durable storage/backups, and operational checks. Static Sites hosting cannot run the Java backend. Nothing has been published, and no GitHub repository has been created.

See [LEARNING.md](LEARNING.md) for what changed and hands-on platform lessons.
