package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_plan_subscriptions")
public class MarketplacePlanSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "subscription_start_date", nullable = false)
    private LocalDateTime subscriptionStartDate;

    @Column(name = "subscription_end_date", nullable = false)
    private LocalDateTime subscriptionEndDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType = SubscriptionType.MONTHLY;

    @Column(name = "price_paid_mmk")
    private BigDecimal pricePaidMmk;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "auto_renew")
    private Boolean autoRenew = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;

    @Column(name = "cancellation_date")
    private LocalDateTime cancellationDate;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status")
    private RefundStatus refundStatus = RefundStatus.NONE;

    @Column(name = "refund_payment_method", length = 32)
    private String refundPaymentMethod;

    @Column(name = "refund_transfer_id", length = 128)
    private String refundTransferId;

    @Column(name = "refund_screenshot_url", length = 500)
    private String refundScreenshotUrl;

    @Column(name = "refund_rejection_reason", length = 500)
    private String refundRejectionReason;

    @Column(name = "refund_admin_notes", length = 500)
    private String refundAdminNotes;

    @Column(name = "refund_processed_at")
    private LocalDateTime refundProcessedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (purchaseDate == null) {
            purchaseDate = LocalDateTime.now();
        }
    }

    // Enums
    public enum SubscriptionType {
        MONTHLY, YEARLY, ONE_TIME_ACCESS
    }

    public enum Status {
        ACTIVE, EXPIRED, CANCELLED, PAUSED
    }

    public enum PaymentMethod {
        CARD, WALLET, BANK_TRANSFER, CASH
    }

    public enum RefundStatus {
        NONE, REQUESTED, APPROVED, REJECTED
    }

    // Constructors
    public MarketplacePlanSubscription() {}

    public MarketplacePlanSubscription(Long userId, Long planId, LocalDateTime startDate, LocalDateTime endDate) {
        this.userId = userId;
        this.planId = planId;
        this.subscriptionStartDate = startDate;
        this.subscriptionEndDate = endDate;
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

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public LocalDateTime getSubscriptionStartDate() {
        return subscriptionStartDate;
    }

    public void setSubscriptionStartDate(LocalDateTime subscriptionStartDate) {
        this.subscriptionStartDate = subscriptionStartDate;
    }

    public LocalDateTime getSubscriptionEndDate() {
        return subscriptionEndDate;
    }

    public void setSubscriptionEndDate(LocalDateTime subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }

    public SubscriptionType getSubscriptionType() {
        return subscriptionType;
    }

    public void setSubscriptionType(SubscriptionType subscriptionType) {
        this.subscriptionType = subscriptionType;
    }

    public BigDecimal getPricePaidMmk() {
        return pricePaidMmk;
    }

    public void setPricePaidMmk(BigDecimal pricePaidMmk) {
        this.pricePaidMmk = pricePaidMmk;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew != null ? autoRenew : true;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDateTime getCancellationDate() {
        return cancellationDate;
    }

    public void setCancellationDate(LocalDateTime cancellationDate) {
        this.cancellationDate = cancellationDate;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public RefundStatus getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(RefundStatus refundStatus) {
        this.refundStatus = refundStatus;
    }

    public String getRefundPaymentMethod() {
        return refundPaymentMethod;
    }

    public void setRefundPaymentMethod(String refundPaymentMethod) {
        this.refundPaymentMethod = refundPaymentMethod;
    }

    public String getRefundTransferId() {
        return refundTransferId;
    }

    public void setRefundTransferId(String refundTransferId) {
        this.refundTransferId = refundTransferId;
    }

    public String getRefundScreenshotUrl() {
        return refundScreenshotUrl;
    }

    public void setRefundScreenshotUrl(String refundScreenshotUrl) {
        this.refundScreenshotUrl = refundScreenshotUrl;
    }

    public String getRefundRejectionReason() {
        return refundRejectionReason;
    }

    public void setRefundRejectionReason(String refundRejectionReason) {
        this.refundRejectionReason = refundRejectionReason;
    }

    public String getRefundAdminNotes() {
        return refundAdminNotes;
    }

    public void setRefundAdminNotes(String refundAdminNotes) {
        this.refundAdminNotes = refundAdminNotes;
    }

    public LocalDateTime getRefundProcessedAt() {
        return refundProcessedAt;
    }

    public void setRefundProcessedAt(LocalDateTime refundProcessedAt) {
        this.refundProcessedAt = refundProcessedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
