package com.hallado.backend.dto;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.SearchAlert;

import java.time.LocalDateTime;

public class AlertResponseDTO {

    private Long id;
    private PublicationType type;
    private CategoryEnum category;
    private String barrio;
    private String query;
    private boolean active;
    private LocalDateTime createdAt;

    public static AlertResponseDTO fromEntity(SearchAlert alert) {
        AlertResponseDTO dto = new AlertResponseDTO();
        dto.setId(alert.getId());
        dto.setType(alert.getType());
        dto.setCategory(alert.getCategory());
        dto.setBarrio(alert.getBarrio());
        dto.setQuery(alert.getQuery());
        dto.setActive(alert.isActive());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PublicationType getType() { return type; }
    public void setType(PublicationType type) { this.type = type; }
    public CategoryEnum getCategory() { return category; }
    public void setCategory(CategoryEnum category) { this.category = category; }
    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
