package com.momo.backend.entity;

import com.momo.backend.entity.enums.ChatType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "chats")
public class Chat {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatType type;

    @Column(nullable = false, name = "manager_id")
    private UUID managerId;

    @OneToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ElementCollection
    @CollectionTable(name = "chat_members", joinColumns = @JoinColumn(name = "chat_id"))
    @Column(name = "member_id", nullable = false)
    private Set<UUID> memberIds = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
