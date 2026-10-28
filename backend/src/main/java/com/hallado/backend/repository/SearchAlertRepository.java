package com.hallado.backend.repository;

import com.hallado.backend.model.CategoryEnum;
import com.hallado.backend.model.PublicationType;
import com.hallado.backend.model.SearchAlert;
import com.hallado.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SearchAlertRepository extends JpaRepository<SearchAlert, Long> {

    // Punto 9: Mis alertas
    List<SearchAlert> findByUserOrderByCreatedAtDesc(User user);

    // Solo se puede operar sobre alertas propias
    Optional<SearchAlert> findByIdAndUser(Long id, User user);

    // Punto 9: evitar alertas duplicadas con los mismos criterios
    boolean existsByUserAndTypeAndCategoryAndBarrioAndQuery(
            User user, PublicationType type, CategoryEnum category, String barrio, String query);
}
