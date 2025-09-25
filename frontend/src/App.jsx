import { Route, Routes } from 'react-router-dom';
import './App.css';
import AddJob from './components/AddJob';
import Header from './components/Header';
import FeaturedCompanies from './components/FeaturedCompanies';
import PopularCategories from './components/PopularCategories';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Login from './components/Login';
import RecruiterDashboard from './components/RecruiterDashboard';
import Register from './components/Register';
import WhyChoose from './components/WhyChoose';
import SuccessStories from './components/SuccessStories';
import JobSeekerDashboard from './components/jobseeker/JobSeekerDashboard';
import JobDetails from './components/jobseeker/JobDetails';
import ResumeTest from './pages/ResumeTest';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import RecruiterProfileEdit from './components/RecruiterProfileEdit';
import JobEdit from './components/JobEdit';

function App() {
  return (
    <div className="nexskill-root">
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <FeaturedCompanies />
            <PopularCategories />
            <HowItWorks />
            <WhyChoose />
            <SuccessStories />
            {/* Footer */}
            <footer className="ns-footer">
              <span>© {new Date().getFullYear()} NexSkill. All rights reserved.</span>
            </footer>
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/jobseeker-dashboard" element={<JobSeekerDashboard />} />
        <Route path="/job-details/:jobId" element={<JobDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/jobseeker-profile" element={<Profile />} />
        <Route path="/recruiter-profile" element={<Profile />} />
        <Route path="/resume-test" element={<ResumeTest />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/jobseeker-profile/edit" element={<ProfileEdit />} />
        <Route path="/recruiter-profile/edit" element={<RecruiterProfileEdit />} />
        <Route path="/edit-job/:jobId" element={<JobEdit />} />
      </Routes>
    </div>
  );
}

export default App;
