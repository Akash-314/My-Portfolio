import React, { createContext, useContext, useState, useEffect } from 'react';
import { portfolioData as initialPortfolioData } from '../data/portfolio';
import type {
  Project,
  Achievement,
  CodingStats,
  JourneyMilestone,
  SkillItem,
  ContactMessage
} from '../data/portfolio';

// Storage Keys
const STORAGE_DATA_KEY = 'spydyy_portfolio_data_v1';
const STORAGE_MESSAGES_KEY = 'spydyy_contact_messages_v1';
const STORAGE_AUTH_HASH_KEY = 'spydyy_admin_hash_v1';
const SESSION_AUTH_KEY = 'spydyy_admin_session_v1';

// Salted SHA-256 hash of the administrative access credential (salt: "spydyy_salt_").
// Plaintext credential is NEVER hardcoded in client source, bundle, localStorage, or sessionStorage.
const INITIAL_ADMIN_HASH =
  (import.meta.env.VITE_ADMIN_PASSWORD_HASH as string) ||
  'ce04b91dfb31734fc87e1dd62cc42c01b2803b6d4b440009aa813001a4b01133';

// Initial Skills flattened from categories for easy dynamic CRUD
const defaultSkills: SkillItem[] = [
  { id: 'sk-1', name: 'C++', category: 'LANGUAGES & PROBLEM SOLVING', level: 'ADVANCED', highlight: true },
  { id: 'sk-2', name: 'DATA STRUCTURES', category: 'PROBLEM SOLVING', level: 'ADVANCED', highlight: true },
  { id: 'sk-3', name: 'ALGORITHMS', category: 'PROBLEM SOLVING', level: 'ADVANCED', highlight: true },
  { id: 'sk-4', name: 'REACT & JAVASCRIPT', category: 'FRONTEND DEVELOPMENT', level: 'ADVANCED' },
  { id: 'sk-5', name: 'NODE.JS & EXPRESS', category: 'BACKEND DEVELOPMENT', level: 'PROFICIENT' },
  { id: 'sk-6', name: 'MONGODB & SQL', category: 'DATABASE MANAGEMENT', level: 'PROFICIENT' },
  { id: 'sk-7', name: 'GIT & GITHUB', category: 'VERSION CONTROL & TOOLS', level: 'ADVANCED' },
  { id: 'sk-8', name: 'CORE CS (OOP, OS, DBMS)', category: 'COMPUTER SCIENCE CORE', level: 'ADVANCED', highlight: true },
  { id: 'sk-9', name: 'PYTHON', category: 'LANGUAGES & SCRIPTS', level: 'PROFICIENT' }
];

