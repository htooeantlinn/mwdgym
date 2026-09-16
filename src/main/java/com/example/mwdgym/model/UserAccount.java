package com.example.mwdgym.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class UserAccount {

    public enum Role {
        ADMIN, STAFF, TRAINER, CLIENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "show_on_home", nullable = false)
    private boolean showOnHome = true;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "coin_balance")
    private Long coinBalance = 0L;

    @Column(name = "default_delivery_name", length = 100)
    private String defaultDeliveryName;

    @Column(name = "default_delivery_phone", length = 32)
    private String defaultDeliveryPhone;

    @Column(name = "default_delivery_address", length = 500)
    private String defaultDeliveryAddress;

    @Column(name = "default_delivery_city", length = 100)
    private String defaultDeliveryCity;

    @Column(name = "default_delivery_township", length = 100)
    private String defaultDeliveryTownship;

    @Column(name = "default_delivery_note", length = 500)
    private String defaultDeliveryNote;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_permissions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "permission")
    private Set<String> permissions = new LinkedHashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isShowOnHome() {
        return showOnHome;
    }

    public void setShowOnHome(boolean showOnHome) {
        this.showOnHome = showOnHome;
    }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<String> getPermissions() {
        return permissions;
    }

    public Long getCoinBalance() {
        return coinBalance;
    }

    public void setCoinBalance(Long coinBalance) {
        this.coinBalance = coinBalance;
    }

    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions == null ? new LinkedHashSet<>() : permissions;
    }

    public boolean hasPermission(String module) {
        return role == Role.ADMIN || (permissions != null && permissions.contains(module));
    }

    public String getDefaultDeliveryName() { return defaultDeliveryName; }
    public void setDefaultDeliveryName(String v) { this.defaultDeliveryName = v; }
    public String getDefaultDeliveryPhone() { return defaultDeliveryPhone; }
    public void setDefaultDeliveryPhone(String v) { this.defaultDeliveryPhone = v; }
    public String getDefaultDeliveryAddress() { return defaultDeliveryAddress; }
    public void setDefaultDeliveryAddress(String v) { this.defaultDeliveryAddress = v; }
    public String getDefaultDeliveryCity() { return defaultDeliveryCity; }
    public void setDefaultDeliveryCity(String v) { this.defaultDeliveryCity = v; }
    public String getDefaultDeliveryTownship() { return defaultDeliveryTownship; }
    public void setDefaultDeliveryTownship(String v) { this.defaultDeliveryTownship = v; }
    public String getDefaultDeliveryNote() { return defaultDeliveryNote; }
    public void setDefaultDeliveryNote(String v) { this.defaultDeliveryNote = v; }
}