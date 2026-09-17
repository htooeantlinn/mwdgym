package com.example.mwdgym.controller;

import com.example.mwdgym.model.DietPlan;
import com.example.mwdgym.model.diet.DietPlanContent;
import com.example.mwdgym.repository.DietPlanRepository;
import com.example.mwdgym.service.DietPlanService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PrintController {

    private final DietPlanRepository dietPlanRepository;
    private final DietPlanService dietPlanService;

    public PrintController(DietPlanRepository dietPlanRepository, DietPlanService dietPlanService) {
        this.dietPlanRepository = dietPlanRepository;
        this.dietPlanService = dietPlanService;
    }

    @GetMapping("/print/diet-plans/{id}")
    public String dietPlan(@PathVariable Long id, Model model) {
        DietPlan plan = dietPlanRepository.findById(id).orElse(null);
        if (plan == null) return "redirect:/diet-plans";
        DietPlanContent content;
        try {
            content = dietPlanService.normalizeContent(dietPlanService.parseContent(plan.getContentJson()));
        } catch (Exception e) {
            content = dietPlanService.defaultContent();
        }
        model.addAttribute("plan", plan);
        model.addAttribute("content", content);
        return "print/diet-plan";
    }
}
