import React, { useState } from 'react';
import './ResumeHealthCheck.css';

export default function ResumeHealthCheck() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentUpload, setCurrentUpload] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if there's already a current upload
      if (currentUpload && currentUpload !== selectedFile.name) {
        setError('Only one resume can be uploaded at a time. Please clear the current upload first.');
        setFile(null);
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        setFile(null);
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setCurrentUpload(selectedFile.name);
      setError('');
      setResult(null);
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || data.detail || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearUpload = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/clear-upload', {
        method: 'POST',
      });
      
      if (response.ok) {
        setFile(null);
        setCurrentUpload(null);
        setResult(null);
        setError('');
        // Reset file input
        const fileInput = document.getElementById('resume-upload');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      setError('Failed to clear upload: ' + err.message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good, but can be improved';
    return 'Needs significant improvement';
  };

  return (
    <section className="rhc-section" id="resume-check">
      <h2 className="rhc-title">Try a Free Resume Health Check</h2>
      <p className="rhc-subtitle">Get instant feedback on your resume and see how it ranks</p>
      
      <div className="rhc-card rhc-blur-card">
        <div className="rhc-card-inner">
          {!result ? (
            <>
          <div className="rhc-score-gradient">
                <span className="rhc-score-text">/100</span>
              </div>
              <h3 className="rhc-card-title">Your Resume Score</h3>
              <p className="rhc-card-desc">Upload your resume to get instant AI-powered analysis and feedback.</p>
              
              <div className="rhc-upload-section">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="rhc-file-input"
                />
                <label htmlFor="resume-upload" className="rhc-upload-btn">
                  {file ? file.name : 'Choose Resume File'}
                </label>
                
                {currentUpload && (
                  <button onClick={clearUpload} className="rhc-clear-btn">
                    Clear Upload
                  </button>
                )}
                
                <button
                  onClick={analyzeResume}
                  disabled={!file || loading}
                  className="rhc-analyze-btn"
                >
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
            </>
          ) : (
            <>
              {result.cached && (
                <div className="rhc-cached-notice">
                  <span className="rhc-cached-icon">💾</span>
                  <span className="rhc-cached-text">{result.message}</span>
                </div>
              )}
              
              <div className="rhc-score-gradient" style={{ background: `linear-gradient(135deg, ${getScoreColor(result.score)} 0%, ${getScoreColor(result.score)}dd 100%)` }}>
                <span className="rhc-score-text">{result.score}</span>
          </div>
          <h3 className="rhc-card-title">Your Resume Score</h3>
              <p className="rhc-card-desc">{getScoreMessage(result.score)}</p>
              
              {result.professionalism_score && (
                <div className="rhc-breakdown">
                  <h4>Professionalism Breakdown</h4>
                  <div className="rhc-breakdown-grid">
                    <div className="rhc-breakdown-item">
                      <span>Grammar & Language</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.grammar / 20) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.grammar * 5)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.grammar}/20</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Structure & Format</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.structure / 25) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.structure * 4)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.structure}/25</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Readability</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.readability / 15) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.readability * 6.67)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{Math.round(result.professionalism_score.readability)}/15</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Keywords & Skills</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.keywords / 15) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.keywords * 6.67)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.keywords}/15</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Contact Information</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.contact_info / 10) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.contact_info * 10)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.contact_info}/10</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Achievements</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.achievements / 5) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.achievements * 20)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.achievements}/5</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Formatting & Presentation</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.formatting / 10) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.formatting * 10)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.formatting}/10</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Action Verbs</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.action_verbs / 5) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.action_verbs * 20)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.action_verbs}/5</span>
                      </div>
                    </div>
                    
                    <div className="rhc-breakdown-item">
                      <span>Quantification & Metrics</span>
                      <div className="rhc-breakdown-bar">
                        <div 
                          className="rhc-breakdown-fill" 
                          style={{ 
                            width: `${(result.professionalism_score.quantification / 5) * 100}%`,
                            backgroundColor: getScoreColor(result.professionalism_score.quantification * 20)
                          }}
                        ></div>
                        <span className="rhc-breakdown-score">{result.professionalism_score.quantification}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {result.download_urls && Object.keys(result.download_urls).length > 0 && (
                <div className="rhc-download-section">
                  <h4>Download Improved Resume</h4>
                  <div className="rhc-download-buttons">
                    {result.download_urls.corrected_pdf && (
                      <a
                        href={`http://127.0.0.1:8000${result.download_urls.corrected_pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rhc-download-btn rhc-pdf-btn"
                        onClick={() => {
                          // Open in new tab and trigger print dialog
                          const newWindow = window.open(`http://127.0.0.1:8000${result.download_urls.corrected_pdf}`, '_blank');
                          if (newWindow) {
                            newWindow.onload = () => {
                              setTimeout(() => newWindow.print(), 1000);
                            };
                          }
                        }}
                      >
                        📄 Download Your Updated Resume (Print as PDF)
                      </a>
                    )}
                    
                    {result.download_urls.professional_pdf && (
                      <a
                        href={`http://127.0.0.1:8000${result.download_urls.professional_pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rhc-download-btn rhc-pdf-btn"
                      >
                        🎯 View Professional Resume (Print as PDF)
                      </a>
                    )}
                    
                    {result.download_urls.corrected_html && (
                      <a
                        href={`http://127.0.0.1:8000${result.download_urls.corrected_html}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rhc-download-btn"
                      >
                        🌐 View Resume Online
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          {error && (
            <div className="rhc-error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 