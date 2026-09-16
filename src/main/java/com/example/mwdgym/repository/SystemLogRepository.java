package com.example.mwdgym.repository;

import com.example.mwdgym.model.SystemLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    List<SystemLog> findByOrderByCreatedAtDescIdDesc(Pageable pageable);

    List<SystemLog> findByCategoryContainingIgnoreCaseOrderByCreatedAtDescIdDesc(String category, Pageable pageable);

    List<SystemLog> findByLevelContainingIgnoreCaseOrderByCreatedAtDescIdDesc(String level, Pageable pageable);

    List<SystemLog> findByActorContainingIgnoreCaseOrderByCreatedAtDescIdDesc(String actor, Pageable pageable);

    long count();
}
