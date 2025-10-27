import React, { useState } from 'react';
import { complaintService } from '../services/api';

const AnonymousComplaint = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    urgency: 'LOW'
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      if (file) {
        data.append('file', file);
      }

      await complaintService.createAnonymousComplaint(data);
      setSuccess('Complaint submitted successfully! (Note: Anonymous complaints cannot be tracked)');
      setFormData({ category: '', description: '', urgency: 'LOW' });
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '700px', margin: '50px auto',color:'black' }}>
        <h2 style={{ color: 'white' }}>Submit Anonymous Complaint</h2>
        <p style={{ marginBottom: '20px', color: 'white' }}>
          Note: Anonymous complaints cannot be tracked. Create an account to track your complaints.
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
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', color:'white' }}>
            Submit Anonymous Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnonymousComplaint;
