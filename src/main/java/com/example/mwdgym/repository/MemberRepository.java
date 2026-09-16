package com.example.mwdgym.repository;

import com.example.mwdgym.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    List<Member> findTop6ByOrderByJoiningDateDesc();

    Optional<Member> findByUserUsername(String username);

    Optional<Member> findByUserId(Long userId);

    List<Member> findByNameContainingIgnoreCase(String name);

    List<Member> findByJoiningDate(LocalDate joiningDate);

    List<Member> findByContactContaining(String contact);

    List<Member> findByContactContainingIgnoreCase(String contact);

    List<Member> findByUserIsNull();

    List<Member> findByNameContainingIgnoreCaseAndJoiningDate(String name, LocalDate joiningDate);

    List<Member> findByNameContainingIgnoreCaseAndContactContaining(String name, String contact);

    List<Member> findByContactContainingAndJoiningDate(String contact, LocalDate joiningDate);

    List<Member> findByNameContainingIgnoreCaseAndJoiningDateAndContactContaining(String name, LocalDate joiningDate, String contact);

    List<Member> findByCardCodeContainingIgnoreCase(String cardCode);

    boolean existsByCardCodeIgnoreCase(String cardCode);
}