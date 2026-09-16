package com.example.mwdgym.repository;

import com.example.mwdgym.model.ShopOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {
    List<ShopOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ShopOrder> findAllByOrderByCreatedAtDesc();
}
