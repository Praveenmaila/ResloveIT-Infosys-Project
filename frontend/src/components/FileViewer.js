import React, { useState, useEffect } from 'react';

const FileViewer = ({ attachmentPath, complaint }) => {
  const [error, setError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showComplaintPreview, setShowComplaintPreview] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  
  const fileUrl = attachmentPath ? `http://localhost:8081/api/complaints/files/${attachmentPath}` : '';
  const token = localStorage.getItem('token');
  
  // Get file extension
  const extension = attachmentPath ? attachmentPath.split('.').pop().toLowerCase() : '';
  
  // Check if it's an image
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const isImage = imageExtensions.includes(extension);
  
  // Check if it's a video
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
  const isVideo = videoExtensions.includes(extension);
  
  // Check if it's a document
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt'];
  const isDocument = documentExtensions.includes(extension);

  useEffect(() => {
    if (showPreview && isImage && !imageSrc) {
      // Load image with authentication
      fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      })
      .catch(err => {
        console.error('Failed to load image:', err);
        setError(true);
      });
    }
  }, [showPreview, isImage, imageSrc, fileUrl, token]);

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  if (!attachmentPath) return null;

  const handleError = () => {
    setError(true);
  };

  const downloadFile = () => {
    fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachmentPath;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(err => {
      console.error('Download failed:', err);
      alert('Failed to download file');
    });
  };

  if (error) {
    return (
      <div style={{ padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
        <p style={{ color: '#c62828', margin: 0 }}>
          <strong>Attachment:</strong> {attachmentPath}
          <button 
            onClick={downloadFile}
            style={{ 
              marginLeft: '10px', 
              padding: '4px 8px', 
              backgroundColor: '#2196f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📥 Download
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong>Attachment:</strong>
          <div style={{ display: 'flex', gap: '8px' }}>
            {complaint && (
              <button 
                onClick={() => setShowComplaintPreview(true)}
                style={{ 
                  padding: '6px 12px', 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📋 View Complaint
              </button>
            )}
            <button 
              onClick={() => setShowPreview(true)}
              style={{ 
                padding: '6px 12px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              👁️ Preview File
            </button>
            <button 
              onClick={downloadFile}
              style={{ 
                padding: '6px 12px', 
                backgroundColor: '#2196f3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📥 Download
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>📎 {attachmentPath}</p>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #e0e0e0',
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>📎 File Preview</h3>
              <button 
                onClick={() => setShowPreview(false)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '20px',
              overflow: 'auto',
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
              {isImage && imageSrc && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <img 
                    src={imageSrc}
                    alt="Attachment Preview"
                    onError={handleError}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '70vh', 
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', marginBottom: 0 }}>{attachmentPath}</p>
                </div>
              )}

              {isImage && !imageSrc && !error && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#666' }}>Loading image...</p>
                </div>
              )}
              
              {isVideo && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <video 
                    controls 
                    onError={handleError}
                    crossOrigin="use-credentials"
                    style={{ 
                      width: '100%',
                      maxHeight: '70vh', 
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                    autoPlay
                  >
                    <source src={fileUrl} type={`video/${extension}`} />
                    Your browser does not support the video tag.
                  </video>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', marginBottom: 0 }}>{attachmentPath}</p>
                </div>
              )}
              
              {isDocument && (
                <div style={{ width: '100%' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#333' }}>
                    📄 <strong>{attachmentPath}</strong>
                  </p>
                  {extension === 'pdf' && (
                    <iframe 
                      src={fileUrl}
                      onError={handleError}
                      style={{ 
                        width: '100%', 
                        height: '70vh', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      title="PDF Viewer"
                    />
                  )}
                  {(extension === 'doc' || extension === 'docx') && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: '#666', margin: '10px 0' }}>
                        📄 This is a {extension.toUpperCase()} document
                      </p>
                      <p style={{ color: '#999', fontSize: '12px', margin: '10px 0' }}>
                        Document preview is not available in the browser. Please download the file to view it.
                      </p>
                      <button 
                        onClick={downloadFile}
                        style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#2196f3', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        📥 Download to View
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {!isImage && !isVideo && !isDocument && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <p style={{ color: '#666', margin: '10px 0' }}>
                    📎 <strong>{attachmentPath}</strong>
                  </p>
                  <p style={{ color: '#999', fontSize: '12px', margin: '10px 0' }}>
                    Preview not available for this file type
                  </p>
                  <button 
                    onClick={downloadFile}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#2196f3', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Download File
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid #e0e0e0',
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              backgroundColor: '#f9f9f9'
            }}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                File: <strong>{attachmentPath}</strong>
              </span>
              <button 
                onClick={downloadFile}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📥 Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Preview Modal */}
      {showComplaintPreview && complaint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '2px solid #e0e0e0',
              flexShrink: 0,
              backgroundColor: '#f8f9fa'
            }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>📋 Complaint #{ complaint.id}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  Status: <strong>{complaint.status?.replace('_', ' ')}</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowComplaintPreview(false)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 15px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '20px',
              overflow: 'auto',
              flex: 1
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Left Column */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>CATEGORY</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{complaint.category}</p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>URGENCY</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: complaint.urgency === 'HIGH' ? '#ffebee' : complaint.urgency === 'MEDIUM' ? '#fff3e0' : '#e8f5e8',
                        color: complaint.urgency === 'HIGH' ? '#c62828' : complaint.urgency === 'MEDIUM' ? '#ef6c00' : '#2e7d32'
                      }}>
                        {complaint.urgency}
                      </span>
                    </p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>SUBMITTED BY</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                      {complaint.username || complaint.fullName || 'Anonymous'}
                    </p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>CREATED DATE</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                      {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {complaint.assignedOfficer && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>ASSIGNED OFFICER</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{complaint.assignedOfficer}</p>
                    </div>
                  )}

                  {complaint.deadline && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>DEADLINE</p>
                      <p style={{ margin: 0, fontSize: '14px', color: new Date(complaint.deadline) < new Date() ? '#d32f2f' : '#333' }}>
                        {new Date(complaint.deadline).toLocaleString()}
                        {new Date(complaint.deadline) < new Date() && <span style={{ marginLeft: '5px', color: '#d32f2f', fontWeight: 'bold' }}>(OVERDUE)</span>}
                      </p>
                    </div>
                  )}

                  {complaint.escalatedAt && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>ESCALATED</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#d32f2f' }}>
                        {new Date(complaint.escalatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>STATUS</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#e3f2fd',
                        color: '#1565c0'
                      }}>
                        {complaint.status?.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>DESCRIPTION</p>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  borderLeft: '4px solid #2196f3',
                  borderRadius: '4px',
                  color: '#333',
                  lineHeight: '1.6'
                }}>
                  {complaint.description}
                </div>
              </div>

              {/* Attachment Preview */}
              {attachmentPath && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>ATTACHMENT</p>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f0f7ff',
                    borderRadius: '4px',
                    border: '1px solid #2196f3'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>
                      📎 {attachmentPath}
                    </p>
                    <button 
                      onClick={() => {
                        setShowComplaintPreview(false);
                        setShowPreview(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginRight: '8px'
                      }}
                    >
                      👁️ View File
                    </button>
                    <button 
                      onClick={downloadFile}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      📥 Download File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '2px solid #e0e0e0',
              padding: '15px 20px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button 
                onClick={() => setShowComplaintPreview(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileViewer;
