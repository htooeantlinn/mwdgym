package com.example.mwdgym.api;

import com.example.mwdgym.model.DietPlan;
import com.example.mwdgym.model.diet.DietPlanContent;
import com.example.mwdgym.repository.DietPlanRepository;
import com.example.mwdgym.service.DietPlanPdfService;
import com.example.mwdgym.service.DietPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/diet-plans")
public class ApiDietPlanController {

    private final DietPlanRepository repository;
    private final DietPlanPdfService pdfService;
    private final DietPlanService dietPlanService;
    private final ITemplateEngine templateEngine;

    public ApiDietPlanController(DietPlanRepository repository, DietPlanPdfService pdfService,
                                 DietPlanService dietPlanService, ITemplateEngine templateEngine) {
        this.repository = repository;
        this.pdfService = pdfService;
        this.dietPlanService = dietPlanService;
        this.templateEngine = templateEngine;
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
            byte[] pdf;
            try {
                pdf = browserPdf(plan);
            } catch (Exception e) {
                pdf = pdfService.generatePdf(plan);
            }
            String filename = plan.getName().replaceAll("[^a-zA-Z0-9._-]", "_") + ".pdf";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(pdf);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Render the print page with headless Chromium so Myanmar text shapes
    // exactly like in the browser. Falls back to iText when unavailable.
    private byte[] browserPdf(DietPlan plan) throws Exception {
        DietPlanContent content;
        try {
            content = dietPlanService.normalizeContent(dietPlanService.parseContent(plan.getContentJson()));
        } catch (Exception e) {
            content = dietPlanService.defaultContent();
        }
        Context ctx = new Context();
        ctx.setVariable("plan", plan);
        ctx.setVariable("content", content);
        String html = templateEngine.process("print/diet-plan", ctx);

        Path htmlFile = Files.createTempFile("diet-", ".html");
        Path pdfFile = Files.createTempFile("diet-", ".pdf");
        try {
            Files.writeString(htmlFile, html, StandardCharsets.UTF_8);
            String chrome = findChrome();
            Process p = new ProcessBuilder(chrome, "--headless=new", "--no-sandbox", "--disable-gpu",
                    "--disable-dev-shm-usage", "--no-pdf-header-footer",
                    "--print-to-pdf=" + pdfFile.toString(), htmlFile.toUri().toString())
                    .redirectErrorStream(true)
                    .start();
            boolean done = p.waitFor(45, TimeUnit.SECONDS);
            String log = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            if (!done) {
                p.destroyForcibly();
                throw new RuntimeException("print timed out: " + log);
            }
            if (p.exitValue() != 0 || !Files.exists(pdfFile) || Files.size(pdfFile) == 0) {
                throw new RuntimeException("print failed: " + log);
            }
            return Files.readAllBytes(pdfFile);
        } finally {
            Files.deleteIfExists(htmlFile);
            Files.deleteIfExists(pdfFile);
        }
    }

    private String findChrome() {
        for (String c : new String[]{"chromium", "chromium-browser", "google-chrome", "google-chrome-stable"}) {
            try {
                Process p = new ProcessBuilder(c, "--version").redirectErrorStream(true).start();
                if (p.waitFor(10, TimeUnit.SECONDS) && p.exitValue() == 0) return c;
            } catch (Exception ignored) {
            }
        }
        throw new RuntimeException("no headless browser available");
    }
}