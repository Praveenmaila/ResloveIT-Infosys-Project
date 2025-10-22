package com.resolveit.controller;

import com.resolveit.dto.ComplaintRequest;
import com.resolveit.dto.ComplaintResponse;
import com.resolveit.dto.MessageResponse;
import com.resolveit.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
    
    @Autowired
    private ComplaintService complaintService;
    
    @PostMapping("/anonymous")
    public ResponseEntity<?> createAnonymousComplaint(
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("urgency") String urgency,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            ComplaintRequest request = new ComplaintRequest();
            request.setCategory(category);
            request.setDescription(description);
            request.setUrgency(urgency);
            request.setAnonymous(true);
            
            ComplaintResponse response = complaintService.createAnonymousComplaint(request, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<?> createComplaint(
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("urgency") String urgency,
            @RequestParam(value = "anonymous", defaultValue = "false") boolean anonymous,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            ComplaintRequest request = new ComplaintRequest();
            request.setCategory(category);
            request.setDescription(description);
            request.setUrgency(urgency);
            request.setAnonymous(anonymous);
            
            ComplaintResponse response = complaintService.createComplaint(request, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<?> getMyComplaints() {
        try {
            List<ComplaintResponse> complaints = complaintService.getMyComplaints();
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAllComplaints() {
        try {
            List<ComplaintResponse> complaints = complaintService.getAllComplaints();
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        try {
            ComplaintResponse complaint = complaintService.getComplaintById(id);
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            ComplaintResponse complaint = complaintService.updateComplaintStatus(id, status);
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/admin/{id}/comment")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> commentData) {
        try {
            String comment = commentData.get("comment");
            ComplaintResponse complaint = complaintService.addComment(id, comment);
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/filter")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> filterComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String urgency) {
        try {
            List<ComplaintResponse> complaints = complaintService.filterComplaints(status, category, urgency);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
