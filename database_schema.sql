-- ResolveIT MySQL Database Schema
-- This script creates the database and tables for the ResolveIT application

-- Create database
CREATE DATABASE IF NOT EXISTS resolveit_db;
USE resolveit_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_role (role)
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    user_id BIGINT,
    assigned_to BIGINT,
    deadline TIMESTAMP NULL,
    anonymous BOOLEAN DEFAULT FALSE,
    attachment_path VARCHAR(255),
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP NULL,
    escalated_to BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (escalated_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_urgency (urgency),
    INDEX idx_user_id (user_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at)
);

-- Complaint comments table
CREATE TABLE IF NOT EXISTS complaint_comments (
    complaint_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_complaint_id (complaint_id)
);

-- Complaint timeline table
CREATE TABLE IF NOT EXISTS complaint_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    is_internal_note BOOLEAN DEFAULT FALSE,
    updated_by BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp)
);

-- Insert sample admin user
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (username, email, password, full_name, enabled) 
VALUES ('admin', 'admin@resolveit.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'System Admin', TRUE)
ON DUPLICATE KEY UPDATE username = username;

-- Assign ADMIN role to  user
INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE username = 'admin'
ON DUPLICATE KEY UPDATE role = role;

-- Insert sample regular user
-- Password: user123 (BCrypt encoded)
INSERT INTO users (username, email, password, full_name, enabled)
VALUES ('testuser', 'user@resolveit.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Test User', TRUE)
ON DUPLICATE KEY UPDATE username = username;

-- Assign USER role to test user
INSERT INTO user_roles (user_id, role)
SELECT id, 'USER' FROM users WHERE username = 'testuser'
ON DUPLICATE KEY UPDATE role = role;
