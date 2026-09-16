package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trainer_earnings")
public class TrainerEarnings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trainer_id", nullable = false)
    private Long trainerId;

    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "period_month", length = 7)
    private String periodMonth;

    @Column(name = "gross_revenue_mmk")
    private BigDecimal grossRevenueMMK;

    @Column(name = "subscription_count")
    private Integer subscriptionCount = 0;

    @Column(name = "new_subscribers")
    private Integer newSubscribers = 0;

    @Column(name = "churned_subscribers")
    private Integer churnedSubscribers = 0;

    @Column(name = "gym_commission_percentage")
    private BigDecimal gymCommissionPercentage = new BigDecimal("30.00");

    @Column(name = "gym_commission_amount_mmk")
    private BigDecimal gymCommissionAmountMMK;

    @Column(name = "trainer_payout_amount_mmk")
    private BigDecimal trainerPayoutAmountMMK;

    @Enumerated(EnumType.STRING)
    @Column(name = "payout_status")
    private PayoutStatus payoutStatus = PayoutStatus.PENDING;

    @Column(name = "payout_date")
    private LocalDateTime payoutDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Calculate commission amounts if gross revenue is set
        if (grossRevenueMMK != null && gymCommissionPercentage != null) {
            this.gymCommissionAmountMMK = grossRevenueMMK.multiply(gymCommissionPercentage).divide(new BigDecimal("100"));
            this.trainerPayoutAmountMMK = grossRevenueMMK.subtract(gymCommissionAmountMMK);
        }
    }

    // Enums
    public enum PayoutStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

    // Constructors
    public TrainerEarnings() {}

    public TrainerEarnings(Long trainerId, Long planId, String periodMonth) {
        this.trainerId = trainerId;
        this.planId = planId;
        this.periodMonth = periodMonth;
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

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public String getPeriodMonth() {
        return periodMonth;
    }

    public void setPeriodMonth(String periodMonth) {
        this.periodMonth = periodMonth;
    }

    public BigDecimal getGrossRevenueMMK() {
        return grossRevenueMMK;
    }

    public void setGrossRevenueMMK(BigDecimal grossRevenueMMK) {
        this.grossRevenueMMK = grossRevenueMMK;
        // Recalculate commission when revenue is updated
        if (grossRevenueMMK != null && gymCommissionPercentage != null) {
            this.gymCommissionAmountMMK = grossRevenueMMK.multiply(gymCommissionPercentage).divide(new BigDecimal("100"));
            this.trainerPayoutAmountMMK = grossRevenueMMK.subtract(gymCommissionAmountMMK);
        }
    }

    public Integer getSubscriptionCount() {
        return subscriptionCount;
    }

    public void setSubscriptionCount(Integer subscriptionCount) {
        this.subscriptionCount = subscriptionCount;
    }

    public Integer getNewSubscribers() {
        return newSubscribers;
    }

    public void setNewSubscribers(Integer newSubscribers) {
        this.newSubscribers = newSubscribers;
    }

    public Integer getChurnedSubscribers() {
        return churnedSubscribers;
    }

    public void setChurnedSubscribers(Integer churnedSubscribers) {
        this.churnedSubscribers = churnedSubscribers;
    }

    public BigDecimal getGymCommissionPercentage() {
        return gymCommissionPercentage;
    }

    public void setGymCommissionPercentage(BigDecimal gymCommissionPercentage) {
        this.gymCommissionPercentage = gymCommissionPercentage;
        // Recalculate commission when percentage is updated
        if (grossRevenueMMK != null && gymCommissionPercentage != null) {
            this.gymCommissionAmountMMK = grossRevenueMMK.multiply(gymCommissionPercentage).divide(new BigDecimal("100"));
            this.trainerPayoutAmountMMK = grossRevenueMMK.subtract(gymCommissionAmountMMK);
        }
    }

    public BigDecimal getGymCommissionAmountMMK() {
        return gymCommissionAmountMMK;
    }

    public void setGymCommissionAmountMMK(BigDecimal gymCommissionAmountMMK) {
        this.gymCommissionAmountMMK = gymCommissionAmountMMK;
    }

    public BigDecimal getTrainerPayoutAmountMMK() {
        return trainerPayoutAmountMMK;
    }

    public void setTrainerPayoutAmountMMK(BigDecimal trainerPayoutAmountMMK) {
        this.trainerPayoutAmountMMK = trainerPayoutAmountMMK;
    }

    public PayoutStatus getPayoutStatus() {
        return payoutStatus;
    }

    public void setPayoutStatus(PayoutStatus payoutStatus) {
        this.payoutStatus = payoutStatus;
    }

    public LocalDateTime getPayoutDate() {
        return payoutDate;
    }

    public void setPayoutDate(LocalDateTime payoutDate) {
        this.payoutDate = payoutDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
