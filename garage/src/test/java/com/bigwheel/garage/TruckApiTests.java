package com.bigwheel.garage;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

// This database exists only in memory. Tests never use the family's local file database.
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:garage-api-test;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class TruckApiTests {
    @Autowired private MockMvc mvc;
    @Autowired private TruckRepository repository;

    @BeforeEach
    void clearTestDatabase() {
        repository.deleteAll();
    }

    @Test
    void demoDoesNotCreateAStoredTruck() throws Exception {
        mvc.perform(get("/api/trucks/demo"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("demo"))
            .andExpect(jsonPath("$.name").value("Honest Abe"));
        assertEquals(0, repository.count());
    }

    @Test
    void previewNormalizesInputWithoutSaving() throws Exception {
        mvc.perform(post("/api/trucks/preview")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"  Blue Thunder  \",\"color\":\"#ABCDEF\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("preview"))
            .andExpect(jsonPath("$.name").value("Blue Thunder"))
            .andExpect(jsonPath("$.color").value("#abcdef"));
        assertEquals(0, repository.count());
    }

    @Test
    void savedTruckCanBeReadBack() throws Exception {
        mvc.perform(post("/api/trucks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"  Blue Thunder  \",\"color\":\"#ABCDEF\"}"))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", containsString("/api/trucks/")))
            .andExpect(jsonPath("$.name").value("Blue Thunder"))
            .andExpect(jsonPath("$.color").value("#abcdef"));

        assertEquals(1, repository.count());
        Truck saved = repository.findAll().getFirst();
        mvc.perform(get("/api/trucks/" + saved.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(saved.getId().toString()))
            .andExpect(jsonPath("$.name").value("Blue Thunder"))
            .andExpect(jsonPath("$.color").value("#abcdef"));
    }

    @Test
    void garageListsNewestTruckFirst() throws Exception {
        repository.save(new Truck("First", "#396b9c"));
        repository.save(new Truck("Second", "#ba5831"));
        mvc.perform(get("/api/trucks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("Second"))
            .andExpect(jsonPath("$[1].name").value("First"));
    }

    @Test
    void missingTruckReturnsNotFound() throws Exception {
        mvc.perform(get("/api/trucks/999999"))
            .andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "{\"name\":\"\",\"color\":\"#396b9c\"}",
        "{\"name\":\"   \",\"color\":\"#396b9c\"}",
        "{\"color\":\"#396b9c\"}",
        "{\"name\":\"This name is much too long for our truck garage collection\",\"color\":\"#396b9c\"}",
        "{\"name\":\"Truck\",\"color\":\"red\"}",
        "{\"name\":\"Truck\",\"color\":\"#gggggg\"}",
        "{\"name\":\"Truck\"}"
    })
    void invalidDesignsAreRejectedWithoutSaving(String payload) throws Exception {
        mvc.perform(post("/api/trucks")
                .contentType(MediaType.APPLICATION_JSON).content(payload))
            .andExpect(status().isBadRequest());
        mvc.perform(post("/api/trucks/preview")
                .contentType(MediaType.APPLICATION_JSON).content(payload))
            .andExpect(status().isBadRequest());
        assertEquals(0, repository.count());
    }

    @Test
    void packagedFrontendIsServedAlongsideApi() throws Exception {
        mvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(forwardedUrl("index.html"));
        mvc.perform(get("/index.html"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("id=\"truck-form\"")));
        mvc.perform(get("/app.js"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("/api/trucks")));
    }
}
