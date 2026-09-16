package com.example.mwdgym.service;

import com.example.mwdgym.model.DietPlan;
import com.example.mwdgym.model.diet.DietPlanContent;
import com.example.mwdgym.model.diet.FoodItem;
import com.example.mwdgym.model.diet.MealBlock;
import com.example.mwdgym.repository.DietPlanRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DietPlanService {

    @Autowired
    private DietPlanRepository repository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<DietPlan> getAllPlans() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    public DietPlan getById(Long id) {
        Optional<DietPlan> plan = repository.findById(id);
        if (plan.isEmpty()) {
            throw new IllegalArgumentException("Diet plan not found with id: " + id);
        }
        return plan.get();
    }

    public DietPlan save(Long id, String name, String notes, String contentJson) {
        DietPlan plan = new DietPlan();
        if (id != null) {
            Optional<DietPlan> existing = repository.findById(id);
            if (existing.isPresent()) {
                plan = existing.get();
            }
        }
        plan.setName(name);
        plan.setNotes(notes);
        plan.setContentJson(contentJson);
        plan.setActive(true);
        plan.setTheme("default");
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());
        return repository.save(plan);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public DietPlan toggleActive(Long id) {
        DietPlan plan = getById(id);
        plan.setActive(!plan.isActive());
        plan.setUpdatedAt(LocalDateTime.now());
        return repository.save(plan);
    }

    public String toJson(DietPlanContent content) {
        try {
            return objectMapper.writeValueAsString(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize DietPlanContent to JSON", e);
        }
    }

    public DietPlanContent parseContent(String json) {
        if (json == null || json.isEmpty()) {
            return defaultContent();
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            return deserializeJsonNode(node);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse DietPlanContent from JSON", e);
        }
    }

    private DietPlanContent deserializeJsonNode(JsonNode node) {
        DietPlanContent content = new DietPlanContent();
        if (node.has("meals") && node.get("meals").isArray()) {
            ArrayNode mealsArray = (ArrayNode) node.get("meals");
            for (JsonNode mealNode : mealsArray) {
                MealBlock meal = new MealBlock();
                if (mealNode.has("name") && !mealNode.get("name").isNull()) {
                    meal.setName(mealNode.get("name").asText());
                }
                if (mealNode.has("items") && mealNode.get("items").isArray()) {
                    ArrayNode itemsArray = (ArrayNode) mealNode.get("items");
                    for (JsonNode itemNode : itemsArray) {
                        FoodItem item = new FoodItem();
                        if (itemNode.has("food") && !itemNode.get("food").isNull()) {
                            item.setFood(itemNode.get("food").asText());
                        }
                        if (itemNode.has("quantity") && !itemNode.get("quantity").isNull()) {
                            item.setQuantity(itemNode.get("quantity").asText());
                        }
                        if (itemNode.has("calories") && !itemNode.get("calories").isNull()) {
                            item.setCalories(itemNode.get("calories").asText());
                        }
                        if (itemNode.has("protein") && !itemNode.get("protein").isNull()) {
                            item.setProtein(itemNode.get("protein").asText());
                        }
                        if (itemNode.has("carbs") && !itemNode.get("carbs").isNull()) {
                            item.setCarbs(itemNode.get("carbs").asText());
                        }
                        if (itemNode.has("fat") && !itemNode.get("fat").isNull()) {
                            item.setFat(itemNode.get("fat").asText());
                        }
                        if (itemNode.has("notes") && !itemNode.get("notes").isNull()) {
                            item.setNotes(itemNode.get("notes").asText());
                        }
                        meal.getItems().add(item);
                    }
                }
                if (meal.getItems() == null) {
                    meal.setItems(new ArrayList<>());
                }
                content.getMeals().add(meal);
            }
        }
        if (content.getMeals() == null) {
            content.setMeals(new ArrayList<>());
        }
        return content;
    }

    public DietPlanContent defaultContent() {
        DietPlanContent content = new DietPlanContent();
        MealBlock breakfast = new MealBlock();
        breakfast.setName("Breakfast");
        FoodItem fi1 = new FoodItem();
        fi1.setFood("Oatmeal");
        fi1.setQuantity("1 cup");
        fi1.setCalories("150");
        fi1.setProtein("5g");
        fi1.setCarbs("27g");
        fi1.setFat("3g");
        breakfast.getItems().add(fi1);

        FoodItem fi2 = new FoodItem();
        fi2.setFood("Boiled Eggs");
        fi2.setQuantity("2 pcs");
        fi2.setCalories("140");
        fi2.setProtein("12g");
        fi2.setCarbs("1g");
        fi2.setFat("10g");
        breakfast.getItems().add(fi2);

        MealBlock lunch = new MealBlock();
        lunch.setName("Lunch");
        FoodItem fi3 = new FoodItem();
        fi3.setFood("Grilled Chicken");
        fi3.setQuantity("150g");
        fi3.setCalories("250");
        fi3.setProtein("30g");
        fi3.setCarbs("0g");
        lunch.getItems().add(fi3);

        FoodItem fi4 = new FoodItem();
        fi4.setFood("Brown Rice");
        fi4.setQuantity("1 cup");
        fi4.setCalories("215");
        fi4.setProtein("5g");
        fi4.setCarbs("45g");
        lunch.getItems().add(fi4);

        MealBlock dinner = new MealBlock();
        dinner.setName("Dinner");
        FoodItem fi5 = new FoodItem();
        fi5.setFood("Salmon");
        fi5.setQuantity("150g");
        fi5.setCalories("280");
        fi5.setProtein("25g");
        fi5.setCarbs("0g");
        dinner.getItems().add(fi5);

        FoodItem fi6 = new FoodItem();
        fi6.setFood("Steamed Vegetables");
        fi6.setQuantity("1 cup");
        fi6.setCalories("50");
        fi6.setProtein("3g");
        fi6.setCarbs("10g");
        dinner.getItems().add(fi6);

        MealBlock snack = new MealBlock();
        snack.setName("Snacks");
        FoodItem fi7 = new FoodItem();
        fi7.setFood("Apple");
        fi7.setQuantity("1 medium");
        fi7.setCalories("95");
        fi7.setProtein("0g");
        fi7.setCarbs("25g");
        fi7.setFat("0g");
        snack.getItems().add(fi7);

        FoodItem fi8 = new FoodItem();
        fi8.setFood("Greek Yogurt");
        fi8.setQuantity("150g");
        fi8.setCalories("120");
        fi8.setProtein("10g");
        fi8.setCarbs("6g");
        fi8.setFat("4g");
        snack.getItems().add(fi8);

        content.getMeals().add(breakfast);
        content.getMeals().add(lunch);
        content.getMeals().add(dinner);
        content.getMeals().add(snack);

        return content;
    }

    public DietPlanContent normalizeContent(DietPlanContent content) {
        if (content == null) {
            return defaultContent();
        }
        if (content.getMeals() == null) {
            content.setMeals(new ArrayList<>());
        }
        for (MealBlock meal : content.getMeals()) {
            if (meal.getItems() == null) {
                meal.setItems(new ArrayList<>());
            }
        }
        return content;
    }
}