package com.hallado.backend.repository;

import com.hallado.backend.model.Claim;
import com.hallado.backend.model.ClaimRating;
import com.hallado.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClaimRatingRepository extends JpaRepository<ClaimRating, Long> {
    Optional<ClaimRating> findByClaimAndAuthor(Claim claim, User author);
    List<ClaimRating> findByRatedUserAndPublicThanksIsNotNullOrderByCreatedAtDesc(User user);
}
