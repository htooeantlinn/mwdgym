package com.example.mwdgym.repository;

import com.example.mwdgym.model.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    List<WorkoutPlan> findAllByOrderByUpdatedAtDesc();
}
