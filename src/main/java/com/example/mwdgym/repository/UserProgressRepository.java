package com.example.mwdgym.repository;

import com.example.mwdgym.model.UserProgress;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    List<UserProgress> findByUserIdAndMarketplacePlanId(Long userId, Long marketplacePlanId);

    Optional<UserProgress> findBySubscriptionIdAndWeekNumber(Long subscriptionId, Integer weekNumber);

    @Query("SELECT p FROM UserProgress p WHERE p.userId = :userId AND p.marketplacePlanId = :planId ORDER BY p.recordedDate DESC")
    List<UserProgress> findProgressHistory(@Param("userId") Long userId, @Param("planId") Long planId);

    @Query("SELECT p FROM UserProgress p WHERE p.marketplacePlanId = :planId ORDER BY p.recordedDate DESC")
    List<UserProgress> findAllProgressForPlan(@Param("planId") Long planId, Pageable pageable);

    @Query("SELECT p FROM UserProgress p WHERE p.subscriptionId = :subscriptionId ORDER BY p.weekNumber ASC")
    List<UserProgress> findProgressBySubscription(@Param("subscriptionId") Long subscriptionId);

    @Query("SELECT p FROM UserProgress p WHERE p.userId = :userId ORDER BY p.recordedDate DESC")
    List<UserProgress> findRecentProgressForUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM UserProgress p WHERE p.marketplacePlanId = :planId AND p.recordedDate >= :date")
    List<UserProgress> findProgressSince(@Param("planId") Long planId, @Param("date") LocalDateTime date);

    @Query("SELECT COUNT(DISTINCT p.userId) FROM UserProgress p WHERE p.marketplacePlanId = :planId")
    long countActiveProgressTrackers(@Param("planId") Long planId);

    @Query("SELECT AVG(p.workoutCompletionRate) FROM UserProgress p WHERE p.marketplacePlanId = :planId")
    Double getAverageWorkoutCompletion(@Param("planId") Long planId);

    List<UserProgress> findBySubscriptionId(Long subscriptionId);
}
