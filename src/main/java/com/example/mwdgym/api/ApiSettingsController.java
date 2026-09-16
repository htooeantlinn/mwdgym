package com.example.mwdgym.api;

import com.example.mwdgym.service.GymService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class ApiSettingsController {

    private final GymService gymService;

    public ApiSettingsController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> get() {
        return ResponseEntity.ok(gymService.getSiteSettings());
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody Map<String, String> body) {
        gymService.saveSiteSettings(body);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping(value = "/hero-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadHero(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "No file"));
        if (file.getSize() > 5 * 1024 * 1024) return ResponseEntity.badRequest().body(Map.of("error", "Max 5MB"));
        String ct = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        String fn = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        boolean ok = ct.startsWith("image/") || fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg") || fn.endsWith(".webp");
        if (!ok) return ResponseEntity.badRequest().body(Map.of("error", "Only images allowed"));
        try {
            String ext = fn.contains(".") ? fn.substring(fn.lastIndexOf(".")) : ".jpg";
            if (ext.equals(".jpeg")) ext = ".jpg";
            String name = "hero-" + UUID.randomUUID() + ext.toLowerCase();
            Path dir = Paths.get("uploads/hero");
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(Map.of("url", "/uploads/hero/" + name));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save"));
        }
    }
}
