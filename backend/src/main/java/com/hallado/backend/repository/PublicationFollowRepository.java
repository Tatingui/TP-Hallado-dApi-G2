package com.hallado.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationFollow;
import com.hallado.backend.model.User;

public interface PublicationFollowRepository extends JpaRepository<PublicationFollow, Long> {

    long countByPublication(Publication publication);

    boolean existsByUserAndPublication(User user, Publication publication);

    Optional<PublicationFollow> findByUserAndPublication(User user, Publication publication);

    Page<PublicationFollow> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
