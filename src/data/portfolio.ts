export interface PersonalInfo {
  name: string;
  role: string;
  education: string;
  college: string;
  stage: string;
  primaryLanguage: string;
  interests: string[];
  bio: {
    intro: string;
    skillsFocus: string;
    webFocus: string;
  };
  contact: {
    github: string;
    phone: string;
    email: string;
    linkedin: string;
    resumePath: string;
  };
}

export interface CodingStats {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number; // Max LeetCode 1731
  codeforcesRating: number; // Max CF 1109
  codechefRating: number; // Max CodeChef 1424
  codechefStars: string; // 2* Coder
  codeforcesStatus: string;
  githubUrl: string;
  leetcodeUrl: string;
  codeforcesUrl: string;
  codechefUrl: string;
  codolioUrl?: string;
  leetcodeUsername?: string;
  codeforcesUsername?: string;
  codechefUsername?: string;
  lastUpdated?: string;
}

export interface Achievement {
  id: string;
  title: string;
  event: string;
  organizer: string;
  year: string;
  position: string;
  description: string;
  featured: boolean;
  tags: string[];
  order?: number;
  connectedTo?: string[]; // IDs of chained achievements for webbed constellation
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  level: string;
  highlight?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  dateFormatted: string;
  read: boolean;
}

export interface SkillCategory {
  category: string;
  skills: {
    name: string;
    icon?: string;
    level?: string;
    highlight?: boolean;
  }[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  featured: boolean;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageAlt: string;
  highlights: string[];
}

export interface JourneyMilestone {
  period: string;
  title: string;
  institutionOrEvent: string;
  type: 'education' | 'achievement' | 'project';
  description: string;
  details?: string[];
}

export const portfolioData: {
  personal: PersonalInfo;
  codingStats: CodingStats;
  achievements: Achievement[];
  skillCategories: SkillCategory[];
  projects: Project[];
  journey: JourneyMilestone[];
} = {
  personal: {
    name: "Akash Kumar",
    role: "B.Tech IT Student • Software Developer • Problem Solver",
    education: "B.Tech in Information Technology",
    college: "Rajkiya Engineering College, Banda",
    stage: "Third Year",
    primaryLanguage: "C++",
    interests: [
      "Data Structures & Algorithms",
      "Competitive Programming",
      "Software Development",
      "Web Development",
      "Problem Solving",
      "Building practical technology projects"
    ],
    bio: {
      intro: "I'm Akash Kumar, a B.Tech Information Technology student at Rajkiya Engineering College, Banda, passionate about software development, problem solving, and building technology that solves real-world problems.",
      skillsFocus: "C++ is my strongest programming language, and I spend a significant amount of time strengthening my Data Structures & Algorithms skills through competitive programming and problem solving.",
      webFocus: "I also enjoy building web applications and participating in hackathons, where I can turn ideas into practical solutions."
    },
    contact: {
      github: "https://github.com/Akash-314",
      phone: "+91 7309402534",
      email: "itsakash314@gmail.com",
      linkedin: "https://www.linkedin.com/in/sp4rk314/",
      resumePath: "/resume.pdf"
    }
  },

  codingStats: {
    totalSolved: 541,
    easy: 158,
    medium: 309,
    hard: 74,
    rating: 1736, // 1736 max leetcode rating
    codeforcesRating: 1269, // 1269 max cf rating (pupil)
    codechefRating: 1477, // 1477 codechef rating
    codechefStars: "2★ Coder", // 2* coder
    codeforcesStatus: "1269 Max Rating (Pupil)",
    githubUrl: "https://github.com/Akash-314",
    leetcodeUrl: "https://leetcode.com/u/Sp4rk314/",
    codeforcesUrl: "https://codeforces.com/profile/itsakash314",
    codechefUrl: "https://www.codechef.com/users/sp4rk314",
    codolioUrl: "https://codolio.com/profile/Sp4rk",
    leetcodeUsername: "Sp4rk314",
    codeforcesUsername: "itsakash314",
    codechefUsername: "sp4rk314",
    lastUpdated: "Archive Verified"
  },

  achievements: [
    {
      id: "arjuna-2",
      title: "WINNER — ARJUNA 2.0 HACKATHON",
      event: "Arjuna 2.0 Hackathon",
      organizer: "NIT Agartala",
      year: "2025",
      position: "1st Place",
      description: "Secured 1st place with my team by developing a Smart Drainage and Flood Prevention System, a technology-driven solution focused on flood monitoring and prevention.",
      featured: true,
      tags: ["Hackathon Winner", "IoT / Flood Monitoring", "Smart Systems", "Team Lead"],
      order: 1,
      connectedTo: ["leetcode-knight", "codechef-stars"]
    },
    {
      id: "leetcode-knight",
      title: "LEETCODE 1736 RATING & 541 PROBLEMS",
      event: "Global Contest Leaderboard",
      organizer: "LeetCode",
      year: "2024 - 2025",
      position: "Top 7% Worldwide",
      description: "Achieved max contest rating of 1736 with 541 algorithmic problems solved across Easy, Medium, and Hard tiers in C++.",
      featured: false,
      tags: ["Competitive Programming", "C++", "Data Structures", "Algorithms"],
      order: 2,
      connectedTo: ["arjuna-2", "codechef-stars"]
    },
    {
      id: "codechef-stars",
      title: "2★ CODER ON CODECHEF (1477) & CF 1269",
      event: "Rated Competitive Programming Rounds",
      organizer: "CodeChef & Codeforces",
      year: "2024",
      position: "2★ Division Coder",
      description: "Demonstrated strong speed and mathematical problem solving across Starters rounds and Div 3/4 contests.",
      featured: false,
      tags: ["CodeChef 1477", "Codeforces 1269", "Division Competitions"],
      order: 3,
      connectedTo: ["leetcode-knight"]
    }
  ],

  skillCategories: [
    {
      category: "Programming",
      skills: [
        { name: "C++", highlight: true, level: "Strongest" },
        { name: "Python" },
        { name: "JavaScript" }
      ]
    },
    {
      category: "Web Development",
      skills: [
        { name: "HTML" },
        { name: "CSS" },
        { name: "JavaScript" },
        { name: "React" },
        { name: "Node.js" }
      ]
    },
    {
      category: "Database",
      skills: [
        { name: "MongoDB" },
        { name: "SQL" }
      ]
    },
    {
      category: "Tools & Platforms",
      skills: [
        { name: "Git" },
        { name: "GitHub" },
        { name: "VS Code" }
      ]
    },
    {
      category: "Core Computer Science",
      skills: [
        { name: "Data Structures", highlight: true },
        { name: "Algorithms", highlight: true },
        { name: "Object-Oriented Programming (OOP)" },
        { name: "Database Management Systems (DBMS)" },
        { name: "Computer Networks" },
        { name: "Operating Systems" }
      ]
    }
  ],

  projects: [
    {
      id: "smart-drainage",
      title: "Smart Drainage & Flood Prevention System",
      subtitle: "Arjuna 2.0 Hackathon Winner (NIT Agartala 2025)",
      description: "A technology-driven flood monitoring and early warning system designed to prevent urban waterlogging through real-time drainage telemetry, sensor threshold alerts, and automated telemetry tracking.",
      featured: true,
      technologies: ["C++", "IoT Systems", "Web Dashboards", "Alert Systems", "Sensor Analytics"],
      githubUrl: "https://github.com/Akash-314",
      liveUrl: undefined, // Placeholder ready
      imageAlt: "Smart Drainage and Flood Control System Visualization",
      highlights: [
        "Secured 1st Place at Arjuna 2.0 Hackathon (NIT Agartala 2025)",
        "Real-time sensor telemetry and early flood warning alerts",
        "Optimized algorithmic data structure engine for rapid alert processing"
      ]
    },
    {
      id: "dsa-algorithmic-suite",
      title: "Algorithmic Problem Solving Suite",
      subtitle: "Core C++ DSA Implementation & Performance Benchmarks",
      description: "A comprehensive repository of custom-built data structures, graph algorithms, dynamic programming optimizations, and high-performance C++ utility suites tested across 541 competitive coding benchmarks.",
      featured: false,
      technologies: ["C++17", "Data Structures", "Graph Algorithms", "Competitive Programming"],
      githubUrl: "https://github.com/Akash-314",
      imageAlt: "C++ Data Structures Algorithmic Suite Visualization",
      highlights: [
        "Includes custom Graph, Segment Tree, Disjoint Set Union (DSU) implementations",
        "Benchmarked algorithms for space & time efficiency in competitive programming",
        "Comprehensive solutions catalog for LeetCode Medium/Hard problems"
      ]
    },
    {
      id: "web-dev-application",
      title: "Interactive Full-Stack Web Platform",
      subtitle: "Modern Web Solution with React & Node.js",
      description: "A responsive, scalable web application featuring intuitive UI components, RESTful API integrations, modular state management, and real-time user interaction workflows.",
      featured: false,
      technologies: ["React", "JavaScript", "Node.js", "CSS3", "Git"],
      githubUrl: "https://github.com/Akash-314",
      imageAlt: "Interactive Web Application Interface",
      highlights: [
        "Clean component architecture with high-contrast UI design system",
        "Asynchronous data handling and client-side optimization",
        "Mobile-first responsive layout with accessible keyboard navigation"
      ]
    }
  ],

  journey: [
    {
      period: "Current (Third Year)",
      title: "B.Tech Information Technology",
      institutionOrEvent: "Rajkiya Engineering College, Banda",
      type: "education",
      description: "Pursuing Bachelor of Technology in Information Technology. Focusing deeply on software development, Data Structures & Algorithms, competitive programming, and practical technology projects.",
      details: [
        "Core Focus: C++ Programming, DSA, Systems Architecture",
        "Active Competitive Programmer with 541 LeetCode problems solved",
        "Current Stage: Third Year Undergraduate"
      ]
    },
    {
      period: "2025",
      title: "Hackathon Winner — 1st Place",
      institutionOrEvent: "Arjuna 2.0 Hackathon, NIT Agartala",
      type: "achievement",
      description: "Secured 1st place with team by developing a Smart Drainage and Flood Prevention System focused on flood monitoring and real-time prevention.",
      details: [
        "Project: Smart Drainage and Flood Prevention System",
        "Built under tight hackathon timelines with hardware-software integration",
        "Awarded top recognition by panel of technical judges"
      ]
    }
  ]
};
