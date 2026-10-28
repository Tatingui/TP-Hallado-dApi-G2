package com.hallado.backend.repository;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.SearchAlert;
import com.hallado.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchAlertRepository extends JpaRepository<SearchAlert, Long> {

    // Punto 9: evitar alertas duplicadas con los mismos criterios
    boolean existsByUserAndTypeAndCategoryAndBarrioAndQuery(
            User user, PublicationType type, CategoryEnum category, String barrio, String query);
}
