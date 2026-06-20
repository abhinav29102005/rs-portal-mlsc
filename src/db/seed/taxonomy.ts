/**
 * TIET Research Domain Taxonomy (Section 8 of spec)
 * and Skills Taxonomy (Section 6.2)
 */

export interface DomainSeed {
  name: string;
  children: string[];
}

export const RESEARCH_DOMAINS: DomainSeed[] = [
  {
    name: "Artificial Intelligence & ML",
    children: [
      "Deep Learning",
      "Reinforcement Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Generative AI",
      "Federated Learning",
      "Explainable AI",
    ],
  },
  {
    name: "Data Science & Analytics",
    children: [
      "Big Data",
      "Data Mining",
      "Statistical Modeling",
      "Business Intelligence",
    ],
  },
  {
    name: "Systems & Networks",
    children: [
      "Distributed Systems",
      "Cloud Computing",
      "Edge Computing",
      "Wireless Sensor Networks",
      "5G/6G",
      "Network Security",
    ],
  },
  {
    name: "Cybersecurity",
    children: [
      "Cryptography",
      "Blockchain",
      "Intrusion Detection",
      "Privacy-Preserving Computation",
    ],
  },
  {
    name: "Signal Processing",
    children: [
      "Digital Signal Processing",
      "Image Processing",
      "Audio Processing",
      "RADAR",
    ],
  },
  {
    name: "VLSI & Embedded Systems",
    children: [
      "Analog VLSI Design",
      "FPGA",
      "Nanotechnology",
      "Carbon Nanotube Interconnects",
      "SoC Design",
    ],
  },
  {
    name: "Robotics & Automation",
    children: [
      "Autonomous Systems",
      "ROS",
      "Path Planning",
      "Multi-agent Systems",
    ],
  },
  {
    name: "Biomedical Engineering",
    children: [
      "Medical Imaging",
      "Wearables",
      "Biosensors",
      "Computational Biology",
    ],
  },
  {
    name: "Energy & Sustainability",
    children: [
      "Renewable Energy",
      "Smart Grid",
      "Energy Storage",
      "Environmental Monitoring",
    ],
  },
  {
    name: "Manufacturing & Materials",
    children: [
      "Composite Materials",
      "Additive Manufacturing",
      "Fracture Analysis",
      "Smart Manufacturing",
    ],
  },
  {
    name: "Theoretical CS",
    children: [
      "Algorithms",
      "Complexity Theory",
      "Formal Verification",
      "Computational Biology",
    ],
  },
  {
    name: "Software Engineering",
    children: ["DevOps", "Microservices", "Testing & QA", "Software Architecture"],
  },
];

export interface SkillSeed {
  name: string;
  category: "language" | "framework" | "tool" | "domain" | "soft_skill";
}

