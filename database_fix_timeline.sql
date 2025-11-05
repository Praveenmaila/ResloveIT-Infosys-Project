-- Fix for complaint_timeline table column size issue
-- Run this script to fix the data truncation error

USE resolveit_db;

-- Check if the table exists and show its structure
DESCRIBE complaint_timeline;

-- Alter the status column to accommodate longer enum values
ALTER TABLE complaint_timeline MODIFY COLUMN status VARCHAR(50) NOT NULL;

-- Also fix the complaints table status column if needed
ALTER TABLE complaints MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'NEW';

-- Verify the changes
DESCRIBE complaint_timeline;
DESCRIBE complaints;

-- Show any existing data to make sure nothing was lost
SELECT COUNT(*) as total_timeline_entries FROM complaint_timeline;
SELECT COUNT(*) as total_complaints FROM complaints;