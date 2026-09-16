package com.example.mwdgym.api;

import com.example.mwdgym.model.Plan;
import com.example.mwdgym.model.PlanFeature;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
public class ApiHomeController {

    private final GymService gymService;

    public ApiHomeController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> home() {
        Map<String, Object> resp = new LinkedHashMap<>();

        // Plans
        List<Plan> plans = gymService.getHomePlans();
        List<Map<String, Object>> planList = plans.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("planName", p.getPlanName());
            m.put("category", p.getCategory().name());
            m.put("durationDays", p.getDurationDays());
            m.put("durationLabel", p.getDurationLabel());
            m.put("price", p.getPrice());
            m.put("description", p.getDescription());
            List<PlanFeature> features = gymService.getPlanFeatures(p.getId());
            m.put("features", features.stream().map(f -> f.getFeatureText()).toList());
            return m;
        }).toList();
        resp.put("plans", planList);

        // Trainers
        List<UserAccount> trainers = gymService.getHomeTrainers();
        resp.put("trainers", trainers.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("displayName", t.getDisplayName());
            m.put("profileImage", t.getProfileImage());
            m.put("role", t.getRole().name());
            return m;
        }).toList());

        // Settings
        resp.put("settings", gymService.getSiteSettings());

        // Stats
        resp.put("memberCount", gymService.getAllMembers().size());
        resp.put("activeCount", gymService.getAllMembers().stream()
                .filter(m -> "Active".equalsIgnoreCase(m.getStatus())).count());
        resp.put("revenueMmk", gymService.overviewStats().get("revenueMmk"));

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/settings")
    public ResponseEntity<?> publicSettings() {
        Map<String, String> settings = gymService.getSiteSettings();
        Map<String, String> announcement = new LinkedHashMap<>();
        announcement.put("announcement_enabled", settings.getOrDefault("announcement_enabled", "true"));
        announcement.put("announcement", settings.getOrDefault("announcement", ""));
        announcement.put("announcement_cta", settings.getOrDefault("announcement_cta", "Claim Now ->"));
        announcement.put("announcement_url", settings.getOrDefault("announcement_url", "/signup"));
        announcement.put("gym_name", settings.getOrDefault("gym_name", "MWD GYM"));
        announcement.put("gym_address", settings.getOrDefault("gym_address", "Myawaddy, Myanmar"));
        announcement.put("address", settings.getOrDefault("address", "Myawaddy, Myanmar"));
        announcement.put("gym_phone", settings.getOrDefault("gym_phone", ""));
        announcement.put("phone", settings.getOrDefault("phone", ""));
        announcement.put("gym_hours", settings.getOrDefault("gym_hours", ""));
        return ResponseEntity.ok(announcement);
    }
}
