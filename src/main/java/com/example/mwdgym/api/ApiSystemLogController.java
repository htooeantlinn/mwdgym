package com.example.mwdgym.api;

import com.example.mwdgym.model.SystemLog;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.SystemLogRepository;
import com.example.mwdgym.service.GymService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class ApiSystemLogController {

    private final SystemLogRepository logRepository;
    private final GymService gymService;

    public ApiSystemLogController(SystemLogRepository logRepository, GymService gymService) {
        this.logRepository = logRepository;
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(value = "category", required = false) String category,
                                  @RequestParam(value = "level", required = false) String level,
                                  @RequestParam(value = "actor", required = false) String actor,
                                  @RequestParam(value = "page", defaultValue = "0") int page,
                                  @RequestParam(value = "size", defaultValue = "30") int size) {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();

        List<SystemLog> logs;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(size, 100));

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasLevel = level != null && !level.isBlank();
        boolean hasActor = actor != null && !actor.isBlank();

        if (hasCategory) {
            logs = logRepository.findByCategoryContainingIgnoreCaseOrderByCreatedAtDescIdDesc(category.trim(), pageable);
        } else if (hasLevel) {
            logs = logRepository.findByLevelContainingIgnoreCaseOrderByCreatedAtDescIdDesc(level.trim(), pageable);
        } else if (hasActor) {
            logs = logRepository.findByActorContainingIgnoreCaseOrderByCreatedAtDescIdDesc(actor.trim(), pageable);
        } else {
            logs = logRepository.findByOrderByCreatedAtDescIdDesc(pageable);
        }

        List<Map<String, Object>> items = new ArrayList<>();
        for (SystemLog l : logs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("level", l.getLevel());
            m.put("category", l.getCategory());
            m.put("action", l.getAction());
            m.put("actor", l.getActor());
            m.put("detail", l.getDetail());
            m.put("ip", l.getIp());
            m.put("createdAt", l.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")));
            items.add(m);
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("logs", items);
        resp.put("total", logRepository.count());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();
        if (logRepository.existsById(id)) {
            logRepository.deleteById(id);
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @DeleteMapping
    public ResponseEntity<?> clear() {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();
        logRepository.deleteAll();
        return ResponseEntity.ok(Map.of("ok", true, "count", 0));
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) return null;
        return gymService.getUserByUsername(auth.getName());
    }
}
