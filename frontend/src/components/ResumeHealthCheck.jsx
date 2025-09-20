import './ResumeHealthCheck.css';

export default function ResumeHealthCheck() {
  return (
    <section className="rhc-section" id="resume-check">
      <h2 className="rhc-title">Try a Free Resume Health Check</h2>
      <p className="rhc-subtitle">Get instant feedback on your resume and see how it ranks</p>
      <div className="rhc-card rhc-blur-card">
        <div className="rhc-card-inner">
          <div className="rhc-score-gradient">
            <span className="rhc-score-text">85%</span>
          </div>
          <h3 className="rhc-card-title">Your Resume Score</h3>
          <p className="rhc-card-desc">Based on our AI analysis, your resume has good potential. Here are some suggestions to improve it further.</p>
          <button className="rhc-upload-btn">Upload Your Resume</button>
        </div>
      </div>
    </section>
  );
} 