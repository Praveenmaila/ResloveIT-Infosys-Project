import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintService.getMyComplaints();
      setComplaints(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch complaints');
      setLoading(false);
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

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h2>My Complaints</h2>
      {error && <div className="error">{error}</div>}
      
      {complaints.length === 0 ? (
        <div className="card">
          <p>You haven't submitted any complaints yet.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint.id}>
                  <td>{complaint.id}</td>
                  <td>{complaint.category}</td>
                  <td style={{ maxWidth: '300px' }}>
                    {complaint.description.substring(0, 100)}
                    {complaint.description.length > 100 ? '...' : ''}
                  </td>
                  <td>{complaint.urgency}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
