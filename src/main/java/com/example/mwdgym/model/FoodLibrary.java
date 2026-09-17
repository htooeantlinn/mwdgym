package com.example.mwdgym.model;

import jakarta.persistence.*;

@Entity
@Table(name = "food_library")
public class FoodLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    private String defaultQuantity = "";

    private String defaultCalories = "";

    private String defaultProtein = "";

    private String defaultCarbs = "";

    private String defaultFat = "";

    private String defaultNote = "";

    private int sortOrder = 0;

    private boolean active = true;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_by_name")
    private String createdByName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDefaultQuantity() { return defaultQuantity; }
    public void setDefaultQuantity(String defaultQuantity) { this.defaultQuantity = defaultQuantity; }

    public String getDefaultCalories() { return defaultCalories; }
    public void setDefaultCalories(String defaultCalories) { this.defaultCalories = defaultCalories; }

    public String getDefaultProtein() { return defaultProtein; }
    public void setDefaultProtein(String defaultProtein) { this.defaultProtein = defaultProtein; }

    public String getDefaultCarbs() { return defaultCarbs; }
    public void setDefaultCarbs(String defaultCarbs) { this.defaultCarbs = defaultCarbs; }

    public String getDefaultFat() { return defaultFat; }
    public void setDefaultFat(String defaultFat) { this.defaultFat = defaultFat; }

    public String getDefaultNote() { return defaultNote; }
    public void setDefaultNote(String defaultNote) { this.defaultNote = defaultNote; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
}
