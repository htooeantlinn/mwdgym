package com.example.mwdgym.repository;

import com.example.mwdgym.model.MarketplacePlanSubscription;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplacePlanSubscriptionRepository extends JpaRepository<MarketplacePlanSubscription, Long> {

    List<MarketplacePlanSubscription> findByUserId(Long userId);

    List<MarketplacePlanSubscription> findByUserIdAndStatus(Long userId, MarketplacePlanSubscription.Status status);

    List<MarketplacePlanSubscription> findByPlanId(Long planId);

    List<MarketplacePlanSubscription> findByPlanIdAndStatus(Long planId, MarketplacePlanSubscription.Status status);

    Optional<MarketplacePlanSubscription> findByUserIdAndPlanIdAndStatus(Long userId, Long planId, MarketplacePlanSubscription.Status status);

    @Query("SELECT COUNT(s) FROM MarketplacePlanSubscription s WHERE s.planId = :planId AND s.status = 'ACTIVE'")
    long countActiveSubscribers(@Param("planId") Long planId);

    @Query("SELECT s FROM MarketplacePlanSubscription s WHERE s.status = 'ACTIVE' AND s.autoRenew = true AND s.subscriptionEndDate BETWEEN :startDate AND :endDate")
    List<MarketplacePlanSubscription> findExpiringSubscriptions(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM MarketplacePlanSubscription s WHERE s.userId = :userId AND s.status = 'ACTIVE'")
    List<MarketplacePlanSubscription> findActiveSubscriptionsByUser(@Param("userId") Long userId);

    @Query("SELECT s FROM MarketplacePlanSubscription s WHERE s.planId = :planId AND s.status = 'ACTIVE' ORDER BY s.purchaseDate DESC")
    List<MarketplacePlanSubscription> findRecentSubscribers(@Param("planId") Long planId, Pageable pageable);

    @Query("SELECT COUNT(s) FROM MarketplacePlanSubscription s WHERE s.planId = :planId AND s.status = 'CANCELLED'")
    long countCancelledSubscriptions(@Param("planId") Long planId);

    @Query("SELECT s FROM MarketplacePlanSubscription s WHERE s.status = 'CANCELLED' AND s.refundStatus = 'APPROVED'")
    List<MarketplacePlanSubscription> findRefundedSubscriptions();

    boolean existsByUserIdAndPlanId(Long userId, Long planId);

    long countByPlanIdAndStatus(Long planId, MarketplacePlanSubscription.Status status);
}
