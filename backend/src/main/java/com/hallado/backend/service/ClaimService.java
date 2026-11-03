package com.hallado.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hallado.backend.dto.ClaimRequestDTO;
import com.hallado.backend.dto.ClaimResponseDTO;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.exception.BadRequestException;
import com.hallado.backend.exception.ForbiddenException;
import com.hallado.backend.exception.ResourceNotFoundException;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.ClaimRepository;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.UserRepository;
import com.hallado.backend.repository.ClaimRatingRepository;
import com.hallado.backend.dto.RatingRequestDTO;
import com.hallado.backend.dto.ResolvedCaseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PublicationService publicationService;
    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;
    private final ClaimRatingRepository claimRatingRepository;
    private final ObjectMapper objectMapper;
    private final UserLookupService userLookupService;
    private final FileStorageService fileStorageService;

    public ClaimService(ClaimRepository claimRepository, PublicationRepository publicationRepository, UserRepository userRepository,
                        ClaimRatingRepository claimRatingRepository, ObjectMapper objectMapper,
                        UserLookupService userLookupService, FileStorageService fileStorageService,
                        PublicationService publicationService) {
        this.publicationService = publicationService;
        this.claimRepository = claimRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
        this.claimRatingRepository = claimRatingRepository;
        this.objectMapper = objectMapper;
        this.userLookupService = userLookupService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Punto 7: Crear un reclamo ("Es mío" / "Lo encontré").
     * Valida el límite de 3 intentos y la respuesta de seguridad para publicaciones FOUND.
     */
    @Transactional
    public ClaimResponseDTO createClaim(Long publicationId, ClaimRequestDTO request, MultipartFile image, String claimantEmail) {
        User claimant = userLookupService.getByEmailOrThrow(claimantEmail);

        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Publicación no encontrada"));

        if (publication.getStatus() != PublicationStatus.OPEN) {
            throw new BadRequestException("La publicación no está disponible para recibir reclamos.");
        }

        if (publication.getUser().getId().equals(claimant.getId())) {
            throw new BadRequestException("No puedes reclamar tu propia publicación.");
        }

        // Límite de 3 intentos fallidos por usuario por publicación
        long previousAttempts = claimRepository.countByPublicationAndClaimant(publication, claimant);
        if (previousAttempts >= 3) {
            throw new ForbiddenException("Has alcanzado el límite de 3 intentos de reclamo para esta publicación.");
        }

        // Para publicaciones FOUND, el reclamante debe responder la pregunta de verificación.
        // La respuesta se guarda en el reclamo para que el publicador la revise manualmente.
        if (publication.getType() == PublicationType.FOUND) {
            if (publication.getVerificationQuestion() != null && !publication.getVerificationQuestion().trim().isEmpty()) {
                String answer = request.getVerificationAnswer();
                if (answer == null || answer.trim().isEmpty()) {
                    throw new BadRequestException("Debes responder la pregunta de verificación.");
                }
            }
        }

        // "Lo encontré": la consigna pide la foto y el barrio donde se encontró
        String barrio = request.getBarrio() == null ? "" : request.getBarrio().trim();
        if (publication.getType() == PublicationType.LOST) {
            if (barrio.isEmpty()) {
                throw new BadRequestException("Debes indicar el barrio donde lo encontraste.");
            }
            if (barrio.length() > 100) {
                throw new BadRequestException("El barrio no puede superar los 100 caracteres.");
            }
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.store(image, "uploads/", "/uploads/");
        } else if (publication.getType() == PublicationType.LOST) {
            throw new BadRequestException("Debes adjuntar una foto para demostrar que lo encontraste.");
        }

        Claim newClaim = new Claim(publication, claimant, request.getProofMessage(), imageUrl);
        if (publication.getType() == PublicationType.LOST) {
            newClaim.setBarrio(barrio);
        }
        if (request.getVerificationAnswer() != null) {
            newClaim.setVerificationAnswer(request.getVerificationAnswer().trim());
        }
        claimRepository.save(newClaim);

        return ClaimResponseDTO.fromEntity(newClaim, false);
    }

    public ClaimResponseDTO createClaim(Long publicationId, String claimJson, MultipartFile image, String claimantEmail) {
        try {
            return createClaim(publicationId, objectMapper.readValue(claimJson, ClaimRequestDTO.class), image, claimantEmail);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("El reclamo contiene un JSON inválido.");
        }
    }

    public ClaimStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Debes indicar el estado del reclamo.");
        }
        try {
            return ClaimStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Estado de reclamo inválido.");
        }
    }

    /**
     * Punto 7: Responder a un reclamo (ACCEPT / REJECT).
     */
    @Transactional
    public ClaimResponseDTO respondToClaim(Long claimId, ClaimStatus newStatus, String publisherEmail) {
        User publisher = userLookupService.getByEmailOrThrow(publisherEmail);

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamo no encontrado"));

        if (!claim.getPublication().getUser().getId().equals(publisher.getId())) {
            throw new ForbiddenException("No tienes permiso para responder a este reclamo.");
        }

        if (newStatus != ClaimStatus.ACCEPTED && newStatus != ClaimStatus.REJECTED) {
            throw new BadRequestException("Un reclamo solo se puede aceptar o rechazar.");
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Solo puedes responder a reclamos pendientes.");
        }

        // Aceptar no concreta la devolución: eso ocurre cuando el publicador confirma la entrega.
        claim.setStatus(newStatus);
        claimRepository.save(claim);

        if (newStatus == ClaimStatus.ACCEPTED) {
            claim.getPublication().setStatus(PublicationStatus.IN_CLAIM);
            publicationRepository.save(claim.getPublication());

            // Rechazar automáticamente los demás reclamos pendientes
            List<Claim> otherPending = claimRepository.findByPublicationAndStatusAndIdNot(
                    claim.getPublication(), ClaimStatus.PENDING, claim.getId()
            );
            for (Claim c : otherPending) {
                c.setStatus(ClaimStatus.REJECTED);
            }
            claimRepository.saveAll(otherPending);
        }

        return ClaimResponseDTO.fromEntity(claim, true);
    }

    /**
     * Punto 8: Proponer un punto de encuentro o sugerir uno alternativo.
     * La primera propuesta la hace quien tiene el objeto; después solo la otra parte puede reemplazarla.
     */
    @Transactional
    public ClaimResponseDTO proposeMeetingPoint(Long claimId, String address, String userEmail) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamo no encontrado"));

        boolean isPublisher = claim.getPublication().getUser().getId().equals(user.getId());
        if (!isPublisher && !claim.getClaimant().getId().equals(user.getId())) {
            throw new ForbiddenException("No participaste de este reclamo.");
        }
        if (claim.getStatus() != ClaimStatus.ACCEPTED) {
            throw new BadRequestException("Solo se puede acordar un punto de encuentro en reclamos aceptados.");
        }
        if (claim.getPublication().getStatus() != PublicationStatus.IN_CLAIM) {
            throw new BadRequestException("La entrega de este reclamo ya fue cerrada.");
        }
        if (claim.getMeetingStatus() == MeetingPointStatus.ACCEPTED) {
            throw new BadRequestException("El punto de encuentro ya fue confirmado.");
        }

        String trimmed = address == null ? "" : address.trim();
        if (trimmed.isEmpty()) {
            throw new BadRequestException("Debes indicar la dirección del punto de encuentro.");
        }
        if (trimmed.length() > 255) {
            throw new BadRequestException("La dirección no puede superar los 255 caracteres.");
        }

        if (claim.getMeetingStatus() == null) {
            // Si se encontró algo, el objeto lo tiene el publicador; si se perdió, lo tiene quien reclamó
            boolean publisherHasObject = claim.getPublication().getType() == PublicationType.FOUND;
            if (isPublisher != publisherHasObject) {
                throw new ForbiddenException("Solo quien tiene el objeto puede proponer el punto de encuentro.");
            }
        } else if (claim.getMeetingProposedBy().getId().equals(user.getId())) {
            throw new BadRequestException("Ya propusiste un punto de encuentro. Esperá la respuesta de la otra parte.");
        }

        claim.setMeetingAddress(trimmed);
        claim.setMeetingProposedBy(user);
        claim.setMeetingStatus(MeetingPointStatus.PROPOSED);
        claimRepository.save(claim);

        return ClaimResponseDTO.fromEntity(claim, isPublisher);
    }

    /**
     * Punto 8: Aceptar el punto de encuentro propuesto por la otra parte.
     */
    @Transactional
    public ClaimResponseDTO acceptMeetingPoint(Long claimId, String userEmail) {
        User user = userLookupService.getByEmailOrThrow(userEmail);
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamo no encontrado"));

        boolean isPublisher = claim.getPublication().getUser().getId().equals(user.getId());
        if (!isPublisher && !claim.getClaimant().getId().equals(user.getId())) {
            throw new ForbiddenException("No participaste de este reclamo.");
        }
        if (claim.getMeetingStatus() != MeetingPointStatus.PROPOSED) {
            throw new BadRequestException("No hay un punto de encuentro pendiente de respuesta.");
        }
        if (claim.getMeetingProposedBy().getId().equals(user.getId())) {
            throw new BadRequestException("No podés aceptar tu propia propuesta.");
        }

        // Acordar el lugar no cierra el caso: la publicación sigue en reclamo
        // hasta que el publicador confirma la entrega.
        claim.setMeetingStatus(MeetingPointStatus.ACCEPTED);
        claimRepository.save(claim);

        return ClaimResponseDTO.fromEntity(claim, isPublisher);
    }

    /**
     * Ciclo de vida: el publicador confirma que el objeto se entregó.
     * Recién acá la publicación pasa a resuelta, el caso entra al historial (y se puede
     * valorar) y se suma la devolución concretada a quien tenía el objeto.
     */
    @Transactional
    public ClaimResponseDTO confirmDelivery(Long claimId, String publisherEmail) {
        Claim claim = getAcceptedClaimOfPublisher(claimId, publisherEmail);

        claim.setResolvedAt(LocalDateTime.now());
        claimRepository.save(claim);

        Publication publication = claim.getPublication();
        publication.setStatus(PublicationStatus.RESOLVED);
        publicationRepository.save(publication);

        boolean publisherIsDevolver = publication.getType() == PublicationType.FOUND;
        User devolver = publisherIsDevolver ? publication.getUser() : claim.getClaimant();
        devolver.setDevolucionesConcretadas(devolver.getDevolucionesConcretadas() + 1);
        userRepository.save(devolver);

        return ClaimResponseDTO.fromEntity(claim, true);
    }

    /**
     * Ciclo de vida: el publicador cancela un reclamo aceptado que no se concretó.
     * Con republish, el reclamo queda cancelado y la publicación vuelve a estar abierta
     * para recibir otros reclamos. Sin republish, se elimina la publicación (como al
     * borrarla desde Mis publicaciones) y devuelve null.
     */
    @Transactional
    public ClaimResponseDTO cancelAcceptedClaim(Long claimId, boolean republish, String publisherEmail) {
        Claim claim = getAcceptedClaimOfPublisher(claimId, publisherEmail);
        Publication publication = claim.getPublication();

        if (!republish) {
            publicationService.deleteWithDependencies(publication);
            return null;
        }

        claim.setStatus(ClaimStatus.CANCELLED);
        claimRepository.save(claim);
        publication.setStatus(PublicationStatus.OPEN);
        publicationRepository.save(publication);

        return ClaimResponseDTO.fromEntity(claim, true);
    }

    private Claim getAcceptedClaimOfPublisher(Long claimId, String publisherEmail) {
        User publisher = userLookupService.getByEmailOrThrow(publisherEmail);
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamo no encontrado"));
        if (!claim.getPublication().getUser().getId().equals(publisher.getId())) {
            throw new ForbiddenException("Solo el publicador puede cerrar este reclamo.");
        }
        if (claim.getStatus() != ClaimStatus.ACCEPTED
                || claim.getPublication().getStatus() != PublicationStatus.IN_CLAIM) {
            throw new BadRequestException("El reclamo no está pendiente de entrega.");
        }
        return claim;
    }

    @Transactional(readOnly = true)
    public List<ResolvedCaseDTO> getResolvedHistory(String email, LocalDate from, LocalDate to, PublicationType type) {
        User user = userLookupService.getByEmailOrThrow(email);
        LocalDateTime fromDate = from == null ? null : from.atStartOfDay();
        LocalDateTime toDate = to == null ? null : to.plusDays(1).atStartOfDay();
        return claimRepository.findResolvedHistory(user, fromDate, toDate, type).stream()
                .map(claim -> ResolvedCaseDTO.from(claim, user,
                        claimRatingRepository.findByClaimAndAuthor(claim, user).orElse(null)))
                .collect(Collectors.toList());
    }

    @Transactional
    public void rateResolvedCase(Long claimId, RatingRequestDTO request, String email) {
        User author = userLookupService.getByEmailOrThrow(email);
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Caso no encontrado"));
        if (claim.getStatus() != ClaimStatus.ACCEPTED || claim.getResolvedAt() == null ||
                claim.getPublication().getStatus() != PublicationStatus.RESOLVED ||
                claim.getResolvedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new BadRequestException("El plazo para valorar este caso venció.");
        }
        boolean publisher = claim.getPublication().getUser().getId().equals(author.getId());
        if (!publisher && !claim.getClaimant().getId().equals(author.getId())) {
            throw new ForbiddenException("No participaste de este caso.");
        }
        if (request.getPositive() == null) {
            throw new BadRequestException("Debes indicar si la valoración es positiva o negativa.");
        }
        if (claimRatingRepository.findByClaimAndAuthor(claim, author).isPresent()) {
            throw new BadRequestException("Ya valoraste este caso.");
        }
        User rated = publisher ? claim.getClaimant() : claim.getPublication().getUser();
        boolean devolver = claim.getPublication().getType() == PublicationType.FOUND ? publisher : !publisher;
        String thanks = request.getPublicThanks() == null ? null : request.getPublicThanks().trim();
        if (!devolver && thanks != null && thanks.length() > 280) {
            throw new BadRequestException("El agradecimiento no puede superar los 280 caracteres.");
        }
        ClaimRating rating = new ClaimRating();
        rating.setClaim(claim);
        rating.setAuthor(author);
        rating.setRatedUser(rated);
        rating.setPositive(request.getPositive());
        rating.setMessage(trimToLimit(request.getMessage(), 280));
        rating.setPublicThanks(!devolver ? trimToLimit(thanks, 280) : null);
        claimRatingRepository.save(rating);
        if (request.getPositive()) rated.setValoracionesPositivas(rated.getValoracionesPositivas() + 1);
        else rated.setValoracionesNegativas(rated.getValoracionesNegativas() + 1);
        userRepository.save(rated);
    }

    private String trimToLimit(String value, int limit) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed.substring(0, Math.min(trimmed.length(), limit));
    }

    public PageResponseDTO<ClaimResponseDTO> getMySentClaims(String userEmail, int page, int size) {
        User claimant = userLookupService.getByEmailOrThrow(userEmail);

        Pageable pageable = PageRequest.of(page, size);
        Page<Claim> claims = claimRepository.findByClaimantOrderByClaimDateDesc(claimant, pageable);

        List<ClaimResponseDTO> dtos = claims.getContent().stream()
                .map(c -> ClaimResponseDTO.fromEntity(c, false))
                .collect(Collectors.toList());

        return new PageResponseDTO<>(dtos, claims.getNumber(), claims.getSize(), claims.getTotalElements(), claims.getTotalPages(), claims.isLast());
    }

    public PageResponseDTO<ClaimResponseDTO> getMyReceivedClaims(String userEmail, int page, int size) {
        User publisher = userLookupService.getByEmailOrThrow(userEmail);

        Pageable pageable = PageRequest.of(page, size);
        Page<Claim> claims = claimRepository.findByPublicationUserOrderByClaimDateDesc(publisher, pageable);

        List<ClaimResponseDTO> dtos = claims.getContent().stream()
                .map(c -> ClaimResponseDTO.fromEntity(c, true))
                .collect(Collectors.toList());

        return new PageResponseDTO<>(dtos, claims.getNumber(), claims.getSize(), claims.getTotalElements(), claims.getTotalPages(), claims.isLast());
    }

}
