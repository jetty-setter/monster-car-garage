package com.bigwheel.garage;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController 
public class TruckController {

    private final TruckService truckService;

    public TruckController(TruckService truckService) {
        this.truckService = truckService;
    }

    @GetMapping("/api/trucks/demo")
    public TruckResponse getDemoTruck() {
        return truckService.getDemoTruck();
    }

    @PostMapping("/api/trucks/preview")
    public TruckResponse previewTruck(@Valid @RequestBody TruckDesignRequest request) {
        return truckService.previewTruck(request);
    }

    @PostMapping("/api/trucks")
    public ResponseEntity<TruckResponse> saveTruck(@Valid @RequestBody TruckDesignRequest request) {
        TruckResponse saved = truckService.saveTruck(request);
        return ResponseEntity.created(URI.create("/api/trucks/" + saved.id())).body(saved);
    }

    @GetMapping("/api/trucks")
    public List<TruckResponse> getTrucks() {
        return truckService.getTrucks();
    }

    @GetMapping("/api/trucks/{id}")
    public ResponseEntity<TruckResponse> getTruck(@PathVariable("id") Long id) {
        return ResponseEntity.of(truckService.getTruck(id));
    }
}
