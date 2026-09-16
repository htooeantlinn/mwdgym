package com.example.mwdgym.api;

import com.example.mwdgym.model.ExerciseLibrary;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.ExerciseLibraryRepository;
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
@RequestMapping("/api/exercises")
public class ApiExerciseController {

    private final ExerciseLibraryRepository repo;
    private final GymService gymService;

    public ApiExerciseController(ExerciseLibraryRepository repo, GymService gymService) {
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
        List<ExerciseLibrary> exercises;
        if (Boolean.TRUE.equals(mine) && current != null) {
            exercises = repo.findByCreatedByAndActiveTrueOrderByMuscleGroupAscSortOrderAsc(current.getId());
        } else {
            exercises = repo.findByActiveTrueOrderByMuscleGroupAscSortOrderAsc();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (ExerciseLibrary ex : exercises) {
            result.add(toMap(ex, current));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/grouped")
    public ResponseEntity<?> grouped(@RequestParam(required = false) Boolean mine) {
        UserAccount current = currentUser();
        List<ExerciseLibrary> exercises;
        if (Boolean.TRUE.equals(mine) && current != null) {
            exercises = repo.findByCreatedByAndActiveTrueOrderByMuscleGroupAscSortOrderAsc(current.getId());
        } else {
            exercises = repo.findByActiveTrueOrderByMuscleGroupAscSortOrderAsc();
        }
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (ExerciseLibrary ex : exercises) {
            grouped.computeIfAbsent(ex.getMuscleGroup(), k -> new ArrayList<>())
                .add(toMap(ex, current));
        }
        return ResponseEntity.ok(grouped);
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        UserAccount current = currentUser();
        List<ExerciseLibrary> exercises = repo.search(q);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ExerciseLibrary ex : exercises) {
            result.add(toMap(ex, current));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        UserAccount current = currentUser();
        ExerciseLibrary ex = new ExerciseLibrary();
        ex.setName((String) body.getOrDefault("name", ""));
        ex.setMuscleGroup((String) body.getOrDefault("muscleGroup", ""));
        ex.setDefaultSets((String) body.getOrDefault("defaultSets", ""));
        ex.setDefaultReps((String) body.getOrDefault("defaultReps", ""));
        ex.setDefaultWeight((String) body.getOrDefault("defaultWeight", ""));
        ex.setDefaultNote((String) body.getOrDefault("defaultNote", ""));
        ex.setSortOrder(body.containsKey("sortOrder") ? (int) body.get("sortOrder") : 0);
        ex.setActive(true);

        if (current != null) {
            ex.setCreatedBy(current.getId());
            ex.setCreatedByName(current.getDisplayName() != null && !current.getDisplayName().isBlank()
                    ? current.getDisplayName() : current.getUsername());
        }

        repo.save(ex);
        return ResponseEntity.ok(toMap(ex, current));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ExerciseLibrary ex = repo.findById(id).orElse(null);
        if (ex == null) return ResponseEntity.notFound().build();

        UserAccount current = currentUser();
        if (current == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        if (current.getRole() != UserAccount.Role.ADMIN) {
            if (ex.getCreatedBy() == null || !ex.getCreatedBy().equals(current.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only edit exercises you created"));
            }
        }

        if (body.containsKey("name")) ex.setName((String) body.get("name"));
        if (body.containsKey("muscleGroup")) ex.setMuscleGroup((String) body.get("muscleGroup"));
        if (body.containsKey("defaultSets")) ex.setDefaultSets((String) body.get("defaultSets"));
        if (body.containsKey("defaultReps")) ex.setDefaultReps((String) body.get("defaultReps"));
        if (body.containsKey("defaultWeight")) ex.setDefaultWeight((String) body.get("defaultWeight"));
        if (body.containsKey("defaultNote")) ex.setDefaultNote((String) body.get("defaultNote"));
        if (body.containsKey("sortOrder")) ex.setSortOrder((int) body.get("sortOrder"));
        if (body.containsKey("active")) ex.setActive((boolean) body.get("active"));
        repo.save(ex);
        return ResponseEntity.ok(toMap(ex, current));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        ExerciseLibrary ex = repo.findById(id).orElse(null);
        if (ex == null) return ResponseEntity.notFound().build();

        UserAccount current = currentUser();
        if (current == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        if (current.getRole() != UserAccount.Role.ADMIN) {
            if (ex.getCreatedBy() == null || !ex.getCreatedBy().equals(current.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only delete exercises you created"));
            }
        }

        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private Map<String, Object> toMap(ExerciseLibrary ex, UserAccount current) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", ex.getId());
        m.put("name", ex.getName());
        m.put("muscleGroup", ex.getMuscleGroup());
        m.put("defaultSets", ex.getDefaultSets());
        m.put("defaultReps", ex.getDefaultReps());
        m.put("defaultWeight", ex.getDefaultWeight());
        m.put("defaultNote", ex.getDefaultNote());
        m.put("sortOrder", ex.getSortOrder());
        m.put("active", ex.isActive());
        m.put("createdBy", ex.getCreatedBy());
        m.put("createdByName", ex.getCreatedByName());
        boolean isMine = current != null && ex.getCreatedBy() != null && ex.getCreatedBy().equals(current.getId());
        m.put("isMine", isMine);
        m.put("isSystem", ex.getCreatedBy() == null);
        return m;
    }
}
