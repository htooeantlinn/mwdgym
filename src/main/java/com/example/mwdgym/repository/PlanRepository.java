package com.example.mwdgym.repository;

import com.example.mwdgym.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findAllByOrderByCategoryAscDurationDaysAsc();

    List<Plan> findByActiveTrueOrderByCategoryAscDurationDaysAsc();

    List<Plan> findByCategoryAndActiveTrueOrderByDurationDaysAsc(Plan.PlanCategory category);

    Optional<Plan> findByPlanNameIgnoreCase(String planName);
}