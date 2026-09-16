package com.example.mwdgym.model.diet;

import java.util.ArrayList;
import java.util.List;

public class DietPlanContent {
    private List<MealBlock> meals = new ArrayList<>();

    public List<MealBlock> getMeals() { return meals; }

    public void setMeals(List<MealBlock> meals) { this.meals = meals; }
}