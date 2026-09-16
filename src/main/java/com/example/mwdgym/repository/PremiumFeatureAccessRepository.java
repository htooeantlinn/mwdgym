package com.example.mwdgym.repository;

import com.example.mwdgym.model.PremiumFeatureAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PremiumFeatureAccessRepository extends JpaRepository<PremiumFeatureAccess, Long> {

    List<PremiumFeatureAccess> findByUserId(Long userId);

    List<PremiumFeatureAccess> findByUserIdAndIsActiveTrue(Long userId);

    Optional<PremiumFeatureAccess> findByUserIdAndFeatureType(Long userId, PremiumFeatureAccess.FeatureType featureType);

    @Query("SELECT p FROM PremiumFeatureAccess p WHERE p.userId = :userId AND p.featureType = :featureType AND p.isActive = true")
    Optional<PremiumFeatureAccess> findActiveFeatureAccess(@Param("userId") Long userId, @Param("featureType") PremiumFeatureAccess.FeatureType featureType);

    @Query("SELECT p FROM PremiumFeatureAccess p WHERE p.userId = :userId AND p.featureType = :featureType AND (p.expiryDate IS NULL OR p.expiryDate > NOW())")
    Optional<PremiumFeatureAccess> findValidFeatureAccess(@Param("userId") Long userId, @Param("featureType") PremiumFeatureAccess.FeatureType featureType);

    @Query("SELECT p FROM PremiumFeatureAccess p WHERE p.isActive = true AND p.expiryDate < :date")
    List<PremiumFeatureAccess> findExpiredFeatures(@Param("date") LocalDateTime date);

    List<PremiumFeatureAccess> findByAccessLevel(PremiumFeatureAccess.AccessLevel accessLevel);

    List<PremiumFeatureAccess> findBySource(PremiumFeatureAccess.Source source);

    @Query("SELECT COUNT(p) FROM PremiumFeatureAccess p WHERE p.userId = :userId AND p.isActive = true")
    long countActiveFeatures(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT p.userId) FROM PremiumFeatureAccess p WHERE p.featureType = :featureType AND p.isActive = true")
    long countUsersWithFeature(@Param("featureType") PremiumFeatureAccess.FeatureType featureType);

    @Query("SELECT p FROM PremiumFeatureAccess p WHERE p.featureType = :featureType AND p.isActive = true")
    List<PremiumFeatureAccess> findAllUsersWithFeature(@Param("featureType") PremiumFeatureAccess.FeatureType featureType);

    boolean existsByUserIdAndFeatureTypeAndIsActiveTrue(Long userId, PremiumFeatureAccess.FeatureType featureType);
}
