package com.example.mwdgym.api;

import com.example.mwdgym.model.FoodLibrary;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.FoodLibraryRepository;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/foods")
public class ApiFoodController {

    private final FoodLibraryRepository repo;
    private final GymService gymService;

    public ApiFoodController(FoodLibraryRepository repo, GymService gymService) {
        this.repo = repo;
        this.gymService = gymService;
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return gymService.getUserByUsername(auth.getName());
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) Boolean mine) {
        UserAccount current = currentUser();
        List<FoodLibrary> foods;
        if (Boolean.TRUE.equals(mine) && current != null) {
            foods = repo.findByCreatedByAndActiveTrueOrderByCategoryAscSortOrderAsc(current.getId());
        } else {
            foods = repo.findByActiveTrueOrderByCategoryAscSortOrderAsc();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (FoodLibrary f : foods) {
            result.add(toMap(f, current));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/grouped")
    public ResponseEntity<?> grouped(@RequestParam(required = false) Boolean mine) {
        UserAccount current = currentUser();
        List<FoodLibrary> foods;
        if (Boolean.TRUE.equals(mine) && current != null) {
            foods = repo.findByCreatedByAndActiveTrueOrderByCategoryAscSortOrderAsc(current.getId());
        } else {
            foods = repo.findByActiveTrueOrderByCategoryAscSortOrderAsc();
        }
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (FoodLibrary f : foods) {
            grouped.computeIfAbsent(f.getCategory(), k -> new ArrayList<>())
                .add(toMap(f, current));
        }
        return ResponseEntity.ok(grouped);
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        UserAccount current = currentUser();
        List<FoodLibrary> foods = repo.search(q);
        List<Map<String, Object>> result = new ArrayList<>();
        for (FoodLibrary f : foods) {
            result.add(toMap(f, current));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        UserAccount current = currentUser();
        FoodLibrary f = new FoodLibrary();
        f.setName((String) body.getOrDefault("name", ""));
        f.setCategory((String) body.getOrDefault("category", ""));
        f.setDefaultQuantity((String) body.getOrDefault("defaultQuantity", ""));
        f.setDefaultCalories((String) body.getOrDefault("defaultCalories", ""));
        f.setDefaultProtein((String) body.getOrDefault("defaultProtein", ""));
        f.setDefaultCarbs((String) body.getOrDefault("defaultCarbs", ""));
        f.setDefaultFat((String) body.getOrDefault("defaultFat", ""));
        f.setDefaultNote((String) body.getOrDefault("defaultNote", ""));
        f.setSortOrder(body.containsKey("sortOrder") ? ((Number) body.get("sortOrder")).intValue() : 0);
        f.setActive(true);

        boolean asSystem = current != null && current.getRole() == UserAccount.Role.ADMIN
                && Boolean.TRUE.equals(body.get("system"));
        if (!asSystem && current != null) {
            f.setCreatedBy(current.getId());
            f.setCreatedByName(current.getDisplayName() != null && !current.getDisplayName().isBlank()
                    ? current.getDisplayName() : current.getUsername());
        }

        repo.save(f);
        return ResponseEntity.ok(toMap(f, current));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        FoodLibrary f = repo.findById(id).orElse(null);
        if (f == null) return ResponseEntity.notFound().build();

        UserAccount current = currentUser();
        if (current == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        if (current.getRole() != UserAccount.Role.ADMIN) {
            if (f.getCreatedBy() == null || !f.getCreatedBy().equals(current.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only edit foods you created"));
            }
        }

        if (body.containsKey("name")) f.setName((String) body.get("name"));
        if (body.containsKey("category")) f.setCategory((String) body.get("category"));
        if (body.containsKey("defaultQuantity")) f.setDefaultQuantity((String) body.get("defaultQuantity"));
        if (body.containsKey("defaultCalories")) f.setDefaultCalories((String) body.get("defaultCalories"));
        if (body.containsKey("defaultProtein")) f.setDefaultProtein((String) body.get("defaultProtein"));
        if (body.containsKey("defaultCarbs")) f.setDefaultCarbs((String) body.get("defaultCarbs"));
        if (body.containsKey("defaultFat")) f.setDefaultFat((String) body.get("defaultFat"));
        if (body.containsKey("defaultNote")) f.setDefaultNote((String) body.get("defaultNote"));
        if (body.containsKey("sortOrder")) f.setSortOrder(((Number) body.get("sortOrder")).intValue());
        if (body.containsKey("active")) f.setActive((boolean) body.get("active"));
        if (body.containsKey("system") && current.getRole() == UserAccount.Role.ADMIN) {
            if (Boolean.TRUE.equals(body.get("system"))) {
                f.setCreatedBy(null);
                f.setCreatedByName(null);
            } else if (f.getCreatedBy() == null) {
                f.setCreatedBy(current.getId());
                f.setCreatedByName(current.getDisplayName() != null && !current.getDisplayName().isBlank()
                        ? current.getDisplayName() : current.getUsername());
            }
        }
        repo.save(f);
        return ResponseEntity.ok(toMap(f, current));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        FoodLibrary f = repo.findById(id).orElse(null);
        if (f == null) return ResponseEntity.notFound().build();

        UserAccount current = currentUser();
        if (current == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        if (current.getRole() != UserAccount.Role.ADMIN) {
            if (f.getCreatedBy() == null || !f.getCreatedBy().equals(current.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only delete foods you created"));
            }
        }

        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private Map<String, Object> toMap(FoodLibrary f, UserAccount current) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("name", f.getName());
        m.put("category", f.getCategory());
        m.put("defaultQuantity", f.getDefaultQuantity());
        m.put("defaultCalories", f.getDefaultCalories());
        m.put("defaultProtein", f.getDefaultProtein());
        m.put("defaultCarbs", f.getDefaultCarbs());
        m.put("defaultFat", f.getDefaultFat());
        m.put("defaultNote", f.getDefaultNote());
        m.put("sortOrder", f.getSortOrder());
        m.put("active", f.isActive());
        m.put("createdBy", f.getCreatedBy());
        m.put("createdByName", f.getCreatedByName());
        boolean isMine = current != null && f.getCreatedBy() != null && f.getCreatedBy().equals(current.getId());
        m.put("isMine", isMine);
        m.put("isSystem", f.getCreatedBy() == null);
        return m;
    }
}
