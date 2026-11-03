package com.hallado.backend.service;

import com.hallado.backend.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    public String store(MultipartFile file, String directory, String publicPrefix) {
        try {
            Path uploadPath = Paths.get(directory);
            Files.createDirectories(uploadPath);

            String extension = extensionOf(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);

            try (var stream = file.getInputStream()) {
                Files.copy(stream, filePath);
            }
            registerRollbackCleanup(filePath);
            return publicPrefix + fileName;
        } catch (IOException e) {
            throw new BadRequestException("No se pudo guardar la imagen: " + e.getMessage());
        }
    }

    private String extensionOf(String originalName) {
        if (originalName == null) {
            return "";
        }
        int dot = originalName.lastIndexOf('.');
        if (dot < 0 || dot == originalName.length() - 1) {
            return "";
        }
        String extension = originalName.substring(dot).toLowerCase();
        return extension.matches("\\.[a-z0-9]{1,10}") ? extension : "";
    }

    private void registerRollbackCleanup(Path filePath) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    try {
                        Files.deleteIfExists(filePath);
                    } catch (IOException ignored) {
                        // The original operation already failed; cleanup is best effort.
                    }
                }
            }
        });
    }
}
