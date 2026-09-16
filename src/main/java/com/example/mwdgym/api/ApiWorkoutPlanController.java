package com.example.mwdgym.api;

import com.example.mwdgym.model.WorkoutPlan;
import com.example.mwdgym.repository.WorkoutPlanRepository;
import com.example.mwdgym.service.WorkoutPlanPdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout-plans")
public class ApiWorkoutPlanController {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutPlanPdfService pdfService;

    public ApiWorkoutPlanController(WorkoutPlanRepository workoutPlanRepository, WorkoutPlanPdfService pdfService) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.pdfService = pdfService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<WorkoutPlan> plans = workoutPlanRepository.findAllByOrderByUpdatedAtDesc();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return workoutPlanRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody WorkoutPlan plan) {
        plan.setId(null);
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());
        plan = workoutPlanRepository.save(plan);
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody WorkoutPlan plan) {
        return workoutPlanRepository.findById(id).map(existing -> {
            existing.setName(plan.getName());
            existing.setNotes(plan.getNotes());
            existing.setContentJson(plan.getContentJson());
            existing.setActive(plan.isActive());
            existing.setUpdatedAt(LocalDateTime.now());
            existing = workoutPlanRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        workoutPlanRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        return workoutPlanRepository.findById(id).map(plan -> {
            plan.setActive(!plan.isActive());
            plan.setUpdatedAt(LocalDateTime.now());
            workoutPlanRepository.save(plan);
            return ResponseEntity.ok((Object) Map.of("ok", true, "active", plan.isActive()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id,
                                      @RequestParam(defaultValue = "true") boolean includeWarm,
                                      @RequestParam(required = false) String days,
                                      @RequestParam(defaultValue = "default") String theme) {
        return workoutPlanRepository.findById(id).map(plan -> {
            // allow theme override via query param
            if (theme != null && !theme.isBlank()) plan.setTheme(theme);
            String daysParam = days != null ? days : plan.getIncludedDays();
            byte[] pdf = pdfService.generatePdf(plan, includeWarm, daysParam);
            String filename = plan.getName().replaceAll("[^a-zA-Z0-9._-]", "_") + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(pdf);
        }).orElse(ResponseEntity.notFound().build());
    }
}
