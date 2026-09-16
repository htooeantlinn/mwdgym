package com.example.mwdgym.api;

import com.example.mwdgym.model.*;
import com.example.mwdgym.repository.MarketplacePlanRepository;
import com.example.mwdgym.repository.PlanReviewRepository;
import com.example.mwdgym.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marketplace")
public class ApiMarketplaceController {

    private final MarketplaceService marketplaceService;
    private final MarketplaceSubscriptionService marketplaceSubscriptionService;
    private final GymService gymService;
    private final LoggingService loggingService;
    private final PlanReviewRepository reviewRepository;
    private final MarketplacePlanRepository planRepository;
    private final WorkoutPlanPdfService workoutPlanPdfService;

    public ApiMarketplaceController(MarketplaceService marketplaceService,
                                     MarketplaceSubscriptionService marketplaceSubscriptionService,
                                     GymService gymService,
                                     LoggingService loggingService,
                                     PlanReviewRepository reviewRepository,
                                     MarketplacePlanRepository planRepository,
                                     WorkoutPlanPdfService workoutPlanPdfService) {
        this.marketplaceService = marketplaceService;
        this.marketplaceSubscriptionService = marketplaceSubscriptionService;
        this.gymService = gymService;
        this.loggingService = loggingService;
        this.reviewRepository = reviewRepository;
        this.planRepository = planRepository;
        this.workoutPlanPdfService = workoutPlanPdfService;
    }

    // ==================== GROUP 1: BROWSE ====================

