import React, { useState } from 'react';
import './SimpleResumeAnalyzer.css';

const SimpleResumeAnalyzer = () => {
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
    <div className="resume-analyzer">
      <div className="analyzer-container">
        <h2>Resume Health Check</h2>
        <p className="subtitle">Upload your resume to get instant feedback and suggestions</p>
        
        <div className="upload-section">
          <div className="file-input-container">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="resume-upload" className="file-label">
              {file ? file.name : 'Choose Resume File'}
            </label>
          </div>
          
          <div className="button-group">
            <button
              onClick={analyzeResume}
              disabled={!file || loading}
              className="analyze-button"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
            
            {currentUpload && (
              <button
                onClick={clearUpload}
                className="clear-button"
              >
                Clear Upload
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="results-section">
            {result.cached && (
              <div className="cached-notice">
                <span className="cached-icon">💾</span>
                <span className="cached-text">{result.message}</span>
              </div>
            )}
            
            <div className="score-display">
              <div 
                className="score-circle"
                style={{ backgroundColor: getScoreColor(result.score) }}
              >
                <span className="score-number">{result.score}</span>
                <span className="score-total">/100</span>
              </div>
              <h3>Resume Health Score</h3>
              <p className="score-message">{getScoreMessage(result.score)}</p>
            </div>

            {result.professionalism_score && (
              <div className="professionalism-breakdown">
                <h4>Professionalism Breakdown</h4>
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Grammar & Language</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.grammar / 20) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.grammar * 5)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.grammar}/20</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Structure & Format</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.structure / 25) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.structure * 4)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.structure}/25</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Readability</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.readability / 15) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.readability * 6.67)
                        }}
                      ></div>
                      <span className="breakdown-score">{Math.round(result.professionalism_score.readability)}/15</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Keywords & Skills</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.keywords / 15) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.keywords * 6.67)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.keywords}/15</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Contact Information</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.contact_info / 10) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.contact_info * 10)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.contact_info}/10</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Achievements</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.achievements / 5) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.achievements * 20)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.achievements}/5</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Formatting & Presentation</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.formatting / 10) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.formatting * 10)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.formatting}/10</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Action Verbs</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.action_verbs / 5) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.action_verbs * 20)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.action_verbs}/5</span>
                    </div>
                  </div>
                  
                  <div className="breakdown-item">
                    <span className="breakdown-label">Quantification & Metrics</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill" 
                        style={{ 
                          width: `${(result.professionalism_score.quantification / 5) * 100}%`,
                          backgroundColor: getScoreColor(result.professionalism_score.quantification * 20)
                        }}
                      ></div>
                      <span className="breakdown-score">{result.professionalism_score.quantification}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="analysis-details">
              <h4>Analysis Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Word Count:</span>
                  <span className="detail-value">{result.analysis_details.word_count}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sections Found:</span>
                  <span className="detail-value">{result.analysis_details.sections_found}/6</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{result.analysis_details.has_email ? '✓' : '✗'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{result.analysis_details.has_phone ? '✓' : '✗'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bullet Points:</span>
                  <span className="detail-value">{result.analysis_details.bullet_count}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Achievements:</span>
                  <span className="detail-value">{result.analysis_details.achievement_count}</span>
                </div>
              </div>
            </div>

            {result.download_urls && Object.keys(result.download_urls).length > 0 && (
              <div className="download-section">
                <h4>Download Improved Resume</h4>
                <div className="download-buttons">
                  {result.download_urls.corrected_pdf && (
                    <a
                      href={`http://127.0.0.1:8000${result.download_urls.corrected_pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button pdf-button"
                    >
                      📄 Download Corrected Resume (PDF)
                    </a>
                  )}
                  
                  {result.download_urls.professional_pdf && (
                    <a
                      href={`http://127.0.0.1:8000${result.download_urls.professional_pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button pdf-button"
                    >
                      🎯 Download Professional Resume (PDF)
                    </a>
                  )}
                  
                  {result.download_urls.corrected_docx && !result.download_urls.corrected_pdf && (
                    <a
                      href={`http://127.0.0.1:8000${result.download_urls.corrected_docx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      📄 Download Corrected Resume (DOCX)
                    </a>
                  )}
                  
                  {result.download_urls.professional_docx && !result.download_urls.professional_pdf && (
                    <a
                      href={`http://127.0.0.1:8000${result.download_urls.professional_docx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      🎯 Download Professional Resume (DOCX)
                    </a>
                  )}
                </div>
                <p className="download-note">
                  Download your improved resume with better formatting, grammar corrections, and professional structure.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleResumeAnalyzer;



