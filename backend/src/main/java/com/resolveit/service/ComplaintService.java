package com.resolveit.service;

import com.resolveit.dto.*;
import com.resolveit.entity.Complaint;
import com.resolveit.entity.ComplaintTimeline;
import com.resolveit.entity.User;
import com.resolveit.repository.ComplaintRepository;
import com.resolveit.repository.ComplaintTimelineRepository;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ComplaintTimelineRepository timelineRepository;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    public ComplaintResponse createComplaint(ComplaintRequest request, MultipartFile file) throws IOException {
        Complaint complaint = new Complaint();
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription());
        complaint.setUrgency(request.getUrgency());
        complaint.setAnonymous(request.isAnonymous());
        complaint.setStatus(Complaint.ComplaintStatus.NEW);
        
        if (!request.isAnonymous()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                User user = userRepository.findById(userDetails.getId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                complaint.setUser(user);
            }
        }
        
        if (file != null && !file.isEmpty()) {
            String filename = saveFile(file);
            complaint.setAttachmentPath(filename);
        }
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        return new ComplaintResponse(savedComplaint);
    }
    
    public ComplaintResponse createAnonymousComplaint(ComplaintRequest request, MultipartFile file) throws IOException {
        Complaint complaint = new Complaint();
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription());
        complaint.setUrgency(request.getUrgency());
        complaint.setAnonymous(true);
        complaint.setStatus(Complaint.ComplaintStatus.NEW);
        
        if (file != null && !file.isEmpty()) {
            String filename = saveFile(file);
            complaint.setAttachmentPath(filename);
        }
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        complaint.addTimelineEntry(Complaint.ComplaintStatus.NEW, "Anonymous complaint submitted", false, null);
        complaintRepository.save(complaint);
        return new ComplaintResponse(savedComplaint);
    }
    
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(ComplaintResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<ComplaintResponse> getMyComplaints() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        return complaintRepository.findByUserId(userDetails.getId()).stream()
                .map(ComplaintResponse::new)
                .collect(Collectors.toList());
    }
    
    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return new ComplaintResponse(complaint);
    }
    
    public ComplaintResponse updateComplaintStatus(Long id, String status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        Complaint.ComplaintStatus parsed = parseStatus(status);
        if (parsed != null) {
            complaint.setStatus(parsed);
        }
        Complaint updatedComplaint = complaintRepository.save(complaint);
        return new ComplaintResponse(updatedComplaint);
    }
    
    public ComplaintResponse updateComplaint(Long id, ComplaintUpdateRequest updateRequest) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateRequest.getStatus() != null) {
            Complaint.ComplaintStatus parsed = parseStatus(updateRequest.getStatus());
            if (parsed != null) complaint.setStatus(parsed);
        }
        
        if (updateRequest.getAssignedToUserId() != null) {
            User assignedUser = userRepository.findById(updateRequest.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            complaint.setAssignedTo(assignedUser);
        }
        
        if (updateRequest.getEscalatedToUserId() != null) {
            User escalatedUser = userRepository.findById(updateRequest.getEscalatedToUserId())
                    .orElseThrow(() -> new RuntimeException("Escalated user not found"));
            complaint.setEscalatedTo(escalatedUser);
            complaint.setEscalated(true);
            complaint.setEscalatedAt(LocalDateTime.now());
        }
        
        complaint.addTimelineEntry(complaint.getStatus(), updateRequest.getComment(), 
                updateRequest.isInternalNote(), currentUser);
        
        Complaint updatedComplaint = complaintRepository.save(complaint);
        return new ComplaintResponse(updatedComplaint);
    }
    
    public List<ComplaintTimelineResponse> getComplaintTimeline(Long complaintId, boolean includeInternal) {
        List<ComplaintTimeline> timeline;
        if (includeInternal) {
            timeline = timelineRepository.findByComplaintIdOrderByTimestampAsc(complaintId);
        } else {
            timeline = timelineRepository.findByComplaintIdAndIsInternalNoteOrderByTimestampAsc(complaintId, false);
        }
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        return timeline.stream().map(entry -> {
            ComplaintTimelineResponse response = new ComplaintTimelineResponse();
            response.setId(entry.getId());
            response.setStatus(entry.getStatus().toString());
            response.setComment(entry.getComment());
            response.setInternalNote(entry.isInternalNote());
            response.setUpdatedByUsername(entry.getUpdatedBy() != null ? 
                    entry.getUpdatedBy().getUsername() : "System");
            response.setTimestamp(entry.getTimestamp().format(formatter));
            return response;
        }).collect(Collectors.toList());
    }
    
    public List<ComplaintResponse> filterComplaints(String status, String category, String urgency) {
        List<Complaint> complaints;
        
        if (status != null && !status.isEmpty()) {
            Complaint.ComplaintStatus parsed = parseStatus(status);
            if (parsed != null) {
                complaints = complaintRepository.findByStatus(parsed);
            } else {
                complaints = complaintRepository.findAll();
            }
        } else if (category != null && !category.isEmpty()) {
            complaints = complaintRepository.findByCategory(category);
        } else if (urgency != null && !urgency.isEmpty()) {
            complaints = complaintRepository.findByUrgency(urgency);
        } else {
            complaints = complaintRepository.findAll();
        }
        
        return complaints.stream()
                .map(ComplaintResponse::new)
                .collect(Collectors.toList());
    }
    
    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return filename;
    }

    private Complaint.ComplaintStatus parseStatus(String statusStr) {
        if (statusStr == null) return null;
        String s = statusStr.trim().toUpperCase();
        try {
            return Complaint.ComplaintStatus.valueOf(s);
        } catch (IllegalArgumentException ex) {
            // map legacy or alternate values
            switch (s) {
                case "PENDING":
                    return Complaint.ComplaintStatus.NEW;
                case "UNDER_REVIEW":
                case "UNDER-REVIEW":
                    return Complaint.ComplaintStatus.UNDER_REVIEW;
                case "IN_PROGRESS":
                case "IN-PROGRESS":
                    return Complaint.ComplaintStatus.IN_PROGRESS;
                case "ESCALATED":
                    return Complaint.ComplaintStatus.ESCALATED;
                case "RESOLVED":
                    return Complaint.ComplaintStatus.RESOLVED;
                case "CLOSED":
                    return Complaint.ComplaintStatus.CLOSED;
                default:
                    return null;
            }
        }
    }
}
