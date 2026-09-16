package com.example.mwdgym.repository;

import com.example.mwdgym.model.CoinOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoinOrderRepository extends JpaRepository<CoinOrder, Long> {
    List<CoinOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CoinOrder> findAllByOrderByCreatedAtDesc();
    List<CoinOrder> findByStatusOrderByCreatedAtDesc(CoinOrder.Status status);
}
