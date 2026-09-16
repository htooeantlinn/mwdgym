package com.example.mwdgym.repository;

import com.example.mwdgym.model.ExerciseLibrary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseLibraryRepository extends JpaRepository<ExerciseLibrary, Long> {
    List<ExerciseLibrary> findByActiveTrueOrderByMuscleGroupAscSortOrderAsc();

    List<ExerciseLibrary> findByCreatedByAndActiveTrueOrderByMuscleGroupAscSortOrderAsc(Long createdBy);

    List<ExerciseLibrary> findByMuscleGroupAndActiveTrueOrderBySortOrderAsc(String muscleGroup);

    @Query("SELECT e FROM ExerciseLibrary e WHERE e.active = true AND (LOWER(e.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(e.muscleGroup) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<ExerciseLibrary> search(String q);
}
