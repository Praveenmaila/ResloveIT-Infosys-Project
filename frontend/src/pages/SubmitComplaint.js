import React, { useState } from 'react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SubmitComplaint = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    urgency: 'LOW',
    anonymous: false
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('urgency', formData.urgency);
      data.append('anonymous', formData.anonymous);
      if (file) {
        data.append('file', file);
      }

      await complaintService.createComplaint(data);
      setSuccess('Complaint submitted successfully! You can track it in "My Complaints"');
      setFormData({ category: '', description: '', urgency: 'LOW', anonymous: false });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '700px', margin: '50px auto' }}>
        <h2>Submit Complaint</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Logged in as: <strong>{user?.username}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="Academic">Academic</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Administrative">Administrative</option>
              <option value="Harassment">Harassment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your complaint in detail..."
            />
          </div>
          <div className="form-group">
            <label>Urgency</label>
            <select name="urgency" value={formData.urgency} onChange={handleChange} required>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Attachment (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              Submit as Anonymous (won't be able to track)
            </label>
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
