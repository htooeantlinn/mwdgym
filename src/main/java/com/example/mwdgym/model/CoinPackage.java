package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coin_packages")
public class CoinPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long coins;

    @Column(name = "bonus_coins")
    private Long bonusCoins = 0L;

    @Column(name = "price_mmk", nullable = false)
    private Long priceMmk;

    @Column(name = "is_popular")
    private Boolean popular = false;

    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "badge_text", length = 32)
    private String badgeText;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCoins() { return coins; }
    public void setCoins(Long coins) { this.coins = coins; }
    public Long getBonusCoins() { return bonusCoins; }
    public void setBonusCoins(Long bonusCoins) { this.bonusCoins = bonusCoins; }
    public Long getPriceMmk() { return priceMmk; }
    public void setPriceMmk(Long priceMmk) { this.priceMmk = priceMmk; }
    public Boolean getPopular() { return popular; }
    public void setPopular(Boolean popular) { this.popular = popular; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public String getBadgeText() { return badgeText; }
    public void setBadgeText(String badgeText) { this.badgeText = badgeText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getTotalCoins() { return (coins != null ? coins : 0) + (bonusCoins != null ? bonusCoins : 0); }
}
