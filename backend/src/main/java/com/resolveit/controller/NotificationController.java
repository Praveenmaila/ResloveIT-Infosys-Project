package com.resolveit.controller;

import com.resolveit.entity.Notification;
import com.resolveit.service.NotificationService;
import com.resolveit.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing user notifications
 * Supports escalation alerts and in-app notifications
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Get paginated notifications for current user
     */
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getUserNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Notification> notifications = notificationService.getUserNotifications(
                userPrincipal.getId(), pageable);
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notifications for current user
     */
    @GetMapping("/unread")
    @PreAuthorize("hasRole('USER') or hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications(
                userPrincipal.getId());
        
        return ResponseEntity.ok(unreadNotifications);
    }
    
    /**
     * Get unread notification count for current user
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('USER') or hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        long count = notificationService.getUnreadNotificationCount(userPrincipal.getId());
        
        return ResponseEntity.ok(Map.of(
            "unreadCount", count,
            "hasUnread", count > 0
        ));
    }
    
    /**
     * Mark a specific notification as read
     */
    @PUT("/{notificationId}/read")
    @PreAuthorize("hasRole('USER') or hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        try {
            notificationService.markAsRead(notificationId, userPrincipal.getId());
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to mark notification as read"));
        }
    }
    
    /**
     * Mark all notifications as read for current user
     */
    @PUT("/read-all")
    @PreAuthorize("hasRole('USER') or hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        try {
            notificationService.markAllAsRead(userPrincipal.getId());
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to mark all notifications as read"));
        }
    }
    
    /**
     * Get notification statistics (Admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        // This could include system-wide notification statistics
        // For now, return basic info
        return ResponseEntity.ok(Map.of(
            "message", "Notification system is active",
            "features", List.of("Email notifications", "In-app notifications", "Escalation alerts")
        ));
    }
}