package com.example.mwdgym.service;

import com.example.mwdgym.model.ChatMessage;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.repository.ChatMessageRepository;
import com.example.mwdgym.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MessengerService {

    private final ChatMessageRepository chatRepository;
    private final UserAccountRepository userRepository;

    public MessengerService(ChatMessageRepository chatRepository, UserAccountRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> buildConversations(UserAccount me) {
        List<ChatMessage> messages = chatRepository.findAllForUserDesc(me.getId());
        Map<Long, Map<String, Object>> byOther = new LinkedHashMap<>();
        for (ChatMessage m : messages) {
            Long otherId = m.getSender().getId().equals(me.getId())
                    ? m.getRecipient().getId()
                    : m.getSender().getId();
            Map<String, Object> entry = byOther.computeIfAbsent(otherId, k -> {
                Map<String, Object> e = new LinkedHashMap<>();
                e.put("user", userRepository.findById(otherId).orElse(null));
                e.put("lastMessage", m.getContent());
                e.put("lastTime", m.getSentAt());
                e.put("lastSenderMe", m.getSender().getId().equals(me.getId()));
                e.put("unread", 0L);
                return e;
            });
            long unread = (Long) entry.get("unread");
            if (m.getRecipient().getId().equals(me.getId()) && !m.isRead()) {
                entry.put("unread", unread + 1);
            }
        }
        List<Map<String, Object>> out = new ArrayList<>(byOther.values());
        out.sort(Comparator.comparing((Map<String, Object> e) -> (java.time.LocalDateTime) e.get("lastTime")).reversed());
        return out;
    }

    public List<ChatMessage> getThread(Long meId, Long otherId) {
        return chatRepository.findThreadBetween(meId, otherId);
    }

    public List<ChatMessage> getNewMessages(Long meId, Long otherId, Long afterId) {
        return chatRepository.findNewMessages(afterId, meId, otherId);
    }

    @Transactional
    public ChatMessage sendMessage(UserAccount sender, UserAccount recipient, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        String trimmed = content.trim();
        if (trimmed.length() > 4000) {
            throw new IllegalArgumentException("Message too long (max 4000 chars)");
        }
        ChatMessage m = new ChatMessage();
        m.setSender(sender);
        m.setRecipient(recipient);
        m.setContent(trimmed);
        m.setSentAt(java.time.LocalDateTime.now());
        m.setRead(false);
        return chatRepository.save(m);
    }

    @Transactional
    public ChatMessage sendMessageWithFile(UserAccount sender, UserAccount recipient, String content, String fileUrl, String fileName, String fileType, Long fileSize) {
        String trimmed = content != null ? content.trim() : "";
        if (trimmed.isEmpty() && fileUrl == null) throw new IllegalArgumentException("Message or file required");
        if (trimmed.length() > 4000) throw new IllegalArgumentException("Message too long (max 4000 chars)");
        ChatMessage m = new ChatMessage();
        m.setSender(sender);
        m.setRecipient(recipient);
        m.setContent(trimmed.isEmpty() && fileUrl != null ? fileName : trimmed);
        m.setFileUrl(fileUrl);
        m.setFileName(fileName);
        m.setFileType(fileType);
        m.setFileSize(fileSize);
        m.setSentAt(java.time.LocalDateTime.now());
        m.setRead(false);
        return chatRepository.save(m);
    }

    @Transactional
    public void markRead(Long recipientId, Long senderId) {
        List<ChatMessage> unread = chatRepository.findByRecipientIdAndSenderIdAndReadFalse(recipientId, senderId);
        for (ChatMessage m : unread) {
            m.setRead(true);
        }
        chatRepository.saveAll(unread);
    }

    public long countUnread(Long userId) {
        return chatRepository.countUnreadFor(userId);
    }

    public long countUnreadFrom(Long userId, Long otherId) {
        return chatRepository.countUnreadFrom(userId, otherId);
    }
}