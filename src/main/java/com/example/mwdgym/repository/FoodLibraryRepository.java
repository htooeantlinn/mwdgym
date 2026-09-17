package com.example.mwdgym.repository;

import com.example.mwdgym.model.FoodLibrary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodLibraryRepository extends JpaRepository<FoodLibrary, Long> {
    List<FoodLibrary> findByActiveTrueOrderByCategoryAscSortOrderAsc();

    List<FoodLibrary> findByCreatedByAndActiveTrueOrderByCategoryAscSortOrderAsc(Long createdBy);

    List<FoodLibrary> findByCategoryAndActiveTrueOrderBySortOrderAsc(String category);

    @Query("SELECT f FROM FoodLibrary f WHERE f.active = true AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(f.category) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<FoodLibrary> search(String q);
}
