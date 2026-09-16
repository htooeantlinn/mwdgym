package com.example.mwdgym.api;

import com.example.mwdgym.model.ChatMessage;
import com.example.mwdgym.model.UserAccount;
import com.example.mwdgym.service.GymService;
import com.example.mwdgym.service.LoggingService;
import com.example.mwdgym.service.MessengerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messenger")
public class ApiMessengerController {

    private final MessengerService messengerService;
    private final GymService gymService;
    private final LoggingService loggingService;

    public ApiMessengerController(MessengerService messengerService, GymService gymService, LoggingService loggingService) {
        this.messengerService = messengerService;
        this.gymService = gymService;
        this.loggingService = loggingService;
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> contacts() {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();

        List<UserAccount> allUsers = gymService.getAllUsers().stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .filter(UserAccount::isActive)
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (UserAccount u : allUsers) {
            Map<String, Object> entry = new LinkedHashMap<>();
            Map<String, Object> userMap = new LinkedHashMap<>();
            userMap.put("id", u.getId());
            userMap.put("displayName", u.getDisplayName());
            userMap.put("role", u.getRole().name());
            entry.put("user", userMap);

            List<ChatMessage> thread = messengerService.getThread(me.getId(), u.getId());
            if (!thread.isEmpty()) {
                ChatMessage last = thread.get(thread.size() - 1);
                entry.put("lastMessage", last.getContent());
                entry.put("lastTime", last.getSentAt());
                entry.put("lastSenderMe", last.getSender().getId().equals(me.getId()));
            } else {
                entry.put("lastMessage", null);
                entry.put("lastTime", null);
                entry.put("lastSenderMe", false);
            }
            entry.put("unread", messengerService.countUnreadFrom(u.getId(), me.getId()));
            result.add(entry);
        }

        result.sort((a, b) -> {
            var ta = (java.time.LocalDateTime) a.get("lastTime");
            var tb = (java.time.LocalDateTime) b.get("lastTime");
            if (ta == null && tb == null) return 0;
            if (ta == null) return 1;
            if (tb == null) return -1;
            return tb.compareTo(ta);
        });

        return ResponseEntity.ok(result);
    }

    @GetMapping("/messages/{userId}")
    public ResponseEntity<?> messages(@PathVariable Long userId) {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();
        List<ChatMessage> msgs = messengerService.getThread(me.getId(), userId);
        messengerService.markRead(me.getId(), userId);
        return ResponseEntity.ok(msgs);
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();

        String recipientIdStr = payload.get("recipientId");
        String content = payload.get("content");
        if (recipientIdStr == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing parameters"));
        }

        Long recipientId;
        try {
            recipientId = Long.parseLong(recipientIdStr);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid recipient"));
        }

        UserAccount recipient = gymService.getUserById(recipientId);
        if (recipient == null || !recipient.isActive() || recipient.getId().equals(me.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid recipient"));
        }

        try {
            ChatMessage saved = messengerService.sendMessage(me, recipient, content);
            loggingService.info("MESSAGER", "SEND", me, "Sent text message to " + recipient.getDisplayName(), request);
            return ResponseEntity.ok(toJson(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/send-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendFile(@RequestParam("recipientId") String recipientIdStr,
                                      @RequestParam(value = "content", required = false) String content,
                                      @RequestParam(value = "file", required = false) MultipartFile file,
                                      HttpServletRequest request) {
        UserAccount me = currentUser();
        if (me == null) return ResponseEntity.status(401).build();
        if (recipientIdStr == null) return ResponseEntity.badRequest().body(Map.of("error", "Missing recipient"));
        Long recipientId;
        try { recipientId = Long.parseLong(recipientIdStr); } catch (NumberFormatException e) { return ResponseEntity.badRequest().body(Map.of("error", "Invalid recipient")); }
        UserAccount recipient = gymService.getUserById(recipientId);
        if (recipient == null || !recipient.isActive() || recipient.getId().equals(me.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid recipient"));
        }
        String text = (content == null || content.isBlank()) ? "" : content.trim();
        String fileUrl = null, fileName = null, fileType = null;
        Long fileSize = null;
        if (file != null && !file.isEmpty()) {
            try {
                String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
                String ext = original.contains(".") ? original.substring(original.lastIndexOf(".")) : "";
                String storedName = UUID.randomUUID() + ext;
                Path dir = Paths.get("uploads/messenger");
                Files.createDirectories(dir);
                Path target = dir.resolve(storedName);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                fileUrl = "/uploads/messenger/" + storedName;
                fileName = original;
                fileType = file.getContentType();
                fileSize = file.getSize();
                if (text.isBlank()) text = fileName;
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to save file"));
            }
        }
        if (text.isBlank() && fileUrl == null) return ResponseEntity.badRequest().body(Map.of("error", "Message or file required"));
        try {
            ChatMessage saved = messengerService.sendMessageWithFile(me, recipient, text, fileUrl, fileName, fileType, fileSize);
            loggingService.info("MESSAGER", "SEND_FILE", me,
                    "Sent " + (fileType != null ? fileType : "file") + " to " + recipient.getDisplayName()
                            + (fileName != null ? " (" + fileName + ")" : ""), request);
            return ResponseEntity.ok(toJson(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/poll")
    public List<Map<String, Object>> poll(@RequestParam("with") Long withId,
                                          @RequestParam(value = "after", required = false) Long afterId) {
        UserAccount me = currentUser();
        if (me == null) {
            return List.of();
        }
        UserAccount other = gymService.getUserById(withId);
        if (other == null || other.getId().equals(me.getId())) {
            return List.of();
        }
        List<ChatMessage> messages;
        if (afterId == null) {
            messages = messengerService.getThread(me.getId(), other.getId());
        } else {
            messages = messengerService.getNewMessages(me.getId(), other.getId(), afterId);
        }
        return messages.stream().map(this::toJson).toList();
    }

    @GetMapping("/unread")
    public Map<String, Object> unread() {
        UserAccount me = currentUser();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", me == null ? 0 : messengerService.countUnread(me.getId()));
        return result;
    }

    private Map<String, Object> toJson(ChatMessage m) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("id", m.getId());
        json.put("senderId", m.getSender().getId());
        json.put("recipientId", m.getRecipient().getId());
        json.put("content", m.getContent());
        json.put("sentAt", m.getSentAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")));
        if (m.getFileUrl() != null) {
            json.put("fileUrl", m.getFileUrl());
            json.put("fileName", m.getFileName());
            json.put("fileType", m.getFileType());
            json.put("fileSize", m.getFileSize());
        }
        return json;
    }

    private UserAccount currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return gymService.getUserByUsername(auth.getName());
    }
}
