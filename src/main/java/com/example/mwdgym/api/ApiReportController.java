package com.example.mwdgym.api;

import com.example.mwdgym.model.Member;
import com.example.mwdgym.model.Payment;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ApiReportController {

    private final GymService gymService;

    public ApiReportController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping("/overview")
    public ResponseEntity<?> overview() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("stats", gymService.overviewStats());
        resp.put("revenueTrend", gymService.revenueTrend(12));
        resp.put("planDistribution", gymService.planDistribution());
        resp.put("trainerWorkload", gymService.trainerWorkload());
        resp.put("topPlans", gymService.topPlansByRevenue());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/members")
    public ResponseEntity<?> members() {
        List<Member> members = gymService.getAllMembers();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/payments")
    public ResponseEntity<?> payments() {
        List<Payment> payments = gymService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> revenue(@RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(gymService.revenueTrend(months));
    }
}
