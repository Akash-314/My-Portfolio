import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Cpu,
  FolderGit2,
  Trophy,
  Flame,
  Milestone,
  Mail,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Upload,
  X,
  AlertCircle,
  Eye,
  Crosshair,
  Zap,
  RefreshCw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  FileText
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { clearCodingStatsCache, getLiveCodingStats } from '../../services/codingStatsService';
import type { Project, Achievement, JourneyMilestone, SkillItem } from '../../data/portfolio';

interface AdminDashboardProps {
  onExit: () => void;
}

type TabType =
  | 'overview'
  | 'spidersense'
  | 'resume'
  | 'skills'
  | 'projects'
  | 'achievements'
  | 'ratings'
  | 'journey'
  | 'messages'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const {
    skills,
    projects,
    achievements,
    codingStats,
    journey,
    messages,
    unreadMessagesCount,
    spiderSenseSettings,
    updateSpiderSenseSettings,
    resetSpiderSenseSettings,
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
    markMessageRead,
    deleteMessage,
    clearAllMessages,
    logout,
    changePasscode,
    exportPortfolioTsCode,
    exportBackupJson,
    importBackupJson,
    resetToDefaults
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    title: string;
    itemName: string;
    onConfirm: () => void;
  } | null>(null);

  const requestDelete = (title: string, itemName: string, onConfirm: () => void) => {
    setDeleteConfirmModal({
      title,
      itemName,
      onConfirm: () => {
        onConfirm();
        setDeleteConfirmModal(null);
      }
    });
  };

  // Resume Form State
  const [resumeUrlInput, setResumeUrlInput] = useState(
    resumeSettings.sourceType === 'url' ? resumeSettings.url : ''
  );
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Skill Form State
  const [skillForm, setSkillForm] = useState<Omit<SkillItem, 'id'>>({
    name: '',
    category: 'LANGUAGES & PROBLEM SOLVING',
    level: 'ADVANCED',
    highlight: false
  });
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Project Form State
  const [projectForm, setProjectForm] = useState<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    featured: boolean;
    technologies: string;
    githubUrl: string;
    liveUrl: string;
    highlights: string;
  }>({
    id: '',
    title: '',
    subtitle: '',
    description: '',
    featured: false,
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    highlights: ''
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Achievement Form State
  const [achievementForm, setAchievementForm] = useState<{
    id: string;
    title: string;
    event: string;
    organizer: string;
    year: string;
    position: string;
    description: string;
    featured: boolean;
    tags: string;
    order: number;
  }>({
    id: '',
    title: '',
    event: '',
    organizer: '',
    year: '2025',
    position: '1st Place',
    description: '',
    featured: false,
    tags: '',
    order: 1
  });
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Journey Form State
  const [journeyForm, setJourneyForm] = useState<{
    period: string;
    title: string;
    institutionOrEvent: string;
    type: 'education' | 'achievement' | 'project';
    description: string;
    details: string;
  }>({
    period: '',
    title: '',
    institutionOrEvent: '',
    type: 'education',
    description: '',
    details: ''
  });
  const [editingJourneyIdx, setEditingJourneyIdx] = useState<number | null>(null);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Ratings Form State
  const [ratingsForm, setRatingsForm] = useState({
    totalSolved: codingStats.totalSolved,
    easy: codingStats.easy,
    medium: codingStats.medium,
    hard: codingStats.hard,
    rating: codingStats.rating,
    codeforcesRating: codingStats.codeforcesRating,
    codechefRating: codingStats.codechefRating,
    codechefStars: codingStats.codechefStars,
    codeforcesStatus: codingStats.codeforcesStatus,
    leetcodeUrl: codingStats.leetcodeUrl,
    codeforcesUrl: codingStats.codeforcesUrl,
    codechefUrl: codingStats.codechefUrl,
    githubUrl: codingStats.githubUrl,
    codolioUrl: codingStats.codolioUrl || '',
    leetcodeUsername: codingStats.leetcodeUsername || '',
    codeforcesUsername: codingStats.codeforcesUsername || '',
    codechefUsername: codingStats.codechefUsername || ''
  });
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  // Settings State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    onExit();
  };

  // --- DRAG & DROP REORDER STATE & HANDLERS ---
  const [draggedSkillIndex, setDraggedSkillIndex] = useState<number | null>(null);
  const [dragOverSkillIndex, setDragOverSkillIndex] = useState<number | null>(null);

  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const [dragOverProjectIndex, setDragOverProjectIndex] = useState<number | null>(null);

  const [draggedAchievementIndex, setDraggedAchievementIndex] = useState<number | null>(null);
  const [dragOverAchievementIndex, setDragOverAchievementIndex] = useState<number | null>(null);

  // Skill reordering
  const handleMoveSkill = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= skills.length || fromIdx === toIdx) return;
    const updated = [...skills];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    reorderSkills(updated);
    triggerToast(`Skill moved to position #${toIdx + 1}!`);
  };

  const handleSkillDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSkillIndex(index);
  };

  const handleSkillDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSkillIndex !== index) {
      setDragOverSkillIndex(index);
    }
  };

  const handleSkillDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedSkillIndex;
    setDraggedSkillIndex(null);
    setDragOverSkillIndex(null);
    if (fromIndex !== null && fromIndex !== dropIndex) {
      handleMoveSkill(fromIndex, dropIndex);
    }
  };

  // Project reordering
  const handleMoveProject = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= projects.length || fromIdx === toIdx) return;
    const updated = [...projects];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    reorderProjects(updated);
    triggerToast(`Project moved to position #${toIdx + 1}!`);
  };

  const handleProjectDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProjectIndex(index);
  };

  const handleProjectDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProjectIndex !== index) {
      setDragOverProjectIndex(index);
    }
  };

  const handleProjectDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedProjectIndex;
    setDraggedProjectIndex(null);
    setDragOverProjectIndex(null);
    if (fromIndex !== null && fromIndex !== dropIndex) {
      handleMoveProject(fromIndex, dropIndex);
    }
  };

  // Achievement reordering
  const handleMoveAchievement = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= achievements.length || fromIdx === toIdx) return;
    const updated = [...achievements];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    reorderAchievements(updated);
    triggerToast(`Achievement moved to position #${toIdx + 1}!`);
  };

  const handleAchievementDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedAchievementIndex(index);
  };

  const handleAchievementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverAchievementIndex !== index) {
      setDragOverAchievementIndex(index);
    }
  };

  const handleAchievementDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedAchievementIndex;
    setDraggedAchievementIndex(null);
    setDragOverAchievementIndex(null);
    if (fromIndex !== null && fromIndex !== dropIndex) {
      handleMoveAchievement(fromIndex, dropIndex);
    }
  };

  // --- SKILL HANDLERS ---
  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return;

    if (editingSkillId) {
      updateSkill(editingSkillId, skillForm);
      setEditingSkillId(null);
      triggerToast(`Skill "${skillForm.name}" updated!`);
    } else {
      addSkill(skillForm);
      triggerToast(`New skill "${skillForm.name}" added!`);
    }

    setSkillForm({
      name: '',
      category: 'LANGUAGES & PROBLEM SOLVING',
      level: 'ADVANCED',
      highlight: false
    });
  };

  const startEditSkill = (s: SkillItem) => {
    setEditingSkillId(s.id);
    setSkillForm({
      name: s.name,
      category: s.category,
      level: s.level,
      highlight: s.highlight || false
    });
  };

  // --- PROJECT HANDLERS ---
  const handleOpenNewProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      id: `project-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      featured: false,
      technologies: 'React, Node.js, TypeScript',
      githubUrl: 'https://github.com/Akash-314',
      liveUrl: '',
      highlights: 'Engineered high-performance real-time features\nOptimized component rendering and accessibility'
    });
    setShowProjectModal(true);
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      featured: p.featured,
      technologies: p.technologies.join(', '),
      githubUrl: p.githubUrl || '',
      liveUrl: p.liveUrl || '',
      highlights: p.highlights.join('\n')
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    const techArray = projectForm.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const highlightsArray = projectForm.highlights
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const projectData: Project = {
      id: projectForm.id || `proj-${Date.now()}`,
      title: projectForm.title.trim(),
      subtitle: projectForm.subtitle.trim(),
      description: projectForm.description.trim(),
      featured: projectForm.featured,
      technologies: techArray,
      githubUrl: projectForm.githubUrl.trim() || undefined,
      liveUrl: projectForm.liveUrl.trim() || undefined,
      imageAlt: `${projectForm.title} Visual Representation`,
      highlights: highlightsArray
    };

    if (editingProjectId) {
      updateProject(editingProjectId, projectData);
      triggerToast(`Project "${projectData.title}" updated!`);
    } else {
      addProject(projectData);
      triggerToast(`New project "${projectData.title}" created!`);
    }

    setShowProjectModal(false);
  };

  // --- ACHIEVEMENTS HANDLERS ---
  const handleOpenNewAchievement = () => {
    setEditingAchievementId(null);
    setAchievementForm({
      id: `ach-${Date.now()}`,
      title: '',
      event: '',
      organizer: '',
      year: new Date().getFullYear().toString(),
      position: '1st Place',
      description: '',
      featured: false,
      tags: 'Hackathon, Winner, C++',
      order: achievements.length + 1
    });
    setShowAchievementModal(true);
  };

  const handleEditAchievement = (a: Achievement) => {
    setEditingAchievementId(a.id);
    setAchievementForm({
      id: a.id,
      title: a.title,
      event: a.event,
      organizer: a.organizer,
      year: a.year,
      position: a.position,
      description: a.description,
      featured: a.featured,
      tags: a.tags.join(', '),
      order: a.order || 1
    });
    setShowAchievementModal(true);
  };

  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title.trim()) return;

    const tagsArray = achievementForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const achData: Achievement = {
      id: achievementForm.id || `ach-${Date.now()}`,
      title: achievementForm.title.trim(),
      event: achievementForm.event.trim(),
      organizer: achievementForm.organizer.trim(),
      year: achievementForm.year.trim(),
      position: achievementForm.position.trim(),
      description: achievementForm.description.trim(),
      featured: achievementForm.featured,
      tags: tagsArray,
      order: Number(achievementForm.order) || 1
    };

    if (editingAchievementId) {
      updateAchievement(editingAchievementId, achData);
      triggerToast(`Achievement "${achData.title}" updated!`);
    } else {
      addAchievement(achData);
      triggerToast(`Achievement "${achData.title}" chained to web!`);
    }

    setShowAchievementModal(false);
  };

  // --- JOURNEY HANDLERS ---
  const handleOpenNewJourney = () => {
    setEditingJourneyIdx(null);
    setJourneyForm({
      period: '2026',
      title: '',
      institutionOrEvent: '',
      type: 'project',
      description: '',
      details: 'Key milestone accomplishment'
    });
    setShowJourneyModal(true);
  };

  const handleEditJourney = (item: JourneyMilestone, idx: number) => {
    setEditingJourneyIdx(idx);
    setJourneyForm({
      period: item.period,
      title: item.title,
      institutionOrEvent: item.institutionOrEvent,
      type: item.type,
      description: item.description,
      details: (item.details || []).join('\n')
    });
    setShowJourneyModal(true);
  };

  const handleSaveJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journeyForm.title.trim()) return;

    const detailsArray = journeyForm.details
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);

    const milestone: JourneyMilestone = {
      period: journeyForm.period.trim(),
      title: journeyForm.title.trim(),
      institutionOrEvent: journeyForm.institutionOrEvent.trim(),
      type: journeyForm.type,
      description: journeyForm.description.trim(),
      details: detailsArray
    };

    if (editingJourneyIdx !== null) {
      updateJourneyMilestone(editingJourneyIdx, milestone);
      triggerToast(`Milestone updated!`);
    } else {
      addJourneyMilestone(milestone);
      triggerToast(`New milestone added to journey!`);
    }

    setShowJourneyModal(false);
  };

  // --- RATINGS HANDLERS ---
  const handleSaveRatings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCodingStats({
      totalSolved: Number(ratingsForm.totalSolved),
      easy: Number(ratingsForm.easy),
      medium: Number(ratingsForm.medium),
      hard: Number(ratingsForm.hard),
      rating: Number(ratingsForm.rating),
      codeforcesRating: Number(ratingsForm.codeforcesRating),
      codechefRating: Number(ratingsForm.codechefRating),
      codechefStars: ratingsForm.codechefStars.trim(),
      codeforcesStatus: ratingsForm.codeforcesStatus.trim(),
      leetcodeUrl: ratingsForm.leetcodeUrl.trim(),
      codeforcesUrl: ratingsForm.codeforcesUrl.trim(),
      codechefUrl: ratingsForm.codechefUrl.trim(),
      githubUrl: ratingsForm.githubUrl.trim(),
      codolioUrl: ratingsForm.codolioUrl.trim(),
      leetcodeUsername: ratingsForm.leetcodeUsername.trim(),
      codeforcesUsername: ratingsForm.codeforcesUsername.trim(),
      codechefUsername: ratingsForm.codechefUsername.trim()
    });
    clearCodingStatsCache();
    triggerToast('Coding stats & profiles successfully saved to HUD!');
  };

  const handleForceLiveSync = async () => {
    setIsSyncingLive(true);
    clearCodingStatsCache();
    try {
      const result = await getLiveCodingStats({
        ...codingStats,
        leetcodeUsername: ratingsForm.leetcodeUsername.trim(),
        codeforcesUsername: ratingsForm.codeforcesUsername.trim(),
        codechefUsername: ratingsForm.codechefUsername.trim()
      });
      setRatingsForm((prev) => ({
        ...prev,
        totalSolved: result.stats.totalSolved,
        easy: result.stats.easy,
        medium: result.stats.medium,
        hard: result.stats.hard,
        rating: result.stats.rating,
        codeforcesRating: result.stats.codeforcesRating,
        codechefRating: result.stats.codechefRating
      }));
      updateCodingStats(result.stats);
      const syncedNames = [
        result.syncedPlatforms?.codeforces && 'Codeforces',
        result.syncedPlatforms?.leetcode && 'LeetCode',
        result.syncedPlatforms?.codechef && 'CodeChef'
      ].filter(Boolean).join(', ');

      if (syncedNames) {
        triggerToast(`Live sync succeeded for: ${syncedNames}!`);
      } else {
        triggerToast('APIs did not respond or handle not found. Fallback stats preserved.');
      }
    } catch {
      triggerToast('API sync failed. Fallback stats preserved.');
    } finally {
      setIsSyncingLive(false);
    }
  };

  // --- SETTINGS HANDLERS ---
  const handleChangePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    const res = await changePasscode(currentPass, newPass);
    if (res.success) {
      setPassSuccess(res.message);
      setCurrentPass('');
      setNewPass('');
      triggerToast('Master passcode updated!');
    } else {
      setPassError(res.message);
    }
  };

  const handleCopyCode = () => {
    const code = exportPortfolioTsCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    triggerToast('Code copied! Paste into src/data/portfolio.ts to make permanent in repo.');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Backup JSON downloaded!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const ok = importBackupJson(content);
      if (ok) {
        triggerToast('Portfolio state successfully restored from JSON!');
      } else {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-gray-100 font-sans flex flex-col antialiased">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-red-600 text-white font-mono text-xs font-bold shadow-2xl shadow-red-950 flex items-center gap-2 border border-red-400"
          >
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-gray-800 bg-[#0f1118] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <h1 className="font-extrabold italic text-xl font-sans tracking-tight text-white flex items-center gap-2">
            SPIDER<span className="text-red-500">.</span>COMMAND
            <span className="text-[10px] font-mono not-italic font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400">
              AKASH IT HUD
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-gray-700 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" /> VIEW PORTFOLIO
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> LOCK & EXIT
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#0f1118] border-r border-gray-800 p-4 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto">
          <div className="hidden md:block text-[10px] font-mono font-black uppercase text-gray-500 tracking-wider px-3 py-2">
            COMMAND MODULES
          </div>

          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            {
              id: 'spidersense',
              label: 'Spider-Sense & HUD',
              icon: Crosshair,
              badge: `Lvl ${spiderSenseSettings.sensitivity}`,
              badgeColor: 'bg-red-950/80 text-red-300 border border-red-800'
            },
            {
              id: 'resume',
              label: 'Resume & CV',
              icon: FileText,
              badge:
                resumeSettings.sourceType === 'upload'
                  ? 'UPLOADED'
                  : resumeSettings.sourceType === 'url'
                  ? 'CLOUD'
                  : 'LOCAL',
              badgeColor:
                resumeSettings.sourceType === 'upload'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : resumeSettings.sourceType === 'url'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                  : 'bg-gray-800 text-gray-300'
            },
            { id: 'skills', label: 'Technical Skills', icon: Cpu, badge: skills.length },
            { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projects.length },
            { id: 'achievements', label: 'Chained Podiums', icon: Trophy, badge: achievements.length },
            { id: 'ratings', label: 'Coding Ratings', icon: Flame },
            { id: 'journey', label: 'My Journey', icon: Milestone, badge: journey.length },
            {
              id: 'messages',
              label: 'Contact Inquiries',
              icon: Mail,
              badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} NEW` : messages.length,
              badgeColor: unreadMessagesCount > 0 ? 'bg-red-600 text-white' : undefined
            },
            { id: 'settings', label: 'Sync & Security', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-6xl">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                  SYSTEM OVERVIEW<span className="text-red-500">.</span>
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  LIVE PORTFOLIO TELEMETRY // DATA REACTION ACTIVE
                </p>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#141722] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
                    TOTAL PROJECTS
                  </span>
                  <div className="text-3xl font-black font-mono text-white">{projects.length}</div>
                  <span className="text-[10px] font-mono text-red-400 font-bold mt-1 block">
                    {projects.filter((p) => p.featured).length} Featured
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#141722] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
                    TECHNICAL SKILLS
                  </span>
                  <div className="text-3xl font-black font-mono text-white">{skills.length}</div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold mt-1 block">
                    {skills.filter((s) => s.highlight).length} Core Highlighted
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#141722] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
                    MAX LEETCODE RATING
                  </span>
                  <div className="text-3xl font-black font-mono text-amber-400">{codingStats.rating}</div>
                  <span className="text-[10px] font-mono text-gray-400 font-bold mt-1 block">
                    {codingStats.totalSolved} Problems Solved
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#141722] border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">
                    CONTACT INQUIRIES
                  </span>
                  <div className="text-3xl font-black font-mono text-red-500">{messages.length}</div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold mt-1 block">
                    {unreadMessagesCount} Unread Messages
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" /> QUICK ACTION DISPATCH
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('projects');
                      handleOpenNewProject();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> ADD NEW PROJECT
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('achievements');
                      handleOpenNewAchievement();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> CHAIN ACHIEVEMENT
                  </button>
                  <button
                    onClick={() => setActiveTab('ratings')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                  >
                    <Flame className="w-4 h-4 text-amber-500" /> UPDATE RATINGS
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-400" /> MANAGE RESUME & CV
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-red-400" /> VIEW INBOX ({unreadMessagesCount})
                  </button>
                </div>
              </div>

              {/* Resume & CV Status Banner */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-mono font-bold uppercase text-white">SDE RESUME / CV STATUS</h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        resumeSettings.sourceType === 'upload'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : resumeSettings.sourceType === 'url'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                          : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}>
                        {resumeSettings.sourceType === 'upload'
                          ? 'UPLOADED PDF'
                          : resumeSettings.sourceType === 'url'
                          ? 'CLOUD LINK'
                          : 'LOCAL /resume.pdf'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-400 mt-1 truncate max-w-md">
                      {resumeSettings.fileName || resumeSettings.url || '/resume.pdf'}{' '}
                      {resumeSettings.fileSize && `(${resumeSettings.fileSize})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> PREVIEW
                  </a>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> CONFIGURE
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Preview */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-mono font-bold uppercase text-white">
                    LATEST CONTACT TRANSMISSIONS
                  </h3>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs font-mono text-red-400 hover:text-red-300 font-bold"
                  >
                    VIEW ALL INBOX →
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs font-mono text-gray-500">No contact messages received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-[#0f1118] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white font-sans">{m.name}</span>
                            <span className="text-[11px] font-mono text-red-400">{m.email}</span>
                            {!m.read && (
                              <span className="px-2 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-mono font-black uppercase">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">{m.message}</p>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {m.dateFormatted}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SPIDER-SENSE & RETICLE TELEMETRY CONTROLS */}
          {activeTab === 'spidersense' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    SPIDER-SENSE & CURSOR HUD<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    FINE-TUNE PROXIMITY ACTIVATION RADIUS, SENSITIVITY LEVEL, VIBRATION CONTROL & STARK RETICLE
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetSpiderSenseSettings();
                    triggerToast('Spider-Sense settings reset to default.');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-gray-700 self-start sm:self-auto"
                >
                  RESET TO DEFAULT
                </button>
              </div>

              {/* Live Telemetry Radar Status Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141722] to-[#191d2c] border border-red-500/40 shadow-xl shadow-red-950/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-gray-800">
                  <div className="text-[10px] font-mono uppercase text-gray-400 font-bold mb-1">SENSITIVITY LEVEL</div>
                  <div className="text-2xl font-black font-sans text-red-500 flex items-center gap-2">
                    <span>{spiderSenseSettings.sensitivity}</span>
                    <span className="text-xs font-mono text-gray-400 font-normal">/ 10</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">
                    {spiderSenseSettings.sensitivity >= 8
                      ? '⚡ High Sensory Response'
                      : spiderSenseSettings.sensitivity >= 5
                      ? '🎯 Balanced Cinematic'
                      : '🛡️ Subtle Whisper'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-gray-800">
                  <div className="text-[10px] font-mono uppercase text-gray-400 font-bold mb-1">TRIGGER RADIUS</div>
                  <div className="text-2xl font-black font-sans text-white flex items-center gap-2">
                    <span>{spiderSenseSettings.triggerRadius}</span>
                    <span className="text-xs font-mono text-gray-400 font-normal">px</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1">
                    {spiderSenseSettings.triggerRadius >= 230 && spiderSenseSettings.triggerRadius <= 280
                      ? '✓ Just Outside Mask (Perfect)'
                      : spiderSenseSettings.triggerRadius < 230
                      ? 'Hugging Mask Tight'
                      : 'Wide Superhero Field'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-gray-800">
                  <div className="text-[10px] font-mono uppercase text-gray-400 font-bold mb-1">TINGLE VIBRATION</div>
                  <div className="text-2xl font-black font-sans text-amber-400 flex items-center gap-2">
                    <span>{spiderSenseSettings.maxAmplitude.toFixed(1)}</span>
                    <span className="text-xs font-mono text-gray-400 font-normal">px</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">
                    Smooth Sinusoidal Oscillation
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-gray-800">
                  <div className="text-[10px] font-mono uppercase text-gray-400 font-bold mb-1">GLOBAL CURSOR HUD</div>
                  <div className="text-2xl font-black font-sans flex items-center gap-2">
                    {spiderSenseSettings.reticleEnabled ? (
                      <span className="text-emerald-400">ACTIVE</span>
                    ) : (
                      <span className="text-gray-500">DISABLED</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">
                    {spiderSenseSettings.cursorTargetLock ? '🎯 Target-Lock Enabled' : 'Standard Reticle'}
                  </div>
                </div>
              </div>

              {/* 1-Click Quick Presets */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono font-bold uppercase text-white">
                    QUICK PRESETS (1-CLICK CALIBRATION)
                  </h3>
                </div>
                <p className="text-xs text-gray-400 font-sans">
                  Select a pre-calibrated sensory profile suited for your preference:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {[
                    {
                      name: 'Classic Subtle',
                      desc: 'Subtle movie tingle hugging the mask perimeter',
                      radius: 190,
                      sens: 5,
                      amp: 1.8,
                      badge: 'Movie Classic'
                    },
                    {
                      name: 'Enhanced Proximity',
                      desc: 'Activates just outside mask with responsive, noticeable tingle',
                      radius: 250,
                      sens: 8,
                      amp: 2.8,
                      badge: 'Recommended',
                      highlight: true
                    },
                    {
                      name: 'Hyper Sensory',
                      desc: 'Instant early detection with vibrant physiological waves',
                      radius: 320,
                      sens: 10,
                      amp: 3.6,
                      badge: 'High Alert'
                    },
                    {
                      name: 'Spider-Verse Overdrive',
                      desc: 'Extended perception field with energetic oscillation',
                      radius: 380,
                      sens: 10,
                      amp: 4.8,
                      badge: 'Maximum'
                    }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateSpiderSenseSettings({
                          triggerRadius: preset.radius,
                          sensitivity: preset.sens,
                          maxAmplitude: preset.amp
                        });
                        triggerToast(`Preset "${preset.name}" applied!`);
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        preset.highlight
                          ? 'bg-red-950/40 border-red-500/60 hover:border-red-400 hover:bg-red-900/30'
                          : 'bg-[#0f1118] border-gray-800 hover:border-gray-700 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-white text-xs font-sans">{preset.name}</span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            preset.highlight ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-sans leading-relaxed mb-3">
                        {preset.desc}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                        <span>R: {preset.radius}px</span>
                        <span>•</span>
                        <span>Sens: {preset.sens}/10</span>
                        <span>•</span>
                        <span>Amp: {preset.amp}px</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Sensitivity, Radius & Amplitude */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Sensitivity Slider */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold uppercase text-white">
                        SENSITIVITY LEVEL
                      </label>
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-mono font-bold">
                        {spiderSenseSettings.sensitivity} / 10
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mb-4">
                      Controls how quickly the tingle awakens. Higher values mean the effect is clearly noticeable right as the cursor nears the perimeter.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={spiderSenseSettings.sensitivity}
                      onChange={(e) => updateSpiderSenseSettings({ sensitivity: Number(e.target.value) })}
                      className="w-full accent-red-600 cursor-pointer h-2 bg-gray-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>1 (Subtle)</span>
                      <span>5 (Cinematic)</span>
                      <span className="text-red-400 font-bold">8 (Recommended)</span>
                      <span>10 (Hyper)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Trigger Radius Slider */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold uppercase text-white">
                        TRIGGER RADIUS
                      </label>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-400 text-xs font-mono font-bold">
                        {spiderSenseSettings.triggerRadius} px
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mb-4">
                      Defines the circular sensory bubble around Spider-Man's face. 240px - 260px places the threshold right outside the superhero mask.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="range"
                      min={150}
                      max={400}
                      step={5}
                      value={spiderSenseSettings.triggerRadius}
                      onChange={(e) => updateSpiderSenseSettings({ triggerRadius: Number(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>150px (Tight)</span>
                      <span className="text-emerald-400 font-bold">250px (Just Outside Mask)</span>
                      <span>400px (Wide)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Tingle Amplitude Slider */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold uppercase text-white">
                        VIBRATION / AMPLITUDE
                      </label>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-amber-400 text-xs font-mono font-bold">
                        {spiderSenseSettings.maxAmplitude.toFixed(1)} px
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mb-4">
                      Maximum physiological tingle displacement. Kept smooth and sinusoidal without image shaking or violent glitching.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="range"
                      min={1.0}
                      max={5.0}
                      step={0.1}
                      value={spiderSenseSettings.maxAmplitude}
                      onChange={(e) => updateSpiderSenseSettings({ maxAmplitude: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>1.0px (Silky)</span>
                      <span className="text-amber-400 font-bold">2.8px (Balanced)</span>
                      <span>5.0px (Intense)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Page Cursor Reticle Options */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-mono font-bold uppercase text-white">
                    FULL-PAGE CURSOR RETICLE SETTINGS
                  </h3>
                </div>
                <p className="text-xs text-gray-400 font-sans">
                  The Stark HUD Reticle operates across all page sections (Hero, Navbar, Skills, Projects, Footer) with zero click interference.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="p-4 rounded-2xl bg-[#0f1118] border border-gray-800 hover:border-gray-700 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-white font-sans">Enable Global Stark Reticle</div>
                      <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                        Displays high-tech rotating crosshairs following cursor everywhere
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={spiderSenseSettings.reticleEnabled}
                      onChange={(e) => updateSpiderSenseSettings({ reticleEnabled: e.target.checked })}
                      className="w-5 h-5 accent-red-600 rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className="p-4 rounded-2xl bg-[#0f1118] border border-gray-800 hover:border-gray-700 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-white font-sans">Interactive Target-Lock Reaction</div>
                      <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                        Reticle expands and locks on when hovering clickable buttons, links & cards
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={spiderSenseSettings.cursorTargetLock}
                      onChange={(e) => updateSpiderSenseSettings({ cursorTargetLock: e.target.checked })}
                      className="w-5 h-5 accent-red-600 rounded cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RESUME & CV MANAGEMENT */}
          {activeTab === 'resume' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    RESUME & CV MANAGEMENT<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    CONFIGURE DIRECT DOWNLOAD LINK, GOOGLE DRIVE LINK, OR UPLOAD PDF FOR THE SDE_RESUME.PDF BUTTON
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors border border-gray-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> PREVIEW / TEST RESUME
                  </a>
                  <button
                    onClick={() => {
                      resetResumeToDefault();
                      setResumeUrlInput('');
                      triggerToast('Resume reset to default (/resume.pdf)');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-gray-800"
                  >
                    RESET TO DEFAULT
                  </button>
                </div>
              </div>

              {/* Active Resume Status Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141722] to-[#191d2c] border border-red-500/40 shadow-xl shadow-red-950/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-400 shrink-0">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase text-gray-400">
                          ACTIVE RESUME SOURCE:
                        </span>
                        <span
                          className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase border ${
                            resumeSettings.sourceType === 'upload'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : resumeSettings.sourceType === 'url'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                              : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}
                        >
                          {resumeSettings.sourceType === 'upload'
                            ? '📁 DIRECTLY UPLOADED PDF'
                            : resumeSettings.sourceType === 'url'
                            ? '🔗 EXTERNAL CLOUD LINK'
                            : '💻 LOCAL PROJECT FILE'}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white font-sans truncate max-w-xl">
                        {resumeSettings.fileName || 'Akash_Kumar_Resume.pdf'}
                      </div>
                      <div className="text-xs font-mono text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-red-400 truncate max-w-md">Target: {resumeSettings.url}</span>
                        {resumeSettings.fileSize && <span>• Size: {resumeSettings.fileSize}</span>}
                        {resumeSettings.updatedAt && <span>• Updated: {resumeSettings.updatedAt}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-950/50"
                    >
                      <ExternalLink className="w-4 h-4" /> TEST SDE_RESUME.PDF
                    </a>
                  </div>
                </div>
              </div>

              {/* Method 1: Web Link / Google Drive */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-400" /> OPTION 1: LINK TO EXTERNAL RESUME (GOOGLE DRIVE, DROPBOX, CLOUD)
                </h3>
                <p className="text-xs text-gray-400 font-sans mb-4">
                  Paste a direct view link to your resume hosted on Google Drive, Dropbox, Notion, or your own cloud server.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!resumeUrlInput.trim()) return;
                    updateResumeUrl(resumeUrlInput);
                    triggerToast('Resume link saved! Visitors clicking SDE_RESUME.PDF will open this link.');
                  }}
                  className="space-y-4 max-w-2xl"
                >
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                      RESUME URL (HTTP / HTTPS / GOOGLE DRIVE LINK)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={resumeUrlInput}
                        onChange={(e) => setResumeUrlInput(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        required
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold shrink-0 shadow-lg shadow-red-950/30"
                      >
                        SAVE LINK
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/60 text-blue-300 text-xs font-mono flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Google Drive Tip:</strong> Open your PDF on Google Drive &rarr; Click <strong>Share</strong> &rarr; Set General Access to <strong>&ldquo;Anyone with the link can view&rdquo;</strong> &rarr; Copy and paste that link here.
                    </span>
                  </div>
                </form>
              </div>

              {/* Method 2: Upload PDF File Directly */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" /> OPTION 2: UPLOAD PDF RESUME DIRECTLY
                </h3>
                <p className="text-xs text-gray-400 font-sans mb-4">
                  Upload your resume PDF file directly through the browser. It will be stored in your portfolio&apos;s local engine and served immediately when clicking SDE_RESUME.PDF.
                </p>

                <div className="max-w-2xl">
                  <label className="border-2 border-dashed border-gray-700 hover:border-red-500/70 bg-[#0f1118]/60 hover:bg-[#0f1118] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <Upload className="w-10 h-10 text-gray-500 group-hover:text-red-400 transition-colors mb-3" />
                    <span className="text-sm font-bold text-white font-sans mb-1">
                      {isUploadingResume ? 'Processing PDF Document...' : 'Click to Browse or Drag & Drop Resume PDF'}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      Supports .pdf documents up to 3.5MB
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={isUploadingResume}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingResume(true);
                        const res = await uploadResumeFile(file);
                        setIsUploadingResume(false);
                        if (res.success) {
                          setResumeUrlInput('');
                          triggerToast(res.message);
                        } else {
                          alert(res.message);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {resumeSettings.sourceType === 'upload' && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>
                          Active Uploaded File: <strong>{resumeSettings.fileName}</strong> ({resumeSettings.fileSize})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          resetResumeToDefault();
                          triggerToast('Uploaded resume removed.');
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                      >
                        REMOVE UPLOAD
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Method 3: Local Repo Deployment Notice */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" /> OPTION 3: STORE LOCALLY IN PROJECT REPO (FOR GITHUB / VERCEL)
                </h3>
                <p className="text-xs text-gray-400 font-sans mb-3">
                  If you prefer committing your resume to Git so it is permanently bundled with your repository:
                </p>
                <div className="p-4 rounded-2xl bg-[#0f1118] border border-gray-800 space-y-2 text-xs font-mono text-gray-300">
                  <p>
                    1. Save your resume PDF inside the project&apos;s <code className="text-red-400">public/</code> directory:
                  </p>
                  <p className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-amber-300 select-all">
                    c:\Users\itsak\OneDrive\Desktop\Projects\Portfolio\public\resume.pdf
                  </p>
                  <p>
                    2. Vite automatically serves any file placed in <code className="text-red-400">public/</code> at the root path (<code className="text-red-400">/resume.pdf</code>).
                  </p>
                  <p>
                    3. Click <strong>&ldquo;RESET TO DEFAULT&rdquo;</strong> above to ensure your portfolio uses <code className="text-red-400">/resume.pdf</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    TECHNICAL SKILLS<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    MANAGE ARSENAL & EXPERTISE DISPLAYED ON THE LIVE PORTFOLIO
                  </p>
                </div>
              </div>

              {/* Add / Edit Skill Card */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-xs font-mono font-bold uppercase text-red-400 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> {editingSkillId ? 'EDIT SKILL' : 'ADD NEW SKILL'}
                </h3>
                <form onSubmit={handleSaveSkill} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                      SKILL NAME
                    </label>
                    <input
                      type="text"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g. TypeScript, Docker, Next.js"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                      CATEGORY
                    </label>
                    <select
                      value={skillForm.category}
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    >
                      <option value="LANGUAGES & PROBLEM SOLVING">LANGUAGES & PROBLEM SOLVING</option>
                      <option value="PROBLEM SOLVING">PROBLEM SOLVING</option>
                      <option value="FRONTEND DEVELOPMENT">FRONTEND DEVELOPMENT</option>
                      <option value="BACKEND DEVELOPMENT">BACKEND DEVELOPMENT</option>
                      <option value="DATABASE MANAGEMENT">DATABASE MANAGEMENT</option>
                      <option value="VERSION CONTROL & TOOLS">VERSION CONTROL & TOOLS</option>
                      <option value="COMPUTER SCIENCE CORE">COMPUTER SCIENCE CORE</option>
                      <option value="LANGUAGES & SCRIPTS">LANGUAGES & SCRIPTS</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                      PROFICIENCY
                    </label>
                    <select
                      value={skillForm.level}
                      onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    >
                      <option value="ADVANCED">ADVANCED</option>
                      <option value="PROFICIENT">PROFICIENT</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2 text-[11px] font-mono text-gray-300">
                      <input
                        type="checkbox"
                        checked={skillForm.highlight}
                        onChange={(e) => setSkillForm({ ...skillForm, highlight: e.target.checked })}
                        className="rounded accent-red-600 w-4 h-4"
                      />
                      <span>Core Tag</span>
                    </label>
                  </div>

                  <div className="sm:col-span-12 flex justify-end gap-2 pt-2">
                    {editingSkillId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSkillId(null);
                          setSkillForm({
                            name: '',
                            category: 'LANGUAGES & PROBLEM SOLVING',
                            level: 'ADVANCED',
                            highlight: false
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-mono font-bold"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold"
                    >
                      {editingSkillId ? 'SAVE CHANGES' : 'ADD SKILL'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Skills Drag & Reorder Info Banner */}
              <div className="p-3.5 rounded-2xl bg-[#141722] border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2.5">
                  <GripVertical className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                  <span>
                    <strong className="text-white">POSITION ARSENAL:</strong> Drag cards using the <strong className="text-red-400">:::</strong> handle or click arrows to rearrange order on live portfolio.
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">
                  {skills.length} TOTAL SKILLS
                </span>
              </div>

              {/* Skills List Table (Draggable & Reorderable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((s, idx) => {
                  const isDragging = draggedSkillIndex === idx;
                  const isDragOver = dragOverSkillIndex === idx && draggedSkillIndex !== idx;

                  return (
                    <div
                      key={s.id}
                      draggable
                      onDragStart={(e) => handleSkillDragStart(e, idx)}
                      onDragOver={(e) => handleSkillDragOver(e, idx)}
                      onDrop={(e) => handleSkillDrop(e, idx)}
                      onDragEnd={() => {
                        setDraggedSkillIndex(null);
                        setDragOverSkillIndex(null);
                      }}
                      className={`p-4 rounded-2xl bg-[#141722] border transition-all flex items-center justify-between group relative select-none ${
                        isDragging
                          ? 'opacity-40 border-red-500 scale-[0.98] ring-2 ring-red-500/50 shadow-2xl z-20'
                          : isDragOver
                          ? 'border-red-500 ring-2 ring-red-500/80 bg-red-950/20 scale-[1.01]'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Drag Handle & Up/Down Arrows */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            title="Drag to reposition skill"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col -space-y-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSkill(idx, idx - 1)}
                              className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === skills.length - 1}
                              onClick={() => handleMoveSkill(idx, idx + 1)}
                              className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-gray-500 w-5 text-center">
                            #{idx + 1}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                s.highlight ? 'bg-red-500 ring-2 ring-red-900' : 'bg-gray-500'
                              }`}
                            />
                            <h4 className="text-sm font-bold text-white font-sans">{s.name}</h4>
                            {s.highlight && (
                              <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 text-[9px] font-mono font-bold">
                                CORE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block">{s.category}</span>
                          <span className="text-[10px] font-mono font-bold text-gray-500 mt-0.5 block">
                            LEVEL: {s.level}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditSkill(s)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Skill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            requestDelete('Delete Skill', s.name, () => {
                              deleteSkill(s.id);
                              triggerToast(`Skill "${s.name}" deleted.`);
                            })
                          }
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    PROJECTS REPO<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    ADD & EDIT PROJECTS WITH ALL CARD DETAILS MATCHING PORTFOLIO HUD
                  </p>
                </div>
                <button
                  onClick={handleOpenNewProject}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 self-start"
                >
                  <Plus className="w-4 h-4" /> ADD NEW PROJECT
                </button>
              </div>

              {/* Projects Drag & Reorder Info Banner */}
              <div className="p-3.5 rounded-2xl bg-[#141722] border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2.5">
                  <GripVertical className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                  <span>
                    <strong className="text-white">POSITION PROJECTS:</strong> Drag cards using the <strong className="text-red-400">:::</strong> handle or click arrows to rearrange project sequence on live portfolio.
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">
                  {projects.length} TOTAL PROJECTS
                </span>
              </div>

              {/* Projects Grid (Draggable & Reorderable) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((p, idx) => {
                  const isDragging = draggedProjectIndex === idx;
                  const isDragOver = dragOverProjectIndex === idx && draggedProjectIndex !== idx;

                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleProjectDragStart(e, idx)}
                      onDragOver={(e) => handleProjectDragOver(e, idx)}
                      onDrop={(e) => handleProjectDrop(e, idx)}
                      onDragEnd={() => {
                        setDraggedProjectIndex(null);
                        setDragOverProjectIndex(null);
                      }}
                      className={`p-6 rounded-3xl bg-[#141722] border transition-all flex flex-col justify-between select-none relative ${
                        isDragging
                          ? 'opacity-40 border-red-500 scale-[0.98] ring-2 ring-red-500/50 shadow-2xl z-20'
                          : isDragOver
                          ? 'border-red-500 ring-2 ring-red-500/80 bg-red-950/20 scale-[1.01]'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        {/* Top Header with Drag Handle, Position, Badges, and Action Buttons */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {/* Drag Handle & Up/Down Controls */}
                            <div
                              className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Drag to reorder project"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-0.5 bg-[#0f1118] px-1.5 py-0.5 rounded-lg border border-gray-800">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveProject(idx, idx - 1)}
                                className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                                title="Move earlier"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[10px] font-mono font-bold text-red-400 px-1">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                disabled={idx === projects.length - 1}
                                onClick={() => handleMoveProject(idx, idx + 1)}
                                className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                                title="Move later"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {p.featured ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-400" /> FEATURED WORK
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">
                                STANDARD CARD
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProject(p)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                requestDelete('Delete Project', p.title, () => {
                                  deleteProject(p.id);
                                  triggerToast(`Project "${p.title}" deleted.`);
                                })
                              }
                              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white font-sans mb-1">{p.title}</h3>
                        <p className="text-xs font-mono text-red-400 font-semibold mb-3">{p.subtitle}</p>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans mb-4">
                          {p.description}
                        </p>

                        {/* Tech Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.technologies.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-[#0f1118] border border-gray-700 text-[10px] font-mono text-gray-300 font-bold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Highlights */}
                        {p.highlights && p.highlights.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#0f1118] border border-gray-800 space-y-1 mb-4">
                            <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block mb-1">
                              CARD HIGHLIGHTS:
                            </span>
                            {p.highlights.map((h, hIdx) => (
                              <div key={hIdx} className="text-[11px] text-gray-300 font-sans flex items-start gap-1.5">
                                <span className="text-red-500 font-bold">•</span>
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white flex items-center gap-1.5"
                          >
                            REPO <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {p.liveUrl && (
                          <a
                            href={p.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 flex items-center gap-1.5"
                          >
                            LIVE DEMO <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Project Add/Edit Modal */}
              {showProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="w-full max-w-2xl bg-[#141722] border border-gray-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-mono font-bold uppercase text-white">
                        {editingProjectId ? 'EDIT PROJECT DETAILS' : 'CREATE NEW PROJECT CARD'}
                      </h3>
                      <button
                        onClick={() => setShowProjectModal(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProject} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          PROJECT TITLE *
                        </label>
                        <input
                          type="text"
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          required
                          placeholder="e.g. Smart Drainage & Flood Prevention System"
                          className="w-full px-4 py-3 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          SUBTITLE / TAGLINE
                        </label>
                        <input
                          type="text"
                          value={projectForm.subtitle}
                          onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                          placeholder="e.g. Arjuna 2.0 Hackathon Winner (NIT Agartala 2025)"
                          className="w-full px-4 py-3 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          DESCRIPTION
                        </label>
                        <textarea
                          rows={3}
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                          placeholder="Comprehensive summary of architectural decisions, systems engineering, and implementation..."
                          className="w-full px-4 py-3 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            GITHUB REPO URL
                          </label>
                          <input
                            type="text"
                            value={projectForm.githubUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                            placeholder="https://github.com/Akash-314/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            LIVE DEMO URL (OPTIONAL)
                          </label>
                          <input
                            type="text"
                            value={projectForm.liveUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                            placeholder="https://yourdemo.app"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          TECHNOLOGIES (COMMA SEPARATED)
                        </label>
                        <input
                          type="text"
                          value={projectForm.technologies}
                          onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                          placeholder="C++, IoT Systems, React, Node.js"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          HIGHLIGHT BULLETS (ONE PER LINE)
                        </label>
                        <textarea
                          rows={3}
                          value={projectForm.highlights}
                          onChange={(e) => setProjectForm({ ...projectForm, highlights: e.target.value })}
                          placeholder="Secured 1st Place at Arjuna 2.0 Hackathon&#10;Real-time sensor telemetry and early flood warning alerts"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white">
                          <input
                            type="checkbox"
                            checked={projectForm.featured}
                            onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                            className="rounded accent-red-600 w-4 h-4"
                          />
                          <span>FEATURED PROJECT (SPOTLIGHT WITH TROPHY BADGE)</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button
                          type="button"
                          onClick={() => setShowProjectModal(false)}
                          className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-mono font-bold"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold shadow-lg"
                        >
                          SAVE PROJECT CARD
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS CHAINED/WEBBED */}
          {activeTab === 'achievements' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    CHAINED ACHIEVEMENTS<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    INTERCONNECTED WEB OF VICTORIES & HACKATHON PODIUM FINISHES
                  </p>
                </div>
                <button
                  onClick={handleOpenNewAchievement}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 self-start"
                >
                  <Plus className="w-4 h-4" /> CHAIN NEW ACHIEVEMENT
                </button>
              </div>

              {/* Spider Web Connection Indicator */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-mono font-bold text-red-300 uppercase">
                    ACTIVE SPIDER-WEB CHAIN: {achievements.length} CONNECTED NODES
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  Visible in portfolio as an interactive webbed constellation
                </span>
              </div>

              {/* Achievements Drag & Reorder Info Banner */}
              <div className="p-3.5 rounded-2xl bg-[#141722] border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2.5">
                  <GripVertical className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                  <span>
                    <strong className="text-white">POSITION ACHIEVEMENTS:</strong> Drag cards using the <strong className="text-red-400">:::</strong> handle or click arrows to rearrange sequence in the spider-web constellation.
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">
                  {achievements.length} TOTAL PODIUMS
                </span>
              </div>

              {/* Achievements Chained List (Draggable & Reorderable) */}
              <div className="space-y-4">
                {achievements.map((a, idx) => {
                  const isDragging = draggedAchievementIndex === idx;
                  const isDragOver = dragOverAchievementIndex === idx && draggedAchievementIndex !== idx;

                  return (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={(e) => handleAchievementDragStart(e, idx)}
                      onDragOver={(e) => handleAchievementDragOver(e, idx)}
                      onDrop={(e) => handleAchievementDrop(e, idx)}
                      onDragEnd={() => {
                        setDraggedAchievementIndex(null);
                        setDragOverAchievementIndex(null);
                      }}
                      className={`p-6 rounded-3xl bg-[#141722] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group select-none ${
                        isDragging
                          ? 'opacity-40 border-red-500 scale-[0.98] ring-2 ring-red-500/50 shadow-2xl z-20'
                          : isDragOver
                          ? 'border-red-500 ring-2 ring-red-500/80 bg-red-950/20 scale-[1.01]'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Drag Handle & Up/Down Arrows */}
                        <div className="flex flex-col items-center justify-center gap-1 shrink-0 pt-0.5">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Drag to reorder in chain"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col -space-y-1 bg-[#0f1118] p-1 rounded-lg border border-gray-800">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveAchievement(idx, idx - 1)}
                              className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                              title="Move earlier in chain"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === achievements.length - 1}
                              onClick={() => handleMoveAchievement(idx, idx + 1)}
                              className="p-0.5 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors cursor-pointer"
                              title="Move later in chain"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Node index */}
                        <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-mono text-sm font-black text-red-400 shrink-0">
                          #{idx + 1}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white font-sans">{a.title}</h3>
                            {a.featured && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-black uppercase">
                                TOP SPOTLIGHT
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-red-400 font-bold">
                              WEB ORDER #{a.order || idx + 1}
                            </span>
                          </div>

                          <div className="text-xs font-mono text-gray-400 mb-2">
                            <span className="text-white font-bold">{a.position}</span> • {a.organizer} ({a.year})
                          </div>

                          <p className="text-xs text-gray-300 font-sans leading-relaxed mb-3 max-w-2xl">
                            {a.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {a.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded bg-[#0f1118] text-gray-400 border border-gray-800 text-[10px] font-mono"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleEditAchievement(a)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Achievement"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            requestDelete('Remove Achievement', a.title, () => {
                              deleteAchievement(a.id);
                              triggerToast(`Achievement "${a.title}" removed.`);
                            })
                          }
                          className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                          title="Delete Achievement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievement Modal */}
              {showAchievementModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="w-full max-w-xl bg-[#141722] border border-gray-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-mono font-bold uppercase text-white">
                        {editingAchievementId ? 'EDIT ACHIEVEMENTS NODE' : 'CHAIN NEW ACHIEVEMENT'}
                      </h3>
                      <button
                        onClick={() => setShowAchievementModal(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAchievement} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          TITLE / HEADLINE *
                        </label>
                        <input
                          type="text"
                          value={achievementForm.title}
                          onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                          required
                          placeholder="e.g. WINNER — ARJUNA 2.0 HACKATHON"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            EVENT NAME
                          </label>
                          <input
                            type="text"
                            value={achievementForm.event}
                            onChange={(e) => setAchievementForm({ ...achievementForm, event: e.target.value })}
                            placeholder="e.g. Arjuna 2.0 Hackathon"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            ORGANIZER
                          </label>
                          <input
                            type="text"
                            value={achievementForm.organizer}
                            onChange={(e) => setAchievementForm({ ...achievementForm, organizer: e.target.value })}
                            placeholder="e.g. NIT Agartala"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            YEAR
                          </label>
                          <input
                            type="text"
                            value={achievementForm.year}
                            onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                            placeholder="2025"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            POSITION / AWARD
                          </label>
                          <input
                            type="text"
                            value={achievementForm.position}
                            onChange={(e) => setAchievementForm({ ...achievementForm, position: e.target.value })}
                            placeholder="1st Place Winner"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            WEB ORDER
                          </label>
                          <input
                            type="number"
                            value={achievementForm.order}
                            onChange={(e) => setAchievementForm({ ...achievementForm, order: Number(e.target.value) })}
                            min={1}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          DESCRIPTION
                        </label>
                        <textarea
                          rows={3}
                          value={achievementForm.description}
                          onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                          placeholder="Details about what was built and awarded..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          TAGS (COMMA SEPARATED)
                        </label>
                        <input
                          type="text"
                          value={achievementForm.tags}
                          onChange={(e) => setAchievementForm({ ...achievementForm, tags: e.target.value })}
                          placeholder="Hackathon Winner, Smart Systems, Team Lead"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white">
                          <input
                            type="checkbox"
                            checked={achievementForm.featured}
                            onChange={(e) => setAchievementForm({ ...achievementForm, featured: e.target.checked })}
                            className="rounded accent-red-600 w-4 h-4"
                          />
                          <span>FEATURED SPOTLIGHT (GOLD MEDALIST HERO CARD)</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button
                          type="button"
                          onClick={() => setShowAchievementModal(false)}
                          className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-mono font-bold"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold shadow-lg"
                        >
                          SAVE & WEB TOGETHER
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CODING RATINGS */}
          {activeTab === 'ratings' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                  CODING RATINGS & HUD<span className="text-red-500">.</span>
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  UPDATE LEETCODE, CODEFORCES, CODECHEF STATS & PROFILE LINKS
                </p>
              </div>

              <form onSubmit={handleSaveRatings} className="space-y-6">
                {/* 4 Core Stat Inputs */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                  <h3 className="text-xs font-mono font-bold uppercase text-red-400 mb-4">
                    PRIMARY COMPETITIVE METRICS
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        TOTAL SOLVED
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.totalSolved}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, totalSolved: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        MAX LEETCODE RATING
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.rating}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, rating: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-amber-400 text-sm font-mono font-bold focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        MAX CODEFORCES
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.codeforcesRating}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codeforcesRating: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-blue-400 text-sm font-mono font-bold focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        CODECHEF RATING
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.codechefRating}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codechefRating: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-emerald-400 text-sm font-mono font-bold focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Difficulty Breakdown Inputs */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                  <h3 className="text-xs font-mono font-bold uppercase text-gray-300 mb-4">
                    PROBLEM DIFFICULTY BREAKDOWN (EASY / MEDIUM / HARD)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-emerald-400 mb-1">
                        EASY PROBLEMS
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.easy}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, easy: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-emerald-800 text-emerald-300 text-sm font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-amber-400 mb-1">
                        MEDIUM PROBLEMS
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.medium}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, medium: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-amber-800 text-amber-300 text-sm font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-red-400 mb-1">
                        HARD PROBLEMS
                      </label>
                      <input
                        type="number"
                        value={ratingsForm.hard}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, hard: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-red-800 text-red-300 text-sm font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Badges / Text Strings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        CODECHEF BADGE / STARS
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codechefStars}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codechefStars: e.target.value })}
                        placeholder="e.g. 2★ Coder"
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        CODEFORCES STATUS TITLE
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codeforcesStatus}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codeforcesStatus: e.target.value })}
                        placeholder="e.g. 1109 Max Rating"
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Links */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                  <h3 className="text-xs font-mono font-bold uppercase text-gray-300 mb-4">
                    EXTERNAL PROFILE HYPERLINKS
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        LEETCODE PROFILE URL
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.leetcodeUrl}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, leetcodeUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        CODEFORCES PROFILE URL
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codeforcesUrl}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codeforcesUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        CODECHEF PROFILE URL
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codechefUrl}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codechefUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                        GITHUB PROFILE URL
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.githubUrl}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, githubUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-bold uppercase text-purple-400 mb-1">
                        CODOLIO PROFILE URL (CENTRAL CODING HUB)
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codolioUrl}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codolioUrl: e.target.value })}
                        placeholder="e.g. https://codolio.com/profile/Akash-314"
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-purple-900/60 text-purple-300 text-xs font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Stats API Handles */}
                <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase text-cyan-400">
                        LIVE STATS API HANDLES & SYNC
                      </h3>
                      <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                        Usernames used by background workers to query official/public platform APIs with verified fallbacks.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleForceLiveSync}
                      disabled={isSyncingLive}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin text-cyan-400' : ''}`} />
                      {isSyncingLive ? 'SYNCING...' : 'FORCE RE-SYNC LIVE STATS'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-amber-400 mb-1">
                        LEETCODE USERNAME
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.leetcodeUsername}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, leetcodeUsername: e.target.value })}
                        placeholder="e.g. Akash-314"
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-blue-400 mb-1">
                        CODEFORCES HANDLE
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codeforcesUsername}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codeforcesUsername: e.target.value })}
                        placeholder="e.g. Akash-314"
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-emerald-400 mb-1">
                        CODECHEF HANDLE
                      </label>
                      <input
                        type="text"
                        value={ratingsForm.codechefUsername}
                        onChange={(e) => setRatingsForm({ ...ratingsForm, codechefUsername: e.target.value })}
                        placeholder="e.g. akash_314"
                        className="w-full px-4 py-2 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/60 transition-transform transform hover:scale-105"
                  >
                    SAVE & DEPLOY RATINGS TO HUD
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: MY JOURNEY */}
          {activeTab === 'journey' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    MY JOURNEY<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    MANAGE CHRONOLOGICAL MILESTONES (EDUCATION, AWARDS, TECH WORK)
                  </p>
                </div>
                <button
                  onClick={handleOpenNewJourney}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 self-start"
                >
                  <Plus className="w-4 h-4" /> ADD MILESTONE
                </button>
              </div>

              {/* Journey Milestones List */}
              <div className="space-y-4">
                {journey.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#141722] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-[10px] font-mono font-bold">
                          {item.period}
                        </span>
                        <span className="text-xs font-mono uppercase text-gray-400 font-bold">
                          TYPE: {item.type}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white font-sans mt-1">{item.title}</h3>
                      <p className="text-xs font-mono text-gray-400 mb-2">{item.institutionOrEvent}</p>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed mb-3 max-w-2xl">
                        {item.description}
                      </p>

                      {item.details && item.details.length > 0 && (
                        <div className="space-y-1">
                          {item.details.map((d, dIdx) => (
                            <div key={dIdx} className="text-[11px] text-gray-400 font-sans flex items-center gap-1.5">
                              <span className="text-red-500 font-bold">•</span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleEditJourney(item, idx)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        title="Edit Milestone"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          requestDelete('Delete Milestone', item.title, () => {
                            deleteJourneyMilestone(idx);
                            triggerToast(`Milestone "${item.title}" deleted.`);
                          })
                        }
                        className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Journey Modal */}
              {showJourneyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="w-full max-w-xl bg-[#141722] border border-gray-700 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-mono font-bold uppercase text-white">
                        {editingJourneyIdx !== null ? 'EDIT JOURNEY MILESTONE' : 'ADD JOURNEY MILESTONE'}
                      </h3>
                      <button
                        onClick={() => setShowJourneyModal(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveJourney} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            PERIOD / YEAR
                          </label>
                          <input
                            type="text"
                            value={journeyForm.period}
                            onChange={(e) => setJourneyForm({ ...journeyForm, period: e.target.value })}
                            placeholder="e.g. Current (Third Year)"
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                            TYPE
                          </label>
                          <select
                            value={journeyForm.type}
                            onChange={(e) =>
                              setJourneyForm({
                                ...journeyForm,
                                type: e.target.value as 'education' | 'achievement' | 'project'
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                          >
                            <option value="education">Education</option>
                            <option value="achievement">Achievement</option>
                            <option value="project">Project</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          TITLE *
                        </label>
                        <input
                          type="text"
                          value={journeyForm.title}
                          onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })}
                          required
                          placeholder="e.g. B.Tech Information Technology"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          INSTITUTION / EVENT
                        </label>
                        <input
                          type="text"
                          value={journeyForm.institutionOrEvent}
                          onChange={(e) => setJourneyForm({ ...journeyForm, institutionOrEvent: e.target.value })}
                          placeholder="e.g. Rajkiya Engineering College, Banda"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          DESCRIPTION
                        </label>
                        <textarea
                          rows={3}
                          value={journeyForm.description}
                          onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })}
                          placeholder="Summary of experience and milestones..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-1">
                          HIGHLIGHT BULLETS (ONE PER LINE)
                        </label>
                        <textarea
                          rows={3}
                          value={journeyForm.details}
                          onChange={(e) => setJourneyForm({ ...journeyForm, details: e.target.value })}
                          placeholder="Core Focus: C++ Programming, DSA&#10;Active Competitive Programmer"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button
                          type="button"
                          onClick={() => setShowJourneyModal(false)}
                          className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-mono font-bold"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold shadow-lg"
                        >
                          SAVE MILESTONE
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CONTACT MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                    INCOMING TRANSMISSIONS<span className="text-red-500">.</span>
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    ALL MESSAGES SUBMITTED VIA YOUR PORTFOLIO CONTACT FORM
                  </p>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={() =>
                      requestDelete('Clear Inbox', 'All messages in inbox', () => {
                        clearAllMessages();
                        triggerToast('All messages cleared.');
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-800 text-red-300 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors self-start cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL INBOX
                  </button>
                )}
              </div>

              {messages.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#141722] border border-gray-800 text-center">
                  <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white font-sans">Inbox is Empty</h3>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    Messages submitted on your portfolio will be saved and displayed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        m.read
                          ? 'bg-[#141722] border-gray-800'
                          : 'bg-[#181a28] border-red-500/60 shadow-lg shadow-red-950/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          {!m.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                          )}
                          <h4 className="text-base font-bold text-white font-sans">{m.name}</h4>
                          <span className="text-xs font-mono text-red-400">({m.email})</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-500">{m.dateFormatted}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0f1118] border border-gray-800/80 mb-4">
                        <p className="text-sm text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
                          {m.message}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <a
                          href={`mailto:${m.email}?subject=Re: Portfolio Contact Inquiry&body=Hi ${m.name},%0D%0A%0D%0AThank you for reaching out!`}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" /> REPLY VIA EMAIL
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markMessageRead(m.id, !m.read)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-mono font-bold transition-colors"
                          >
                            {m.read ? 'MARK UNREAD' : 'MARK READ'}
                          </button>
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SYNC & SECURITY */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase font-sans">
                  SETTINGS & REPO SYNC<span className="text-red-500">.</span>
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  SECURITY PASSCODE MANAGEMENT & REPO DEPLOYMENT CODE GENERATOR
                </p>
              </div>

              {/* Security Section */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-xs font-mono font-bold uppercase text-red-400 mb-2">
                  MASTER SECURITY PASSCODE
                </h3>
                <p className="text-xs text-gray-400 font-sans mb-4">
                  Change the secret passcode required to open this Admin Hub.
                </p>

                {passError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasscodeSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                      CURRENT PASSCODE
                    </label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      required
                      placeholder="Enter current PIN"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">
                      NEW PASSCODE (MIN 4 CHARS)
                    </label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      placeholder="Enter new PIN"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0f1118] border border-gray-700 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-start pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold"
                    >
                      UPDATE PASSCODE
                    </button>
                  </div>
                </form>
              </div>

              {/* Code Generator & Repo Sync */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-white">
                    PERMANENT REPO CODE EXPORT
                  </h3>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors self-start"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'COPIED TO CLIPBOARD!' : 'COPY PORTFOLIO.TS CODE'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-sans mb-4">
                  Copy the generated TypeScript block below and paste it directly into{' '}
                  <code className="text-red-400">src/data/portfolio.ts</code> to make your admin updates permanent across all web visitors on GitHub / Vercel!
                </p>

                <textarea
                  readOnly
                  rows={8}
                  value={exportPortfolioTsCode()}
                  className="w-full p-4 rounded-2xl bg-[#0f1118] border border-gray-800 text-gray-300 font-mono text-xs focus:outline-none select-all"
                />
              </div>

              {/* JSON Backup & Restore */}
              <div className="p-6 rounded-3xl bg-[#141722] border border-gray-800">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">
                  BACKUP & RESTORE DATA
                </h3>
                <p className="text-xs text-gray-400 font-sans mb-4">
                  Export or restore your complete custom portfolio configuration as a JSON file.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleDownloadBackup}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" /> DOWNLOAD JSON BACKUP
                  </button>

                  <label className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-blue-400" /> RESTORE FROM JSON
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  </label>

                  <button
                    onClick={() =>
                      requestDelete('Factory Reset', 'All custom portfolio data (will revert to initial defaults)', () => {
                        resetToDefaults();
                        triggerToast('Reset to defaults complete.');
                      })
                    }
                    className="px-5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> FACTORY RESET
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* In-App Stark HUD Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#0c1017] border border-red-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-semibold">
                    SECURITY PROTOCOL // CONFIRM ACTION
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {deleteConfirmModal.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-300 font-sans leading-relaxed mb-6">
                Are you sure you want to delete{' '}
                <span className="font-bold text-white">"{deleteConfirmModal.itemName}"</span>? This action will take effect immediately.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={deleteConfirmModal.onConfirm}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> CONFIRM DELETE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
