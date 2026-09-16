package com.example.mwdgym.repository;

import com.example.mwdgym.model.DietPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DietPlanRepository extends JpaRepository<DietPlan, Long> {
    List<DietPlan> findAllByOrderByUpdatedAtDesc();
}