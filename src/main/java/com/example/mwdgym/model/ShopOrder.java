package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shop_orders")
public class ShopOrder {

    public enum Status { PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "total_mmk", nullable = false)
    private Long totalMmk = 0L;

    @Column(name = "delivery_name", length = 100)
    private String deliveryName;

    @Column(name = "delivery_phone", length = 32)
    private String deliveryPhone;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "delivery_city", length = 100)
    private String deliveryCity;

    @Column(name = "delivery_township", length = 100)
    private String deliveryTownship;

    @Column(name = "delivery_note", length = 500)
    private String deliveryNote;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<ShopOrderItem> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Long getTotalMmk() { return totalMmk; }
    public void setTotalMmk(Long totalMmk) { this.totalMmk = totalMmk; }
    public String getDeliveryName() { return deliveryName; }
    public void setDeliveryName(String v) { this.deliveryName = v; }
    public String getDeliveryPhone() { return deliveryPhone; }
    public void setDeliveryPhone(String v) { this.deliveryPhone = v; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String v) { this.deliveryAddress = v; }
    public String getDeliveryCity() { return deliveryCity; }
    public void setDeliveryCity(String v) { this.deliveryCity = v; }
    public String getDeliveryTownship() { return deliveryTownship; }
    public void setDeliveryTownship(String v) { this.deliveryTownship = v; }
    public String getDeliveryNote() { return deliveryNote; }
    public void setDeliveryNote(String v) { this.deliveryNote = v; }
    public List<ShopOrderItem> getItems() { return items; }
    public void setItems(List<ShopOrderItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}
