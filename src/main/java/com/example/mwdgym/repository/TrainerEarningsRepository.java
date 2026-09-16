package com.example.mwdgym.repository;

import com.example.mwdgym.model.TrainerEarnings;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerEarningsRepository extends JpaRepository<TrainerEarnings, Long> {

    List<TrainerEarnings> findByTrainerId(Long trainerId);

    List<TrainerEarnings> findByTrainerIdOrderByPeriodMonthDesc(Long trainerId);

    Optional<TrainerEarnings> findByTrainerIdAndPeriodMonth(Long trainerId, String periodMonth);

    List<TrainerEarnings> findByPeriodMonth(String periodMonth);

    List<TrainerEarnings> findByPayoutStatus(TrainerEarnings.PayoutStatus status);

    @Query("SELECT e FROM TrainerEarnings e WHERE e.payoutStatus = 'PENDING' ORDER BY e.createdAt ASC")
    List<TrainerEarnings> findPendingPayouts();

    @Query("SELECT e FROM TrainerEarnings e WHERE e.trainerId = :trainerId AND e.periodMonth >= :startMonth ORDER BY e.periodMonth DESC")
    List<TrainerEarnings> findEarningsSince(@Param("trainerId") Long trainerId, @Param("startMonth") String startMonth);

    @Query("SELECT SUM(e.grossRevenueMMK) FROM TrainerEarnings e WHERE e.trainerId = :trainerId")
    BigDecimal getTotalRevenueForTrainer(@Param("trainerId") Long trainerId);

    @Query("SELECT SUM(e.trainerPayoutAmountMMK) FROM TrainerEarnings e WHERE e.trainerId = :trainerId")
    BigDecimal getTotalPayoutForTrainer(@Param("trainerId") Long trainerId);

    @Query("SELECT SUM(e.gymCommissionAmountMMK) FROM TrainerEarnings e WHERE e.periodMonth = :periodMonth")
    BigDecimal getTotalGymCommissionForMonth(@Param("periodMonth") String periodMonth);

    @Query("SELECT SUM(e.grossRevenueMMK) FROM TrainerEarnings e WHERE e.periodMonth = :periodMonth")
    BigDecimal getTotalMarketplaceRevenueForMonth(@Param("periodMonth") String periodMonth);

    @Query("SELECT e FROM TrainerEarnings e WHERE e.periodMonth = :periodMonth ORDER BY e.grossRevenueMMK DESC")
    List<TrainerEarnings> getTopTrainersForMonth(@Param("periodMonth") String periodMonth, Pageable pageable);

    long countByPayoutStatus(TrainerEarnings.PayoutStatus status);

    long countByPeriodMonth(String periodMonth);
}