export const SKILLS_TAXONOMY: SkillSeed[] = [
  // Programming Languages
  { name: "C", category: "language" },
  { name: "C++", category: "language" },
  { name: "Python", category: "language" },
  { name: "Java", category: "language" },
  { name: "JavaScript", category: "language" },
  { name: "TypeScript", category: "language" },
  { name: "Rust", category: "language" },
  { name: "Go", category: "language" },
  { name: "R", category: "language" },
  { name: "MATLAB", category: "language" },
  { name: "Verilog", category: "language" },
  { name: "VHDL", category: "language" },
  { name: "SQL", category: "language" },
  { name: "Kotlin", category: "language" },
  { name: "Swift", category: "language" },
  { name: "Scala", category: "language" },
  { name: "Julia", category: "language" },
  { name: "Assembly", category: "language" },
  { name: "Shell/Bash", category: "language" },

  // Frameworks & Libraries
  { name: "React", category: "framework" },
  { name: "Next.js", category: "framework" },
  { name: "Angular", category: "framework" },
  { name: "Vue.js", category: "framework" },
  { name: "Node.js", category: "framework" },
  { name: "Express", category: "framework" },
  { name: "FastAPI", category: "framework" },
  { name: "Django", category: "framework" },
  { name: "Flask", category: "framework" },
  { name: "Spring Boot", category: "framework" },
  { name: "PyTorch", category: "framework" },
  { name: "TensorFlow", category: "framework" },
  { name: "Keras", category: "framework" },
  { name: "scikit-learn", category: "framework" },
  { name: "Pandas", category: "framework" },
  { name: "NumPy", category: "framework" },
  { name: "OpenCV", category: "framework" },
  { name: "Hugging Face", category: "framework" },
  { name: "LangChain", category: "framework" },
  { name: "ROS", category: "framework" },
  { name: "Apache Spark", category: "framework" },
  { name: "Hadoop", category: "framework" },
  { name: "Docker", category: "framework" },
  { name: "Kubernetes", category: "framework" },

  // Research Tools
  { name: "LaTeX", category: "tool" },
  { name: "Jupyter Notebook", category: "tool" },
  { name: "Google Colab", category: "tool" },
  { name: "GNU Radio", category: "tool" },
  { name: "LTSpice", category: "tool" },
  { name: "MATLAB Simulink", category: "tool" },
  { name: "Xilinx Vivado", category: "tool" },
  { name: "Cadence", category: "tool" },
  { name: "ANSYS", category: "tool" },
  { name: "SolidWorks", category: "tool" },
  { name: "AutoCAD", category: "tool" },
  { name: "Git/GitHub", category: "tool" },
  { name: "Overleaf", category: "tool" },
  { name: "Wireshark", category: "tool" },
  { name: "Postman", category: "tool" },
  { name: "Figma", category: "tool" },
  { name: "Tableau", category: "tool" },
  { name: "Power BI", category: "tool" },

  // Domains
  { name: "Machine Learning", category: "domain" },
  { name: "Computer Vision", category: "domain" },
  { name: "NLP", category: "domain" },
  { name: "Systems Programming", category: "domain" },
  { name: "VLSI", category: "domain" },
  { name: "Robotics", category: "domain" },
  { name: "IoT", category: "domain" },
  { name: "Cybersecurity", category: "domain" },
  { name: "Distributed Systems", category: "domain" },
  { name: "Bioinformatics", category: "domain" },
  { name: "Signal Processing", category: "domain" },
  { name: "Cloud Computing", category: "domain" },
  { name: "Blockchain", category: "domain" },
  { name: "Embedded Systems", category: "domain" },
  { name: "Data Engineering", category: "domain" },
  { name: "Web Development", category: "domain" },
  { name: "Mobile Development", category: "domain" },
  { name: "Game Development", category: "domain" },
  { name: "DevOps", category: "domain" },

  // Soft Skills
  { name: "Technical Writing", category: "soft_skill" },
  { name: "Public Speaking", category: "soft_skill" },
  { name: "Team Leadership", category: "soft_skill" },
  { name: "Project Management", category: "soft_skill" },
  { name: "Research Methodology", category: "soft_skill" },
  { name: "Data Analysis", category: "soft_skill" },
];

/** Departments at TIET */
export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical & Instrumentation Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Experiential Learning Centre",
  "School of Mathematics",
  "School of Physics & Materials Science",
  "School of Chemistry & Biochemistry",
  "School of Humanities & Social Sciences",
  "TIFAC-CORE",
  "COE-FS",
  "School of Advanced AI & Data Science",
  "School of Energy & Environment",
  "School of Management",
  "Interdisciplinary",
];

/** Faculty designations */
export const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Distinguished Professor",
  "Professor Emeritus",
  "Visiting Faculty",
  "Adjunct Faculty",
  "Research Associate",
];

/** Mentorship style tags */
export const MENTORSHIP_STYLES = [
  "Hands-on",
  "Independent work",
  "Weekly check-ins",
  "Publication-focused",
  "Hackathon-friendly",
  "Industry-oriented",
  "Theoretical focus",
  "Project-based",
  "Reading group",
  "Code review intensive",
];
