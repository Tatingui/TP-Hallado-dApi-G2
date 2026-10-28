package com.hallado.backend.dto;

/**
 * Punto 9: Criterios de la búsqueda que se guarda como alerta.
 */
public class AlertRequestDTO {

    private String type;     // LOST o FOUND (lo que le pasó a la persona)
    private String category; // Opcional
    private String barrio;   // Opcional
    private String query;    // Palabras clave, opcional

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
}
