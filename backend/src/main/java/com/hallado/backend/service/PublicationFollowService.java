package com.hallado.backend.service;

import com.hallado.backend.dto.FollowStatusDTO;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.dto.SeenStatusDTO;
import com.hallado.backend.exception.ResourceNotFoundException;
import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationFollow;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.PublicationFollowRepository;
import com.hallado.backend.repository.PublicationRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Punto 9: publicaciones seguidas. Seguir y dejar de seguir, consultar el estado
 * del seguimiento y detectar novedades (cambios de estado desde la última visita).
 */
@Service
public class PublicationFollowService {

    private final PublicationRepository publicationRepository;
    private final PublicationFollowRepository followRepository;
    private final UserLookupService userLookupService;

    public PublicationFollowService(PublicationRepository publicationRepository,
                                    PublicationFollowRepository followRepository,
                                    UserLookupService userLookupService) {
        this.publicationRepository = publicationRepository;
        this.followRepository = followRepository;
        this.userLookupService = userLookupService;
    }

    @Transactional
    public FollowStatusDTO follow(String userEmail, Long publicationId) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        Publication publication = findPublication(publicationId);

        if (!followRepository.existsByUserAndPublication(user, publication)) {
            followRepository.save(new PublicationFollow(user, publication));
        }
        return statusOf(user, publication);
    }

    @Transactional
    public FollowStatusDTO unfollow(String userEmail, Long publicationId) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        Publication publication = findPublication(publicationId);

        followRepository.findByUserAndPublication(user, publication).ifPresent(followRepository::delete);
        return statusOf(user, publication);
    }

    public FollowStatusDTO getStatus(String userEmail, Long publicationId) {
        return statusOf(userLookupService.getByEmailOrThrow(userEmail), findPublication(publicationId));
    }

    public PageResponseDTO<PublicationResponseDTO> getFollowedPublications(String userEmail, int page, int size) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        Page<PublicationFollow> follows =
                followRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(page, size));

        return PageResponseDTO.fromPage(follows.map(follow -> {
            PublicationResponseDTO dto = PublicationResponseDTO.fromEntity(follow.getPublication());
            dto.setHasNewUpdates(hasStatusChangedSinceSeen(follow));
            return dto;
        }));
    }

    /** Cantidad de publicaciones seguidas que cambiaron de estado desde la última vez que se vieron. */
    public long countWithUpdates(String userEmail) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        return followRepository.findByUser(user).stream()
                .filter(this::hasStatusChangedSinceSeen)
                .count();
    }

    @Transactional
    public SeenStatusDTO markAsSeen(String userEmail, Long publicationId) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        Publication publication = findPublication(publicationId);

        return followRepository.findByUserAndPublication(user, publication)
                .map(follow -> {
                    follow.setLastSeenAt(publication.getUpdatedAt() != null ? publication.getUpdatedAt() : LocalDateTime.now());
                    followRepository.save(follow);
                    return SeenStatusDTO.vista(follow.getLastSeenAt());
                })
                .orElseGet(SeenStatusDTO::noSeguida);
    }

    private FollowStatusDTO statusOf(User user, Publication publication) {
        long followersCount = followRepository.countByPublication(publication);
        return followRepository.findByUserAndPublication(user, publication)
                .map(follow -> new FollowStatusDTO(true, followersCount, hasStatusChangedSinceSeen(follow)))
                .orElseGet(() -> new FollowStatusDTO(false, followersCount, false));
    }

    /** Hay novedad solo cuando la publicación cambió de estado (no por ediciones de texto). */
    private boolean hasStatusChangedSinceSeen(PublicationFollow follow) {
        LocalDateTime statusChangedAt = follow.getPublication().getStatusChangedAt();
        return statusChangedAt != null
                && (follow.getLastSeenAt() == null || statusChangedAt.isAfter(follow.getLastSeenAt()));
    }

    private Publication findPublication(Long publicationId) {
        return publicationRepository.findById(publicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Publicación no encontrada"));
    }
}
