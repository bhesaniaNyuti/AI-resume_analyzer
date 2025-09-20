import { FaBolt, FaBullseye, FaChartLine, FaCheckCircle, FaUserCheck, FaUserTie } from 'react-icons/fa';
import { MdScreenSearchDesktop } from 'react-icons/md';
import './WhyChoose.css';

const seekers = [
  { icon: <FaUserCheck />, text: 'AI-powered resume optimization' },
  { icon: <FaBullseye />, text: 'Perfect job matches' },
  { icon: <FaChartLine />, text: 'Career growth insights' },
  { icon: <FaBolt />, text: 'Instant feedback' },
];
const recruiters = [
  { icon: <FaUserTie />, text: 'Top candidate recommendations' },
  { icon: <MdScreenSearchDesktop />, text: 'AI-driven screening' },
  { icon: <FaBolt />, text: 'Faster hiring process' },
  { icon: <FaCheckCircle />, text: 'Quality assurance' },
];

export default function WhyChoose() {
  return (
    <section className="why-section" id="why-nexskill">
      <h2 className="why-title">Why Choose NexSkill?</h2>
      <p className="why-subtitle">Discover the benefits that make us the preferred choice for job seekers and recruiters</p>
      <div className="why-cards-row">
        <div className="why-card">
          <div className="why-card-title">For Job Seekers</div>
          <ul className="why-list">
            {seekers.map((item, i) => (
              <li key={i} className="why-list-item">
                <span className="why-icon-bg">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="why-card">
          <div className="why-card-title">For Recruiters</div>
          <ul className="why-list">
            {recruiters.map((item, i) => (
              <li key={i} className="why-list-item">
                <span className="why-icon-bg">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
} 