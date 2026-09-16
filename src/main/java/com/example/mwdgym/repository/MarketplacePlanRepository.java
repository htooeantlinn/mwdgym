package com.example.mwdgym.repository;

import com.example.mwdgym.model.MarketplacePlan;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplacePlanRepository extends JpaRepository<MarketplacePlan, Long> {

    List<MarketplacePlan> findByStatus(MarketplacePlan.Status status);

    List<MarketplacePlan> findByStatusOrderByPublishedAtDesc(MarketplacePlan.Status status, Pageable pageable);

    List<MarketplacePlan> findByTrainerId(Long trainerId);

    List<MarketplacePlan> findByTrainerIdAndStatus(Long trainerId, MarketplacePlan.Status status);

    List<MarketplacePlan> findByCategory(MarketplacePlan.Category category);

    List<MarketplacePlan> findByStatusAndCategory(MarketplacePlan.Status status, MarketplacePlan.Category category);

    List<MarketplacePlan> findByDifficultyLevel(MarketplacePlan.DifficultyLevel difficultyLevel);

    List<MarketplacePlan> findByStatusAndDifficultyLevel(MarketplacePlan.Status status, MarketplacePlan.DifficultyLevel difficultyLevel);

    List<MarketplacePlan> findByCategoryAndDifficultyLevel(MarketplacePlan.Category category, MarketplacePlan.DifficultyLevel difficulty);

    List<MarketplacePlan> findByStatusAndCategoryAndDifficultyLevel(MarketplacePlan.Status status, MarketplacePlan.Category category, MarketplacePlan.DifficultyLevel difficulty);

    @Query("SELECT p FROM MarketplacePlan p WHERE p.status = 'PUBLISHED' ORDER BY p.rating DESC, p.activeSubscribers DESC")
    List<MarketplacePlan> findTopTrendingPlans(Pageable pageable);

    @Query("SELECT p FROM MarketplacePlan p WHERE p.status = 'PUBLISHED' AND p.publishedAt IS NOT NULL ORDER BY p.publishedAt DESC")
    List<MarketplacePlan> findLatestPublishedPlans(Pageable pageable);

    @Query("SELECT p FROM MarketplacePlan p WHERE p.status = 'PUBLISHED' AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<MarketplacePlan> searchPlans(@Param("search") String search);

    Optional<MarketplacePlan> findByIdAndStatus(Long id, MarketplacePlan.Status status);

    @Query("SELECT p FROM MarketplacePlan p WHERE p.status = 'PUBLISHED' AND p.priceMmk BETWEEN :minPrice AND :maxPrice")
    List<MarketplacePlan> findByPriceRange(@Param("minPrice") java.math.BigDecimal minPrice, @Param("maxPrice") java.math.BigDecimal maxPrice);

    @Query("SELECT p FROM MarketplacePlan p WHERE p.status = 'PUBLISHED' AND p.category = :category ORDER BY p.rating DESC")
    List<MarketplacePlan> findByCategoryOrdered(@Param("category") MarketplacePlan.Category category, Pageable pageable);

    long countByTrainerIdAndStatus(Long trainerId, MarketplacePlan.Status status);

    long countByStatus(MarketplacePlan.Status status);
}
