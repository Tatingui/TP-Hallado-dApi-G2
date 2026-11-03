package com.hallado.backend.service;

import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.repository.PublicationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Punto 5: "Las publicaciones vencen a los 30 días y pueden renovarse."
 * Marca como vencidas las publicaciones abiertas cuya vigencia terminó.
 * Corre al iniciar el backend y después cada 10 minutos.
 */
@Service
public class PublicationExpirationService {

    private static final Logger log = LoggerFactory.getLogger(PublicationExpirationService.class);

    private final PublicationRepository publicationRepository;

    public PublicationExpirationService(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    /** Devuelve cuántas publicaciones se marcaron como vencidas. */
    @Scheduled(initialDelayString = "PT10S", fixedDelayString = "PT10M")
    @Transactional
    public int expireOverduePublications() {
        List<Publication> vencidas = publicationRepository
                .findByStatusAndExpiresAtLessThanEqual(PublicationStatus.OPEN, LocalDateTime.now());

        vencidas.forEach(Publication::expire);
        publicationRepository.saveAll(vencidas);

        if (!vencidas.isEmpty()) {
            log.info("{} publicaciones vencieron por superar los {} días.", vencidas.size(), Publication.VIGENCIA_DIAS);
        }
        return vencidas.size();
    }
}
