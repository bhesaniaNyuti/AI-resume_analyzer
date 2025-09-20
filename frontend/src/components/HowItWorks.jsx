import { motion } from 'framer-motion';
import { FiUpload } from 'react-icons/fi';
import { GiBrain, GiTargetArrows } from 'react-icons/gi';
import './HowItWorks.css';

const steps = [
  {
    icon: <FiUpload size={48} color="#0099e6" />,
    title: 'Upload Resume',
    desc: 'Simply upload your resume or paste your experience. Our AI analyzes your skills and experience.'
  },
  {
    icon: <GiBrain size={48} color="#0099e6" />,
    title: 'AI Ranks & Matches',
    desc: 'Our advanced AI algorithm ranks your profile and matches it with the best job opportunities.'
  },
  {
    icon: <GiTargetArrows size={48} color="#0099e6" />,
    title: 'Get Recommendations',
    desc: 'Receive personalized job recommendations and insights to improve your profile.'
  }
];

export default function HowItWorks() {
  return (
    <section className="hiw-section" id="how-it-works">
      <motion.h2 
        className="hiw-title"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        How It Works
      </motion.h2>
      <motion.p 
        className="hiw-subtitle"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Our AI-powered system makes job matching simple and effective
      </motion.p>
      <div className="hiw-steps">
        {steps.map((step, i) => (
          <motion.div
            className="hiw-step"
            key={step.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="hiw-icon-bg">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 