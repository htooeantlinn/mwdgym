package com.example.mwdgym.repository;

import com.example.mwdgym.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByMemberId(Long memberId);

    List<Payment> findByStatus(String status);

    List<Payment> findByDueDateBeforeAndStatus(LocalDate date, String status);
}