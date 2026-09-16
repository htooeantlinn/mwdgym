package com.example.mwdgym.api;

import com.example.mwdgym.model.Plan;
import com.example.mwdgym.model.PlanFeature;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plans")
public class ApiPlanController {

    private final GymService gymService;

    public ApiPlanController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<Plan> plans = gymService.getAllPlans();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Plan p : plans) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("planName", p.getPlanName());
            m.put("category", p.getCategory().name());
            m.put("durationDays", p.getDurationDays());
            m.put("durationLabel", p.getDurationLabel());
            m.put("price", p.getPrice());
            m.put("description", p.getDescription());
            m.put("active", p.isActive());
            m.put("showOnHome", p.isShowOnHome());
            m.put("features", gymService.getPlanFeatures(p.getId()).stream()
                    .map(f -> Map.of("id", f.getId(), "text", f.getFeatureText()))
                    .toList());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Plan plan = gymService.getPlanById(id);
        if (plan == null) return ResponseEntity.notFound().build();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", plan.getId());
        m.put("planName", plan.getPlanName());
        m.put("category", plan.getCategory().name());
        m.put("durationDays", plan.getDurationDays());
        m.put("durationLabel", plan.getDurationLabel());
        m.put("price", plan.getPrice());
        m.put("description", plan.getDescription());
        m.put("active", plan.isActive());
        m.put("showOnHome", plan.isShowOnHome());
        m.put("features", gymService.getPlanFeatures(plan.getId()));
        return ResponseEntity.ok(m);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Plan plan = new Plan();
        applyFields(plan, body);
        plan = gymService.savePlan(plan);
        if (body.containsKey("features")) {
            @SuppressWarnings("unchecked")
            List<String> features = (List<String>) body.get("features");
            gymService.savePlanFeatures(plan.getId(), features);
        }
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Plan plan = gymService.getPlanById(id);
        if (plan == null) return ResponseEntity.notFound().build();
        applyFields(plan, body);
        plan = gymService.savePlan(plan);
        if (body.containsKey("features")) {
            @SuppressWarnings("unchecked")
            List<String> features = (List<String>) body.get("features");
            gymService.savePlanFeatures(id, features);
        }
        return ResponseEntity.ok(plan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        gymService.deletePlan(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        gymService.togglePlanActive(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/{id}/features")
    public ResponseEntity<?> features(@PathVariable Long id) {
        List<PlanFeature> features = gymService.getPlanFeatures(id);
        return ResponseEntity.ok(features);
    }

    @PostMapping("/{id}/features")
    public ResponseEntity<?> saveFeatures(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> texts = (List<String>) body.get("features");
        gymService.savePlanFeatures(id, texts);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private void applyFields(Plan plan, Map<String, Object> body) {
        if (body.containsKey("planName")) plan.setPlanName((String) body.get("planName"));
        if (body.containsKey("category")) plan.setCategory(Plan.PlanCategory.valueOf((String) body.get("category")));
        if (body.containsKey("durationDays")) plan.setDurationDays(((Number) body.get("durationDays")).intValue());
        if (body.containsKey("price") && body.get("price") != null) plan.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.containsKey("description")) plan.setDescription((String) body.get("description"));
        if (body.containsKey("active")) plan.setActive((Boolean) body.get("active"));
        if (body.containsKey("showOnHome")) plan.setShowOnHome((Boolean) body.get("showOnHome"));
    }
}
