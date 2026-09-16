package com.example.mwdgym.service;

import com.example.mwdgym.model.MarketplacePlan;
import com.example.mwdgym.model.MarketplacePlanSubscription;
import com.example.mwdgym.repository.MarketplacePlanRepository;
import com.example.mwdgym.repository.MarketplacePlanSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MarketplaceSubscriptionService {

    @Autowired
    private MarketplacePlanSubscriptionRepository subscriptionRepository;

    @Autowired
    private MarketplacePlanRepository planRepository;

    @Autowired
    private MarketplaceService marketplaceService;

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    /**
     * Subscribe user to a marketplace plan
     */
    public MarketplacePlanSubscription subscribeToPlan(Long userId, Long planId, String subscriptionType, BigDecimal pricePaid) {
        // Verify plan exists
        MarketplacePlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Check if user already subscribed (active)
        if (isDuplicateActiveSubscription(userId, planId)) {
            throw new RuntimeException("User is already subscribed to this plan");
        }

        // Create subscription
        MarketplacePlanSubscription subscription = new MarketplacePlanSubscription();
        subscription.setUserId(userId);
        subscription.setPlanId(planId);
        subscription.setPricePaidMmk(pricePaid != null ? pricePaid : plan.getPriceMmk());

        // Set dates based on subscription type
        MarketplacePlanSubscription.SubscriptionType subType = 
            MarketplacePlanSubscription.SubscriptionType.valueOf(subscriptionType);
        subscription.setSubscriptionType(subType);
        
        LocalDateTime now = LocalDateTime.now();
        subscription.setSubscriptionStartDate(now);
        
        switch (subType) {
            case MONTHLY:
                subscription.setSubscriptionEndDate(now.plusMonths(1));
                subscription.setAutoRenew(true);
                break;
            case YEARLY:
                subscription.setSubscriptionEndDate(now.plusYears(1));
                subscription.setAutoRenew(true);
                break;
            case ONE_TIME_ACCESS:
                subscription.setSubscriptionEndDate(now.plusYears(1)); // 1 year access
                subscription.setAutoRenew(false);
                break;
        }

        subscription.setStatus(MarketplacePlanSubscription.Status.ACTIVE);
        subscription.setPaymentMethod(MarketplacePlanSubscription.PaymentMethod.CARD);

        MarketplacePlanSubscription saved = subscriptionRepository.save(subscription);

        // Update plan stats
        marketplaceService.incrementPurchaseCount(planId);
        marketplaceService.updateActiveSubscriberCount(planId);

        return saved;
    }

    /**
     * Get all subscriptions for a user
     */
    public List<MarketplacePlanSubscription> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    /**
     * Get active subscriptions for a user
     */
    public List<MarketplacePlanSubscription> getUserActiveSubscriptions(Long userId) {
        return subscriptionRepository.findActiveSubscriptionsByUser(userId);
    }

    /**
     * Get subscription by ID
     */
    public Optional<MarketplacePlanSubscription> getSubscription(Long subscriptionId) {
        return subscriptionRepository.findById(subscriptionId);
    }

    /**
     * Cancel a subscription
     */
    public MarketplacePlanSubscription cancelSubscription(Long subscriptionId, String reason) {
        MarketplacePlanSubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        subscription.setStatus(MarketplacePlanSubscription.Status.CANCELLED);
        subscription.setCancellationDate(LocalDateTime.now());
        subscription.setCancellationReason(reason);
        subscription.setAutoRenew(false);

        MarketplacePlanSubscription updated = subscriptionRepository.save(subscription);

        // Update plan stats
        marketplaceService.updateActiveSubscriberCount(subscription.getPlanId());

        return updated;
    }

    /**
     * Pause a subscription
     */
    public MarketplacePlanSubscription pauseSubscription(Long subscriptionId) {
        MarketplacePlanSubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        subscription.setStatus(MarketplacePlanSubscription.Status.PAUSED);
        subscription.setAutoRenew(false);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Resume a paused subscription
     */
    public MarketplacePlanSubscription resumeSubscription(Long subscriptionId) {
        MarketplacePlanSubscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (subscription.getStatus() != MarketplacePlanSubscription.Status.PAUSED) {
            throw new RuntimeException("Only PAUSED subscriptions can be resumed");
        }

        subscription.setStatus(MarketplacePlanSubscription.Status.ACTIVE);
        subscription.setAutoRenew(true);

        return subscriptionRepository.save(subscription);
    }

    // ==================== VALIDATION ====================

    /**
     * Check if user can subscribe to plan
     */
    public boolean canUserSubscribe(Long userId, Long planId) {
        // Plan must be published
        Optional<MarketplacePlan> plan = planRepository.findById(planId);
        if (plan.isEmpty()) {
            return false;
        }

        if (plan.get().getStatus() != MarketplacePlan.Status.PUBLISHED) {
            return false;
        }

        // User must not already have active subscription
        return !isDuplicateActiveSubscription(userId, planId);
    }

    /**
     * Check if user already has active subscription to this plan
     */
    public boolean isDuplicateActiveSubscription(Long userId, Long planId) {
        Optional<MarketplacePlanSubscription> existing = 
            subscriptionRepository.findByUserIdAndPlanIdAndStatus(userId, planId, MarketplacePlanSubscription.Status.ACTIVE);
        return existing.isPresent();
    }

    /**
     * Check if subscription exists (any status)
     */
    public boolean hasSubscribedBefore(Long userId, Long planId) {
        return subscriptionRepository.existsByUserIdAndPlanId(userId, planId);
    }

    // ==================== AUTO-RENEWAL ====================

    /**
     * Process auto-renewals (scheduled job)
     * Find subscriptions expiring within next 7 days with auto_renew = true
     * and attempt to renew them
     */
    @Transactional
    public void processAutoRenewals() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekLater = now.plusDays(7);

        List<MarketplacePlanSubscription> expiringSubscriptions = 
            subscriptionRepository.findExpiringSubscriptions(now, weekLater);

        for (MarketplacePlanSubscription sub : expiringSubscriptions) {
            try {
                renewSubscription(sub);
            } catch (Exception e) {
                // Auto-renewal failed
            }
        }
    }

    /**
     * Renew a single subscription
     */
    private void renewSubscription(MarketplacePlanSubscription subscription) {
        // Get plan for pricing
        MarketplacePlan plan = planRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found for subscription renewal"));

        // Create new subscription
        MarketplacePlanSubscription newSub = new MarketplacePlanSubscription();
        newSub.setUserId(subscription.getUserId());
        newSub.setPlanId(subscription.getPlanId());
        newSub.setPricePaidMmk(plan.getPriceMmk());
        newSub.setSubscriptionType(subscription.getSubscriptionType());
        newSub.setPaymentMethod(subscription.getPaymentMethod());

        LocalDateTime now = LocalDateTime.now();
        newSub.setSubscriptionStartDate(now);

        // Calculate end date based on subscription type
        switch (subscription.getSubscriptionType()) {
            case MONTHLY:
                newSub.setSubscriptionEndDate(now.plusMonths(1));
                break;
            case YEARLY:
                newSub.setSubscriptionEndDate(now.plusYears(1));
                break;
            case ONE_TIME_ACCESS:
                newSub.setSubscriptionEndDate(now.plusYears(1));
                break;
        }

        newSub.setStatus(MarketplacePlanSubscription.Status.ACTIVE);
        newSub.setAutoRenew(subscription.getAutoRenew());

        subscriptionRepository.save(newSub);
    }

    // ==================== ANALYTICS ====================

    /**
     * Get total active subscribers for a plan
     */
    public long getActivSubscriberCount(Long planId) {
        return subscriptionRepository.countActiveSubscribers(planId);
    }

    /**
     * Get revenue for a plan
     */
    public BigDecimal getPlanRevenue(Long planId) {
        List<MarketplacePlanSubscription> subscriptions = 
            subscriptionRepository.findByPlanIdAndStatus(planId, MarketplacePlanSubscription.Status.ACTIVE);

        return subscriptions.stream()
                .map(MarketplacePlanSubscription::getPricePaidMmk)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public MarketplacePlanSubscription updateSubscription(MarketplacePlanSubscription subscription) {
        return subscriptionRepository.save(subscription);
    }

    public List<MarketplacePlanSubscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }
}
