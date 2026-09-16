package com.example.mwdgym.api;

import com.example.mwdgym.model.InventoryItem;
import com.example.mwdgym.model.ShopOrder;
import com.example.mwdgym.model.ShopOrderItem;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.InventoryItemRepository;
import com.example.mwdgym.repository.ShopOrderRepository;
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
import java.util.*;

@RestController
@RequestMapping("/api/shop")
public class ApiShopController {

    private final InventoryItemRepository itemRepository;
    private final ShopOrderRepository orderRepository;
    private final GymService gymService;
    private final LoggingService loggingService;

    public ApiShopController(InventoryItemRepository itemRepository,
                             ShopOrderRepository orderRepository,
                             GymService gymService,
                             LoggingService loggingService) {
        this.itemRepository = itemRepository;
        this.orderRepository = orderRepository;
        this.gymService = gymService;
        this.loggingService = loggingService;
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) return null;
        return gymService.getUserByUsername(auth.getName());
    }

    private Map<String, Object> toProductJson(InventoryItem item) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", item.getId());
        m.put("name", item.getItemName());
        m.put("itemName", item.getItemName());
        m.put("category", item.getCategory());
        m.put("unit", item.getUnit());
        m.put("description", item.getDescription());
        m.put("imageUrl", item.getImageUrl());
        m.put("images", item.getImages());
        m.put("imagesJson", item.getImagesJson());
        m.put("stockQuantity", item.getStockQuantity());
        m.put("priceMmk", item.getPriceMmk());
        m.put("priceCoins", item.getPriceMmk());
        m.put("unitCost", item.getPriceMmk());
        m.put("activeForShop", item.getActiveForShop());
        m.put("createdAt", item.getCreatedAt());
        return m;
    }

    private Map<String, Object> toOrderJson(ShopOrder o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("userId", o.getUserId());
        m.put("status", o.getStatus().name());
        m.put("totalMmk", o.getTotalMmk());
        m.put("totalCoins", o.getTotalMmk());
        m.put("deliveryName", o.getDeliveryName());
        m.put("deliveryPhone", o.getDeliveryPhone());
        m.put("deliveryAddress", o.getDeliveryAddress());
        m.put("deliveryCity", o.getDeliveryCity());
        m.put("deliveryTownship", o.getDeliveryTownship());
        m.put("deliveryNote", o.getDeliveryNote());
        m.put("createdAt", o.getCreatedAt());
        m.put("updatedAt", o.getUpdatedAt());
        List<Map<String, Object>> items = new ArrayList<>();
        for (ShopOrderItem it : o.getItems()) {
            Map<String, Object> im = new LinkedHashMap<>();
            im.put("id", it.getId());
            im.put("itemId", it.getItemId());
            im.put("itemName", it.getItemName());
            im.put("quantity", it.getQuantity());
            im.put("unitPriceMmk", it.getUnitPriceMmk());
            im.put("unitPriceCoins", it.getUnitPriceMmk());
            im.put("imageUrl", it.getImageUrl());
            items.add(im);
        }
        m.put("items", items);
        UserAccount u = gymService.getUserById(o.getUserId());
        if (u != null) { m.put("userName", u.getDisplayName()); m.put("username", u.getUsername()); }
        return m;
    }

    // ========== CATEGORIES (customizable) ==========

    private static final List<String> DEFAULT_CATS = List.of("Equipment","Supplement","Merchandise","Consumable");

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        Map<String,String> settings = gymService.getSiteSettings();
        String raw = settings.get("shop_categories");
        List<String> cats;
        try {
            if (raw != null && !raw.isBlank()) {
                // stored as JSON array string
                cats = new com.fasterxml.jackson.databind.ObjectMapper().readValue(raw, new com.fasterxml.jackson.core.type.TypeReference<List<String>>(){});
                if (cats == null || cats.isEmpty()) cats = DEFAULT_CATS;
            } else cats = DEFAULT_CATS;
        } catch (Exception e) { cats = DEFAULT_CATS; }
        return ResponseEntity.ok(cats);
    }

    @PutMapping("/admin/categories")
    public ResponseEntity<?> saveCategories(@RequestBody Map<String,Object> body) {
        UserAccount user = currentUser();
        if (user == null || user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error","Admin only"));
        Object catsObj = body.get("categories");
        List<String> cats;
        if (catsObj instanceof List) {
            cats = ((List<?>) catsObj).stream().map(Object::toString).map(String::trim).filter(s-> !s.isBlank()).toList();
        } else if (body.get("shop_categories") instanceof String) {
            try { cats = new com.fasterxml.jackson.databind.ObjectMapper().readValue((String)body.get("shop_categories"), new com.fasterxml.jackson.core.type.TypeReference<List<String>>(){}); } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error","Invalid JSON")); }
        } else return ResponseEntity.badRequest().body(Map.of("error","categories required"));
        if (cats.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","At least one category required"));
        try {
            String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(cats);
            gymService.saveSiteSettings(Map.of("shop_categories", json));
            return ResponseEntity.ok(Map.of("categories", cats));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    // ========== PRODUCTS (public for shop) ==========

    @GetMapping("/products")
    public ResponseEntity<?> products(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String keyword) {
        List<InventoryItem> all = itemRepository.findAll();
        List<Map<String, Object>> out = new ArrayList<>();
        for (InventoryItem item : all) {
            if (Boolean.FALSE.equals(item.getActiveForShop())) continue;
            if (category != null && !category.equalsIgnoreCase("ALL") && !category.equalsIgnoreCase(item.getCategory())) continue;
            if (keyword != null && !keyword.isBlank()) {
                String kw = keyword.toLowerCase();
                if (!item.getItemName().toLowerCase().contains(kw) && !(item.getDescription()!=null && item.getDescription().toLowerCase().contains(kw))) continue;
            }
            out.add(toProductJson(item));
        }
        return ResponseEntity.ok(out);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> productDetail(@PathVariable Long id) {
        InventoryItem item = itemRepository.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toProductJson(item));
    }

    @PostMapping(value = "/products/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProductImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        UserAccount user = currentUser();
        if (user == null || user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error","Admin only"));
        InventoryItem item = itemRepository.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","No file"));
        if (file.getSize() > 5*1024*1024) return ResponseEntity.badRequest().body(Map.of("error","Max 5MB"));
        try {
            String fn = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "img.jpg";
            String ext = fn.contains(".") ? fn.substring(fn.lastIndexOf(".")) : ".jpg";
            if (ext.equals(".jpeg")) ext = ".jpg";
            String name = "product-" + id + "-" + UUID.randomUUID() + ext;
            Path dir = Paths.get("uploads/products");
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/products/" + name;
            List<String> images = new ArrayList<>(item.getImages());
            images.add(url);
            item.setImages(images);
            itemRepository.save(item);
            return ResponseEntity.ok(Map.of("imageUrl", url, "images", images));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}/image")
    public ResponseEntity<?> deleteProductImage(@PathVariable Long id, @RequestParam String url) {
        UserAccount user = currentUser();
        if (user == null || user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error","Admin only"));
        InventoryItem item = itemRepository.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        List<String> images = new ArrayList<>(item.getImages());
        images.remove(url);
        item.setImages(images.isEmpty() ? null : images);
        if (images.isEmpty()) { item.setImageUrl(null); item.setImagesJson(null); }
        itemRepository.save(item);
        try { if (url.startsWith("/uploads/products/")) Files.deleteIfExists(Paths.get("uploads/products/" + url.substring("/uploads/products/".length()))); } catch (Exception ignored) {}
        return ResponseEntity.ok(Map.of("images", item.getImages()));
    }

    // ========== ORDERS ==========

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error","Login required"));

        List<Map<String,Object>> itemsRaw = (List<Map<String,Object>>) body.get("items");
        if (itemsRaw == null || itemsRaw.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","Cart is empty"));

        String deliveryName = (String) body.getOrDefault("deliveryName", user.getDefaultDeliveryName() != null ? user.getDefaultDeliveryName() : user.getDisplayName());
        String deliveryPhone = (String) body.getOrDefault("deliveryPhone", user.getDefaultDeliveryPhone());
        String deliveryAddress = (String) body.getOrDefault("deliveryAddress", user.getDefaultDeliveryAddress());
        String deliveryCity = (String) body.getOrDefault("deliveryCity", user.getDefaultDeliveryCity());
        String deliveryTownship = (String) body.getOrDefault("deliveryTownship", user.getDefaultDeliveryTownship());
        String deliveryNote = (String) body.getOrDefault("deliveryNote", user.getDefaultDeliveryNote());

        if (deliveryAddress == null || deliveryAddress.isBlank()) return ResponseEntity.badRequest().body(Map.of("error","Delivery address required. Please set in Profile."));

        ShopOrder order = new ShopOrder();
        order.setUserId(user.getId());
        order.setDeliveryName(deliveryName);
        order.setDeliveryPhone(deliveryPhone);
        order.setDeliveryAddress(deliveryAddress);
        order.setDeliveryCity(deliveryCity);
        order.setDeliveryTownship(deliveryTownship);
        order.setDeliveryNote(deliveryNote);
        order.setStatus(ShopOrder.Status.PENDING);

        long total = 0;
        List<ShopOrderItem> orderItems = new ArrayList<>();
        for (Map<String,Object> r : itemsRaw) {
            Long itemId = Long.valueOf(r.get("itemId").toString());
            Integer qty = Integer.valueOf(r.get("quantity").toString());
            if (qty <= 0) continue;
            InventoryItem product = itemRepository.findById(itemId).orElse(null);
            if (product == null) return ResponseEntity.badRequest().body(Map.of("error","Product #"+itemId+" not found"));
            if (product.getStockQuantity() < qty) return ResponseEntity.badRequest().body(Map.of("error", product.getItemName()+" only "+product.getStockQuantity()+" in stock"));
            ShopOrderItem oi = new ShopOrderItem();
            oi.setItemId(product.getId());
            oi.setItemName(product.getItemName());
            oi.setQuantity(qty);
            oi.setUnitPriceMmk(product.getPriceMmk());
            oi.setImageUrl(product.getImageUrl());
            orderItems.add(oi);
            total += product.getPriceMmk() * qty;
        }
        if (orderItems.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","No valid items"));

        long coinBalance = user.getCoinBalance() != null ? user.getCoinBalance() : 0L;
        if (coinBalance < total) return ResponseEntity.badRequest().body(Map.of("error","Insufficient coins. Need "+total+" coins but you have "+coinBalance));

        // deduct stock & coins
        for (ShopOrderItem oi : orderItems) {
            InventoryItem p = itemRepository.findById(oi.getItemId()).orElse(null);
            if (p != null) { p.setStockQuantity(p.getStockQuantity() - oi.getQuantity()); itemRepository.save(p); }
        }
        user.setCoinBalance(coinBalance - total);
        gymService.saveUserAccount(user);

        order.setTotalMmk(total);
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Save delivery as default if not set
        if (user.getDefaultDeliveryAddress() == null || user.getDefaultDeliveryAddress().isBlank()) {
            user.setDefaultDeliveryName(deliveryName);
            user.setDefaultDeliveryPhone(deliveryPhone);
            user.setDefaultDeliveryAddress(deliveryAddress);
            user.setDefaultDeliveryCity(deliveryCity);
            user.setDefaultDeliveryTownship(deliveryTownship);
            user.setDefaultDeliveryNote(deliveryNote);
            gymService.saveUserAccount(user);
        }

        loggingService.info("SHOP", "CREATE_ORDER", user, "Created shop order #"+order.getId()+" total "+total+" coins", null);
        Map<String,Object> resp = toOrderJson(order);
        resp.put("newCoinBalance", user.getCoinBalance());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/orders/my")
    public ResponseEntity<?> myOrders() {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        List<ShopOrder> list = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String,Object>> out = new ArrayList<>();
        for (ShopOrder o : list) out.add(toOrderJson(o));
        return ResponseEntity.ok(out);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        ShopOrder o = orderRepository.findById(id).orElse(null);
        if (o == null) return ResponseEntity.notFound().build();
        if (!o.getUserId().equals(user.getId()) && user.getRole() != UserAccount.Role.ADMIN)
            return ResponseEntity.status(403).body(Map.of("error","Forbidden"));
        return ResponseEntity.ok(toOrderJson(o));
    }

    @GetMapping("/orders/{id}/voucher")
    public ResponseEntity<?> voucher(@PathVariable Long id) {
        UserAccount user = currentUser();
        if (user == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        ShopOrder o = orderRepository.findById(id).orElse(null);
        if (o == null) return ResponseEntity.notFound().build();
        if (!o.getUserId().equals(user.getId()) && user.getRole() != UserAccount.Role.ADMIN)
            return ResponseEntity.status(403).body(Map.of("error","Forbidden"));
        Map<String,Object> voucher = new LinkedHashMap<>(toOrderJson(o));
        Map<String,String> settings = gymService.getSiteSettings();
        voucher.put("gymName", settings.getOrDefault("gym_name","MWD GYM"));
        voucher.put("gymPhone", settings.getOrDefault("gym_phone", settings.getOrDefault("phone","")));
        voucher.put("gymAddress", settings.getOrDefault("gym_address", settings.getOrDefault("address","")));
        voucher.put("voucherNo", String.format("MWD-%06d", o.getId()));
        voucher.put("printedAt", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(voucher);
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> adminOrders() {
        UserAccount user = currentUser();
        if (user == null || user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error","Admin only"));
        List<ShopOrder> list = orderRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String,Object>> out = new ArrayList<>();
        for (ShopOrder o : list) out.add(toOrderJson(o));
        return ResponseEntity.ok(out);
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        UserAccount user = currentUser();
        if (user == null || user.getRole() != UserAccount.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error","Admin only"));
        ShopOrder o = orderRepository.findById(id).orElse(null);
        if (o == null) return ResponseEntity.notFound().build();
        String statusStr = body.get("status");
        if (statusStr == null) return ResponseEntity.badRequest().body(Map.of("error","status required"));
        try {
            ShopOrder.Status s = ShopOrder.Status.valueOf(statusStr.toUpperCase());
            // if cancelled, restore stock & coins
            if (s == ShopOrder.Status.CANCELLED && o.getStatus() != ShopOrder.Status.CANCELLED) {
                for (ShopOrderItem it : o.getItems()) {
                    InventoryItem p = itemRepository.findById(it.getItemId()).orElse(null);
                    if (p != null) { p.setStockQuantity(p.getStockQuantity() + it.getQuantity()); itemRepository.save(p); }
                }
                UserAccount buyer = gymService.getUserById(o.getUserId());
                if (buyer != null) {
                    long refund = o.getTotalMmk() != null ? o.getTotalMmk() : 0;
                    buyer.setCoinBalance((buyer.getCoinBalance()!=null?buyer.getCoinBalance():0) + refund);
                    gymService.saveUserAccount(buyer);
                }
            }
            o.setStatus(s);
            orderRepository.save(o);
            loggingService.info("SHOP", "UPDATE_ORDER", user, "Order #"+id+" -> "+s, null);
            return ResponseEntity.ok(toOrderJson(o));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error","Invalid status"));
        }
    }
}
