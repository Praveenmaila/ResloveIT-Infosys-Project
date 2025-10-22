package com.resolveit.dto;

import com.resolveit.entity.Complaint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {
    private Long id;
    private String category;
    private String description;
    private String urgency;
    private String status;
    private String username;
    private boolean anonymous;
    private String attachmentPath;
    private List<String> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public ComplaintResponse(Complaint complaint) {
        this.id = complaint.getId();
        this.category = complaint.getCategory();
        this.description = complaint.getDescription();
        this.urgency = complaint.getUrgency();
        this.status = complaint.getStatus().toString();
        this.username = complaint.isAnonymous() ? "Anonymous" : 
                       (complaint.getUser() != null ? complaint.getUser().getUsername() : "Anonymous");
        this.anonymous = complaint.isAnonymous();
        this.attachmentPath = complaint.getAttachmentPath();
        this.comments = complaint.getComments();
        this.createdAt = complaint.getCreatedAt();
        this.updatedAt = complaint.getUpdatedAt();
    }
}
