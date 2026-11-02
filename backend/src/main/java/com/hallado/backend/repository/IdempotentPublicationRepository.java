package com.hallado.backend.repository;
import com.hallado.backend.model.IdempotentPublication;
import org.springframework.data.jpa.repository.JpaRepository;
public interface IdempotentPublicationRepository extends JpaRepository<IdempotentPublication, String> {}
