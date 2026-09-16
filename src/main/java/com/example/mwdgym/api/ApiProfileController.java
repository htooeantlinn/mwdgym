package com.example.mwdgym.api;

import com.example.mwdgym.model.Member;
import com.example.mwdgym.model.Payment;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.service.GymService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ApiProfileController {

    private final GymService gymService;
    private final PasswordEncoder passwordEncoder;

    public ApiProfileController(GymService gymService, PasswordEncoder passwordEncoder) {
        this.gymService = gymService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<?> get() {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("displayName", user.getDisplayName());
        resp.put("role", user.getRole().name());
        resp.put("active", user.isActive());
        resp.put("profileImage", user.getProfileImage());
        resp.put("createdAt", user.getCreatedAt());
        resp.put("coinBalance", user.getCoinBalance());
        resp.put("defaultDeliveryName", user.getDefaultDeliveryName());
        resp.put("defaultDeliveryPhone", user.getDefaultDeliveryPhone());
        resp.put("defaultDeliveryAddress", user.getDefaultDeliveryAddress());
        resp.put("defaultDeliveryCity", user.getDefaultDeliveryCity());
        resp.put("defaultDeliveryTownship", user.getDefaultDeliveryTownship());
        resp.put("defaultDeliveryNote", user.getDefaultDeliveryNote());

        if (user.getRole() == UserAccount.Role.CLIENT) {
            Member member = gymService.getMemberByUserUsername(user.getUsername());
            if (member != null) {
                resp.put("member", member);
                List<Payment> payments = gymService.getPaymentsByMemberId(member.getId());
                resp.put("payments", payments);
            }
        } else {
            resp.put("permissions", user.getPermissions());
        }
        return ResponseEntity.ok(resp);
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody Map<String, Object> body) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        if (body.containsKey("displayName")) user.setDisplayName((String) body.get("displayName"));
        if (body.containsKey("defaultDeliveryName")) user.setDefaultDeliveryName((String) body.get("defaultDeliveryName"));
        if (body.containsKey("defaultDeliveryPhone")) user.setDefaultDeliveryPhone((String) body.get("defaultDeliveryPhone"));
        if (body.containsKey("defaultDeliveryAddress")) user.setDefaultDeliveryAddress((String) body.get("defaultDeliveryAddress"));
        if (body.containsKey("defaultDeliveryCity")) user.setDefaultDeliveryCity((String) body.get("defaultDeliveryCity"));
        if (body.containsKey("defaultDeliveryTownship")) user.setDefaultDeliveryTownship((String) body.get("defaultDeliveryTownship"));
        if (body.containsKey("defaultDeliveryNote")) user.setDefaultDeliveryNote((String) body.get("defaultDeliveryNote"));
        gymService.saveUserAccount(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "No file"));
        if (file.getSize() > 5 * 1024 * 1024) return ResponseEntity.badRequest().body(Map.of("error", "File too large (max 5MB)"));
        String ct = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        boolean isImageByCt = ct.startsWith("image/");
        boolean isImageByExt = original.endsWith(".png") || original.endsWith(".jpg") || original.endsWith(".jpeg") || original.endsWith(".gif") || original.endsWith(".webp") || original.endsWith(".svg") || original.endsWith(".bmp") || original.endsWith(".ico") || original.endsWith(".avif");
        if (!isImageByCt && !isImageByExt) return ResponseEntity.badRequest().body(Map.of("error", "Only images allowed (png, jpg, jpeg, gif, webp, svg, bmp)"));
        try {
            String origName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "profile.jpg";
            String ext = origName.contains(".") ? origName.substring(origName.lastIndexOf(".")) : ".jpg";
            // normalize ext to lower case, handle jpeg -> jpg
            ext = ext.toLowerCase();
            if (ext.equals(".jpeg")) ext = ".jpg";
            String storedName = "profile-" + user.getId() + "-" + UUID.randomUUID() + ext;
            Path dir = Paths.get("uploads/profile");
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/profile/" + storedName;
            // delete old image file if exists
            if (user.getProfileImage() != null) {
                try {
                    String old = user.getProfileImage();
                    if (old.startsWith("/uploads/profile/")) {
                        Path oldPath = Paths.get("uploads/profile/" + old.substring("/uploads/profile/".length()));
                        Files.deleteIfExists(oldPath);
                    }
                } catch (Exception ignored) {}
            }
            user.setProfileImage(url);
            gymService.saveUserAccount(user);
            return ResponseEntity.ok(Map.of("ok", true, "profileImage", url));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save image"));
        }
    }

    @DeleteMapping("/image")
    public ResponseEntity<?> deleteImage() {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        if (user.getProfileImage() != null) {
            try {
                String old = user.getProfileImage();
                if (old.startsWith("/uploads/profile/")) {
                    Path oldPath = Paths.get("uploads/profile/" + old.substring("/uploads/profile/".length()));
                    Files.deleteIfExists(oldPath);
                }
            } catch (Exception ignored) {}
            user.setProfileImage(null);
            gymService.saveUserAccount(user);
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteProfile() {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        // prevent deleting the last admin
        if (user.getRole() == UserAccount.Role.ADMIN) {
            long adminCount = gymService.getAllUsers().stream().filter(u -> u.getRole() == UserAccount.Role.ADMIN).count();
            if (adminCount <= 1) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete the last admin account"));
            }
        }
        try {
            // delete profile image file if exists
            if (user.getProfileImage() != null) {
                try {
                    String old = user.getProfileImage();
                    if (old.startsWith("/uploads/profile/")) {
                        Path oldPath = Paths.get("uploads/profile/" + old.substring("/uploads/profile/".length()));
                        Files.deleteIfExists(oldPath);
                    }
                } catch (Exception ignored) {}
            }
            // delete member if exists (for CLIENT)
            if (user.getRole() == UserAccount.Role.CLIENT) {
                try {
                    Member m = gymService.getMemberByUserUsername(user.getUsername());
                    if (m != null) gymService.deleteMember(m.getId());
                } catch (Exception ignored) {}
            }
            gymService.deleteUserAccount(user.getId());
            // invalidate session
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete profile"));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).build();
        String current = body.get("currentPassword");
        String newPw = body.get("newPassword");
        if (current == null || newPw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both passwords required"));
        }
        if (!passwordEncoder.matches(current, user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }
        if (newPw.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters"));
        }
        user.setPasswordHash(passwordEncoder.encode(newPw));
        gymService.saveUserAccount(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return gymService.getUserByUsername(auth.getName());
    }
}
