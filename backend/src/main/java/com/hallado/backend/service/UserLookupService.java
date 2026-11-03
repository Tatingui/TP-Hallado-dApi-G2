package com.hallado.backend.service;

import com.hallado.backend.exception.ResourceNotFoundException;
import com.hallado.backend.model.User;
import com.hallado.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserLookupService {

    private final UserRepository userRepository;

    public UserLookupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getByEmailOrThrow(String email) {
        return getByEmailOrThrow(email, "Usuario no encontrado");
    }

    public User getByEmailOrThrow(String email, String message) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(message));
    }
}
