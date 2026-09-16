package com.example.mwdgym.api;

import com.example.mwdgym.model.CoinOrder;
import com.example.mwdgym.model.CoinPackage;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.CoinOrderRepository;
import com.example.mwdgym.repository.CoinPackageRepository;
import com.example.mwdgym.service.GymService;
import com.example.mwdgym.service.LoggingService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/coin-shop")
public class ApiCoinShopController {

    private final CoinPackageRepository packageRepository;
    private final CoinOrderRepository orderRepository;
    private final GymService gymService;
    private final LoggingService loggingService;

    public ApiCoinShopController(CoinPackageRepository packageRepository,
                                 CoinOrderRepository orderRepository,
                                 GymService gymService,
                                 LoggingService loggingService) {
        this.packageRepository = packageRepository;
        this.orderRepository = orderRepository;
        this.gymService = gymService;
        this.loggingService = loggingService;
        seedDefaults();
    }

    private void seedDefaults() {
        try {
            if (packageRepository.count() > 0) return;
            createPkg("86 Coins", 86L, 0L, 5000L, false, "Starter", 1);
            createPkg("172 Coins", 172L, 8L, 10000L, false, "+8 Bonus", 2);
            createPkg("344 Coins", 344L, 32L, 19000L, true, "Popular", 3);
            createPkg("706 Coins", 706L, 80L, 38000L, false, "+80 Bonus", 4);
            createPkg("1412 Coins", 1412L, 200L, 75000L, false, "+200 Bonus", 5);
            createPkg("2845 Coins", 2845L, 500L, 145000L, false, "Best Value", 6);
        } catch (Exception ignored) {}
    }

    private void createPkg(String name, Long coins, Long bonus, Long price, boolean popular, String badge, int sort) {
        CoinPackage p = new CoinPackage();
        p.setName(name);
        p.setCoins(coins);
        p.setBonusCoins(bonus);
        p.setPriceMmk(price);
        p.setPopular(popular);
        p.setBadgeText(badge);
        p.setSortOrder(sort);
        p.setActive(true);
        packageRepository.save(p);
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return gymService.getUserByUsername(auth.getName());
    }

    private Map<String, Object> toPackageJson(CoinPackage p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("coins", p.getCoins());
        m.put("bonusCoins", p.getBonusCoins());
        m.put("totalCoins", p.getTotalCoins());
        m.put("priceMmk", p.getPriceMmk());
        m.put("popular", p.getPopular());
        m.put("active", p.getActive());
        m.put("sortOrder", p.getSortOrder());
        m.put("badgeText", p.getBadgeText());
        return m;
    }

    private Map<String, Object> toOrderJson(CoinOrder o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("userId", o.getUserId());
        m.put("packageId", o.getPackageId());
        m.put("coinsAmount", o.getCoinsAmount());
        m.put("priceMmk", o.getPriceMmk());
        m.put("status", o.getStatus().name());
        m.put("paymentMethod", o.getPaymentMethod());
        m.put("transferId", o.getTransferId());
        m.put("screenshotUrl", o.getScreenshotUrl());
        m.put("adminNotes", o.getAdminNotes());
        m.put("rejectionReason", o.getRejectionReason());
        m.put("createdAt", o.getCreatedAt());
        m.put("processedAt", o.getProcessedAt());
        UserAccount u = gymService.getUserById(o.getUserId());
        if (u != null) { m.put("userName", u.getDisplayName()); m.put("username", u.getUsername()); }
        packageRepository.findById(o.getPackageId()).ifPresent(p -> m.put("packageName", p.getName()));
        return m;
    }

    // ========== PUBLIC / AUTHENTICATED ==========

    @GetMapping("/packages")
    public ResponseEntity<?> listPackages() {
        List<CoinPackage> list = packageRepository.findByActiveTrueOrderBySortOrderAscIdAsc();
        List<Map<String, Object>> out = new ArrayList<>();
        for (CoinPackage p : list) out.add(toPackageJson(p));
        return ResponseEntity.ok(out);
    }

    @GetMapping("/packages/all")
    public ResponseEntity<?> listAllPackages() {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        List<CoinPackage> list = packageRepository.findAllByOrderBySortOrderAscIdAsc();
        List<Map<String, Object>> out = new ArrayList<>();
        for (CoinPackage p : list) out.add(toPackageJson(p));
        return ResponseEntity.ok(out);
    }

