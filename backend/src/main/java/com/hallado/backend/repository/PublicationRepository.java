package com.hallado.backend.repository;

import com.hallado.backend.model.Publication;
import com.hallado.backend.model.PublicationStatus;
import com.hallado.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long>, JpaSpecificationExecutor<Publication> {

    Page<Publication> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Publication> findByUserAndStatusOrderByCreatedAtDesc(User user, PublicationStatus status, Pageable pageable);
}
