package com.example.mwdgym.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "plans")
public class Plan {

    public enum PlanCategory {
        BASIC, PREMIUM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_name", nullable = false, unique = true)
    private String planName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanCategory category = PlanCategory.BASIC;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(precision = 18, scale = 0)
    private BigDecimal price;

    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "show_on_home", nullable = false)
    private boolean showOnHome = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public PlanCategory getCategory() {
        return category;
    }

    public void setCategory(PlanCategory category) {
        this.category = category;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDurationLabel() {
        switch (durationDays) {
            case 1: return "1 Day";
            case 7: return "1 Week";
            case 30: return "1 Month";
            case 60: return "2 Months";
            case 90: return "3 Months";
            case 120: return "4 Months";
            case 180: return "6 Months";
            case 365: return "1 Year";
            default: return durationDays + " Days";
        }
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isShowOnHome() {
        return showOnHome;
    }

    public void setShowOnHome(boolean showOnHome) {
        this.showOnHome = showOnHome;
    }
}