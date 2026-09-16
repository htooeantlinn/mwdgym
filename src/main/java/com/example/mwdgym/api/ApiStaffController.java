package com.example.mwdgym.api;

import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class ApiStaffController {

    private final GymService gymService;
    private final PasswordEncoder passwordEncoder;

    public ApiStaffController(GymService gymService, PasswordEncoder passwordEncoder) {
        this.gymService = gymService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<UserAccount> users = gymService.getAllUsers();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("displayName", u.getDisplayName());
            m.put("role", u.getRole().name());
            m.put("active", u.isActive());
            m.put("showOnHome", u.isShowOnHome());
            m.put("permissions", u.getPermissions());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        UserAccount user = gymService.getUserById(id);
        if (user == null) return ResponseEntity.notFound().build();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", user.getId());
        m.put("username", user.getUsername());
        m.put("displayName", user.getDisplayName());
        m.put("role", user.getRole().name());
        m.put("active", user.isActive());
        m.put("showOnHome", user.isShowOnHome());
        m.put("permissions", user.getPermissions());
        return ResponseEntity.ok(m);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String displayName = (String) body.get("displayName");
        String password = (String) body.get("password");
        String role = (String) body.get("role");

        if (username == null || displayName == null || password == null || role == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields required"));
        }
        if (gymService.usernameExists(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(UserAccount.Role.valueOf(role));
        user.setActive(true);

        if (body.containsKey("permissions")) {
            @SuppressWarnings("unchecked")
            List<String> perms = (List<String>) body.get("permissions");
            user.setPermissions(new java.util.LinkedHashSet<>(perms));
        }
        if (body.containsKey("showOnHome")) {
            user.setShowOnHome((Boolean) body.get("showOnHome"));
        }

        user = gymService.saveUserAccount(user);
        return ResponseEntity.ok(Map.of("id", user.getId(), "username", user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        UserAccount user = gymService.getUserById(id);
        if (user == null) return ResponseEntity.notFound().build();

        if (body.containsKey("displayName")) user.setDisplayName((String) body.get("displayName"));
        if (body.containsKey("role")) user.setRole(UserAccount.Role.valueOf((String) body.get("role")));
        if (body.containsKey("active")) user.setActive((Boolean) body.get("active"));
        if (body.containsKey("showOnHome")) user.setShowOnHome((Boolean) body.get("showOnHome"));
        if (body.containsKey("password") && body.get("password") != null && !body.get("password").toString().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode((String) body.get("password")));
        }
        if (body.containsKey("permissions")) {
            @SuppressWarnings("unchecked")
            List<String> perms = (List<String>) body.get("permissions");
            user.setPermissions(new java.util.LinkedHashSet<>(perms));
        }

        gymService.saveUserAccount(user);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        gymService.deleteUserAccount(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        gymService.toggleUserActive(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/trainers")
    public ResponseEntity<?> trainers() {
        return ResponseEntity.ok(gymService.getTrainers());
    }
}
