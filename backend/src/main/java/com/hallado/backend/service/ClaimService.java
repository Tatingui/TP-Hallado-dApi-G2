package com.hallado.backend.service;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/";

    public ClaimService(ClaimRepository claimRepository, PublicationRepository publicationRepository, UserRepository userRepository) {
        this.claimRepository = claimRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Punto 7: Crear un reclamo ("Es mío" / "Lo encontré").
     * Valida el límite de 3 intentos y la respuesta de seguridad para publicaciones FOUND.
     */
    @Transactional
    public ClaimResponseDTO createClaim(Long publicationId, ClaimRequestDTO request, MultipartFile image, String claimantEmail) {
        User claimant = userRepository.findByEmail(claimantEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

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

        // Validaciones según el tipo (LOST / FOUND)
        if (publication.getType() == PublicationType.FOUND) {
            if (publication.getVerificationAnswer() != null && !publication.getVerificationAnswer().trim().isEmpty()) {
                String expected = publication.getVerificationAnswer().trim().toLowerCase();
                String received = request.getVerificationAnswer() != null ? request.getVerificationAnswer().trim().toLowerCase() : "";

                if (!expected.equals(received)) {
                    // Registrar intento fallido
                    Claim failedClaim = new Claim(publication, claimant, request.getProofMessage(), null);
                    failedClaim.setStatus(ClaimStatus.REJECTED);
                    claimRepository.save(failedClaim);
                    throw new BadRequestException("Respuesta de verificación incorrecta.");
                }
            }
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        } else if (publication.getType() == PublicationType.LOST) {
            throw new BadRequestException("Debes adjuntar una foto para demostrar que lo encontraste.");
        }

        Claim newClaim = new Claim(publication, claimant, request.getProofMessage(), imageUrl);
        claimRepository.save(newClaim);

        return ClaimResponseDTO.fromEntity(newClaim, false);
    }

    /**
     * Punto 7: Responder a un reclamo (ACCEPT / REJECT).
     */
    @Transactional
    public ClaimResponseDTO respondToClaim(Long claimId, ClaimStatus newStatus, String publisherEmail) {
        User publisher = userRepository.findByEmail(publisherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamo no encontrado"));

        if (!claim.getPublication().getUser().getId().equals(publisher.getId())) {
            throw new ForbiddenException("No tienes permiso para responder a este reclamo.");
        }

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Solo puedes responder a reclamos pendientes.");
        }

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

    public PageResponseDTO<ClaimResponseDTO> getMySentClaims(String userEmail, int page, int size) {
        User claimant = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Claim> claims = claimRepository.findByClaimantOrderByClaimDateDesc(claimant, pageable);

        List<ClaimResponseDTO> dtos = claims.getContent().stream()
                .map(c -> ClaimResponseDTO.fromEntity(c, false))
                .collect(Collectors.toList());

        return new PageResponseDTO<>(dtos, claims.getNumber(), claims.getSize(), claims.getTotalElements(), claims.getTotalPages(), claims.isLast());
    }

    public PageResponseDTO<ClaimResponseDTO> getMyReceivedClaims(String userEmail, int page, int size) {
        User publisher = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Claim> claims = claimRepository.findByPublicationUserOrderByClaimDateDesc(publisher, pageable);

        List<ClaimResponseDTO> dtos = claims.getContent().stream()
                .map(c -> ClaimResponseDTO.fromEntity(c, true))
                .collect(Collectors.toList());

        return new PageResponseDTO<>(dtos, claims.getNumber(), claims.getSize(), claims.getTotalElements(), claims.getTotalPages(), claims.isLast());
    }

    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen", e);
        }
    }
}
