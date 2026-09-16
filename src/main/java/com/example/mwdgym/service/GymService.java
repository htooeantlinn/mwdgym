package com.example.mwdgym.service;

import com.example.mwdgym.model.InventoryItem;
import com.example.mwdgym.model.Member;
import com.example.mwdgym.model.Payment;
import com.example.mwdgym.model.Plan;
import com.example.mwdgym.model.PlanFeature;
import com.example.mwdgym.model.PurchaseTransaction;
import com.example.mwdgym.model.SiteSetting;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.InventoryItemRepository;
import com.example.mwdgym.repository.MemberRepository;
import com.example.mwdgym.repository.PaymentRepository;
import com.example.mwdgym.repository.PlanFeatureRepository;
import com.example.mwdgym.repository.PlanRepository;
import com.example.mwdgym.repository.PurchaseTransactionRepository;
import com.example.mwdgym.repository.SiteSettingRepository;
import com.example.mwdgym.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class GymService {

    public static final Set<String> DEFAULT_MODULES = Set.of("MEMBERS", "PAYMENTS", "INVENTORY");

    public static final Map<String, String> DEFAULT_SETTINGS = Map.ofEntries(
            Map.entry("gym_name", "MWD GYM"),
            Map.entry("gym_slogan", "Build Strength, Discipline, & Community"),
            Map.entry("gym_phone", "09-XXX XXX XXX"),
            Map.entry("gym_email", "info@mwdgym.com"),
            Map.entry("gym_address", "Myawaddy, Myanmar"),
            Map.entry("gym_hours", "Mon - Sun: 6:00 AM - 10:00 PM"),
            Map.entry("announcement_enabled", "true"),
            Map.entry("announcement", "Limited - First 50 new members get +100 bonus coins"),
            Map.entry("announcement_cta", "Claim Now ->"),
            Map.entry("announcement_url", "/signup"),
            Map.entry("marketplace_video_max_mb", "50"),
            // legacy keys for backwards compat
            Map.entry("address", "Myawaddy, Myanmar"),
            Map.entry("phone", "09-XXX XXX XXX"),
            Map.entry("contact_email", "info@mwdgym.com"),
            Map.entry("hours_morning", "6:00 AM - 11:00 AM"),
            Map.entry("hours_evening", "3:00 PM - 8:00 PM"));

    private final MemberRepository memberRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final PurchaseTransactionRepository transactionRepository;
    private final UserAccountRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final PlanRepository planRepository;
    private final PlanFeatureRepository planFeatureRepository;
    private final SiteSettingRepository siteSettingRepository;
    private final PasswordEncoder passwordEncoder;

    public GymService(MemberRepository memberRepository,
                      InventoryItemRepository inventoryItemRepository,
                      PurchaseTransactionRepository transactionRepository,
                      UserAccountRepository userRepository,
                      PaymentRepository paymentRepository,
                      PlanRepository planRepository,
                      PlanFeatureRepository planFeatureRepository,
                      SiteSettingRepository siteSettingRepository,
                      PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.planRepository = planRepository;
        this.planFeatureRepository = planFeatureRepository;
        this.siteSettingRepository = siteSettingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- Users / staff ----------

    public List<UserAccount> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserAccount> getStaffUsers() {
        return userRepository.findByRoleOrderByDisplayNameAsc(UserAccount.Role.ADMIN)
                .stream()
                .filter(UserAccount::isActive)
                .toList();
    }

    public List<UserAccount> getTrainers() {
        return userRepository.findByRoleOrderByDisplayNameAsc(UserAccount.Role.TRAINER)
                .stream()
                .filter(UserAccount::isActive)
                .toList();
    }

    public UserAccount getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public UserAccount getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public UserAccount saveUserAccount(UserAccount user) {
        return userRepository.save(user);
    }

    public void toggleUserActive(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(!user.isActive());
            userRepository.save(user);
        });
    }

    public void deleteUserAccount(Long id) {
        memberRepository.findAll().forEach(m -> {
            if (m.getTrainer() != null && m.getTrainer().getId().equals(id)) {
                m.setTrainer(null);
                memberRepository.save(m);
            }
        });
        userRepository.deleteById(id);
    }

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public UserAccount registerClient(String fullName, String contact, String username, String rawPassword) {
        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setDisplayName(fullName);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(UserAccount.Role.CLIENT);
        user.setActive(true);
        user = userRepository.save(user);

        Member member = findWalkInByContact(contact);
        if (member == null) {
            member = new Member();
            member.setName(fullName);
            member.setContact(contact);
            member.setJoiningDate(LocalDate.now());
            member.setStatus(deriveStatus(null, null, null));
        } else {
            member.setName(fullName);
            member.setContact(contact);
        }
        member.setUser(user);
        saveMember(member);
        return user;
    }

    public Member findWalkInByContact(String contact) {
        if (contact == null || contact.isBlank()) {
            return null;
        }
        String phone = contact.trim().replaceAll("[^0-9+]", "");
        return memberRepository.findByContactContainingIgnoreCase(contact.trim()).stream()
                .filter(m -> m.getUser() == null)
                .filter(m -> {
                    if (m.getContact() == null) {
                        return false;
                    }
                    String clean = m.getContact().replaceAll("[^0-9+]", "");
                    return clean.equals(phone) || clean.contains(phone) || phone.contains(clean);
                })
                .findFirst()
                .orElse(null);
    }

    public boolean memberContactExists(String contact) {
        if (contact == null || contact.isBlank()) {
            return false;
        }
        String phone = contact.trim().replaceAll("[^0-9+]", "");
        return memberRepository.findByContactContainingIgnoreCase(contact.trim()).stream()
                .map(Member::getContact)
                .filter(java.util.Objects::nonNull)
                .anyMatch(c -> {
                    String clean = c.replaceAll("[^0-9+]", "");
                    return clean.equals(phone);
                });
    }

    public String deriveStatus(LocalDate startDate, LocalDate endDate, String currentStatus) {
        if ("Inactive".equalsIgnoreCase(currentStatus)) {
            return "Inactive";
        }
        if (startDate != null && endDate != null) {
            LocalDate today = LocalDate.now();
            if (today.isBefore(startDate)) {
                return "Not Started";
            }
            if (today.isAfter(endDate)) {
                return "Expired";
            }
        }
        return "Active";
    }

    public void refreshMemberStatuses() {
        for (Member m : memberRepository.findAll()) {
            String derived = deriveStatus(m.getStartDate(), m.getEndDate(), m.getStatus());
            if (!derived.equals(m.getStatus())) {
                m.setStatus(derived);
                memberRepository.save(m);
            }
        }
    }

    // ---------- Members ----------

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id).orElse(null);
    }

    public Member getMemberByUserUsername(String username) {
        return memberRepository.findByUserUsername(username).orElse(null);
    }

    public Member saveMember(Member member) {
        if (member.getCardCode() == null || member.getCardCode().isBlank()) {
            member.setCardCode(nextCardCode());
        } else if (cardCodeTakenByOther(member)) {
            member.setCardCode(nextCardCode());
        }
        try {
            return memberRepository.save(member);
        } catch (DataIntegrityViolationException e) {
            member.setCardCode(nextCardCode());
            return memberRepository.save(member);
        }
    }

    private boolean cardCodeTakenByOther(Member member) {
        if (member.getCardCode() == null) {
            return false;
        }
        return memberRepository.findAll().stream()
                .anyMatch(m -> m.getCardCode() != null
                        && m.getCardCode().equalsIgnoreCase(member.getCardCode())
                        && !java.util.Objects.equals(m.getId(), member.getId()));
    }

    public String nextCardCode() {
        long max = 0L;
        for (Member m : memberRepository.findAll()) {
            if (m.getCardCode() != null && m.getCardCode().startsWith("MWD")) {
                try {
                    long n = Long.parseLong(m.getCardCode().substring(3));
                    if (n > max) {
                        max = n;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return "MWD" + String.format("%06d", max + 1);
    }

    public BigDecimal mmk(BigDecimal value) {
        return value == null ? null : value.setScale(0, RoundingMode.HALF_UP);
    }

    public Member findByCardCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        List<Member> matches = memberRepository.findByCardCodeContainingIgnoreCase(code.trim().toUpperCase());
        return matches.isEmpty() ? null : matches.get(0);
    }

    public List<Member> searchByCardCode(String code) {
        if (code == null || code.isBlank()) {
            return getAllMembers();
        }
        return memberRepository.findByCardCodeContainingIgnoreCase(code.trim());
    }

    private boolean allBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private boolean noneBlank(String... values) {
        for (String v : values) {
            if (v == null || v.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    public void deleteMember(Long id) {
        Member member = getMemberById(id);
        if (member != null && member.getUser() != null) {
            member.setTrainer(null);
            memberRepository.save(member);
            userRepository.deleteById(member.getUser().getId());
        }
        paymentRepository.deleteAll(getPaymentsByMemberId(id));
        memberRepository.deleteById(id);
    }

    public List<Member> searchMembers(String name, String joiningDate, String contact) {
        if ((name != null && !name.isEmpty()) && (joiningDate == null || joiningDate.isEmpty()) && (contact == null || contact.isEmpty())) {
            return memberRepository.findByNameContainingIgnoreCase(name);
        } else if ((joiningDate != null && !joiningDate.isEmpty()) && (name == null || name.isEmpty()) && (contact == null || contact.isEmpty())) {
            return memberRepository.findByJoiningDate(LocalDate.parse(joiningDate));
        } else if ((contact != null && !contact.isEmpty()) && (name == null || name.isEmpty()) && (joiningDate == null || joiningDate.isEmpty())) {
            return memberRepository.findByContactContaining(contact);
        } else if ((name != null && !name.isEmpty()) && (joiningDate != null && !joiningDate.isEmpty()) && (contact == null || contact.isEmpty())) {
            return memberRepository.findByNameContainingIgnoreCaseAndJoiningDate(name, LocalDate.parse(joiningDate));
        } else if ((name != null && !name.isEmpty()) && (contact != null && !contact.isEmpty()) && (joiningDate == null || joiningDate.isEmpty())) {
            return memberRepository.findByNameContainingIgnoreCaseAndContactContaining(name, contact);
        } else if ((contact != null && !contact.isEmpty()) && (joiningDate != null && !joiningDate.isEmpty()) && (name == null || name.isEmpty())) {
            return memberRepository.findByContactContainingAndJoiningDate(contact, LocalDate.parse(joiningDate));
        } else if ((name != null && !name.isEmpty()) && (joiningDate != null && !joiningDate.isEmpty()) && (contact != null && !contact.isEmpty())) {
            return memberRepository.findByNameContainingIgnoreCaseAndJoiningDateAndContactContaining(name, LocalDate.parse(joiningDate), contact);
        } else {
            return getAllMembers();
        }
    }

    public boolean isPremiumPlan(String planType) {
        if (planType == null) {
            return false;
        }
        return planRepository.findByPlanNameIgnoreCase(planType)
                .map(p -> p.getCategory() == Plan.PlanCategory.PREMIUM)
                .orElse(false);
    }

    // ---------- Member quick actions ----------

    public void setMemberActive(Long memberId, boolean active) {
        Member member = getMemberById(memberId);
        if (member != null) {
            member.setStatus(active ? "Active" : "Inactive");
            memberRepository.save(member);
        }
    }

    public void quickPay(Long memberId) {
        Member member = getMemberById(memberId);
        if (member == null) {
            return;
        }
        List<Payment> payments = getPaymentsByMemberId(memberId);
        Payment payment = payments.isEmpty() ? null : payments.get(payments.size() - 1);
        if (payment == null) {
            LocalDate created = member.getStartDate() != null ? member.getStartDate() : LocalDate.now();
            payment = newPaymentRow(member, created, created);
            savePayment(payment);
        }
        processPayment(payment);
    }

    private Payment newPaymentRow(Member member, LocalDate paymentDate, LocalDate periodStart) {
        Payment payment = new Payment();
        payment.setMember(member);
        payment.setAmount(mmk(member.getAmount()));
        payment.setPaymentDate(paymentDate);
        payment.setDueDate(dueDateFromPlan(member.getPlanType(), periodStart));
        payment.setStatus("Not Paid");
        payment.setTrainer(member.getTrainer());
        return payment;
    }

    private LocalDate nextCycleStart(Member member) {
        LocalDate today = LocalDate.now();
        LocalDate end = member.getEndDate();
        if (end == null || today.isAfter(end)) {
            return today;
        }
        return end;
    }

    public void markUnpaid(Long paymentId) {
        Payment payment = getPaymentById(paymentId);
        if (payment != null) {
            payment.setStatus("Not Paid");
            savePayment(payment);
        }
    }

    public void quickUnpaid(Long memberId) {
        List<Payment> payments = getPaymentsByMemberId(memberId);
        if (!payments.isEmpty()) {
            markUnpaid(payments.get(payments.size() - 1).getId());
        }
    }

    // ---------- Payments ----------

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByMemberId(Long memberId) {
        return paymentRepository.findByMemberId(memberId);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public void processPayment(Payment payment) {
        payment.setStatus("Paid");
        paymentRepository.save(payment);

        Member member = payment.getMember();
        if (member != null) {
            member.setStatus("Active");
            memberRepository.save(member);
        }
    }

    public List<Payment> getOverduePayments() {
        return paymentRepository.findByDueDateBeforeAndStatus(LocalDate.now(), "Not Paid");
    }

    public String renewMember(Long memberId, String planType, BigDecimal amount, Long trainerId, LocalDate startDate, LocalDate paymentDate) {
        Member member = getMemberById(memberId);
        if (member == null) {
            return "Member not found.";
        }
        Plan plan = (planType == null || planType.isBlank())
                ? null
                : planRepository.findByPlanNameIgnoreCase(planType).orElse(null);
        if (plan == null) {
            return "Please select an active plan for the renewal.";
        }
        boolean premium = plan.getCategory() == Plan.PlanCategory.PREMIUM;
        UserAccount trainer = null;
        if (premium) {
            if (trainerId != null) {
                trainer = getUserById(trainerId);
                if (trainer == null) {
                    return "Selected personal trainer no longer exists. Pick another one.";
                }
            } else {
                trainer = member.getTrainer();
            }
            if (trainer == null) {
                return "Premium plans require a Personal Trainer. Assign one to continue.";
            }
        }
        BigDecimal paid = mmk(amount != null && amount.signum() > 0 ? amount : plan.getPrice());
        LocalDate periodStart = startDate != null ? startDate : nextCycleStart(member);
        LocalDate paidOn = paymentDate != null ? paymentDate : LocalDate.now();

        member.setPlanType(plan.getPlanName());
        member.setAmount(paid);
        member.setTrainer(premium ? trainer : null);
        member.setStartDate(periodStart);
        member.setEndDate(endDateFromPlan(plan.getPlanName(), periodStart));
        memberRepository.save(member);

        List<Payment> payments = getPaymentsByMemberId(memberId);
        Payment open = payments.stream()
                .filter(p -> "Not Paid".equals(p.getStatus()))
                .findFirst()
                .orElse(null);
        Payment target;
        if (open != null) {
            open.setAmount(paid);
            open.setPaymentDate(paidOn);
            open.setDueDate(dueDateFromPlan(plan.getPlanName(), periodStart));
            open.setTrainer(member.getTrainer());
            savePayment(open);
            target = open;
        } else {
            target = newPaymentRow(member, paidOn, periodStart);
            target.setTrainer(member.getTrainer());
            savePayment(target);
        }
        processPayment(target);
        return null;
    }

    // ---------- Plan-aware dates ----------

    public int planDurationDays(String planType) {
        if (planType == null) {
            return 30;
        }
        return planRepository.findByPlanNameIgnoreCase(planType)
                .map(Plan::getDurationDays)
                .filter(days -> days > 0)
                .orElse(30);
    }

    public LocalDate endDateFromPlan(String planType, LocalDate startDate) {
        return startDate.plusDays(planDurationDays(planType));
    }

    public LocalDate dueDateFromPlan(String planType, LocalDate startDate) {
        return startDate.plusDays(Math.max(1, planDurationDays(planType) / 2));
    }

    // ---------- Plans ----------

    public List<Plan> getAllPlans() {
        return planRepository.findAllByOrderByCategoryAscDurationDaysAsc();
    }

    public List<Plan> getActivePlans() {
        return planRepository.findByActiveTrueOrderByCategoryAscDurationDaysAsc();
    }

    public Plan getPlanById(Long id) {
        return planRepository.findById(id).orElse(null);
    }

    public Plan savePlan(Plan plan) {
        plan.setPrice(mmk(plan.getPrice()));
        return planRepository.save(plan);
    }

    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }

    public void togglePlanActive(Long id) {
        planRepository.findById(id).ifPresent(plan -> {
            plan.setActive(!plan.isActive());
            planRepository.save(plan);
        });
    }

    // ---------- Inventory ----------

    public List<InventoryItem> getAllInventoryItems() {
        return inventoryItemRepository.findAll();
    }

    public InventoryItem saveInventoryItem(InventoryItem item) {
        return inventoryItemRepository.save(item);
    }

    public void adjustInventoryStock(Long id, int change) {
        inventoryItemRepository.findById(id).ifPresent(item -> {
            item.setStockQuantity(Math.max(0, item.getStockQuantity() + change));
            inventoryItemRepository.save(item);
        });
    }

    public void deleteInventoryItem(Long id) {
        inventoryItemRepository.deleteById(id);
    }

    // ---------- Site settings / homepage control ----------

    public Map<String, String> getSiteSettings() {
        Map<String, String> result = new LinkedHashMap<>(DEFAULT_SETTINGS);
        siteSettingRepository.findAll().forEach(s -> result.put(s.getSettingKey(), s.getSettingValue()));
        for (Map.Entry<String, String> entry : DEFAULT_SETTINGS.entrySet()) {
            if (!result.containsKey(entry.getKey())) {
                SiteSetting setting = new SiteSetting();
                setting.setSettingKey(entry.getKey());
                setting.setSettingValue(entry.getValue());
                siteSettingRepository.save(setting);
            }
        }
        return result;
    }

    public String getSetting(String key) {
        return siteSettingRepository.findBySettingKey(key)
                .map(SiteSetting::getSettingValue)
                .filter(value -> value != null && !value.isBlank())
                .orElseGet(() -> DEFAULT_SETTINGS.getOrDefault(key, ""));
    }

    @Transactional
    public void saveSiteSettings(Map<String, String> values) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key == null || value == null) continue;
            // save any key provided by frontend, not just defaults
            SiteSetting setting = siteSettingRepository.findBySettingKey(key)
                    .orElseGet(() -> {
                        SiteSetting created = new SiteSetting();
                        created.setSettingKey(key);
                        return created;
                    });
            setting.setSettingValue(value.trim());
            siteSettingRepository.save(setting);
            // keep legacy sync: gym_address <-> address, gym_phone <-> phone, gym_email <-> contact_email, gym_hours <-> hours_morning/evening
            if ("gym_address".equals(key)) syncLegacy("address", value);
            if ("address".equals(key)) syncLegacy("gym_address", value);
            if ("gym_phone".equals(key)) syncLegacy("phone", value);
            if ("phone".equals(key)) syncLegacy("gym_phone", value);
            if ("gym_email".equals(key)) syncLegacy("contact_email", value);
            if ("contact_email".equals(key)) syncLegacy("gym_email", value);
        }
    }

    private void syncLegacy(String key, String value) {
        try {
            SiteSetting s = siteSettingRepository.findBySettingKey(key).orElseGet(() -> {
                SiteSetting c = new SiteSetting();
                c.setSettingKey(key);
                return c;
            });
            s.setSettingValue(value.trim());
            siteSettingRepository.save(s);
        } catch (Exception ignored) {}
    }

    public List<PlanFeature> getPlanFeatures(Long planId) {
        return planFeatureRepository.findByPlanIdOrderBySortOrderAsc(planId);
    }

    @Transactional
    public void savePlanFeatures(Long planId, List<String> texts) {
        planFeatureRepository.deleteByPlanId(planId);
        if (texts == null) {
            return;
        }
        Plan plan = getPlanById(planId);
        if (plan == null) {
            return;
        }
        int order = 0;
        for (String text : texts) {
            if (text == null || text.isBlank()) {
                continue;
            }
            PlanFeature feature = new PlanFeature();
            feature.setPlan(plan);
            feature.setFeatureText(text.trim());
            feature.setSortOrder(order++);
            planFeatureRepository.save(feature);
        }
    }

    public List<Plan> getHomePlans() {
        return planRepository.findByActiveTrueOrderByCategoryAscDurationDaysAsc().stream()
                .filter(Plan::isShowOnHome)
                .toList();
    }

    public List<UserAccount> getHomeTrainers() {
        return userRepository.findByRoleOrderByDisplayNameAsc(UserAccount.Role.TRAINER)
                .stream()
                .filter(UserAccount::isActive)
                .filter(UserAccount::isShowOnHome)
                .toList();
    }

    @Transactional
    public void setTrainerShowOnHome(Long userId, boolean showOnHome) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setShowOnHome(showOnHome);
            userRepository.save(user);
        });
    }

    // ---------- POS ----------

    public List<PurchaseTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // ---------- Overview / live stats ----------

    public Map<String, Object> overviewStats() {
        refreshMemberStatuses();
        List<Member> members = getAllMembers();
        long memberCount = members.size();
        long activeCount = members.stream().filter(m -> "Active".equalsIgnoreCase(m.getStatus())).count();
        long expiredCount = members.stream().filter(m -> "Expired".equalsIgnoreCase(m.getStatus())).count();

        LocalDate today = LocalDate.now();
        YearMonth month = YearMonth.from(today);

        long unpaidCount = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        for (Payment p : getAllPayments()) {
            if ("Not Paid".equals(p.getStatus())) {
                unpaidCount++;
            }
            if ("Paid".equals(p.getStatus()) && p.getPaymentDate() != null
                    && YearMonth.from(p.getPaymentDate()).equals(month)) {
                revenue = revenue.add(p.getAmount() == null ? BigDecimal.ZERO : p.getAmount());
            }
        }

        List<Member> expiringSoon = members.stream()
                .filter(m -> m.getEndDate() != null)
                .filter(m -> !m.getEndDate().isBefore(today) && !m.getEndDate().isAfter(today.plusDays(7)))
                .sorted((a, b) -> a.getEndDate().compareTo(b.getEndDate()))
                .limit(6)
                .toList();

        List<Payment> overdue = getOverduePayments().stream()
                .sorted((a, b) -> a.getDueDate().compareTo(b.getDueDate()))
                .limit(6)
                .toList();

        List<Member> recent = memberRepository.findTop6ByOrderByJoiningDateDesc();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("memberCount", memberCount);
        stats.put("activeCount", activeCount);
        stats.put("expiredCount", expiredCount);
        stats.put("unpaidCount", unpaidCount);
        stats.put("revenueMmk", revenue);
        stats.put("planCount", getAllPlans().size());
        stats.put("trainerCount", getTrainers().size());
        stats.put("overdueCount", getOverduePayments().size());
        stats.put("expiringSoonCount", expiringSoon.size());
        stats.put("expiringSoon", expiringSoon);
        stats.put("overdue", overdue);
        stats.put("recent", recent);
        return stats;
    }

    public List<Member> todaysRenewals() {
        return memberRepository.findAll().stream()
                .filter(m -> m.getEndDate() != null && m.getEndDate().equals(LocalDate.now()))
                .toList();
    }

    // ---------- Overview analysis / charts ----------

    public Map<String, Object> revenueTrend() {
        return revenueTrend(6);
    }

    /**
     * Build a revenue trend over the given number of trailing months.
     * Pass -1 for "all time" — will auto-detect the earliest paid payment month.
     * Pass 0 for "year to date" — January of the current year through now.
     */
    public Map<String, Object> revenueTrend(int months) {
        List<Payment> allPaid = getAllPayments().stream()
                .filter(p -> "Paid".equals(p.getStatus()) && p.getPaymentDate() != null)
                .toList();

        YearMonth now = YearMonth.now();
        YearMonth from;

        if (months == 0) {
            // Year to date: Jan of current year
            from = YearMonth.of(now.getYear(), 1);
        } else if (months < 0) {
            // All time: earliest paid payment month, or 12 months back if no data
            from = allPaid.stream()
                    .map(p -> YearMonth.from(p.getPaymentDate()))
                    .min(YearMonth::compareTo)
                    .orElse(now.minusMonths(11));
        } else {
            from = now.minusMonths(months - 1);
        }

        List<String> labels  = new ArrayList<>();
        List<BigDecimal> values = new ArrayList<>();
        YearMonth cursor = from;
        while (!cursor.isAfter(now)) {
            final YearMonth ym = cursor;
            labels.add(ym.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            BigDecimal sum = allPaid.stream()
                    .filter(p -> YearMonth.from(p.getPaymentDate()).equals(ym))
                    .map(Payment::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            values.add(sum);
            cursor = cursor.plusMonths(1);
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("labels",  labels);
        m.put("values",  values);
        return m;
    }

    public List<Map<String, Object>> planDistribution() {
        Map<String, Long> byPlan = new LinkedHashMap<>();
        for (Member mbr : getAllMembers()) {
            String key = mbr.getPlanType() == null || mbr.getPlanType().isBlank() ? "No Plan" : mbr.getPlanType();
            byPlan.merge(key, 1L, Long::sum);
        }
        List<Map<String, Object>> out = new ArrayList<>();
        byPlan.forEach((k, v) -> {
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("name", k);
            e.put("count", v);
            e.put("premium", isPremiumPlan(k));
            out.add(e);
        });
        return out;
    }

    public List<Map<String, Object>> trainerWorkload() {
        List<Map<String, Object>> out = new ArrayList<>();
        List<Member> members = getAllMembers();
        for (UserAccount t : getTrainers()) {
            long assigned = members.stream()
                    .filter(m -> m.getTrainer() != null && m.getTrainer().getId().equals(t.getId()))
                    .count();
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("name", t.getDisplayName());
            e.put("assigned", assigned);
            out.add(e);
        }
        return out;
    }

    public Map<String, Object> statusSplit() {
        List<Member> members = getAllMembers();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("active", members.stream().filter(x -> "Active".equalsIgnoreCase(x.getStatus())).count());
        m.put("inactive", members.size() - members.stream().filter(x -> "Active".equalsIgnoreCase(x.getStatus())).count());
        return m;
    }

    public Map<String, Object> paymentSplit() {
        List<Payment> payments = getAllPayments();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("paid", payments.stream().filter(p -> "Paid".equals(p.getStatus())).count());
        m.put("unpaid", payments.stream().filter(p -> "Not Paid".equals(p.getStatus())).count());
        return m;
    }

    public List<Map<String, Object>> topPlansByRevenue() {
        Map<String, BigDecimal> byPlan = new LinkedHashMap<>();
        for (Payment p : getAllPayments()) {
            if (!"Paid".equals(p.getStatus()) || p.getMember() == null || p.getAmount() == null) {
                continue;
            }
            String plan = p.getMember().getPlanType() == null || p.getMember().getPlanType().isBlank()
                    ? "No Plan" : p.getMember().getPlanType();
            byPlan.merge(plan, p.getAmount(), BigDecimal::add);
        }
        return byPlan.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("revenue", e.getValue());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Object> overviewSummary() {
        return overviewSummary(6);
    }

    public Map<String, Object> overviewSummary(int revRange) {
        refreshMemberStatuses();
        YearMonth month = YearMonth.now();
        List<Payment> payments = getAllPayments();
        BigDecimal revenue = payments.stream()
                .filter(p -> "Paid".equals(p.getStatus()) && p.getPaymentDate() != null
                        && YearMonth.from(p.getPaymentDate()).equals(month))
                .map(Payment::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> s = new LinkedHashMap<>();
        s.put("memberCount", getAllMembers().size());
        s.put("activeCount", getAllMembers().stream().filter(m -> "Active".equalsIgnoreCase(m.getStatus())).count());
        s.put("expiredCount", getAllMembers().stream().filter(m -> "Expired".equalsIgnoreCase(m.getStatus())).count());
        s.put("unpaidCount", payments.stream().filter(p -> "Not Paid".equals(p.getStatus())).count());
        s.put("overdueCount", getOverduePayments().size());
        s.put("revenueMmk", revenue);
        s.put("planCount", getAllPlans().size());
        s.put("trainerCount", getTrainers().size());
        LocalDate today = LocalDate.now();
        long expiringSoon = getAllMembers().stream()
                .filter(m -> m.getEndDate() != null)
                .filter(m -> !m.getEndDate().isBefore(today) && !m.getEndDate().isAfter(today.plusDays(7)))
                .count();
        s.put("expiringSoonCount", expiringSoon);
        s.put("revenueTrend", revenueTrend(revRange));
        s.put("planDist", planDistribution());
        s.put("statusSplit", statusSplit());
        s.put("paymentSplit", paymentSplit());
        s.put("trainerLoad", trainerWorkload());
        s.put("topPlans", topPlansByRevenue());
        return s;
    }

    // ---------- Scheduled status check ----------

    @Scheduled(cron = "0 0 0 * * ?")
    public void checkAndUpdateMemberStatus() {
        refreshMemberStatuses();
    }

    // ---------- Fresh-start bootstrap ----------

    public void createSampleDataIfEmpty() {
        if (userRepository.count() == 0) {
            saveUser("admin", "Admin", "admin123", UserAccount.Role.ADMIN);
        }
        normalizeModulePermissions();
        backfillCardCodes();
    }

    public void backfillCardCodes() {
        for (Member member : getAllMembers()) {
            if (member.getCardCode() == null || member.getCardCode().isBlank()) {
                member.setCardCode(nextCardCode());
                memberRepository.save(member);
            }
        }
    }

    public void normalizeModulePermissions() {
        for (UserAccount user : getAllUsers()) {
            if (user.getRole() == UserAccount.Role.STAFF || user.getRole() == UserAccount.Role.TRAINER) {
                if (user.getPermissions() == null || user.getPermissions().isEmpty()) {
                    user.setPermissions(new LinkedHashSet<>(DEFAULT_MODULES));
                    userRepository.save(user);
                }
            }
        }
    }

    private UserAccount saveUser(String username, String displayName, String rawPassword, UserAccount.Role role) {
        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }
}