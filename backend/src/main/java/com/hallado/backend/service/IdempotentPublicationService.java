package com.hallado.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hallado.backend.dto.CreatePublicationRequest;
import com.hallado.backend.dto.PublicationResponseDTO;
import com.hallado.backend.model.IdempotentPublication;
import com.hallado.backend.repository.IdempotentPublicationRepository;
import com.hallado.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

@Service
public class IdempotentPublicationService {
    private final UserRepository users;
    private final IdempotentPublicationRepository results;
    private final PublicationService publications;
    private final ObjectMapper mapper;

    public IdempotentPublicationService(UserRepository users, IdempotentPublicationRepository results,
                                       PublicationService publications, ObjectMapper mapper) {
        this.users = users; this.results = results; this.publications = publications; this.mapper = mapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public PublicationResponseDTO create(CreatePublicationRequest request, List<MultipartFile> images,
                                         String email, String key) throws Exception {
        if (key == null || key.isBlank()) return publications.createPublication(request, images, email);
        if (!key.matches("[a-zA-Z0-9_-]{1,128}")) throw new IllegalArgumentException("Clave de idempotencia inválida");
        // This database lock serializes requests for the same user across server instances.
        // The publication and replay result commit together; a failed request reserves nothing.
        var user = users.findByEmailForUpdate(email).orElseThrow(() -> new IllegalArgumentException("Usuario inexistente"));
        String id = digest((user.getId() + ":" + key).getBytes(StandardCharsets.UTF_8));
        MessageDigest hash = MessageDigest.getInstance("SHA-256");
        hash.update(mapper.writeValueAsBytes(request));
        if (images != null) for (MultipartFile image : images) {
            hash.update(Long.toString(image.getSize()).getBytes(StandardCharsets.UTF_8));
            hash.update(image.getBytes());
        }
        String requestHash = HexFormat.of().formatHex(hash.digest());
        var previous = results.findById(id);
        if (previous.isPresent()) {
            if (!previous.get().getRequestHash().equals(requestHash))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La clave ya corresponde a otra publicación");
            return mapper.readValue(previous.get().getResponseJson(), PublicationResponseDTO.class);
        }
        PublicationResponseDTO created = publications.createPublication(request, images, email);
        results.saveAndFlush(new IdempotentPublication(id, requestHash, mapper.writeValueAsString(created)));
        return created;
    }
    private static String digest(byte[] input) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(input));
    }
}
