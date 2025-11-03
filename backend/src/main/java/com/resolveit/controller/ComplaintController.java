package com.resolveit.controller;

import com.resolveit.dto.*;
import com.resolveit.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
    
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OFFICER')")
    public ResponseEntity<?> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintUpdateRequest updateRequest) {
        try {
            ComplaintResponse complaint = complaintService.updateComplaint(id, updateRequest);
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/timeline")
    public ResponseEntity<?> getComplaintTimeline(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeInternal) {
        try {
            List<ComplaintTimelineResponse> timeline = complaintService.getComplaintTimeline(id, includeInternal);
            return ResponseEntity.ok(timeline);
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