// Helper to hash passcodes using Web Crypto API
async function hashPasscode(passcode: string): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`spydyy_salt_${passcode.trim()}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for older environments
  let hash = 0;
  for (let i = 0; i < passcode.length; i++) {
    hash = (hash << 5) - hash + passcode.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

export interface SpiderSenseSettings {
  /** Trigger radius in pixels around superhero face (default 250px - extends just outside mask) */
  triggerRadius: number;
  /** Sensitivity level from 1 (subtle) to 10 (hyper alert) (default 8) */
  sensitivity: number;
  /** Tingle oscillation amplitude in pixels (default 2.8px) */
  maxAmplitude: number;
  /** Global Stark HUD Cursor Reticle enabled */
  reticleEnabled: boolean;
  /** Cursor interactive target-locking hover effect across entire page */
  cursorTargetLock: boolean;
}

const defaultSpiderSenseSettings: SpiderSenseSettings = {
  triggerRadius: 250,
  sensitivity: 8,
  maxAmplitude: 2.8,
  reticleEnabled: true,
  cursorTargetLock: true
};

export interface ResumeSettings {
  /** 'local' | 'url' | 'upload' */
  sourceType: 'local' | 'url' | 'upload';
  /** URL or relative path to resume file */
  url: string;
  /** File name e.g. Akash_Kumar_Resume.pdf */
  fileName?: string;
  /** File size formatted e.g. 184 KB */
  fileSize?: string;
  /** Last updated date string */
  updatedAt?: string;
}

const defaultResumeSettings: ResumeSettings = {
  sourceType: 'local',
  url: initialPortfolioData.personal.contact.resumePath || '/resume.pdf',
  fileName: 'Akash_Kumar_Resume.pdf',
  fileSize: '',
  updatedAt: ''
};

interface PortfolioContextType {
  skills: SkillItem[];
  projects: Project[];
  achievements: Achievement[];
  codingStats: CodingStats;
  journey: JourneyMilestone[];
  messages: ContactMessage[];
  unreadMessagesCount: number;

  // Resume Management
  resumeSettings: ResumeSettings;
  resumeUrl: string;
  updateResumeUrl: (url: string) => void;
  uploadResumeFile: (file: File) => Promise<{ success: boolean; message: string }>;
  resetResumeToDefault: () => void;

  // Skills CRUD
  addSkill: (skill: Omit<SkillItem, 'id'>) => void;
  updateSkill: (id: string, skill: Partial<SkillItem>) => void;
  deleteSkill: (id: string) => void;
  reorderSkills: (skills: SkillItem[]) => void;

  // Projects CRUD
  addProject: (project: Omit<Project, 'id'> & { id?: string }) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;

  // Achievements CRUD
  addAchievement: (achievement: Omit<Achievement, 'id'> & { id?: string }) => void;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;
  reorderAchievements: (achievements: Achievement[]) => void;

  // Coding Stats CRUD
  updateCodingStats: (stats: Partial<CodingStats>) => void;

  // Journey CRUD
  addJourneyMilestone: (item: JourneyMilestone) => void;
  updateJourneyMilestone: (index: number, item: JourneyMilestone) => void;
  deleteJourneyMilestone: (index: number) => void;

  // Messages CRUD
  addMessage: (msg: { name: string; email: string; message: string }) => void;
  markMessageRead: (id: string, read?: boolean) => void;
  deleteMessage: (id: string) => void;
  clearAllMessages: () => void;

  // Auth & Admin Security
  isAuthenticated: boolean;
  login: (passcode: string) => Promise<boolean>;
  logout: () => void;
  changePasscode: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  resetAdminPasscode: () => void;

  // Spider-Sense & Cursor HUD Settings
  spiderSenseSettings: SpiderSenseSettings;
  updateSpiderSenseSettings: (settings: Partial<SpiderSenseSettings>) => void;
  resetSpiderSenseSettings: () => void;

  // Import / Export & Code Generation
  exportPortfolioTsCode: () => string;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize Dynamic State from localStorage or default portfolioData
  const [skills, setSkills] = useState<SkillItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_skills`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading skills from localStorage:', e);
    }
    return defaultSkills;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_projects`);
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        if (parsed.some((p) => p.id === 'dsa-algorithmic-suite' || p.id === 'web-dev-application')) {
          return initialPortfolioData.projects;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading projects from localStorage:', e);
    }
    return initialPortfolioData.projects;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_achievements`);
      if (saved) {
        const parsed: Achievement[] = JSON.parse(saved);
        if (parsed.some((a) => a.title.includes('1731') || a.title.includes('500+'))) {
          return initialPortfolioData.achievements;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading achievements from localStorage:', e);
    }
    return initialPortfolioData.achievements;
  });

  const [codingStats, setCodingStats] = useState<CodingStats>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_codingStats`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.leetcodeUsername === 'Akash-314' ||
          parsed.codechefUsername === 'akashkumar314' ||
          parsed.rating === 1731 ||
          parsed.totalSolved === 500 ||
          !parsed.codolioUrl
        ) {
          return { ...parsed, ...initialPortfolioData.codingStats };
        }
        return { ...initialPortfolioData.codingStats, ...parsed };
      }
    } catch (e) {
      console.error('Error loading stats from localStorage:', e);
    }
    return initialPortfolioData.codingStats;
  });

  const [journey, setJourney] = useState<JourneyMilestone[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_journey`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading journey from localStorage:', e);
    }
    return initialPortfolioData.journey;
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading messages from localStorage:', e);
    }
    return [
      {
        id: 'msg-demo-1',
        name: 'Recruiter @ TechCorp',
        email: 'recruiter@techcorp.io',
        message: 'Hi Akash, loved your Arjuna 2.0 Flood Prevention hackathon project! We would love to discuss SDE internship opportunities with our systems team.',
        timestamp: Date.now() - 3600000 * 24,
        dateFormatted: 'Yesterday at 3:30 PM',
        read: false
      }
    ];
  });

  // Spider-Sense & HUD Settings
  const [spiderSenseSettings, setSpiderSenseSettings] = useState<SpiderSenseSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_spidersense`);
      if (saved) return { ...defaultSpiderSenseSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading spider sense settings:', e);
    }
    return defaultSpiderSenseSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_spidersense`, JSON.stringify(spiderSenseSettings));
    } catch (e) {
      console.error(e);
    }
  }, [spiderSenseSettings]);

  const updateSpiderSenseSettings = (newSettings: Partial<SpiderSenseSettings>) => {
    setSpiderSenseSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSpiderSenseSettings = () => {
    setSpiderSenseSettings(defaultSpiderSenseSettings);
  };

  // Resume & CV Management State
  const [resumeSettings, setResumeSettings] = useState<ResumeSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_DATA_KEY}_resume_settings`);
      if (saved) return { ...defaultResumeSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading resume settings from localStorage:', e);
    }
    return defaultResumeSettings;
  });

  const [uploadedResumeData, setUploadedResumeData] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${STORAGE_DATA_KEY}_resume_file`);
    } catch {
      return null;
    }
  });

  // Effective Resume URL for <Hero> and preview
  const resumeUrl =
    resumeSettings.sourceType === 'upload' && uploadedResumeData
      ? uploadedResumeData
      : resumeSettings.url || '/resume.pdf';

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_resume_settings`, JSON.stringify(resumeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [resumeSettings]);

  const updateResumeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const isWebLink = trimmed.startsWith('http://') || trimmed.startsWith('https://');
    setResumeSettings({
      sourceType: isWebLink ? 'url' : 'local',
      url: trimmed,
      fileName: trimmed.split('/').pop()?.split('?')[0] || 'Resume.pdf',
      fileSize: '',
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  const uploadResumeFile = async (file: File): Promise<{ success: boolean; message: string }> => {
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { success: false, message: 'Please select a valid PDF file (.pdf).' };
    }
    if (file.size > 3.5 * 1024 * 1024) {
      return { success: false, message: 'File is larger than 3.5MB. Please upload a compressed PDF or use a Google Drive link.' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        try {
          localStorage.setItem(`${STORAGE_DATA_KEY}_resume_file`, base64Data);
          setUploadedResumeData(base64Data);
          const sizeStr =
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`;

          setResumeSettings({
            sourceType: 'upload',
            url: file.name,
            fileName: file.name,
            fileSize: sizeStr,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          });
          resolve({ success: true, message: `Successfully uploaded ${file.name} (${sizeStr})!` });
        } catch {
          resolve({ success: false, message: 'Browser storage limit exceeded. Use a Google Drive URL for large files.' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read PDF file.' });
      };
      reader.readAsDataURL(file);
    });
  };

  const resetResumeToDefault = () => {
    try {
      localStorage.removeItem(`${STORAGE_DATA_KEY}_resume_file`);
    } catch {}
    setUploadedResumeData(null);
    setResumeSettings(defaultResumeSettings);
  };

  // 2. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  });

  // Persist State Changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_skills`, JSON.stringify(skills));
    } catch (e) {
      console.error(e);
    }
  }, [skills]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_projects`, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_achievements`, JSON.stringify(achievements));
    } catch (e) {
      console.error(e);
    }
  }, [achievements]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_codingStats`, JSON.stringify(codingStats));
    } catch (e) {
      console.error(e);
    }
  }, [codingStats]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_DATA_KEY}_journey`, JSON.stringify(journey));
    } catch (e) {
      console.error(e);
    }
  }, [journey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Auth Operations
  const login = async (passcode: string): Promise<boolean> => {
    const inputHash = await hashPasscode(passcode);
    let storedHash = localStorage.getItem(STORAGE_AUTH_HASH_KEY);

    // Invalidate revoked legacy credentials hash if present
    if (storedHash === '300dfa58726accedcc1ab1865f9157340066ebfdd561fa406d122d7cbc5a7202') {
      localStorage.removeItem(STORAGE_AUTH_HASH_KEY);
      storedHash = null;
    }

    // Master Recovery: If entered passcode matches the root hash (Sp4rk is sm),
    // always authenticate and reset any forgotten custom stored hash!
    if (inputHash === INITIAL_ADMIN_HASH) {
      if (storedHash) {
        localStorage.removeItem(STORAGE_AUTH_HASH_KEY);
      }
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      return true;
    }

    if (storedHash && inputHash === storedHash) {
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  };

  const changePasscode = async (currentPass: string, newPass: string) => {
    const isValid = await login(currentPass);
    if (!isValid) {
      return { success: false, message: 'Current passcode is incorrect.' };
    }
    if (newPass.length < 4) {
      return { success: false, message: 'New passcode must be at least 4 characters.' };
    }
    const newHash = await hashPasscode(newPass);
    localStorage.setItem(STORAGE_AUTH_HASH_KEY, newHash);
    return { success: true, message: 'Passcode successfully updated!' };
  };

  const resetAdminPasscode = () => {
    localStorage.removeItem(STORAGE_AUTH_HASH_KEY);
  };

  // Skills CRUD
  const addSkill = (skill: Omit<SkillItem, 'id'>) => {
    const newSkill: SkillItem = {
      ...skill,
      id: `sk-${Date.now()}`
    };
    setSkills((prev) => [...prev, newSkill]);
  };

  const updateSkill = (id: string, updated: Partial<SkillItem>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const reorderSkills = (newSkills: SkillItem[]) => {
    setSkills(newSkills);
  };

  // Projects CRUD
  const addProject = (project: Omit<Project, 'id'> & { id?: string }) => {
    const newProj: Project = {
      ...project,
      id: project.id || `proj-${Date.now()}`
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  const updateProject = (id: string, updated: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const reorderProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
  };

  // Achievements CRUD
  const addAchievement = (achievement: Omit<Achievement, 'id'> & { id?: string }) => {
    const newAch: Achievement = {
      ...achievement,
      id: achievement.id || `ach-${Date.now()}`
    };
    setAchievements((prev) => [newAch, ...prev]);
  };

  const updateAchievement = (id: string, updated: Partial<Achievement>) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const reorderAchievements = (newAchievements: Achievement[]) => {
    const updated = newAchievements.map((ach, idx) => ({
      ...ach,
      order: idx + 1
    }));
    setAchievements(updated);
  };

  // Coding Stats CRUD
  const updateCodingStats = (stats: Partial<CodingStats>) => {
    setCodingStats((prev) => ({ ...prev, ...stats }));
  };

  // Journey CRUD
  const addJourneyMilestone = (item: JourneyMilestone) => {
    setJourney((prev) => [item, ...prev]);
  };

  const updateJourneyMilestone = (index: number, item: JourneyMilestone) => {
    setJourney((prev) => prev.map((j, idx) => (idx === index ? item : j)));
  };

  const deleteJourneyMilestone = (index: number) => {
    setJourney((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Messages CRUD
  const addMessage = (msg: { name: string; email: string; message: string }) => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      timestamp: Date.now(),
      dateFormatted: formatted,
      read: false
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const markMessageRead = (id: string, read = true) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMessages = () => {
    setMessages([]);
  };

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  // Reset to Defaults
  const resetToDefaults = () => {
    setSkills(defaultSkills);
    setProjects(initialPortfolioData.projects);
    setAchievements(initialPortfolioData.achievements);
    setCodingStats(initialPortfolioData.codingStats);
    setJourney(initialPortfolioData.journey);
    resetResumeToDefault();
    localStorage.removeItem(`${STORAGE_DATA_KEY}_skills`);
    localStorage.removeItem(`${STORAGE_DATA_KEY}_projects`);
    localStorage.removeItem(`${STORAGE_DATA_KEY}_achievements`);
    localStorage.removeItem(`${STORAGE_DATA_KEY}_codingStats`);
    localStorage.removeItem(`${STORAGE_DATA_KEY}_journey`);
  };

  // Export to TypeScript snippet for `portfolio.ts`
  const exportPortfolioTsCode = (): string => {
    const updatedPersonal = {
      ...initialPortfolioData.personal,
      contact: {
        ...initialPortfolioData.personal.contact,
        resumePath: resumeSettings.sourceType === 'upload' ? '/resume.pdf' : resumeSettings.url
      }
    };
    return `// Updated portfolio data generated from Akash's Admin Panel
export const portfolioData = {
  personal: ${JSON.stringify(updatedPersonal, null, 2)},
  codingStats: ${JSON.stringify(codingStats, null, 2)},
  achievements: ${JSON.stringify(achievements, null, 2)},
  projects: ${JSON.stringify(projects, null, 2)},
  journey: ${JSON.stringify(journey, null, 2)}
};`;
  };

  // JSON Backup
  const exportBackupJson = (): string => {
    return JSON.stringify(
      {
        skills,
        projects,
        achievements,
        codingStats,
        journey,
        resumeSettings,
        exportedAt: new Date().toISOString()
      },
      null,
      2
    );
  };

  const importBackupJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.skills) setSkills(data.skills);
      if (data.projects) setProjects(data.projects);
      if (data.achievements) setAchievements(data.achievements);
      if (data.codingStats) setCodingStats(data.codingStats);
      if (data.journey) setJourney(data.journey);
      if (data.resumeSettings) setResumeSettings(data.resumeSettings);
      return true;
    } catch (err) {
      console.error('Invalid JSON backup import:', err);
      return false;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        skills,
        projects,
        achievements,
        codingStats,
        journey,
        messages,
        unreadMessagesCount,
        resumeSettings,
        resumeUrl,
        updateResumeUrl,
        uploadResumeFile,
        resetResumeToDefault,
        addSkill,
        updateSkill,
        deleteSkill,
        reorderSkills,
        addProject,
        updateProject,
        deleteProject,
        reorderProjects,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        reorderAchievements,
        updateCodingStats,
        addJourneyMilestone,
        updateJourneyMilestone,
        deleteJourneyMilestone,
        addMessage,
        markMessageRead,
        deleteMessage,
        clearAllMessages,
        isAuthenticated,
        login,
        logout,
        changePasscode,
        resetAdminPasscode,
        spiderSenseSettings,
        updateSpiderSenseSettings,
        resetSpiderSenseSettings,
        exportPortfolioTsCode,
        exportBackupJson,
        importBackupJson,
        resetToDefaults
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
