import { motion } from "framer-motion";
import React from "react";

const stories = [
  {
    initials: "SJ",
    name: "Sarah Johnson",
    role: "Software Engineer at TechCorp",
    review:
      "NexSkill helped me find my dream job in just 2 weeks! The AI matching was incredibly accurate.",
    stars: 5,
  },
  {
    initials: "MC",
    name: "Mike Chen",
    role: "HR Director at InnovateTech",
    review:
      "We reduced our hiring time by 60% and found better candidates than ever before.",
    stars: 5,
  },
  {
    initials: "ER",
    name: "Emily Rodriguez",
    role: "Product Manager at StartupXYZ",
    review:
      "The resume ranking feature is a game-changer. It saves us hours of manual screening.",
    stars: 5,
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 80 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.2, duration: 0.7, type: "spring", stiffness: 80 },
  }),
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 32px rgba(33,150,243,0.18)",
    transition: { duration: 0.3 },
  },
};

const starVariants = {
  initial: { scale: 0, rotate: -90 },
  animate: (i) => ({ scale: 1, rotate: 0, transition: { delay: 0.7 + i * 0.1, type: "spring", stiffness: 200 } }),
};

const SuccessStories = () => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={sectionVariants}
    style={{
      padding: "80px 0 100px 0",
      background: "linear-gradient(135deg, #f8f9fb 60%, #e3f0ff 100%)",
      minHeight: 600,
      width: "100%",
    }}
  >
    <div style={{ textAlign: "center", marginBottom: 64 }}>
      <motion.h2
        style={{ fontSize: 64, fontWeight: 800, margin: 0, letterSpacing: 1 }}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        Success Stories
      </motion.h2>
      <motion.p
        style={{ color: "#5a6473", fontSize: 28, marginTop: 16 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        Hear from our satisfied users who found their perfect match
      </motion.p>
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 48,
        flexWrap: "wrap",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {stories.map((story, idx) => (
        <motion.div
          key={idx}
          custom={idx}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            background: "#fff",
            borderRadius: 32,
            padding: 48,
            width: 420,
            minHeight: 340,
            boxShadow: "0 4px 24px rgba(33,150,243,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            cursor: "pointer",
            transition: "box-shadow 0.3s, transform 0.3s",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <div
              style={{
                background: "#2196f3",
                color: "#fff",
                borderRadius: "50%",
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 28,
                marginRight: 20,
                boxShadow: "0 2px 8px rgba(33,150,243,0.12)",
              }}
            >
              {story.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 26 }}>{story.name}</div>
              <div style={{ color: "#5a6473", fontSize: 18 }}>{story.role}</div>
            </div>
          </div>
          <div style={{ fontSize: 22, marginBottom: 24, color: "#222", fontStyle: "italic" }}>
            "{story.review}"
          </div>
          <div style={{ color: "#ffc107", fontSize: 32, display: "flex", gap: 4 }}>
            {Array.from({ length: story.stars }).map((_, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={starVariants}
                initial="initial"
                animate="animate"
              >
                ★
              </motion.span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

export default SuccessStories; 