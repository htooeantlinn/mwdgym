package com.example.mwdgym.repository;

import com.example.mwdgym.model.PlanFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanFeatureRepository extends JpaRepository<PlanFeature, Long> {

    List<PlanFeature> findByPlanIdOrderBySortOrderAsc(Long planId);

    void deleteByPlanId(Long planId);
}