package com.example.mwdgym.api;

import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.service.GymService;
import com.example.mwdgym.service.LoggingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {

    private final GymService gymService;
    private final PasswordEncoder passwordEncoder;
    private final LoggingService loggingService;

    public ApiAuthController(GymService gymService, PasswordEncoder passwordEncoder, LoggingService loggingService) {
        this.gymService = gymService;
        this.passwordEncoder = passwordEncoder;
        this.loggingService = loggingService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                    HttpServletRequest request,
                                    HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password required"));
        }
        UserAccount user = gymService.getUserByUsername(username);
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            loggingService.warn("AUTH", "LOGIN_FAILED", null, "Failed login attempt for username: " + username, request);
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        if (!user.isActive()) {
            loggingService.warn("AUTH", "LOGIN_BLOCKED", user, "Login blocked - account disabled", request);
            return ResponseEntity.status(403).body(Map.of("error", "Account disabled"));
        }

        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, authorities);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        loggingService.info("AUTH", "LOGIN", user, "User logged in", request);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("displayName", user.getDisplayName());
        resp.put("role", user.getRole().name());
        resp.put("profileImage", user.getProfileImage());
        resp.put("permissions", user.getPermissions());
        resp.put("coinBalance", user.getCoinBalance());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String fullName = body.get("fullName");
        String contact = body.get("contact");
        String username = body.get("username");
        String password = body.get("password");
        if (fullName == null || contact == null || username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields required"));
        }
        if (gymService.usernameExists(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        UserAccount user = gymService.registerClient(fullName, contact, username, password);
        loggingService.info("AUTH", "SIGNUP", user, "New user registered", request);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("displayName", user.getDisplayName());
        resp.put("role", user.getRole().name());
        resp.put("coinBalance", user.getCoinBalance());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        UserAccount user = gymService.getUserByUsername(auth.getName());
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("displayName", user.getDisplayName());
        resp.put("role", user.getRole().name());
        resp.put("active", user.isActive());
        resp.put("profileImage", user.getProfileImage());
        resp.put("permissions", user.getPermissions());
        resp.put("coinBalance", user.getCoinBalance());
        resp.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
