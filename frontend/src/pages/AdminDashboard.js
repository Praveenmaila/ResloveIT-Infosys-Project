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

  useEffect(() => {
    fetchComplaints();
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
    try {
      await complaintService.updateComplaintStatus(id, newStatus);
      setSuccess('Status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchComplaints();
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint((s) => ({ ...s, status: newStatus }));
      }
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const addComment = async (id) => {
    if (!comment.trim()) return;
    try {
      await complaintService.addComment(id, comment);
      setSuccess('Comment added successfully');
      setComment('');
      setTimeout(() => setSuccess(''), 3000);
      fetchComplaints();
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint((s) => ({ ...s, comments: [...(s.comments || []), comment] }));
      }
    } catch (err) {
      setError('Failed to add comment');
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
                <th>Complaint ID</th>
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
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.username}</td>
                  <td>{c.category}</td>
                  <td style={{ maxWidth: 200 }}>{(c.description || '').substring(0, 50)}{(c.description || '').length > 50 ? '...' : ''}</td>
                  <td>{c.urgency}</td>
                  <td><span className={`status-badge ${getStatusClass(c.status)}`}>{c.status.replace('_', ' ')}</span></td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button onClick={() => setSelectedComplaint(c)} className="btn btn-primary" style={{ fontSize: 12, padding: '5px 10px' }}>
                      View
                    </button>
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
              <p><strong>Urgency:</strong> {selectedComplaint.urgency}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedComplaint.status)}`}>{selectedComplaint.status.replace('_', ' ')}</span></p>
              <p><strong>Description:</strong></p>
              <p className="description">{selectedComplaint.description}</p>
              {selectedComplaint.attachmentPath && (
                <p><strong>Attachment:</strong> {selectedComplaint.attachmentPath}</p>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <h4>Update Status</h4>
              <div className="status-buttons" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                <button onClick={() => updateStatus(selectedComplaint.id, 'UNDER_REVIEW')} className="btn btn-review">Under Review</button>
                <button onClick={() => updateStatus(selectedComplaint.id, 'IN_PROGRESS')} className="btn btn-progress">In Progress</button>
                <button onClick={() => updateStatus(selectedComplaint.id, 'ESCALATED')} className="btn" style={{ backgroundColor: '#dc3545', color: 'white' }}>Escalate</button>
                <button onClick={() => updateStatus(selectedComplaint.id, 'RESOLVED')} className="btn btn-success">Resolve</button>
                <button onClick={() => updateStatus(selectedComplaint.id, 'CLOSED')} className="btn" style={{ backgroundColor: '#343a40', color: 'white' }}>Close</button>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h4>Comments</h4>
              {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                <ul>
                  {selectedComplaint.comments.map((c, idx) => <li key={idx} style={{ marginBottom: 5 }}>{c}</li>)}
                </ul>
              ) : <p>No comments yet</p>}

              <div className="form-group" style={{ marginTop: 10  }}>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." style={{ minHeight: 60, width: '100%' }} />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button onClick={() => addComment(selectedComplaint.id)} className="btn btn-primary">Add Comment</button>
                  <button onClick={() => setSelectedComplaint(null)} className="btn btn-danger" style={{ marginLeft: 'auto' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
