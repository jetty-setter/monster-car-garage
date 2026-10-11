package com.bigwheel.garage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TruckDesignRequest(
    @NotBlank
    @Size(max = 40)
    String name,

    @NotBlank
    @Pattern(regexp = "#[0-9a-fA-F]{6}")
    String color
){}