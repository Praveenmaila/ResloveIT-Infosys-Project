-- Create notifications table for the notification system
-- This table will store all in-app notifications for users

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `complaint_id` bigint(20) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `type` enum('COMPLAINT_ESCALATED','COMPLAINT_ASSIGNED','COMPLAINT_STATUS_UPDATE','COMPLAINT_DEADLINE_UPDATE','SYSTEM_ANNOUNCEMENT','ESCALATION_ALERT') NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `email_sent` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_complaint_id` (`complaint_id`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX `idx_notifications_unread_user` ON `notifications` (`user_id`, `is_read`, `created_at`);
CREATE INDEX `idx_notifications_type_created` ON `notifications` (`type`, `created_at`);

-- Add email field to users table if it doesn't exist (for notifications)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `email` varchar(255) UNIQUE DEFAULT NULL AFTER `username`;

-- Insert some sample notification types documentation
INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES 
('NOTIFICATION_EMAIL_ENABLED', 'true', 'Enable email notifications for escalations and assignments'),
('NOTIFICATION_CLEANUP_DAYS', '30', 'Number of days to keep old notifications'),
('NOTIFICATION_MAX_RETRIES', '3', 'Maximum email sending retries'),
('ESCALATION_EMAIL_TEMPLATE', 'default', 'Email template for escalation notifications');

-- Create system_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(255) NOT NULL UNIQUE,
  `config_value` text,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;