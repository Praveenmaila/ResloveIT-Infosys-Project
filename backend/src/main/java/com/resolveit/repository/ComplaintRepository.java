package com.resolveit.repository;

import com.resolveit.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long userId);
    List<Complaint> findByAssignedToId(Long assignedToId);
    List<Complaint> findByStatus(Complaint.ComplaintStatus status);
    List<Complaint> findByCategory(String category);
    List<Complaint> findByUrgency(String urgency);
    List<Complaint> findByIsEscalated(boolean isEscalated);
}
