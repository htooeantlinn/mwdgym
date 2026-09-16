package com.example.mwdgym.api;

import com.example.mwdgym.model.Member;
import com.example.mwdgym.model.Payment;
import com.example.mwdgym.model.Plan;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class ApiMemberController {

    private final GymService gymService;

    public ApiMemberController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String card,
            @RequestParam(required = false) String contact,
            @RequestParam(required = false) String joiningDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String payment,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Member> members;
        if (name != null || card != null || contact != null || joiningDate != null) {
            members = gymService.searchMembers(name, joiningDate, contact);
        } else {
            members = gymService.getAllMembers();
        }

        // Apply filters
        if (status != null && !status.isEmpty()) {
            members = members.stream().filter(m -> status.equals(m.getStatus())).toList();
        }
        if (category != null && !category.isEmpty()) {
            members = members.stream().filter(m -> category.equalsIgnoreCase(
                    gymService.isPremiumPlan(m.getPlanType()) ? "PREMIUM" : "BASIC")).toList();
        }

        // Set payment status
        for (Member m : members) {
            List<Payment> payments = gymService.getPaymentsByMemberId(m.getId());
            Payment last = payments.isEmpty() ? null : payments.get(payments.size() - 1);
            m.setPaymentStatus(last != null ? last.getStatus() : "Not Paid");
        }

        // Filter by payment status
        if (payment != null && !payment.isEmpty()) {
            members = members.stream().filter(m -> payment.equals(m.getPaymentStatus())).toList();
        }

        // Filter by card
        if (card != null && !card.isEmpty()) {
            members = members.stream().filter(m -> m.getCardCode() != null
                    && m.getCardCode().toLowerCase().contains(card.toLowerCase())).toList();
        }

        int total = members.size();
        int from = page * size;
        int to = Math.min(from + size, total);
        List<Member> paged = from < total ? members.subList(from, to) : List.of();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("members", paged);
        resp.put("total", total);
        resp.put("page", page);
        resp.put("size", size);
        resp.put("totalPages", (int) Math.ceil((double) total / size));
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Member member = gymService.getMemberById(id);
        if (member == null) return ResponseEntity.notFound().build();
        List<Payment> payments = gymService.getPaymentsByMemberId(id);
        Payment last = payments.isEmpty() ? null : payments.get(payments.size() - 1);
        member.setPaymentStatus(last != null ? last.getStatus() : "Not Paid");
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("member", member);
        resp.put("payments", payments);
        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Member member = new Member();
        applyFields(member, body);
        member.setJoiningDate(LocalDate.now());
        member = gymService.saveMember(member);
        return ResponseEntity.ok(member);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Member member = gymService.getMemberById(id);
        if (member == null) return ResponseEntity.notFound().build();
        applyFields(member, body);
        member = gymService.saveMember(member);
        return ResponseEntity.ok(member);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        gymService.deleteMember(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        gymService.setMemberActive(id, true);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/inactivate")
    public ResponseEntity<?> inactivate(@PathVariable Long id) {
        gymService.setMemberActive(id, false);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/quick-pay")
    public ResponseEntity<?> quickPay(@PathVariable Long id) {
        gymService.quickPay(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<?> renew(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String planType = (String) body.getOrDefault("planType", "");
        BigDecimal amount = body.get("amount") != null ? new BigDecimal(body.get("amount").toString()) : null;
        Long trainerId = body.get("trainerId") != null ? Long.valueOf(body.get("trainerId").toString()) : null;
        LocalDate startDate = body.get("startDate") != null ? LocalDate.parse(body.get("startDate").toString()) : null;
        LocalDate paymentDate = body.get("paymentDate") != null ? LocalDate.parse(body.get("paymentDate").toString()) : null;

        String error = gymService.renewMember(id, planType, amount, trainerId, startDate, paymentDate);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("error", error));
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private void applyFields(Member member, Map<String, Object> body) {
        if (body.containsKey("name")) member.setName((String) body.get("name"));
        if (body.containsKey("contact")) member.setContact((String) body.get("contact"));
        if (body.containsKey("address")) member.setAddress((String) body.get("address"));
        if (body.containsKey("planType")) member.setPlanType((String) body.get("planType"));
        if (body.containsKey("amount") && body.get("amount") != null) {
            member.setAmount(new BigDecimal(body.get("amount").toString()));
        }
        if (body.containsKey("cardCode")) member.setCardCode((String) body.get("cardCode"));
        if (body.containsKey("status")) member.setStatus((String) body.get("status"));
        if (body.containsKey("startDate") && body.get("startDate") != null) {
            member.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        }
        if (body.containsKey("endDate") && body.get("endDate") != null) {
            member.setEndDate(LocalDate.parse(body.get("endDate").toString()));
        }
        if (body.containsKey("trainerId") && body.get("trainerId") != null && !body.get("trainerId").toString().isEmpty()) {
            UserAccount trainer = gymService.getUserById(Long.valueOf(body.get("trainerId").toString()));
            member.setTrainer(trainer);
        } else if (body.containsKey("trainerId")) {
            member.setTrainer(null);
        }
    }
}
