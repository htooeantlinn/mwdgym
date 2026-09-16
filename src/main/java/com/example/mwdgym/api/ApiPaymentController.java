package com.example.mwdgym.api;

import com.example.mwdgym.model.Payment;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class ApiPaymentController {

    private final GymService gymService;

    public ApiPaymentController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String member,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Payment> payments = gymService.getAllPayments();

        if (status != null && !status.isEmpty()) {
            payments = payments.stream().filter(p -> status.equals(p.getStatus())).toList();
        }
        if (member != null && !member.isEmpty()) {
            payments = payments.stream().filter(p -> p.getMember() != null
                    && p.getMember().getName() != null
                    && p.getMember().getName().toLowerCase().contains(member.toLowerCase())).toList();
        }
        if (plan != null && !plan.isEmpty()) {
            payments = payments.stream().filter(p -> p.getMember() != null
                    && plan.equalsIgnoreCase(p.getMember().getPlanType())).toList();
        }

        payments = payments.stream().sorted((a, b) -> {
            if (a.getPaymentDate() == null) return 1;
            if (b.getPaymentDate() == null) return -1;
            return b.getPaymentDate().compareTo(a.getPaymentDate());
        }).toList();

        int total = payments.size();
        int from = page * size;
        int to = Math.min(from + size, total);
        List<Payment> paged = from < total ? payments.subList(from, to) : List.of();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("payments", paged);
        resp.put("total", total);
        resp.put("page", page);
        resp.put("size", size);
        resp.put("totalPages", (int) Math.ceil((double) total / size));

        // Stats
        List<Payment> all = gymService.getAllPayments();
        long paid = all.stream().filter(p -> "Paid".equals(p.getStatus())).count();
        long unpaid = all.stream().filter(p -> "Not Paid".equals(p.getStatus())).count();
        resp.put("paidCount", paid);
        resp.put("unpaidCount", unpaid);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Payment payment = gymService.getPaymentById(id);
        if (payment == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<?> markPaid(@PathVariable Long id) {
        Payment payment = gymService.getPaymentById(id);
        if (payment == null) return ResponseEntity.notFound().build();
        gymService.processPayment(payment);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/mark-unpaid")
    public ResponseEntity<?> markUnpaid(@PathVariable Long id) {
        gymService.markUnpaid(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
