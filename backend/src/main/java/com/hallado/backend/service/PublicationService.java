package com.hallado.backend.service;

import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.dto.PageResponseDTO;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.*;
import com.hallado.backend.repository.PublicationRepository;
import com.hallado.backend.repository.PublicationSpecification;
import com.hallado.backend.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PublicationService {

    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;

    // Directorio donde se guardan las imágenes subidas
    private static final String UPLOAD_DIR = "uploads/publications/";

    public PublicationService(PublicationRepository publicationRepository,
                              UserRepository userRepository) {
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
    }

    // ─── Punto 5: Crear publicación ───────────────────────────────────

    /**
     * Crea una nueva publicación con imágenes opcionales.
     * Las imágenes se guardan en el filesystem y sus rutas se almacenan
     * como string separado por comas en el campo imageUrls.
     */
    public PublicationResponseDTO createPublication(CreatePublicationRequest req,
                                                     List<MultipartFile> images,
                                                     String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validaciones
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("El título es obligatorio");
        }
        if (req.getType() == null) {
            throw new IllegalArgumentException("El tipo de publicación es obligatorio");
        }
        if (req.getCategory() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        if (req.getBarrio() == null || req.getBarrio().trim().isEmpty()) {
            throw new IllegalArgumentException("El barrio es obligatorio");
        }

        // Guardar imágenes y obtener rutas
        String imageUrlsStr = null;
        if (images != null && !images.isEmpty()) {
            List<String> savedPaths = new ArrayList<>();
            for (MultipartFile file : images) {
                String savedPath = saveImage(file);
                savedPaths.add(savedPath);
            }
            imageUrlsStr = String.join(",", savedPaths);
        }

        Publication pub = new Publication(
                req.getTitle().trim(),
                req.getDescription() != null ? req.getDescription().trim() : null,
                req.getType(),
                req.getCategory(),
                req.getBarrio().trim(),
                req.getAddress() != null ? req.getAddress().trim() : null,
                req.getLatitude(),
                req.getLongitude(),
                req.getEventDate() != null ? req.getEventDate() : LocalDateTime.now(),
                imageUrlsStr,
                user
        );

        // Pregunta de verificación solo para FOUND
        if (req.getType() == PublicationType.FOUND) {
            pub.setVerificationQuestion(req.getVerificationQuestion());
            pub.setVerificationAnswer(req.getVerificationAnswer());
        }

        Publication saved = publicationRepository.save(pub);
        return PublicationResponseDTO.fromEntity(saved);
    }

    /**
     * Guarda una imagen en el filesystem y devuelve la ruta relativa.
     */
    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/publications/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen: " + e.getMessage());
        }
    }

    // ─── Punto 5: Mis publicaciones ──────────────────────────────────

    /**
     * Obtiene las publicaciones del usuario autenticado, con filtro opcional por estado.
     */
    public PageResponseDTO<PublicationResponseDTO> getMyPublications(String userEmail,
                                                                      PublicationStatus status,
                                                                      int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Publication> pubPage;

        if (status != null) {
            pubPage = publicationRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status, pageable);
        } else {
            pubPage = publicationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }

        List<PublicationResponseDTO> dtos = pubPage.getContent().stream()
                .map(PublicationResponseDTO::fromEntity)
                .collect(Collectors.toList());

        Page<PublicationResponseDTO> dtoPage = new PageImpl<>(dtos, pageable, pubPage.getTotalElements());
        return PageResponseDTO.fromPage(dtoPage);
    }

    // ─── Detalle de publicación ──────────────────────────────────────

    /**
     * Obtiene una publicación por ID.
     */
    public PublicationResponseDTO getPublicationById(Long id) {
        Publication pub = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        return PublicationResponseDTO.fromEntity(pub);
    }

    // ─── Punto 3: Búsqueda (existente) ──────────────────────────────

    public PageResponseDTO<PublicationResponseDTO> searchPublications(
            PublicationType userActionType,
            CategoryEnum category,
            String query,
            String barrio,
            String dateFilterOption,
            LocalDate startDateParam,
            LocalDate endDateParam,
            Double userLat,
            Double userLng,
            String sortBy,
            int page,
            int size
    ) {
        PublicationType targetType = null;
        if (userActionType == PublicationType.LOST) {
            targetType = PublicationType.FOUND;
        } else if (userActionType == PublicationType.FOUND) {
            targetType = PublicationType.LOST;
        }

        LocalDateTime startDate = null;
        LocalDateTime endDate = LocalDateTime.now();

        if (dateFilterOption != null) {
            switch (dateFilterOption.toUpperCase()) {
                case "TODAY":
                    startDate = LocalDate.now().atStartOfDay();
                    break;
                case "LAST_3_DAYS":
                    startDate = LocalDate.now().minusDays(3).atStartOfDay();
                    break;
                case "LAST_WEEK":
                    startDate = LocalDate.now().minusWeeks(1).atStartOfDay();
                    break;
                case "RANGO":
                case "CUSTOM_RANGE":
                    if (startDateParam != null) {
                        startDate = startDateParam.atStartOfDay();
                    }
                    if (endDateParam != null) {
                        endDate = endDateParam.atTime(LocalTime.MAX);
                    }
                    break;
                default:
                    break;
            }
        }

        Specification<Publication> spec = PublicationSpecification.buildSearchSpecification(
                targetType, category, query, barrio, startDate, endDate
        );

        Sort sort = Sort.by(Sort.Direction.DESC, "eventDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Publication> publicationPage = publicationRepository.findAll(spec, pageable);

        List<PublicationResponseDTO> dtoList = publicationPage.getContent().stream()
                .map(p -> {
                    PublicationResponseDTO dto = PublicationResponseDTO.fromEntity(p);
                    if (userLat != null && userLng != null && p.getLatitude() != null && p.getLongitude() != null) {
                        double dist = calculateDistanceKm(userLat, userLng, p.getLatitude(), p.getLongitude());
                        dto.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        if ("distance".equalsIgnoreCase(sortBy) && userLat != null && userLng != null) {
            dtoList.sort(Comparator.comparing(PublicationResponseDTO::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder())));
        }

        Page<PublicationResponseDTO> dtoPage = new PageImpl<>(dtoList, pageable, publicationPage.getTotalElements());
        return PageResponseDTO.fromPage(dtoPage);
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