    @PostMapping(value = "/orders", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createOrder(
            @RequestParam Long packageId,
            @RequestParam String paymentMethod,
            @RequestParam(required = false) String transferId,
            @RequestParam(value = "screenshot", required = false) MultipartFile screenshot) {
        try {
            UserAccount user = currentUser();
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            CoinPackage pkg = packageRepository.findById(packageId).orElse(null);
            if (pkg == null || !pkg.getActive()) return ResponseEntity.badRequest().body(Map.of("error", "Package not found"));

            CoinOrder order = new CoinOrder();
            order.setUserId(user.getId());
            order.setPackageId(pkg.getId());
            order.setCoinsAmount(pkg.getTotalCoins());
            order.setPriceMmk(pkg.getPriceMmk());
            order.setPaymentMethod(paymentMethod != null ? paymentMethod.toUpperCase() : "KPAY");
            order.setTransferId(transferId);
            order.setStatus(CoinOrder.Status.PENDING);

            if (screenshot != null && !screenshot.isEmpty()) {
                String ext = getExt(screenshot.getOriginalFilename());
                String name = "coin-order-" + UUID.randomUUID() + ext;
                Path dir = Paths.get("uploads/coin-orders");
                Files.createDirectories(dir);
                Files.copy(screenshot.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
                order.setScreenshotUrl("/uploads/coin-orders/" + name);
            }

            order = orderRepository.save(order);
            loggingService.info("COIN_SHOP", "CREATE_ORDER", user, "Created coin order #" + order.getId() + " for " + pkg.getName(), null);
            return ResponseEntity.ok(toOrderJson(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/my")
    public ResponseEntity<?> myOrders() {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        List<CoinOrder> list = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> out = new ArrayList<>();
        for (CoinOrder o : list) out.add(toOrderJson(o));
        return ResponseEntity.ok(out);
    }

    // ========== ADMIN ==========

    @GetMapping("/admin/orders")
    public ResponseEntity<?> adminOrders(@RequestParam(required = false) String status) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        List<CoinOrder> list;
        if (status != null && !status.isBlank() && !status.equals("ALL")) {
            list = orderRepository.findByStatusOrderByCreatedAtDesc(CoinOrder.Status.valueOf(status));
        } else {
            list = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (CoinOrder o : list) out.add(toOrderJson(o));
        return ResponseEntity.ok(out);
    }

    @PostMapping("/admin/orders/{id}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            UserAccount admin = currentUser();
            if (admin == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (admin.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
            CoinOrder order = orderRepository.findById(id).orElse(null);
            if (order == null) return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            if (order.getStatus() != CoinOrder.Status.PENDING) return ResponseEntity.badRequest().body(Map.of("error", "Order already processed"));

            UserAccount target = gymService.getUserById(order.getUserId());
            if (target == null) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            target.setCoinBalance((target.getCoinBalance() != null ? target.getCoinBalance() : 0) + order.getCoinsAmount());
            gymService.saveUserAccount(target);

            order.setStatus(CoinOrder.Status.APPROVED);
            order.setProcessedAt(LocalDateTime.now());
            if (body != null && body.get("adminNotes") != null) order.setAdminNotes(body.get("adminNotes"));
            orderRepository.save(order);

            loggingService.info("COIN_SHOP", "APPROVE_ORDER", admin, "Approved order #" + id + " +" + order.getCoinsAmount() + " coins to " + target.getUsername(), null);
            return ResponseEntity.ok(toOrderJson(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/orders/{id}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            UserAccount admin = currentUser();
            if (admin == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            if (admin.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
            CoinOrder order = orderRepository.findById(id).orElse(null);
            if (order == null) return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            if (order.getStatus() != CoinOrder.Status.PENDING) return ResponseEntity.badRequest().body(Map.of("error", "Order already processed"));

            order.setStatus(CoinOrder.Status.REJECTED);
            order.setProcessedAt(LocalDateTime.now());
            String reason = body != null ? body.getOrDefault("rejectionReason", body.getOrDefault("reason", "")) : "";
            order.setRejectionReason(reason);
            if (body != null && body.get("adminNotes") != null) order.setAdminNotes(body.get("adminNotes"));
            orderRepository.save(order);

            loggingService.info("COIN_SHOP", "REJECT_ORDER", admin, "Rejected order #" + id + " reason: " + reason, null);
            return ResponseEntity.ok(toOrderJson(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/packages")
    public ResponseEntity<?> createPackage(@RequestBody Map<String, Object> body) {
        UserAccount admin = currentUser();
        if (admin == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (admin.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        try {
            CoinPackage p = new CoinPackage();
            p.setName((String) body.get("name"));
            p.setCoins(Long.parseLong(body.get("coins").toString()));
            p.setBonusCoins(body.get("bonusCoins") != null ? Long.parseLong(body.get("bonusCoins").toString()) : 0L);
            p.setPriceMmk(Long.parseLong(body.get("priceMmk").toString()));
            p.setPopular(Boolean.TRUE.equals(body.get("popular")));
            p.setActive(body.get("active") == null || Boolean.parseBoolean(body.get("active").toString()));
            p.setBadgeText((String) body.get("badgeText"));
            p.setSortOrder(body.get("sortOrder") != null ? Integer.parseInt(body.get("sortOrder").toString()) : 0);
            p = packageRepository.save(p);
            return ResponseEntity.ok(toPackageJson(p));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PutMapping("/admin/packages/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        UserAccount admin = currentUser();
        if (admin == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (admin.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        CoinPackage p = packageRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.badRequest().body(Map.of("error", "Package not found"));
        try {
            if (body.get("name") != null) p.setName((String) body.get("name"));
            if (body.get("coins") != null) p.setCoins(Long.parseLong(body.get("coins").toString()));
            if (body.get("bonusCoins") != null) p.setBonusCoins(Long.parseLong(body.get("bonusCoins").toString()));
            if (body.get("priceMmk") != null) p.setPriceMmk(Long.parseLong(body.get("priceMmk").toString()));
            if (body.get("popular") != null) p.setPopular(Boolean.parseBoolean(body.get("popular").toString()));
            if (body.get("active") != null) p.setActive(Boolean.parseBoolean(body.get("active").toString()));
            if (body.get("badgeText") != null) p.setBadgeText((String) body.get("badgeText"));
            if (body.get("sortOrder") != null) p.setSortOrder(Integer.parseInt(body.get("sortOrder").toString()));
            p = packageRepository.save(p);
            return ResponseEntity.ok(toPackageJson(p));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @DeleteMapping("/admin/packages/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        UserAccount admin = currentUser();
        if (admin == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        if (admin.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        packageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private String getExt(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        if (ext.equals(".jpeg")) ext = ".jpg";
        return ext;
    }
}
