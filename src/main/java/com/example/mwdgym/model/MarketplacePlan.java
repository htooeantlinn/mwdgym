package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_plans")
public class MarketplacePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trainer_id", nullable = false)
    private Long trainerId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private DifficultyLevel difficultyLevel;

    @Column(name = "duration_weeks")
    private Integer durationWeeks;

    @Column(name = "target_audience", length = 255)
    private String targetAudience;

    @Column(name = "price_mmk")
    private BigDecimal priceMmk;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type")
    private PlanType planType;

    @Column(name = "exercises_json", columnDefinition = "JSON")
    private String exercisesJson;

    @Column(name = "content_structure", columnDefinition = "JSON")
    private String contentStructure;

    @Column(name = "include_macro_planning")
    private Boolean includeMacroPlanning = false;

    @Column(name = "include_supplement_guide")
    private Boolean includeSupplementGuide = false;

    @Column(name = "rating")
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "total_purchases")
    private Integer totalPurchases = 0;

    @Column(name = "active_subscribers")
    private Integer activeSubscribers = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.DRAFT;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "preview_video_url", length = 500)
    private String previewVideoUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Enums
    public enum Category {
        STRENGTH, CARDIO, FLEXIBILITY, NUTRITION, SPORT, MIXED
    }

    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum PlanType {
        WEEKLY, PROGRESSIVE, PERIODIZED
    }

    public enum Status {
        DRAFT, PUBLISHED, ARCHIVED
    }

    // Constructors
    public MarketplacePlan() {}

    public MarketplacePlan(Long trainerId, String title, String description, Category category) {
        this.trainerId = trainerId;
        this.title = title;
        this.description = description;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public BigDecimal getPriceMmk() {
        return priceMmk;
    }

    public void setPriceMmk(BigDecimal priceMmk) {
        this.priceMmk = priceMmk;
    }

    public PlanType getPlanType() {
        return planType;
    }

    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }

    public String getExercisesJson() {
        return exercisesJson;
    }

    public void setExercisesJson(String exercisesJson) {
        this.exercisesJson = exercisesJson;
    }

    public String getContentStructure() {
        return contentStructure;
    }

    public void setContentStructure(String contentStructure) {
        this.contentStructure = contentStructure;
    }

    public Boolean getIncludeMacroPlanning() {
        return includeMacroPlanning;
    }

    public void setIncludeMacroPlanning(Boolean includeMacroPlanning) {
        this.includeMacroPlanning = includeMacroPlanning != null ? includeMacroPlanning : false;
    }

    public Boolean getIncludeSupplementGuide() {
        return includeSupplementGuide;
    }

    public void setIncludeSupplementGuide(Boolean includeSupplementGuide) {
        this.includeSupplementGuide = includeSupplementGuide != null ? includeSupplementGuide : false;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(Integer totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public Integer getActiveSubscribers() {
        return activeSubscribers;
    }

    public void setActiveSubscribers(Integer activeSubscribers) {
        this.activeSubscribers = activeSubscribers;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getPreviewVideoUrl() {
        return previewVideoUrl;
    }

    public void setPreviewVideoUrl(String previewVideoUrl) {
        this.previewVideoUrl = previewVideoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }
}
