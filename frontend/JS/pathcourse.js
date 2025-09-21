const streamSelect = document.getElementById('streamSelect');
const pathDisplay = document.getElementById('pathDisplay');

// Define course paths
const coursePaths = {
  "Science": ["B.Sc → M.Sc → Scientist/Engineer/Doctor", "B.Tech → Software Engineer/Researcher", "B.Pharm → Pharmacist/Researcher"],
  "Arts": ["B.A → M.A → Teacher/Writer/Designer", "BFA → Designer/Artist", "B.Ed → Teaching Profession"],
  "Commerce": ["B.Com → Accountant/Financial Analyst", "BBA → Manager/Entrepreneur", "CA/CS → Corporate Jobs"],
  "Vocational": ["Diploma/Certification → IT Specialist/Technician", "Skill Courses → Entrepreneurship"],
  "BSc": ["M.Sc → Researcher/Scientist", "B.Tech → Engineer"],
  "BA": ["M.A → Teacher/Writer", "B.Ed → Teaching"],
  "BCom": ["M.Com → Accountant/Financial Analyst", "CA/CS → Corporate Jobs"],
  "BBA": ["MBA → Manager/Entrepreneur", "Business Analyst → Corporate Jobs"]
};

streamSelect.addEventListener('change', () => {
  const value = streamSelect.value;
  pathDisplay.innerHTML = '';

  if(coursePaths[value]) {
    coursePaths[value].forEach(path => {
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerText = path;
      pathDisplay.appendChild(div);
    });
  }
});
