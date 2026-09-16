package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "marketplace_plan_id", nullable = false)
    private Long marketplacePlanId;

    @Column(name = "subscription_id", nullable = false)
    private Long subscriptionId;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Column(name = "current_week")
    private Integer currentWeek;

    @Column(name = "body_metrics", columnDefinition = "JSON")
    private String bodyMetrics;

    @Column(name = "workout_completion_rate")
    private Double workoutCompletionRate;

    @Column(name = "exercises_completed")
    private Integer exercisesCompleted;

    @Column(name = "exercises_total")
    private Integer exercisesTotal;

    @Column(name = "nutrition_compliance", columnDefinition = "JSON")
    private String nutritionCompliance;

    @Column(name = "performance_data", columnDefinition = "JSON")
    private String performanceData;

    @Column(name = "mood_energy_level")
    private Integer moodEnergyLevel;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "recorded_date", nullable = false)
    private LocalDateTime recordedDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (recordedDate == null) {
            recordedDate = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public UserProgress() {}

    public UserProgress(Long userId, Long marketplacePlanId, Long subscriptionId) {
        this.userId = userId;
        this.marketplacePlanId = marketplacePlanId;
        this.subscriptionId = subscriptionId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getMarketplacePlanId() {
        return marketplacePlanId;
    }

    public void setMarketplacePlanId(Long marketplacePlanId) {
        this.marketplacePlanId = marketplacePlanId;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public Integer getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(Integer weekNumber) {
        this.weekNumber = weekNumber;
    }

    public Integer getCurrentWeek() {
        return currentWeek;
    }

    public void setCurrentWeek(Integer currentWeek) {
        this.currentWeek = currentWeek;
    }

    public String getBodyMetrics() {
        return bodyMetrics;
    }

    public void setBodyMetrics(String bodyMetrics) {
        this.bodyMetrics = bodyMetrics;
    }

    public Double getWorkoutCompletionRate() {
        return workoutCompletionRate;
    }

    public void setWorkoutCompletionRate(Double workoutCompletionRate) {
        this.workoutCompletionRate = workoutCompletionRate;
    }

    public Integer getExercisesCompleted() {
        return exercisesCompleted;
    }

    public void setExercisesCompleted(Integer exercisesCompleted) {
        this.exercisesCompleted = exercisesCompleted;
    }

    public Integer getExercisesTotal() {
        return exercisesTotal;
    }

    public void setExercisesTotal(Integer exercisesTotal) {
        this.exercisesTotal = exercisesTotal;
    }

    public String getNutritionCompliance() {
        return nutritionCompliance;
    }

    public void setNutritionCompliance(String nutritionCompliance) {
        this.nutritionCompliance = nutritionCompliance;
    }

    public String getPerformanceData() {
        return performanceData;
    }

    public void setPerformanceData(String performanceData) {
        this.performanceData = performanceData;
    }

    public Integer getMoodEnergyLevel() {
        return moodEnergyLevel;
    }

    public void setMoodEnergyLevel(Integer moodEnergyLevel) {
        this.moodEnergyLevel = moodEnergyLevel;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getRecordedDate() {
        return recordedDate;
    }

    public void setRecordedDate(LocalDateTime recordedDate) {
        this.recordedDate = recordedDate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
