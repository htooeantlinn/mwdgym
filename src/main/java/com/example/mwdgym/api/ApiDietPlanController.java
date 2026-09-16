package com.example.mwdgym.api;

import com.example.mwdgym.model.DietPlan;
import com.example.mwdgym.repository.DietPlanRepository;
import com.example.mwdgym.service.DietPlanPdfService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diet-plans")
public class ApiDietPlanController {

    private final DietPlanRepository repository;
    private final DietPlanPdfService pdfService;

    public ApiDietPlanController(DietPlanRepository repository, DietPlanPdfService pdfService) {
        this.repository = repository;
        this.pdfService = pdfService;
    }

    @GetMapping("")
    public List<DietPlan> getAll() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DietPlan> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("")
    public ResponseEntity<DietPlan> create(@RequestBody DietPlan plan) {
        plan.setId(null);
        plan.setCreatedAt(java.time.LocalDateTime.now());
        plan.setUpdatedAt(java.time.LocalDateTime.now());
        plan.setActive(true);
        plan.setTheme("default");
        DietPlan saved = repository.save(plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DietPlan> update(@PathVariable Long id, @RequestBody DietPlan plan) {
        return repository.findById(id).map(existing -> {
            existing.setName(plan.getName());
            existing.setNotes(plan.getNotes());
            existing.setContentJson(plan.getContentJson());
            existing.setActive(plan.isActive());
            existing.setUpdatedAt(java.time.LocalDateTime.now());
            existing.setTheme(plan.getTheme());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<DietPlan> toggleActive(@PathVariable Long id) {
        return repository.findById(id).map(plan -> {
            plan.setActive(!plan.isActive());
            plan.setUpdatedAt(java.time.LocalDateTime.now());
            return ResponseEntity.ok(repository.save(plan));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id,
                                         @RequestParam(defaultValue = "default") String theme) {
        return repository.findById(id).map(plan -> {
            if (theme != null && !theme.isBlank()) plan.setTheme(theme);
            byte[] pdf = pdfService.generatePdf(plan);
            String filename = plan.getName().replaceAll("[^a-zA-Z0-9._-]", "_") + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(pdf);
        }).orElse(ResponseEntity.notFound().build());
    }
}