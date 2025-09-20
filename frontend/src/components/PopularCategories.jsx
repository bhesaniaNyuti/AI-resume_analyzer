import './PopularCategories.css';

const categories = {
  Business: [
    'Banking', 'HR', 'Sales', 'Accounting', 'Work From Home', 'Customer Support'
  ],
  Tech: [
    'IT', 'SQL', 'Oracle', 'Software Development', 'Data Science', 'Cloud Computing'
  ],
  Creative: [
    'Graphic Design', 'Digital Marketing', 'Event Management', 'Content Writing', 'UI/UX Design', 'Video Editing'
  ]
};

export default function PopularCategories() {
  return (
    <section className="nspc-section" aria-label="Popular Categories">
      <h2 className="nspc-title">Popular Categories</h2>
      
      <div className="nspc-cards-container">
        {Object.entries(categories).map(([section, sectionCategories]) => (
          <div key={section} className="nspc-card">
            <h3 className="nspc-card-title">{section}</h3>
            <div className="nspc-categories-list">
              {sectionCategories.map((category) => (
                <span key={category} className="nspc-category-tag">
                  {category}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
