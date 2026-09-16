package com.example.mwdgym.repository;

import com.example.mwdgym.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.sender.id = :a AND m.recipient.id = :b)
               OR (m.sender.id = :b AND m.recipient.id = :a)
            ORDER BY m.sentAt ASC, m.id ASC
            """)
    List<ChatMessage> findThreadBetween(@Param("a") Long userIdA, @Param("b") Long userIdB);

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE m.id > :afterId
              AND ((m.sender.id = :a AND m.recipient.id = :b)
                OR (m.sender.id = :b AND m.recipient.id = :a))
            ORDER BY m.sentAt ASC, m.id ASC
            """)
    List<ChatMessage> findNewMessages(@Param("afterId") Long afterId,
                                      @Param("a") Long userIdA,
                                      @Param("b") Long userIdB);

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE m.sender.id = :uid OR m.recipient.id = :uid
            ORDER BY m.sentAt DESC, m.id DESC
            """)
    List<ChatMessage> findAllForUserDesc(@Param("uid") Long userId);

    List<ChatMessage> findBySenderIdAndRecipientIdOrderBySentAtAsc(Long senderId, Long recipientId);

    List<ChatMessage> findByRecipientIdAndSenderIdAndReadFalse(Long recipientId, Long senderId);

    @Query("""
            SELECT COUNT(m) FROM ChatMessage m
            WHERE m.recipient.id = :userId AND m.read = false
            """)
    long countUnreadFor(@Param("userId") Long userId);

    @Query("""
            SELECT COUNT(m) FROM ChatMessage m
            WHERE m.recipient.id = :userId AND m.sender.id = :otherId AND m.read = false
            """)
    long countUnreadFrom(@Param("userId") Long userId, @Param("otherId") Long otherId);
}