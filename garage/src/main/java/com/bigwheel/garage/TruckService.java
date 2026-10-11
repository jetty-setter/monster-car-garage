package com.bigwheel.garage;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class TruckService {

    private final TruckRepository truckRepository;

    public TruckService(TruckRepository truckRepository) {
        this.truckRepository = truckRepository;
    }

    public TruckResponse getDemoTruck() {
        return new TruckResponse(
            "demo", "Honest Abe", "pickup", "#396b9c", "mud", "hat"
        );
    }

    public TruckResponse previewTruck(TruckDesignRequest request) {
        return responseFor("preview", request.name().trim(), normalizeColor(request.color()));
    }

    public TruckResponse saveTruck(TruckDesignRequest request) {
        Truck saved = truckRepository.save(
            new Truck(request.name().trim(), normalizeColor(request.color()))
        );
        return toResponse(saved);
    }

    public List<TruckResponse> getTrucks() {
        return truckRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public Optional<TruckResponse> getTruck(Long id) {
        return truckRepository.findById(id).map(this::toResponse);
    }

    private TruckResponse toResponse(Truck truck) {
        return responseFor(truck.getId().toString(), truck.getName(), truck.getColor());
    }

    // Only name and paint are customizable so far. These remain demo defaults.
    private TruckResponse responseFor(String id, String name, String color) {
        TruckResponse demo = getDemoTruck();
        return new TruckResponse(id, name, demo.body(), color, demo.tires(), demo.decal());
    }

    private String normalizeColor(String color) {
        return color.toLowerCase(Locale.ROOT);
    }
}
