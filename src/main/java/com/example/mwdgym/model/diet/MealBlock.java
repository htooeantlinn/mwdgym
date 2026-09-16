package com.example.mwdgym.model.diet;

import java.util.ArrayList;
import java.util.List;

public class MealBlock {
    private String name;
    private List<FoodItem> items = new ArrayList<>();

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public List<FoodItem> getItems() { return items; }

    public void setItems(List<FoodItem> items) { this.items = items; }
}