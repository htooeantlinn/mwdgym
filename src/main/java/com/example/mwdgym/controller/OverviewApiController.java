package com.example.mwdgym.controller;

import com.example.mwdgym.service.GymService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class OverviewApiController {

    private final GymService gymService;

    public OverviewApiController(GymService gymService) {
        this.gymService = gymService;
    }

    /**
     * GET /api/overview?range=N
     *
     * range = positive integer  → trailing N months  (e.g. 3, 6, 12, 24)
     * range = 0                 → year-to-date (Jan of current year → now)
     * range = -1                → all time  (earliest paid payment → now)
     *
     * Defaults to 6 when omitted.
     */
    @GetMapping("/api/overview")
    public Map<String, Object> overview(
            @RequestParam(name = "range", defaultValue = "6") int range) {
        // Clamp to sane values: -1 = all-time, 0 = YTD, 1..120 months
        int sanitized = (range < -1) ? -1 : Math.min(range, 120);
        return gymService.overviewSummary(sanitized);
    }
}
