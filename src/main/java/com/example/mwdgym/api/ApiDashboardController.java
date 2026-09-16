package com.example.mwdgym.api;

import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class ApiDashboardController {

    private final GymService gymService;

    public ApiDashboardController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> overview(@RequestParam(defaultValue = "6") int range) {
        return ResponseEntity.ok(gymService.overviewSummary(range));
    }
}
