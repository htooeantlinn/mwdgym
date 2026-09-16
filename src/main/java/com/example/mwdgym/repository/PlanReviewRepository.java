package com.example.mwdgym.repository;

import com.example.mwdgym.model.PlanReview;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanReviewRepository extends JpaRepository<PlanReview, Long> {

    List<PlanReview> findByPlanId(Long planId);

    List<PlanReview> findByPlanIdOrderByCreatedAtDesc(Long planId);

    @Query("SELECT r FROM PlanReview r WHERE r.planId = :planId ORDER BY r.helpfulCount DESC")
    List<PlanReview> findByPlanIdOrderByHelpfulCount(@Param("planId") Long planId);

    @Query("SELECT r FROM PlanReview r WHERE r.planId = :planId ORDER BY r.rating DESC")
    List<PlanReview> findByPlanIdOrderByRating(@Param("planId") Long planId);

    List<PlanReview> findByUserId(Long userId);

    Optional<PlanReview> findByPlanIdAndUserId(Long planId, Long userId);

    @Query("SELECT AVG(r.rating) FROM PlanReview r WHERE r.planId = :planId")
    Double getAverageRatingForPlan(@Param("planId") Long planId);

    @Query("SELECT COUNT(r) FROM PlanReview r WHERE r.planId = :planId AND r.rating >= 4")
    long countPositiveReviews(@Param("planId") Long planId);

    @Query("SELECT COUNT(r) FROM PlanReview r WHERE r.planId = :planId AND r.rating < 4")
    long countNegativeReviews(@Param("planId") Long planId);

    @Query("SELECT COUNT(r) FROM PlanReview r WHERE r.planId = :planId")
    long countTotalReviews(@Param("planId") Long planId);

    @Query("SELECT r FROM PlanReview r WHERE r.planId = :planId AND r.trainerResponse IS NOT NULL")
    List<PlanReview> findReviewsWithResponses(@Param("planId") Long planId);

    List<PlanReview> findBySubscriptionId(Long subscriptionId);
}
