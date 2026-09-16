package com.example.mwdgym.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private Long priceMmk;

    @Column(length = 32)
    private String category = "Equipment";

    @Column(length = 16)
    private String unit = "pcs";

    @Column(length = 500)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "images_json", length = 2000)
    private String imagesJson;

    @Column(name = "active_for_shop")
    private Boolean activeForShop = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Long getPriceMmk() {
        return priceMmk;
    }

    public void setPriceMmk(Long priceMmk) {
        this.priceMmk = priceMmk;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getImagesJson() { return imagesJson; }
    public void setImagesJson(String imagesJson) { this.imagesJson = imagesJson; }
    public java.util.List<String> getImages() {
        if (imagesJson == null || imagesJson.isBlank()) return imageUrl != null ? java.util.List.of(imageUrl) : java.util.List.of();
        try {
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.List<String> list = om.readValue(imagesJson, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>(){});
            return list != null ? list : java.util.List.of();
        } catch (Exception e) { return imageUrl != null ? java.util.List.of(imageUrl) : java.util.List.of(); }
    }
    public void setImages(java.util.List<String> images) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            this.imagesJson = om.writeValueAsString(images);
            if (images != null && !images.isEmpty()) this.imageUrl = images.get(0);
        } catch (Exception e) { this.imagesJson = null; }
    }
    public Boolean getActiveForShop() { return activeForShop; }
    public void setActiveForShop(Boolean activeForShop) { this.activeForShop = activeForShop; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // aliases for frontend compat
    public String getName() { return itemName; }
    public void setName(String name) { this.itemName = name; }
    public Long getUnitCost() { return priceMmk; }
    public void setUnitCost(Long unitCost) { this.priceMmk = unitCost; }
}
