package com.example.mwdgym.repository;

import com.example.mwdgym.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByUsername(String username);

    List<UserAccount> findByRoleOrderByDisplayNameAsc(UserAccount.Role role);

    boolean existsByUsername(String username);
}