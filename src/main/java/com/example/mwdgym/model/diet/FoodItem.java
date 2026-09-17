package com.example.mwdgym.model.diet;

import java.util.ArrayList;
import java.util.List;

public class FoodItem {
    private String food = "";
    private String quantity = "";
    private String calories = "";
    private String protein = "";
    private String carbs = "";
    private String fat = "";
    private String notes = "";
    private String kind = "single";
    private String options = "";
    private List<FoodItem> optionItems = new ArrayList<>();

    public String getFood() { return food; }

    public void setFood(String food) { this.food = food; }

    public String getQuantity() { return quantity; }

    public void setQuantity(String quantity) { this.quantity = quantity; }

    public String getCalories() { return calories; }

    public void setCalories(String calories) { this.calories = calories; }

    public String getProtein() { return protein; }

    public void setProtein(String protein) { this.protein = protein; }

    public String getCarbs() { return carbs; }

    public void setCarbs(String carbs) { this.carbs = carbs; }

    public String getFat() { return fat; }

    public void setFat(String fat) { this.fat = fat; }

    public String getNotes() { return notes; }

    public void setNotes(String notes) { this.notes = notes; }

    public String getKind() { return kind; }

    public void setKind(String kind) { this.kind = kind; }

    public String getOptions() { return options; }

    public void setOptions(String options) { this.options = options; }

    public List<FoodItem> getOptionItems() { return optionItems; }

    public void setOptionItems(List<FoodItem> optionItems) { this.optionItems = optionItems; }
}