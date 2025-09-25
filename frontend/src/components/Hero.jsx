// Hero.jsx
import { motion } from "framer-motion";
import "./Hero.css";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="nsf-hero relative" aria-label="Job Search Hero Section">
      {/* Background with animated waves + gradient overlay */}
      <motion.div
        className="nsf-hero-bg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { duration: 1.2, ease: "easeOut" },
        }}
        whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
      >
        <svg
          className="nsf-hero-waves"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fill="#fff"
            fillOpacity="0.08"
            d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
          <path
            fill="#fff"
            fillOpacity="0.15"
            d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,186.7C840,203,960,181,1080,154.7C1200,128,1320,96,1380,80L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <motion.div
        className="nsf-hero-content max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="hero-title text-5xl md:text-6xl font-extrabold text-white leading-tight"
        >
          Discover <span className="nsf-hero-highlight">800,000+</span>{" "}
          opportunities <br />
          <span className="opacity-90">shaped just for you</span>
        </motion.h1>

        {/* Interactive animated showcase (replaces search bar) */}
        <motion.div
          className="nsf-hero-badges mt-8"
          variants={itemVariants}
        >
          {[
            { label: "AI Resume Scan", color: "teal" },
            { label: "ATS Score", color: "violet" },
            { label: "Instant Feedback", color: "cyan" },
            { label: "Smart Suggestions", color: "indigo" },
          ].map((b, i) => (
            <motion.div
              key={b.label}
              className={`nsf-badge nsf-badge--${b.color}`}
              drag
              dragMomentum={false}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96, rotate: 2 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, repeatType: "mirror" }}
            >
              {b.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Floating glow accents for visual motion */}
        <motion.div
          className="nsf-hero-glows"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          aria-hidden
        >
          <motion.span className="glow glow-a" animate={{ x: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }} />
          <motion.span className="glow glow-b" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, repeatType: "mirror" }} />
          <motion.span className="glow glow-c" animate={{ x: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
