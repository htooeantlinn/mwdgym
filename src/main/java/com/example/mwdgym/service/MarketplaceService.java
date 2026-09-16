package com.example.mwdgym.service;

import com.example.mwdgym.model.MarketplacePlan;
import com.example.mwdgym.model.MarketplacePlanSubscription;
import com.example.mwdgym.model.PlanReview;
import com.example.mwdgym.repository.MarketplacePlanRepository;
import com.example.mwdgym.repository.MarketplacePlanSubscriptionRepository;
import com.example.mwdgym.repository.PlanReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MarketplaceService {

    @Autowired
    private MarketplacePlanRepository marketplacePlanRepository;

    @Autowired
    private MarketplacePlanSubscriptionRepository subscriptionRepository;

    @Autowired
    private PlanReviewRepository reviewRepository;

    // ==================== PLAN MANAGEMENT ====================

    /**
     * Create a new marketplace plan (DRAFT status)
     */
    public MarketplacePlan createPlan(MarketplacePlan plan, Long trainerId) {
        plan.setTrainerId(trainerId);
        plan.setStatus(MarketplacePlan.Status.DRAFT);
        plan.setActiveSubscribers(0);
        plan.setTotalPurchases(0);
        plan.setRating(BigDecimal.ZERO);
        return marketplacePlanRepository.save(plan);
    }

    /**
     * Update an existing plan
     */
    public MarketplacePlan updatePlan(Long planId, MarketplacePlan updates, Long trainerId) {
        MarketplacePlan plan = marketplacePlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Verify trainer owns this plan
        if (!plan.getTrainerId().equals(trainerId)) {
            throw new RuntimeException("Unauthorized: Trainer does not own this plan");
        }

        if (updates.getTitle() != null) plan.setTitle(updates.getTitle());
        if (updates.getDescription() != null) plan.setDescription(updates.getDescription());
        if (updates.getCategory() != null) plan.setCategory(updates.getCategory());
        if (updates.getDifficultyLevel() != null) plan.setDifficultyLevel(updates.getDifficultyLevel());
        if (updates.getDurationWeeks() != null) plan.setDurationWeeks(updates.getDurationWeeks());
        if (updates.getPriceMmk() != null) plan.setPriceMmk(updates.getPriceMmk());
        if (updates.getContentStructure() != null) plan.setContentStructure(updates.getContentStructure());
        if (updates.getExercisesJson() != null) plan.setExercisesJson(updates.getExercisesJson());
        if (updates.getTargetAudience() != null) plan.setTargetAudience(updates.getTargetAudience());
        if (updates.getPlanType() != null) plan.setPlanType(updates.getPlanType());
        if (updates.getIncludeMacroPlanning() != null) plan.setIncludeMacroPlanning(updates.getIncludeMacroPlanning());
        if (updates.getIncludeSupplementGuide() != null) plan.setIncludeSupplementGuide(updates.getIncludeSupplementGuide());
        if (updates.getThumbnailUrl() != null) plan.setThumbnailUrl(updates.getThumbnailUrl());
        if (updates.getPreviewVideoUrl() != null) plan.setPreviewVideoUrl(updates.getPreviewVideoUrl());

        return marketplacePlanRepository.save(plan);
    }

    /**
     * Get plan by ID
     */
    public Optional<MarketplacePlan> getPlanById(Long planId) {
        return marketplacePlanRepository.findById(planId);
    }

    /**
     * Get published plans with pagination
     */
    public List<MarketplacePlan> getPublishedPlans(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        return marketplacePlanRepository.findByStatusOrderByPublishedAtDesc(MarketplacePlan.Status.PUBLISHED, pageable);
    }

    /**
     * Search plans by keyword, category, difficulty
     */
    public List<MarketplacePlan> searchPlans(String keyword, String category, String difficulty) {

        if (keyword != null && !keyword.isBlank()) {
            return marketplacePlanRepository.searchPlans(keyword);
        }

        if (category != null && difficulty != null) {
            MarketplacePlan.Category cat = MarketplacePlan.Category.valueOf(category);
            MarketplacePlan.DifficultyLevel diff = MarketplacePlan.DifficultyLevel.valueOf(difficulty);
            return marketplacePlanRepository.findByStatusAndCategoryAndDifficultyLevel(MarketplacePlan.Status.PUBLISHED, cat, diff);
        }

        if (category != null) {
            MarketplacePlan.Category cat = MarketplacePlan.Category.valueOf(category);
            return marketplacePlanRepository.findByStatusAndCategory(MarketplacePlan.Status.PUBLISHED, cat);
        }

        if (difficulty != null) {
            MarketplacePlan.DifficultyLevel diff = MarketplacePlan.DifficultyLevel.valueOf(difficulty);
            return marketplacePlanRepository.findByStatusAndDifficultyLevel(MarketplacePlan.Status.PUBLISHED, diff);
        }

        return marketplacePlanRepository.findByStatus(MarketplacePlan.Status.PUBLISHED);
    }

    public Optional<MarketplacePlan> getPublishedPlanById(Long planId) {
        return marketplacePlanRepository.findByIdAndStatus(planId, MarketplacePlan.Status.PUBLISHED);
    }

    /**
     * Publish a plan (DRAFT → PUBLISHED)
     */
    public MarketplacePlan publishPlan(Long planId, Long trainerId) {
        MarketplacePlan plan = marketplacePlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (!plan.getTrainerId().equals(trainerId)) {
            throw new RuntimeException("Unauthorized: Trainer does not own this plan");
        }

        if (plan.getStatus() != MarketplacePlan.Status.DRAFT && plan.getStatus() != MarketplacePlan.Status.ARCHIVED) {
            throw new RuntimeException("Only DRAFT or ARCHIVED plans can be published");
        }

        plan.setStatus(MarketplacePlan.Status.PUBLISHED);
        plan.setPublishedAt(LocalDateTime.now());
        return marketplacePlanRepository.save(plan);
    }

    /**
     * Archive a plan (PUBLISHED → ARCHIVED)
     */
    public MarketplacePlan archivePlan(Long planId, Long trainerId) {
        MarketplacePlan plan = marketplacePlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (!plan.getTrainerId().equals(trainerId)) {
            throw new RuntimeException("Unauthorized: Trainer does not own this plan");
        }

        plan.setStatus(MarketplacePlan.Status.ARCHIVED);
        return marketplacePlanRepository.save(plan);
    }

    // ==================== DISCOVERY & ANALYTICS ====================

    /**
     * Get trending plans (sorted by rating & subscribers)
     */
    public List<MarketplacePlan> getTrendingPlans() {
        Pageable pageable = PageRequest.of(0, 10);
        return marketplacePlanRepository.findTopTrendingPlans(pageable);
    }

    /**
     * Get latest published plans
     */
    public List<MarketplacePlan> getLatestPlans() {
        Pageable pageable = PageRequest.of(0, 10);
        return marketplacePlanRepository.findLatestPublishedPlans(pageable);
    }

    /**
     * Get plans by price range
     */
    public List<MarketplacePlan> getPlansByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return marketplacePlanRepository.findByPriceRange(minPrice, maxPrice);
    }

    /**
     * Get average rating for a plan
     */
    public Double getAverageRating(Long planId) {
        return reviewRepository.getAverageRatingForPlan(planId);
    }

    /**
     * Get subscriber count for a plan
     */
    public int getSubscriberCount(Long planId) {
        return (int) subscriptionRepository.countActiveSubscribers(planId);
    }

    /**
     * Get reviews for a plan
     */
    public List<PlanReview> getPlanReviews(Long planId) {
        return reviewRepository.findByPlanIdOrderByCreatedAtDesc(planId);
    }

    /**
     * Get reviews sorted by helpful count
     */
    public List<PlanReview> getPlanReviewsSortedByHelpful(Long planId) {
        return reviewRepository.findByPlanIdOrderByHelpfulCount(planId);
    }

    /**
     * Get trainer's plans
     */
    public List<MarketplacePlan> getTrainerPlans(Long trainerId) {
        return marketplacePlanRepository.findByTrainerId(trainerId);
    }

    /**
     * Get trainer's published plans
     */
    public List<MarketplacePlan> getTrainerPublishedPlans(Long trainerId) {
        return marketplacePlanRepository.findByTrainerIdAndStatus(trainerId, MarketplacePlan.Status.PUBLISHED);
    }

    /**
     * Update plan rating based on reviews
     */
    public void updatePlanRating(Long planId) {
        Double avgRating = reviewRepository.getAverageRatingForPlan(planId);
        if (avgRating != null) {
            Optional<MarketplacePlan> planOpt = marketplacePlanRepository.findById(planId);
            if (planOpt.isPresent()) {
                MarketplacePlan plan = planOpt.get();
                plan.setRating(BigDecimal.valueOf(avgRating));
                marketplacePlanRepository.save(plan);
            }
        }
    }

    /**
     * Increment purchase count
     */
    public void incrementPurchaseCount(Long planId) {
        Optional<MarketplacePlan> planOpt = marketplacePlanRepository.findById(planId);
        if (planOpt.isPresent()) {
            MarketplacePlan plan = planOpt.get();
            plan.setTotalPurchases((plan.getTotalPurchases() != null ? plan.getTotalPurchases() : 0) + 1);
            marketplacePlanRepository.save(plan);
        }
    }

    /**
     * Update active subscriber count
     */
    public void updateActiveSubscriberCount(Long planId) {
        long count = subscriptionRepository.countActiveSubscribers(planId);
        Optional<MarketplacePlan> planOpt = marketplacePlanRepository.findById(planId);
        if (planOpt.isPresent()) {
            MarketplacePlan plan = planOpt.get();
            plan.setActiveSubscribers((int) count);
            marketplacePlanRepository.save(plan);
        }
    }
}
