package com.example.mwdgym.model.diet;

import java.util.ArrayList;
import java.util.List;

public class MealBlock {
    private String name;
    private String startTime = "";
    private String endTime = "";
    private List<FoodItem> items = new ArrayList<>();

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getStartTime() { return startTime; }

    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }

    public void setEndTime(String endTime) { this.endTime = endTime; }

    public List<FoodItem> getItems() { return items; }

    public void setItems(List<FoodItem> items) { this.items = items; }
}