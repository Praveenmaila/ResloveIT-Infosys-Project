import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    urgency: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintService.getAllComplaints();
      setComplaints(response.data);
    } catch (err) {
      setError('Failed to fetch complaints');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = async () => {
    try {
      const response = await complaintService.filterComplaints(
        filters.status,
        filters.category,
        filters.urgency
      );
      setComplaints(response.data);
    } catch (err) {
      setError('Failed to filter complaints');
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', category: '', urgency: '' });
    fetchComplaints();
  };

  const updateStatus = async (id, status) => {
    try {
      await complaintService.updateComplaintStatus(id, status);
      setSuccess('Status updated successfully');
      fetchComplaints();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const addComment = async (id) => {
    if (!comment.trim()) return;
    
    try {
      await complaintService.addComment(id, comment);
      setSuccess('Comment added successfully');
      setComment('');
      fetchComplaints();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'status-pending',
      'IN_PROGRESS': 'status-in_progress',
      'RESOLVED': 'status-resolved'
    };
    return statusMap[status] || 'status-pending';
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="card">
        <h3>Filters</h3>
        <div className="filter-section">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Administrative">Administrative</option>
            <option value="Harassment">Harassment</option>
            <option value="Other">Other</option>
          </select>
          
          <select name="urgency" value={filters.urgency} onChange={handleFilterChange}>
            <option value="">All Urgency</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          
          <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
          <button onClick={clearFilters} className="btn" style={{ backgroundColor: '#6c757d', color: 'white' }}>
            Clear
          </button>
        </div>
      </div>
      
      <div className="card">
        <h3>All Complaints ({complaints.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Category</th>
              <th>Description</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint.id}>
                <td>{complaint.id}</td>
                <td>{complaint.username}</td>
                <td>{complaint.category}</td>
                <td style={{ maxWidth: '200px' }}>
                  {complaint.description.substring(0, 50)}...
                </td>
                <td>{complaint.urgency}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => setSelectedComplaint(complaint)}
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedComplaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            maxWidth: '600px', 
            maxHeight: '80vh', 
            overflow: 'auto',
            margin: '20px'
          }}>
            <h3>Complaint Details</h3>
            <p><strong>ID:</strong> {selectedComplaint.id}</p>
            <p><strong>User:</strong> {selectedComplaint.username}</p>
            <p><strong>Category:</strong> {selectedComplaint.category}</p>
            <p><strong>Urgency:</strong> {selectedComplaint.urgency}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>
                {selectedComplaint.status.replace('_', ' ')}
              </span>
            </p>
            <p><strong>Description:</strong></p>
            <p>{selectedComplaint.description}</p>
            
            {selectedComplaint.attachmentPath && (
              <p><strong>Attachment:</strong> {selectedComplaint.attachmentPath}</p>
            )}
            
            <div style={{ marginTop: '20px' }}>
              <h4>Update Status</h4>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'PENDING')}
                  className="btn"
                  style={{ backgroundColor: '#ffc107', color: '#000' }}
                >
                  Pending
                </button>
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'IN_PROGRESS')}
                  className="btn"
                  style={{ backgroundColor: '#17a2b8', color: '#fff' }}
                >
                  In Progress
                </button>
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'RESOLVED')}
                  className="btn btn-success"
                >
                  Resolved
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h4>Comments</h4>
              {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                <ul>
                  {selectedComplaint.comments.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p>No comments yet</p>
              )}
              
              <div className="form-group" style={{ marginTop: '10px' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={{ minHeight: '60px' }}
                />
              </div>
              <button 
                onClick={() => addComment(selectedComplaint.id)}
                className="btn btn-primary"
              >
                Add Comment
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedComplaint(null)}
              className="btn btn-danger"
              style={{ marginTop: '20px', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
