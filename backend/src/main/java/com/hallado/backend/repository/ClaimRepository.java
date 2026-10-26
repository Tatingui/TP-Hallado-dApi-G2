package com.hallado.backend.repository;

import com.hallado.backend.model.Claim;
import com.hallado.backend.model.ClaimStatus;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.hallado.backend.model.PublicationType;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    // Punto 7: Cada persona tiene un máximo de 3 intentos de reclamo por publicación.
    long countByPublicationAndClaimant(Publication publication, User claimant);

    // Mis reclamos enviados (yo soy el claimant)
    Page<Claim> findByClaimantOrderByClaimDateDesc(User claimant, Pageable pageable);

    // Mis reclamos recibidos (yo soy el publicador)
    Page<Claim> findByPublicationUserOrderByClaimDateDesc(User publisher, Pageable pageable);

    // Buscar reclamos pendientes vencidos (> 48 hs) para tarea programada (cron)
    List<Claim> findByStatusAndClaimDateBefore(ClaimStatus status, LocalDateTime dateTime);

    // Obtener el resto de los reclamos pendientes de una publicación (para rechazarlos si acepto uno)
    List<Claim> findByPublicationAndStatusAndIdNot(Publication publication, ClaimStatus status, Long idToExclude);

    @Query("select c from Claim c where c.status = com.hallado.backend.model.ClaimStatus.ACCEPTED " +
           "and (c.claimant = :user or c.publication.user = :user) " +
           "and (:fromDate is null or c.resolvedAt >= :fromDate) " +
           "and (:toDate is null or c.resolvedAt < :toDate) " +
           "and (:type is null or c.publication.type = :type) order by c.resolvedAt desc")
    List<Claim> findResolvedHistory(User user, LocalDateTime fromDate, LocalDateTime toDate, PublicationType type);
}
