package com.example.mwdgym.repository;

import com.example.mwdgym.model.CoinPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoinPackageRepository extends JpaRepository<CoinPackage, Long> {
    List<CoinPackage> findAllByOrderBySortOrderAscIdAsc();
    List<CoinPackage> findByActiveTrueOrderBySortOrderAscIdAsc();
}
