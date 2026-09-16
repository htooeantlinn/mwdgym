package com.example.mwdgym.api;

import com.example.mwdgym.model.InventoryItem;
import com.example.mwdgym.service.GymService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class ApiInventoryController {

    private final GymService gymService;

    public ApiInventoryController(GymService gymService) {
        this.gymService = gymService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        List<InventoryItem> items = gymService.getAllInventoryItems();
        long inStock = items.stream().filter(i -> i.getStockQuantity() > 0).count();
        long outOfStock = items.stream().filter(i -> i.getStockQuantity() == 0).count();
        return ResponseEntity.ok(Map.of(
                "items", items,
                "total", items.size(),
                "inStock", inStock,
                "outOfStock", outOfStock));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return gymService.getAllInventoryItems().stream()
                .filter(i -> i.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InventoryItem item) {
        item.setId(null);
        item = gymService.saveInventoryItem(item);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InventoryItem item) {
        item.setId(id);
        item = gymService.saveInventoryItem(item);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        gymService.deleteInventoryItem(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/adjust")
    public ResponseEntity<?> adjust(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        int change = body.getOrDefault("change", 0);
        gymService.adjustInventoryStock(id, change);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
