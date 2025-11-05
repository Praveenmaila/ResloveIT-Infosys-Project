import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { complaintService } from '../services/api';
import './AdminDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', urgency: '' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [officers, setOfficers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    complaintId: null,
    officerId: '',
    deadline: '',
    comment: ''
  });

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await complaintService.getAllComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await complaintService.getAllOfficers();
      setOfficers(res.data || []);
    } catch (err) {
      setError('Failed to fetch officers');
      console.error(err);
    }
  };

  const applyFilters = async () => {
    try {
      const res = await complaintService.filterComplaints(filters.status, filters.category, filters.urgency);
      setComplaints(res.data || []);
    } catch (err) {
      setError('Failed to filter complaints');
      console.error(err);
    }
  };

  const clearFilters = async () => {
    setFilters({ status: '', category: '', urgency: '' });
    await fetchComplaints();
  };

  const updateStatus = async (id, newStatus) => {
    console.log(`=== Updating Status ===`);
    console.log(`Complaint ID: ${id}`);
    console.log(`New Status: ${newStatus}`);
    
    try {
      setError('');
      setSuccess('');
      
      const response = await complaintService.updateComplaintStatus(id, newStatus);
      console.log('Status update response:', response);
      
      setSuccess(`Status updated to "${newStatus.replace('_', ' ')}" successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh complaints list
      fetchComplaints();
      
      // Update selected complaint if it's the one being updated
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint((s) => ({ ...s, status: newStatus }));
      }
      
    } catch (err) {
      console.error('❌ Status update failed:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Failed to update status';
      if (err.response?.data?.message) {
        errorMessage += ': ' + err.response.data.message;
      } else if (err.response?.status === 403) {
        errorMessage += ': Access denied. Admin privileges required.';
      } else if (err.response?.status === 404) {
        errorMessage += ': Complaint not found.';
      } else if (err.message) {
        errorMessage += ': ' + err.message;
      }
      
      setError(errorMessage);
    }
  };

  const addComment = async (id) => {
    if (!comment.trim()) return;
    try {
      const noteRequest = {
        comment: comment,
        isInternalNote: true
      };
      await complaintService.addInternalNote(id, noteRequest);
      setSuccess('Internal note added successfully');
      setComment('');
      setTimeout(() => setSuccess(''), 3000);
      fetchComplaints();
    } catch (err) {
      setError('Failed to add internal note');
      console.error(err);
    }
  };

    const openAssignModal = (complaintId) => {
    console.log('Opening assign modal for complaint:', complaintId);
    console.log('Available officers:', officers);
    setAssignmentData({
      complaintId: complaintId,
      officerId: '',
      deadline: '',
      comment: ''
    });
    setError('');
    setSuccess('');
    setShowAssignModal(true);
  };

  const assignComplaint = async () => {
    console.log('=== Assignment Process Started ===');
    console.log('Current assignmentData:', assignmentData);
    console.log('Available officers:', officers);
    
    if (!assignmentData.officerId) {
      console.log('❌ No officer selected');
      setError('Please select an officer to assign');
      return;
    }

    if (!assignmentData.complaintId) {
      console.log('❌ No complaint ID');
      setError('No complaint selected for assignment');
      return;
    }

    // Validate officer exists
    const selectedOfficer = officers.find(o => o.id.toString() === assignmentData.officerId.toString());
    if (!selectedOfficer) {
      console.log('❌ Invalid officer ID:', assignmentData.officerId);
      setError('Selected officer not found');
      return;
    }
    
    console.log('✅ Selected officer:', selectedOfficer);

    try {
      setError('');
      setSuccess('');
      
      const assignRequest = {
        assignToUserId: parseInt(assignmentData.officerId),
        deadline: assignmentData.deadline ? new Date(assignmentData.deadline).toISOString() : null,
        comment: assignmentData.comment || 'Complaint assigned by admin'
      };

      console.log('📤 Sending assign request:', assignRequest);
      console.log('📋 Complaint ID:', assignmentData.complaintId);
      console.log('🌐 API URL will be:', `/complaints/assign/${assignmentData.complaintId}`);

      const response = await complaintService.assignComplaint(assignmentData.complaintId, assignRequest);
      console.log('✅ Assignment successful, response:', response);
      
      setSuccess('Complaint assigned successfully!');
      setTimeout(() => {
        setSuccess('');
        setShowAssignModal(false);
        // Clear assignment data
        setAssignmentData({
          complaintId: null,
          officerId: '',
          deadline: '',
          comment: ''
        });
      }, 2000);
      
      fetchComplaints();
      
      // Update the selected complaint if it's the one being assigned
      if (selectedComplaint && selectedComplaint.id === assignmentData.complaintId) {
        const officer = officers.find(o => o.id === parseInt(assignmentData.officerId));
        setSelectedComplaint(prev => ({
          ...prev, 
          status: 'ASSIGNED',
          assignedToUsername: officer ? officer.fullName : 'Unknown',
          deadline: assignmentData.deadline
        }));
      }
    } catch (err) {
      console.error('❌ Assignment Failed:', err);
      console.error('❌ Error Response Data:', err.response?.data);
      console.error('❌ Error Response Status:', err.response?.status);
      console.error('❌ Error Response Headers:', err.response?.headers);
      console.error('❌ Full Error Object:', err);
      
      let errorMessage = 'Failed to assign complaint';
      if (err.response?.data?.message) {
        errorMessage += ': ' + err.response.data.message;
      } else if (err.response?.status === 403) {
        errorMessage += ': Access denied. Please check your permissions.';
      } else if (err.response?.status === 404) {
        errorMessage += ': Complaint or officer not found.';
      } else if (err.message) {
        errorMessage += ': ' + err.message;
      }
      
      setError(errorMessage);
    }
  };

  const unassignComplaint = async (id) => {
    try {
      await complaintService.unassignComplaint(id);
      setSuccess('Complaint unassigned successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchComplaints();
      
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(prev => ({
          ...prev, 
          status: 'UNDER_REVIEW',
          assignedToUsername: null,
          deadline: null
        }));
      }
    } catch (err) {
      setError('Failed to unassign complaint');
      console.error(err);
    }
  };

  const markResolved = async (id) => {
    try {
      await complaintService.markResolved(id);
      setSuccess('Complaint marked as resolved');
      setTimeout(() => setSuccess(''), 3000);
      fetchComplaints();
      
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint(prev => ({ ...prev, status: 'RESOLVED' }));
      }
    } catch (err) {
      setError('Failed to resolve complaint');
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusClass = (status) => {
    const map = {
      NEW: 'status-new',
      UNDER_REVIEW: 'status-under-review',
      IN_PROGRESS: 'status-in-progress',
      ESCALATED: 'status-escalated',
      RESOLVED: 'status-resolved',
      CLOSED: 'status-closed',
    };
    return map[status] || 'status-new';
  };

  const getChartData = () => {
    if (!complaints || complaints.length === 0) {
      return {
        categoryChartData: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
        statusChartData: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      };
    }

    const categoryStats = {};
    const statusStats = {};
    complaints.forEach((c) => {
      categoryStats[c.category] = (categoryStats[c.category] || 0) + 1;
      statusStats[c.status] = (statusStats[c.status] || 0) + 1;
    });

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#2ECC71', '#E74C3C', '#3498DB', '#F1C40F', '#8E44AD',
    ];

    const categoryChartData = {
      labels: Object.keys(categoryStats),
      datasets: [{
        data: Object.values(categoryStats),
        backgroundColor: backgroundColors.slice(0, Object.keys(categoryStats).length),
        label: 'Categories',
      }],
    };

    const statusChartData = {
      labels: Object.keys(statusStats),
      datasets: [{
        data: Object.values(statusStats),
        backgroundColor: backgroundColors.slice(0, Object.keys(statusStats).length),
        label: 'Status',
      }],
    };

    return { categoryChartData, statusChartData };
  };

  const { categoryChartData, statusChartData } = getChartData();

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h3>Filters</h3>
        <div className="filter-section" style={{ color:'black' }}>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BILLING">Billing</option>
            <option value="SERVICE_QUALITY">Service Quality</option>
            <option value="DELIVERY">Delivery</option>
            <option value="PRODUCT_QUALITY">Product Quality</option>
            <option value="CUSTOMER_SERVICE">Customer Service</option>
            <option value="WEBSITE">Website</option>
            <option value="MOBILE_APP">Mobile App</option>
            <option value="SECURITY">Security</option>
            <option value="FEEDBACK">Feedback</option>
            <option value="OTHER">Other</option>
          </select>

          <select name="urgency" value={filters.urgency} onChange={handleFilterChange}>
            <option value="">All Urgency</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
          <button onClick={clearFilters} className="btn" style={{ backgroundColor: '#6c757d', color: 'white' }}>Clear</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Complaint Statistics</h3>
        {complaints && complaints.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ width: '45%' }}>
              <h4>Complaints by Category</h4>
              <div className="chart-container" style={{ height: 300 }}>
                <Pie
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 20 } },
                      title: { display: true, text: 'Distribution by Category' },
                    },
                  }}
                />
              </div>
            </div>

            <div style={{ width: '45%' }}>
              <h4>Complaints by Status</h4>
              <div className="chart-container" style={{ height: 300 }}>
                <Pie
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 20 } },
                      title: { display: true, text: 'Distribution by Status' },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>No complaints data available to display statistics</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>All Complaints ({complaints.length})</h3>
        <div className="complaint-stats" style={{ marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {Object.entries(complaints.reduce((acc, complaint) => {
            acc[complaint.status] = (acc[complaint.status] || 0) + 1;
            return acc;
          }, {})).map(([status, count]) => (
            <div key={status} className={`status-stat ${getStatusClass(status)}`} style={{ padding: 10, borderRadius: 5 }}>
              <strong>{status.replace('_', ' ')}:</strong> {count}
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Category</th>
                <th>Description</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Deadline</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.username}</td>
                  <td>{c.category}</td>
                  <td style={{ maxWidth: 200 }}>{(c.description || '').substring(0, 50)}{(c.description || '').length > 50 ? '...' : ''}</td>
                  <td>
                    <span className={`urgency-badge urgency-${c.urgency.toLowerCase()}`}>
                      {c.urgency}
                    </span>
                  </td>
                  <td><span className={`status-badge ${getStatusClass(c.status)}`}>{c.status.replace('_', ' ')}</span></td>
                  <td>
                    {c.assignedToUsername ? (
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        {c.assignedToUsername}
                      </span>
                    ) : (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {c.deadline ? (
                      <span style={{ 
                        color: new Date(c.deadline) < new Date() ? '#d32f2f' : '#1976d2',
                        fontWeight: new Date(c.deadline) < new Date() ? 'bold' : 'normal'
                      }}>
                        {new Date(c.deadline).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ color: '#666' }}>-</span>
                    )}
                  </td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setSelectedComplaint(c)} 
                        className="btn btn-primary" 
                        style={{ fontSize: 12, padding: '5px 10px' }}
                      >
                        View
                      </button>
                      {!c.assignedToUsername && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                        <button 
                          onClick={() => openAssignModal(c.id)} 
                          className="btn" 
                          style={{ fontSize: 12, padding: '5px 10px', backgroundColor: '#4caf50', color: 'white' }}
                        >
                          Assign
                        </button>
                      )}
                      {c.assignedToUsername && (
                        <button 
                          onClick={() => unassignComplaint(c.id)} 
                          className="btn" 
                          style={{ fontSize: 12, padding: '5px 10px', backgroundColor: '#ff9800', color: 'white' }}
                        >
                          Unassign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card modal-content" style={{ maxWidth: 600, maxHeight: '80vh', overflow: 'auto', margin: 20 }}>
            <h3>Complaint Details</h3>
            <div className="details">
              <p><strong>ID:</strong> {selectedComplaint.id}</p>
              <p><strong>User:</strong> {selectedComplaint.username}</p>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
              <p><strong>Urgency:</strong> 
                <span className={`urgency-badge urgency-${selectedComplaint.urgency.toLowerCase()}`} style={{ marginLeft: 10 }}>
                  {selectedComplaint.urgency}
                </span>
              </p>
              <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>{selectedComplaint.status.replace('_', ' ')}</span></p>
              
              {selectedComplaint.assignedToUsername && (
                <p><strong>Assigned To:</strong> 
                  <span style={{ color: '#2e7d32', fontWeight: 'bold', marginLeft: 10 }}>
                    {selectedComplaint.assignedToUsername}
                  </span>
                </p>
              )}
              
              {selectedComplaint.deadline && (
                <p><strong>Deadline:</strong> 
                  <span style={{ 
                    marginLeft: 10,
                    color: new Date(selectedComplaint.deadline) < new Date() ? '#d32f2f' : '#1976d2',
                    fontWeight: new Date(selectedComplaint.deadline) < new Date() ? 'bold' : 'normal'
                  }}>
                    {new Date(selectedComplaint.deadline).toLocaleString()}
                    {new Date(selectedComplaint.deadline) < new Date() && 
                      <span style={{ color: '#d32f2f', marginLeft: 5 }}>(OVERDUE)</span>}
                  </span>
                </p>
              )}
              
              <p><strong>Created:</strong> {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString() : '-'}</p>
              <p><strong>Description:</strong></p>
              <p className="description">{selectedComplaint.description}</p>
              {selectedComplaint.attachmentPath && (
                <p><strong>Attachment:</strong> {selectedComplaint.attachmentPath}</p>
              )}
            </div>

            <div style={{ 
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--space-4)'
              }}>
                <h4 style={{ 
                  color: 'var(--gray-800)', 
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  margin: 0
                }}>
                  ⚡ Admin Actions
                </h4>
                <div style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary-200)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--primary-700)'
                }}>
                  Current Status: <span className={`status-badge status-${selectedComplaint.status.toLowerCase()}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="action-buttons" style={{ 
                display: 'flex', 
                gap: 'var(--space-3)', 
                flexWrap: 'wrap', 
                alignItems: 'center'
              }}>
                {!selectedComplaint.assignedToUsername && selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'CLOSED' && (
                  <button 
                    onClick={() => openAssignModal(selectedComplaint.id)} 
                    className="btn btn-success btn-sm"
                  >
                    👤 Assign to Officer
                  </button>
                )}
                
                {selectedComplaint.assignedToUsername && (
                  <button 
                    onClick={() => unassignComplaint(selectedComplaint.id)} 
                    className="btn btn-warning btn-sm"
                  >
                    🔄 Unassign
                  </button>
                )}
                
                {selectedComplaint.status === 'COMPLETED' && (
                  <button 
                    onClick={() => markResolved(selectedComplaint.id)} 
                    className="btn btn-success btn-sm"
                  >
                    ✅ Mark as Resolved
                  </button>
                )}
                
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'UNDER_REVIEW')} 
                  className="btn btn-primary btn-sm"
                  disabled={selectedComplaint.status === 'UNDER_REVIEW'}
                >
                  🔍 Under Review
                </button>
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'IN_PROGRESS')} 
                  className="btn btn-warning btn-sm"
                  disabled={selectedComplaint.status === 'IN_PROGRESS'}
                >
                  ⚙️ In Progress
                </button>
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'ESCALATED')} 
                  className="btn btn-danger btn-sm"
                  disabled={selectedComplaint.status === 'ESCALATED'}
                >
                  🔺 Escalate
                </button>
                <button 
                  onClick={() => updateStatus(selectedComplaint.id, 'CLOSED')} 
                  className="btn btn-secondary btn-sm"
                  disabled={selectedComplaint.status === 'CLOSED'}
                >
                  ❌ Close
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h4>Internal Notes</h4>
              {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                <ul>
                  {selectedComplaint.comments.map((c, idx) => <li key={idx} style={{ marginBottom: 5 }}>{c}</li>)}
                </ul>
              ) : <p>No internal notes yet</p>}

              <div className="form-group" style={{ marginTop: 10  }}>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Add an internal note (visible to officers and admins only)..." 
                  style={{ minHeight: 60, width: '100%' }} 
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button onClick={() => addComment(selectedComplaint.id)} className="btn btn-primary">Add Internal Note</button>
                  <button onClick={() => setSelectedComplaint(null)} className="btn btn-danger" style={{ marginLeft: 'auto' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card modal-content" style={{ maxWidth: 500, margin: 20 }}>
            <h3>Assign Complaint to Officer</h3>
            
            {error && (
              <div style={{ 
                backgroundColor: '#ffebee', 
                color: '#c62828', 
                padding: 10, 
                borderRadius: 4, 
                marginBottom: 15, 
                border: '1px solid #ef5350' 
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ 
                backgroundColor: '#e8f5e8', 
                color: '#2e7d32', 
                padding: 10, 
                borderRadius: 4, 
                marginBottom: 15, 
                border: '1px solid #4caf50' 
              }}>
                {success}
              </div>
            )}
            
            <div className="form-group" style={{ marginBottom: 15 }}>
              <label><strong>Select Officer:</strong></label>
              <select 
                value={assignmentData.officerId} 
                onChange={(e) => setAssignmentData(prev => ({ ...prev, officerId: e.target.value }))}
                style={{ width: '100%', padding: 10, marginTop: 5, border: '1px solid #ccc', borderRadius: 4 }}
              >
                <option value="">Choose an officer...</option>
                {officers.map(officer => (
                  <option key={officer.id} value={officer.id}>
                    {officer.fullName} ({officer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 15 }}>
              <label><strong>Deadline (Optional):</strong></label>
              <input
                type="datetime-local"
                value={assignmentData.deadline}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, deadline: e.target.value }))}
                style={{ width: '100%', padding: 10, marginTop: 5, border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 15 }}>
              <label><strong>Assignment Comment (Optional):</strong></label>
              <textarea
                value={assignmentData.comment}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Add a comment about this assignment..."
                style={{ width: '100%', minHeight: 60, padding: 10, marginTop: 5, border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowAssignModal(false)} 
                className="btn" 
                style={{ backgroundColor: '#6c757d', color: 'white' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('Assign button clicked');
                  console.log('Current assignment data:', assignmentData);
                  assignComplaint();
                }} 
                className="btn btn-primary"
                disabled={!assignmentData.officerId}
              >
                Assign Complaint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional CSS for new elements */}
      <style jsx>{`
        .urgency-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .urgency-high { background-color: #ffebee; color: #c62828; }
        .urgency-medium { background-color: #fff3e0; color: #ef6c00; }
        .urgency-low { background-color: #e8f5e8; color: #2e7d32; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
