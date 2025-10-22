package com.resolveit.service;

import com.resolveit.dto.ComplaintRequest;
import com.resolveit.dto.ComplaintResponse;
import com.resolveit.entity.Complaint;
import com.resolveit.entity.User;
import com.resolveit.repository.ComplaintRepository;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    public ComplaintResponse createComplaint(ComplaintRequest request, MultipartFile file) throws IOException {
        Complaint complaint = new Complaint();
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription());
        complaint.setUrgency(request.getUrgency());
        complaint.setAnonymous(request.isAnonymous());
        complaint.setStatus(Complaint.ComplaintStatus.PENDING);
        
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
        complaint.setStatus(Complaint.ComplaintStatus.PENDING);
        
        if (file != null && !file.isEmpty()) {
            String filename = saveFile(file);
            complaint.setAttachmentPath(filename);
        }
        
        Complaint savedComplaint = complaintRepository.save(complaint);
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
        
        complaint.setStatus(Complaint.ComplaintStatus.valueOf(status.toUpperCase()));
        Complaint updatedComplaint = complaintRepository.save(complaint);
        return new ComplaintResponse(updatedComplaint);
    }
    
    public ComplaintResponse addComment(Long id, String comment) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        complaint.getComments().add(comment);
        Complaint updatedComplaint = complaintRepository.save(complaint);
        return new ComplaintResponse(updatedComplaint);
    }
    
    public List<ComplaintResponse> filterComplaints(String status, String category, String urgency) {
        List<Complaint> complaints;
        
        if (status != null && !status.isEmpty()) {
            complaints = complaintRepository.findByStatus(Complaint.ComplaintStatus.valueOf(status.toUpperCase()));
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
}