    @GetMapping("/plans")
    public ResponseEntity<?> listPublishedPlans(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<MarketplacePlan> plans;
            if (keyword != null && !keyword.isBlank()) {
                plans = marketplaceService.searchPlans(keyword, category, difficulty);
            } else if (category != null || difficulty != null) {
                plans = marketplaceService.searchPlans(null, category, difficulty);
            } else {
                plans = marketplaceService.getPublishedPlans(page, size);
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlan plan : plans) {
                result.add(toPlanSummaryJson(plan));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<?> getPlanDetail(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            Optional<MarketplacePlan> planOpt = marketplaceService.getPublishedPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }

            MarketplacePlan plan = planOpt.get();
            Map<String, Object> json = toPlanDetailJson(plan);

            Double avgRating = marketplaceService.getAverageRating(id);
            json.put("averageRating", avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0);
            json.put("subscriberCount", marketplaceService.getSubscriberCount(id));

            Optional<UserAccount> trainer = Optional.ofNullable(gymService.getUserById(plan.getTrainerId()));
            if (trainer.isPresent()) {
                Map<String, Object> trainerInfo = new LinkedHashMap<>();
                trainerInfo.put("id", trainer.get().getId());
                trainerInfo.put("displayName", trainer.get().getDisplayName());
                trainerInfo.put("profileImage", trainer.get().getProfileImage());
                json.put("trainer", trainerInfo);
            }

            boolean hasActive = user != null && marketplaceSubscriptionService.isDuplicateActiveSubscription(user.getId(), id);
            boolean canViewVideo = hasActive || (user != null &&
                    (user.getRole() == UserAccount.Role.ADMIN || plan.getTrainerId().equals(user.getId())));
            json.put("hasActiveSubscription", hasActive);
            if (!canViewVideo) {
                json.remove("previewVideoUrl");
            } else if (plan.getPreviewVideoUrl() != null) {
                json.put("previewVideoUrl", "/api/marketplace/plans/" + id + "/preview-video");
            }
            if (!hasActive) {
                json.remove("exercisesJson");
                json.remove("contentStructure");
            }

            List<PlanReview> reviews = marketplaceService.getPlanReviews(id);
            List<Map<String, Object>> reviewList = new ArrayList<>();
            for (PlanReview review : reviews) {
                reviewList.add(toReviewJson(review));
            }
            json.put("reviews", reviewList);

            return ResponseEntity.ok(json);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plans/{id}/pdf")
    public ResponseEntity<?> downloadPlanPdf(@PathVariable Long id) {
        try {
            Optional<MarketplacePlan> planOpt = planRepository.findById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }

            MarketplacePlan plan = planOpt.get();
            UserAccount user = currentUser();

            boolean isOwner = user != null && plan.getTrainerId() != null && plan.getTrainerId().equals(user.getId());
            boolean isAdmin = user != null && user.getRole() == UserAccount.Role.ADMIN;
            boolean isPublished = plan.getStatus() == MarketplacePlan.Status.PUBLISHED;
            boolean isSubscriber = user != null && marketplaceSubscriptionService.isDuplicateActiveSubscription(user.getId(), plan.getId());

            if (!isOwner && !isAdmin && !isPublished && !isSubscriber) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not have permission to download this plan PDF"));
            }

            UserAccount trainer = plan.getTrainerId() != null ? gymService.getUserById(plan.getTrainerId()) : null;
            String gymName = gymService.getSetting("gym_name");
            if (gymName == null || gymName.isBlank()) gymName = "MWD FITNESS & GYM";

            byte[] pdfBytes = workoutPlanPdfService.generateMarketplacePlanPdf(plan, trainer, gymName);
            String cleanTitle = (plan.getTitle() != null ? plan.getTitle() : "Workout_Plan")
                    .replaceAll("[^a-zA-Z0-9._-]", "_");
            String filename = cleanTitle + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingPlans() {
        try {
            List<MarketplacePlan> plans = marketplaceService.getTrendingPlans();
            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlan plan : plans) {
                result.add(toPlanSummaryJson(plan));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestPlans() {
        try {
            List<MarketplacePlan> plans = marketplaceService.getLatestPlans();
            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlan plan : plans) {
                result.add(toPlanSummaryJson(plan));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== GROUP 2: TRAINER PLAN MANAGEMENT ====================

    @GetMapping("/my-plans")
    public ResponseEntity<?> getMyPlans() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            List<MarketplacePlan> plans = marketplaceService.getTrainerPlans(user.getId());
            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlan plan : plans) {
                result.add(toPlanDetailJson(plan));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@RequestBody Map<String, Object> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            MarketplacePlan plan = new MarketplacePlan();
            plan.setTitle((String) body.get("title"));
            plan.setDescription((String) body.get("description"));

            if (body.get("category") != null) {
                plan.setCategory(MarketplacePlan.Category.valueOf((String) body.get("category")));
            }
            if (body.get("difficultyLevel") != null) {
                plan.setDifficultyLevel(MarketplacePlan.DifficultyLevel.valueOf((String) body.get("difficultyLevel")));
            }
            if (body.get("durationWeeks") != null) {
                plan.setDurationWeeks(Integer.parseInt(body.get("durationWeeks").toString()));
            }
            if (body.get("targetAudience") != null) {
                plan.setTargetAudience((String) body.get("targetAudience"));
            }
            if (body.get("priceMmk") != null) {
                plan.setPriceMmk(new BigDecimal(body.get("priceMmk").toString()));
            }
            if (body.get("planType") != null) {
                plan.setPlanType(MarketplacePlan.PlanType.valueOf((String) body.get("planType")));
            }
            if (body.get("exercisesJson") != null) {
                plan.setExercisesJson((String) body.get("exercisesJson"));
            }
            if (body.get("contentStructure") != null) {
                plan.setContentStructure((String) body.get("contentStructure"));
            }
            if (body.get("includeMacroPlanning") != null) {
                plan.setIncludeMacroPlanning(Boolean.parseBoolean(body.get("includeMacroPlanning").toString()));
            }
            if (body.get("includeSupplementGuide") != null) {
                plan.setIncludeSupplementGuide(Boolean.parseBoolean(body.get("includeSupplementGuide").toString()));
            }
            if (body.get("thumbnailUrl") != null) {
                plan.setThumbnailUrl((String) body.get("thumbnailUrl"));
            }
            if (body.get("previewVideoUrl") != null) {
                plan.setPreviewVideoUrl((String) body.get("previewVideoUrl"));
            }

            MarketplacePlan saved = marketplaceService.createPlan(plan, user.getId());
            loggingService.info("MARKETPLACE", "CREATE_PLAN", user, "Created plan: " + saved.getTitle(), null);
            return ResponseEntity.ok(toPlanSummaryJson(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            Optional<MarketplacePlan> existing = marketplaceService.getPlanById(id);
            if (existing.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }
            if (!existing.get().getTrainerId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You do not own this plan"));
            }

            MarketplacePlan updates = new MarketplacePlan();
            if (body.get("title") != null) updates.setTitle((String) body.get("title"));
            if (body.get("description") != null) updates.setDescription((String) body.get("description"));
            if (body.get("category") != null) {
                updates.setCategory(MarketplacePlan.Category.valueOf((String) body.get("category")));
            }
            if (body.get("difficultyLevel") != null) {
                updates.setDifficultyLevel(MarketplacePlan.DifficultyLevel.valueOf((String) body.get("difficultyLevel")));
            }
            if (body.get("durationWeeks") != null) {
                updates.setDurationWeeks(Integer.parseInt(body.get("durationWeeks").toString()));
            }
            if (body.get("priceMmk") != null) {
                updates.setPriceMmk(new BigDecimal(body.get("priceMmk").toString()));
            }
            if (body.get("contentStructure") != null) {
                updates.setContentStructure((String) body.get("contentStructure"));
            }
            if (body.get("targetAudience") != null) {
                updates.setTargetAudience((String) body.get("targetAudience"));
            }
            if (body.get("planType") != null) {
                updates.setPlanType(MarketplacePlan.PlanType.valueOf((String) body.get("planType")));
            }
            if (body.get("exercisesJson") != null) {
                updates.setExercisesJson((String) body.get("exercisesJson"));
            }
            if (body.get("includeMacroPlanning") != null) {
                updates.setIncludeMacroPlanning(Boolean.parseBoolean(body.get("includeMacroPlanning").toString()));
            }
            if (body.get("includeSupplementGuide") != null) {
                updates.setIncludeSupplementGuide(Boolean.parseBoolean(body.get("includeSupplementGuide").toString()));
            }
            if (body.get("thumbnailUrl") != null) {
                updates.setThumbnailUrl((String) body.get("thumbnailUrl"));
            }
            if (body.get("previewVideoUrl") != null) {
                updates.setPreviewVideoUrl((String) body.get("previewVideoUrl"));
            }

            MarketplacePlan saved = marketplaceService.updatePlan(id, updates, user.getId());
            return ResponseEntity.ok(toPlanSummaryJson(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/{id}/publish")
    public ResponseEntity<?> publishPlan(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            MarketplacePlan saved = marketplaceService.publishPlan(id, user.getId());
            loggingService.info("MARKETPLACE", "PUBLISH_PLAN", user, "Published plan: " + saved.getTitle(), null);
            return ResponseEntity.ok(toPlanSummaryJson(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/{id}/archive")
    public ResponseEntity<?> archivePlan(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            MarketplacePlan saved = marketplaceService.archivePlan(id, user.getId());
            loggingService.info("MARKETPLACE", "ARCHIVE_PLAN", user, "Archived plan: " + saved.getTitle(), null);
            return ResponseEntity.ok(toPlanSummaryJson(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }
            MarketplacePlan plan = planOpt.get();
            if (!plan.getTrainerId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You do not own this plan"));
            }
            if (plan.getStatus() != MarketplacePlan.Status.DRAFT) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only DRAFT plans can be deleted"));
            }

            planRepository.deleteById(id);
            loggingService.info("MARKETPLACE", "DELETE_PLAN", user, "Deleted plan: " + plan.getTitle(), null);
            return ResponseEntity.ok(Map.of("success", true, "message", "Plan deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== GROUP 3: PURCHASE / SUBSCRIBE ====================

    @PostMapping("/plans/{id}/buy")
    public ResponseEntity<?> buyPlan(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }
            MarketplacePlan plan = planOpt.get();
            if (plan.getStatus() != MarketplacePlan.Status.PUBLISHED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan is not published"));
            }

            String subscriptionType = body.getOrDefault("subscriptionType", "ONE_TIME_ACCESS");

            boolean alreadySubscribed = marketplaceSubscriptionService.isDuplicateActiveSubscription(user.getId(), id);
            if (alreadySubscribed) {
                return ResponseEntity.badRequest().body(Map.of("error", "You already have an active subscription to this plan"));
            }

            BigDecimal pricePaid = plan.getPriceMmk() != null ? plan.getPriceMmk() : BigDecimal.ZERO;
            long priceCoins = pricePaid.longValue();

            if (user.getCoinBalance() == null || user.getCoinBalance() < priceCoins) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient coins. You need " + priceCoins + " coins but have " + (user.getCoinBalance() != null ? user.getCoinBalance() : 0)));
            }

            user.setCoinBalance(user.getCoinBalance() - priceCoins);
            gymService.saveUserAccount(user);

            MarketplacePlanSubscription subscription = marketplaceSubscriptionService.subscribeToPlan(
                    user.getId(), id, subscriptionType, pricePaid);

            loggingService.info("MARKETPLACE", "BUY_PLAN", user,
                    "Purchased plan: " + plan.getTitle() + " (" + subscriptionType + ") for " + priceCoins + " coins", null);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("message", "Plan purchased successfully");
            result.put("subscriptionId", subscription.getId());
            result.put("subscriptionType", subscription.getSubscriptionType().name());
            result.put("pricePaidMmk", subscription.getPricePaidMmk());
            result.put("priceCoins", priceCoins);
            result.put("startDate", subscription.getSubscriptionStartDate());
            result.put("endDate", subscription.getSubscriptionEndDate());
            result.put("status", subscription.getStatus().name());
            result.put("newCoinBalance", user.getCoinBalance());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-purchases")
    public ResponseEntity<?> getMyPurchases() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            List<MarketplacePlanSubscription> subscriptions = marketplaceSubscriptionService.getUserSubscriptions(user.getId());
            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlanSubscription sub : subscriptions) {
                result.add(toSubscriptionJson(sub));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/subscriptions/{id}/cancel")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            Optional<MarketplacePlanSubscription> subOpt = marketplaceSubscriptionService.getSubscription(id);
            if (subOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription not found"));
            }
            MarketplacePlanSubscription sub = subOpt.get();
            if (!sub.getUserId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You do not own this subscription"));
            }
            if (sub.getStatus() == MarketplacePlanSubscription.Status.CANCELLED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription is already cancelled"));
            }

            String reason = (body != null && body.get("reason") != null) ? body.get("reason") : "";
            MarketplacePlanSubscription updated = marketplaceSubscriptionService.cancelSubscription(id, reason);
            loggingService.info("MARKETPLACE", "CANCEL_SUBSCRIPTION", user,
                    "Cancelled subscription #" + id, null);

            return ResponseEntity.ok(toSubscriptionJson(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/subscriptions/{id}/refund-request", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> requestRefund(
            @PathVariable Long id,
            @RequestParam(value = "reason", defaultValue = "") String reason,
            @RequestParam(value = "paymentMethod", defaultValue = "") String paymentMethod,
            @RequestParam(value = "transferId", defaultValue = "") String transferId,
            @RequestParam(value = "screenshot", required = false) MultipartFile screenshot) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            Optional<MarketplacePlanSubscription> subOpt = marketplaceSubscriptionService.getSubscription(id);
            if (subOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription not found"));
            }
            MarketplacePlanSubscription sub = subOpt.get();
            if (!sub.getUserId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You do not own this subscription"));
            }
            if (sub.getStatus() == MarketplacePlanSubscription.Status.CANCELLED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription is already cancelled"));
            }
            if (sub.getRefundStatus() == MarketplacePlanSubscription.RefundStatus.REQUESTED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Refund already requested"));
            }

            sub.setRefundStatus(MarketplacePlanSubscription.RefundStatus.REQUESTED);
            sub.setCancellationReason(reason);
            if (paymentMethod != null && !paymentMethod.isBlank()) {
                sub.setRefundPaymentMethod(paymentMethod.toUpperCase());
            }
            if (transferId != null && !transferId.isBlank()) {
                sub.setRefundTransferId(transferId);
            }

            if (screenshot != null && !screenshot.isEmpty()) {
                String storedName = "refund-" + id + "-" + UUID.randomUUID() + getExtension(screenshot.getOriginalFilename());
                Path dir = Paths.get("uploads/refunds");
                Files.createDirectories(dir);
                Path target = dir.resolve(storedName);
                Files.copy(screenshot.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                sub.setRefundScreenshotUrl("/uploads/refunds/" + storedName);
            }

            marketplaceSubscriptionService.updateSubscription(sub);

            loggingService.info("MARKETPLACE", "REFUND_REQUEST", user,
                    "Requested refund for subscription #" + id + " (reason: " + reason + ", method: " + paymentMethod + ")", null);

            return ResponseEntity.ok(toSubscriptionJson(sub));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subscriptions/{id}/check")
    public ResponseEntity<?> checkSubscription(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            String planIdStr = body.get("planId");
            if (planIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "planId is required"));
            }
            Long planId = Long.parseLong(planIdStr);

            boolean active = marketplaceSubscriptionService.isDuplicateActiveSubscription(user.getId(), planId);
            return ResponseEntity.ok(Map.of("hasActiveSubscription", active));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== GROUP 4: REVIEWS ====================

    @GetMapping("/plans/{id}/reviews")
    public ResponseEntity<?> getPlanReviews(@PathVariable Long id) {
        try {
            Optional<MarketplacePlan> planOpt = marketplaceService.getPublishedPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }

            List<PlanReview> reviews = marketplaceService.getPlanReviews(id);
            List<Map<String, Object>> result = new ArrayList<>();
            for (PlanReview review : reviews) {
                result.add(toReviewJson(review));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/{id}/review")
    public ResponseEntity<?> addReview(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }

            Optional<PlanReview> existingReview = reviewRepository.findByPlanIdAndUserId(id, user.getId());
            if (existingReview.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "You have already reviewed this plan"));
            }

            Integer rating = (Integer) body.get("rating");
            if (rating == null || rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 1 and 5"));
            }

            String reviewText = (String) body.getOrDefault("reviewText", "");

            PlanReview review = new PlanReview();
            review.setPlanId(id);
            review.setUserId(user.getId());
            review.setSubscriptionId(0L);
            review.setRating(rating);
            review.setReviewText(reviewText);
            review.setVerifiedPurchase(false);
            review.setHelpfulCount(0);

            PlanReview saved = reviewRepository.save(review);
            marketplaceService.updatePlanRating(id);

            loggingService.info("MARKETPLACE", "ADD_REVIEW", user,
                    "Added review (rating=" + rating + ") for plan: " + planOpt.get().getTitle(), null);

            return ResponseEntity.ok(toReviewJson(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== GROUP 5: ADMIN ====================

    @GetMapping("/admin/plans")
    public ResponseEntity<?> adminListAllPlans() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlan.Status status : MarketplacePlan.Status.values()) {
                List<MarketplacePlan> plans = planRepository.findByStatus(status);
                for (MarketplacePlan plan : plans) {
                    result.add(toPlanSummaryJson(plan));
                }
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/plans/{id}/approve")
    public ResponseEntity<?> adminApprovePlan(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }
            MarketplacePlan plan = planOpt.get();
            plan.setStatus(MarketplacePlan.Status.PUBLISHED);
            plan.setPublishedAt(LocalDateTime.now());
            planRepository.save(plan);

            loggingService.info("MARKETPLACE", "ADMIN_APPROVE", user,
                    "Approved plan: " + plan.getTitle(), null);

            return ResponseEntity.ok(toPlanSummaryJson(plan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/plans/{id}/reject")
    public ResponseEntity<?> adminRejectPlan(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan not found"));
            }
            MarketplacePlan plan = planOpt.get();
            plan.setStatus(MarketplacePlan.Status.ARCHIVED);
            planRepository.save(plan);

            loggingService.info("MARKETPLACE", "ADMIN_REJECT", user,
                    "Rejected plan: " + plan.getTitle(), null);

            return ResponseEntity.ok(toPlanSummaryJson(plan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== GROUP 6: COINS & REFUNDS ====================

    @GetMapping("/coins/balance")
    public ResponseEntity<?> getCoinBalance() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            return ResponseEntity.ok(Map.of("coinBalance", user.getCoinBalance() != null ? user.getCoinBalance() : 0));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/coins/topup")
    public ResponseEntity<?> adminTopUpCoins(@RequestBody Map<String, Object> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            Long targetUserId = Long.parseLong(body.get("userId").toString());
            Long amount = Long.parseLong(body.get("amount").toString());

            UserAccount targetUser = gymService.getUserById(targetUserId);
            if (targetUser == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            targetUser.setCoinBalance((targetUser.getCoinBalance() != null ? targetUser.getCoinBalance() : 0) + amount);
            gymService.saveUserAccount(targetUser);

            loggingService.info("MARKETPLACE", "ADMIN_TOPUP", user,
                    "Topped up " + amount + " coins for user: " + targetUser.getUsername(), null);

            return ResponseEntity.ok(Map.of("success", true, "newBalance", targetUser.getCoinBalance()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/subscriptions/{id}/refund")
    public ResponseEntity<?> adminRefundSubscription(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            Optional<MarketplacePlanSubscription> subOpt = marketplaceSubscriptionService.getSubscription(id);
            if (subOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription not found"));
            }

            MarketplacePlanSubscription sub = subOpt.get();
            if (sub.getStatus() == MarketplacePlanSubscription.Status.CANCELLED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription already cancelled"));
            }

            String action = body != null ? body.getOrDefault("action", "approve") : "approve";
            String adminNotes = body != null ? body.getOrDefault("adminNotes", "") : "";
            String rejectReason = body != null ? body.getOrDefault("rejectReason", "") : "";

            sub.setRefundProcessedAt(LocalDateTime.now());
            sub.setRefundAdminNotes(adminNotes);

            if ("reject".equalsIgnoreCase(action)) {
                sub.setRefundStatus(MarketplacePlanSubscription.RefundStatus.REJECTED);
                sub.setRefundRejectionReason(rejectReason);
                marketplaceSubscriptionService.updateSubscription(sub);

                loggingService.info("MARKETPLACE", "ADMIN_REFUND_REJECTED", user,
                        "Rejected refund for subscription #" + id + " (reason: " + rejectReason + ")", null);
            } else {
                sub.setStatus(MarketplacePlanSubscription.Status.CANCELLED);
                sub.setCancellationDate(LocalDateTime.now());
                sub.setCancellationReason("Admin refund approved");
                sub.setRefundStatus(MarketplacePlanSubscription.RefundStatus.APPROVED);
                marketplaceSubscriptionService.updateSubscription(sub);

                UserAccount subscriber = gymService.getUserById(sub.getUserId());
                if (subscriber != null) {
                    long refundCoins = sub.getPricePaidMmk() != null ? sub.getPricePaidMmk().longValue() : 0;
                    subscriber.setCoinBalance((subscriber.getCoinBalance() != null ? subscriber.getCoinBalance() : 0) + refundCoins);
                    gymService.saveUserAccount(subscriber);
                }

                marketplaceService.updateActiveSubscriberCount(sub.getPlanId());

                loggingService.info("MARKETPLACE", "ADMIN_REFUND_APPROVED", user,
                        "Approved refund for subscription #" + id + " for user #" + sub.getUserId(), null);
            }

            return ResponseEntity.ok(toSubscriptionJson(sub));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/subscriptions")
    public ResponseEntity<?> adminListSubscriptions() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            List<MarketplacePlanSubscription> allSubs = marketplaceSubscriptionService.getAllSubscriptions();
            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlanSubscription sub : allSubs) {
                Map<String, Object> json = toSubscriptionJson(sub);
                UserAccount subscriber = gymService.getUserById(sub.getUserId());
                if (subscriber != null) {
                    json.put("userName", subscriber.getDisplayName());
                    json.put("userUsername", subscriber.getUsername());
                }
                Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(sub.getPlanId());
                if (planOpt.isPresent()) {
                    json.put("planTitle", planOpt.get().getTitle());
                    json.put("planPriceMmk", planOpt.get().getPriceMmk());
                }
                result.add(json);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/trainer/subscriptions/{id}/refund")
    public ResponseEntity<?> trainerRefundSubscription(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            Optional<MarketplacePlanSubscription> subOpt = marketplaceSubscriptionService.getSubscription(id);
            if (subOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription not found"));
            }

            MarketplacePlanSubscription sub = subOpt.get();
            Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(sub.getPlanId());
            if (planOpt.isEmpty() || !planOpt.get().getTrainerId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You can only manage refunds for your own plans"));
            }

            if (sub.getStatus() == MarketplacePlanSubscription.Status.CANCELLED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subscription already cancelled"));
            }

            String action = body != null ? body.getOrDefault("action", "approve") : "approve";
            String adminNotes = body != null ? body.getOrDefault("adminNotes", "") : "";
            String rejectReason = body != null ? body.getOrDefault("rejectReason", "") : "";

            sub.setRefundProcessedAt(LocalDateTime.now());
            sub.setRefundAdminNotes(adminNotes);

            if ("reject".equalsIgnoreCase(action)) {
                sub.setRefundStatus(MarketplacePlanSubscription.RefundStatus.REJECTED);
                sub.setRefundRejectionReason(rejectReason);
                marketplaceSubscriptionService.updateSubscription(sub);

                loggingService.info("MARKETPLACE", "TRAINER_REFUND_REJECTED", user,
                        "Rejected refund for subscription #" + id + " (reason: " + rejectReason + ")", null);
            } else {
                sub.setStatus(MarketplacePlanSubscription.Status.CANCELLED);
                sub.setCancellationDate(LocalDateTime.now());
                sub.setCancellationReason("Trainer refund approved");
                sub.setRefundStatus(MarketplacePlanSubscription.RefundStatus.APPROVED);
                marketplaceSubscriptionService.updateSubscription(sub);

                UserAccount subscriber = gymService.getUserById(sub.getUserId());
                if (subscriber != null) {
                    long refundCoins = sub.getPricePaidMmk() != null ? sub.getPricePaidMmk().longValue() : 0;
                    subscriber.setCoinBalance((subscriber.getCoinBalance() != null ? subscriber.getCoinBalance() : 0) + refundCoins);
                    gymService.saveUserAccount(subscriber);
                }

                marketplaceService.updateActiveSubscriberCount(sub.getPlanId());

                loggingService.info("MARKETPLACE", "TRAINER_REFUND_APPROVED", user,
                        "Approved refund for subscription #" + id + " for user #" + sub.getUserId(), null);
            }

            return ResponseEntity.ok(toSubscriptionJson(sub));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trainer/subscriptions")
    public ResponseEntity<?> trainerListSubscriptions() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer or Admin role required"));
            }

            List<MarketplacePlan> trainerPlans = marketplaceService.getTrainerPlans(user.getId());
            Set<Long> planIds = trainerPlans.stream().map(MarketplacePlan::getId).collect(Collectors.toSet());

            List<MarketplacePlanSubscription> allSubs = marketplaceSubscriptionService.getAllSubscriptions();
            List<Map<String, Object>> result = new ArrayList<>();
            for (MarketplacePlanSubscription sub : allSubs) {
                if (!planIds.contains(sub.getPlanId())) continue;
                Map<String, Object> json = toSubscriptionJson(sub);
                UserAccount subscriber = gymService.getUserById(sub.getUserId());
                if (subscriber != null) {
                    json.put("userName", subscriber.getDisplayName());
                    json.put("userUsername", subscriber.getUsername());
                }
                Optional<MarketplacePlan> planOpt = marketplaceService.getPlanById(sub.getPlanId());
                if (planOpt.isPresent()) {
                    json.put("planTitle", planOpt.get().getTitle());
                    json.put("planPriceMmk", planOpt.get().getPriceMmk());
                }
                result.add(json);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== HELPERS ====================

    private Map<String, Object> toPlanSummaryJson(MarketplacePlan plan) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("id", plan.getId());
        json.put("trainerId", plan.getTrainerId());
        json.put("title", plan.getTitle());
        json.put("description", plan.getDescription());
        json.put("category", plan.getCategory() != null ? plan.getCategory().name() : null);
        json.put("difficultyLevel", plan.getDifficultyLevel() != null ? plan.getDifficultyLevel().name() : null);
        json.put("durationWeeks", plan.getDurationWeeks());
        json.put("targetAudience", plan.getTargetAudience());
        json.put("priceMmk", plan.getPriceMmk());
        json.put("planType", plan.getPlanType() != null ? plan.getPlanType().name() : null);
        json.put("rating", plan.getRating());
        json.put("totalPurchases", plan.getTotalPurchases());
        json.put("activeSubscribers", plan.getActiveSubscribers());
        json.put("status", plan.getStatus().name());
        json.put("thumbnailUrl", plan.getThumbnailUrl() != null
            ? "/api/marketplace/plans/" + plan.getId() + "/cover" : null);
        json.put("previewVideoUrl", null);
        json.put("createdAt", plan.getCreatedAt());
        json.put("updatedAt", plan.getUpdatedAt());
        json.put("publishedAt", plan.getPublishedAt());
        return json;
    }

    private Map<String, Object> toPlanDetailJson(MarketplacePlan plan) {
        Map<String, Object> json = toPlanSummaryJson(plan);
        json.put("exercisesJson", plan.getExercisesJson());
        json.put("contentStructure", plan.getContentStructure());
        json.put("includeMacroPlanning", plan.getIncludeMacroPlanning());
        json.put("includeSupplementGuide", plan.getIncludeSupplementGuide());
        return json;
    }

    @PostMapping(value = "/plans/{id}/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPlanMedia(
            @PathVariable Long id,
            @RequestParam("type") String type,
            @RequestParam("file") MultipartFile file) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.TRAINER && user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Trainer or Admin role required"));
            }
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "A media file is required"));
            }
            if (!"cover".equals(type) && !"video".equals(type)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Media type must be cover or video"));
            }
            long maxBytes = "video".equals(type) ? configuredVideoLimitBytes() : 8L * 1024 * 1024;
            if (file.getSize() > maxBytes) {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Video exceeds the configured limit of " + (maxBytes / (1024 * 1024)) + " MB"));
            }

            MarketplacePlan plan = marketplaceService.getPlanById(id)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));
            if (!plan.getTrainerId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not own this plan"));
            }

            String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
            boolean validType = "cover".equals(type)
                    ? Set.of("image/jpeg", "image/png", "image/webp").contains(contentType)
                    : Set.of("video/mp4", "video/webm", "video/quicktime").contains(contentType);
            if (!validType) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported media format"));
            }

            String extension = mediaExtension(contentType);
            String storedName = "plan-" + id + "-" + UUID.randomUUID() + extension;
            Path directory = Paths.get("uploads/marketplace").toAbsolutePath().normalize();
            Files.createDirectories(directory);
            Path target = directory.resolve(storedName).normalize();
            if (!target.getParent().equals(directory)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid file name"));
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/marketplace/" + storedName;
            if ("cover".equals(type)) plan.setThumbnailUrl(url);
            else plan.setPreviewVideoUrl("/api/marketplace/plans/" + id + "/preview-video");
            MarketplacePlan saved = planRepository.save(plan);
            loggingService.info("MARKETPLACE", "UPLOAD_PLAN_MEDIA", user,
                    "Uploaded " + type + " media for plan #" + id, null);
            return ResponseEntity.ok(toPlanDetailJson(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plans/{id}/preview-video")
    public ResponseEntity<?> getPreviewVideo(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            MarketplacePlan plan = marketplaceService.getPlanById(id)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));
            boolean ownerOrAdmin = user.getRole() == UserAccount.Role.ADMIN || plan.getTrainerId().equals(user.getId());
            boolean subscriber = marketplaceSubscriptionService.isDuplicateActiveSubscription(user.getId(), id);
            if (!ownerOrAdmin && !subscriber) {
                return ResponseEntity.status(403).body(Map.of("error", "Purchase this plan to watch the preview video"));
            }
            String videoUrl = plan.getPreviewVideoUrl();
            if (videoUrl == null || !videoUrl.startsWith("/uploads/marketplace/")) {
                return ResponseEntity.notFound().build();
            }

            String filename = videoUrl.substring("/uploads/marketplace/".length());
            Path directory = Paths.get("uploads/marketplace").toAbsolutePath().normalize();
            Path videoPath = directory.resolve(filename).normalize();
            if (!videoPath.getParent().equals(directory) || !Files.isRegularFile(videoPath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(videoPath.toUri());
            MediaType mediaType = MediaTypeFactory.getMediaType(videoPath.getFileName().toString())
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header("Content-Disposition", "inline; filename=\"" + videoPath.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plans/{id}/cover")
    public ResponseEntity<?> getPlanCover(@PathVariable Long id) {
        try {
            UserAccount user = currentUser();
            MarketplacePlan plan = marketplaceService.getPlanById(id)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));
            boolean publicPlan = plan.getStatus() == MarketplacePlan.Status.PUBLISHED;
            boolean ownerOrAdmin = user != null && (user.getRole() == UserAccount.Role.ADMIN
                    || plan.getTrainerId().equals(user.getId()));
            if (!publicPlan && !ownerOrAdmin) return ResponseEntity.status(404).build();

            String coverUrl = plan.getThumbnailUrl();
            if (coverUrl == null || !coverUrl.startsWith("/uploads/marketplace/")) {
                return ResponseEntity.notFound().build();
            }
            String filename = coverUrl.substring("/uploads/marketplace/".length());
            Path directory = Paths.get("uploads/marketplace").toAbsolutePath().normalize();
            Path coverPath = directory.resolve(filename).normalize();
            if (!coverPath.getParent().equals(directory) || !Files.isRegularFile(coverPath)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(coverPath.toUri());
            MediaType mediaType = MediaTypeFactory.getMediaType(coverPath.getFileName().toString())
                    .orElse(MediaType.IMAGE_JPEG);
            return ResponseEntity.ok().contentType(mediaType).body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Map<String, Object> toSubscriptionJson(MarketplacePlanSubscription sub) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("id", sub.getId());
        json.put("userId", sub.getUserId());
        json.put("planId", sub.getPlanId());
        json.put("subscriptionType", sub.getSubscriptionType().name());
        json.put("pricePaidMmk", sub.getPricePaidMmk());
        json.put("status", sub.getStatus().name());
        json.put("autoRenew", sub.getAutoRenew());
        json.put("paymentMethod", sub.getPaymentMethod() != null ? sub.getPaymentMethod().name() : null);
        json.put("startDate", sub.getSubscriptionStartDate());
        json.put("endDate", sub.getSubscriptionEndDate());
        json.put("purchaseDate", sub.getPurchaseDate());
        json.put("cancellationDate", sub.getCancellationDate());
        json.put("cancellationReason", sub.getCancellationReason());
        json.put("refundStatus", sub.getRefundStatus() != null ? sub.getRefundStatus().name() : null);
        json.put("refundPaymentMethod", sub.getRefundPaymentMethod());
        json.put("refundTransferId", sub.getRefundTransferId());
        json.put("refundScreenshotUrl", sub.getRefundScreenshotUrl());
        json.put("refundRejectionReason", sub.getRefundRejectionReason());
        json.put("refundAdminNotes", sub.getRefundAdminNotes());
        json.put("refundProcessedAt", sub.getRefundProcessedAt());
        json.put("createdAt", sub.getCreatedAt());
        return json;
    }

    private Map<String, Object> toReviewJson(PlanReview review) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("id", review.getId());
        json.put("planId", review.getPlanId());
        json.put("userId", review.getUserId());
        json.put("rating", review.getRating());
        json.put("reviewText", review.getReviewText());
        json.put("verifiedPurchase", review.getVerifiedPurchase());
        json.put("helpfulCount", review.getHelpfulCount());
        json.put("trainerResponse", review.getTrainerResponse());
        json.put("createdAt", review.getCreatedAt());
        return json;
    }

    // ==================== PAYMENT SETTINGS ====================

    @GetMapping("/payment-settings")
    public ResponseEntity<?> getPaymentSettings() {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            Map<String, String> allSettings = gymService.getSiteSettings();
            Map<String, Object> settings = new LinkedHashMap<>();
            String[] keys = {
                "payment_kpay_name", "payment_kpay_number",
                "payment_wave_name", "payment_wave_number",
                "payment_bank_name", "payment_bank_account", "payment_bank_holder",
                "payment_methods_enabled"
            };
            for (String key : keys) {
                settings.put(key, allSettings.getOrDefault(key, ""));
            }
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/payment-settings")
    public ResponseEntity<?> updatePaymentSettings(@RequestBody Map<String, String> body) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (user.getRole() != UserAccount.Role.ADMIN) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin role required"));
            }

            gymService.saveSiteSettings(body);

            loggingService.info("MARKETPLACE", "ADMIN_PAYMENT_SETTINGS", user,
                    "Updated payment settings", null);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return gymService.getUserByUsername(auth.getName());
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        if (ext.equals(".jpeg")) ext = ".jpg";
        return ext;
    }

    private String mediaExtension(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "video/webm" -> ".webm";
            case "video/quicktime" -> ".mov";
            default -> ".jpg";
        };
    }

    private long configuredVideoLimitBytes() {
        final long minimumMb = 1;
        final long maximumMb = 500;
        try {
            long configuredMb = Long.parseLong(gymService.getSetting("marketplace_video_max_mb"));
            long safeMb = Math.max(minimumMb, Math.min(configuredMb, maximumMb));
            return safeMb * 1024 * 1024;
        } catch (NumberFormatException e) {
            return 50L * 1024 * 1024;
        }
    }
}
