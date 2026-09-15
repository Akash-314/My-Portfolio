import type { CodingStats } from '../data/portfolio';

const CACHE_STORAGE_KEY = 'spydyy_coding_stats_cache_v1';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes cache

export interface LiveStatsResult {
  stats: CodingStats;
  isLive: boolean;
  lastUpdated: string;
  source: 'live_api' | 'cached' | 'fallback';
  syncedPlatforms: {
    leetcode: boolean;
    codeforces: boolean;
    codechef: boolean;
  };
}

/**
 * Safely fetches with timeout to prevent hung requests
 */
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Parse HTML returned from CodeChef user profile page
 */
function parseCodeChefHtml(html: string): { rating?: number; stars?: string } | null {
  const ratingMatch = html.match(/class=["']rating-number["'][^>]*>[\s\r\n]*([0-9]+)/i);
  const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : undefined;

  const starSection = html.match(/class=["']rating-star["'][\s\S]*?<\/div>/i);
  const starsCount = (starSection?.[0]?.match(/&#9733;|★/g) || []).length;
  const stars = starsCount > 0 ? `${starsCount}★ Coder` : undefined;

  if (rating || stars) {
    return { rating, stars };
  }
  return null;
}

/**
 * Multi-tier LeetCode fetcher
 * Tier 1: Fast Vercel serverless proxy (<1s response)
 * Tier 2: Render hosted Alfa API
 */
async function fetchLeetCodeStats(username: string): Promise<{
  totalSolved?: number;
  easy?: number;
  medium?: number;
  hard?: number;
  rating?: number;
} | null> {
  let solvedStats: {
    totalSolved?: number;
    easy?: number;
    medium?: number;
    hard?: number;
    rating?: number;
  } | null = null;

  // Tier 1: Vercel serverless proxy for problems solved
  try {
    const res = await fetchWithTimeout(
      `https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(username)}`,
      3500
    );
    if (res.ok) {
      const data = await res.json();
      if (data.totalSolved !== undefined && !data.errors) {
        solvedStats = {
          totalSolved: data.totalSolved,
          easy: data.easySolved,
          medium: data.mediumSolved,
          hard: data.hardSolved
        };
      }
    }
  } catch {
    // Continue to next tier
  }

  // Tier 2: Render hosted Alfa API for problems solved
  if (!solvedStats) {
    try {
      const res = await fetchWithTimeout(
        `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`,
        3500
      );
      if (res.ok) {
        const data = await res.json();
        if (data.totalSolved !== undefined && !data.errors) {
          solvedStats = {
            totalSolved: data.totalSolved,
            easy: data.easySolved,
            medium: data.mediumSolved,
            hard: data.hardSolved
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  // Live Contest Rating fetcher (e.g. 1736)
  try {
    const contestRes = await fetchWithTimeout(
      `https://alfa-leetcode-api.onrender.com/userContestRankingInfo/${encodeURIComponent(username)}`,
      3500
    );
    if (contestRes.ok) {
      const contestData = await contestRes.json();
      const rawRating = contestData?.userContestRanking?.rating;
      if (rawRating && !isNaN(Number(rawRating))) {
        const parsedRating = Math.round(Number(rawRating));
        if (solvedStats) {
          solvedStats.rating = parsedRating;
        } else {
          solvedStats = { rating: parsedRating };
        }
      }
    }
  } catch {
    // Fallback
  }

  return solvedStats;
}

/**
 * Multi-tier CodeChef fetcher
 * Tier 1: Local / Vite dev server proxy
 * Tier 2: Community cp-rating-api
 */
async function fetchCodeChefStats(username: string): Promise<{
  rating?: number;
  stars?: string;
} | null> {
  // Tier 1: Vite proxy / server proxy
  try {
    const res = await fetchWithTimeout(
      `/api/codechef-proxy/${encodeURIComponent(username)}`,
      3500
    );
    if (res.ok) {
      const html = await res.text();
      const parsed = parseCodeChefHtml(html);
      if (parsed) return parsed;
    }
  } catch {
    // Continue to next tier
  }

  // Tier 2: cp-rating-api
  try {
    const res = await fetchWithTimeout(
      `https://cp-rating-api.vercel.app/codechef/${encodeURIComponent(username)}`,
      3500
    );
    if (res.ok) {
      const data = await res.json();
      const parsedRating = parseInt(data.rating, 10);
      const rating = !isNaN(parsedRating) && parsedRating > 0 ? parsedRating : undefined;
      const stars = data.stars ? `${data.stars}★ Coder` : undefined;
      if (rating || stars) {
        return { rating, stars };
      }
    }
  } catch {
    // Fallback
  }

  return null;
}

/**
 * Attempts to retrieve real-time stats from official / public APIs.
 * Falls back gracefully to stored profile data if APIs are offline, rate-limited, or unavailable.
 */
export async function getLiveCodingStats(fallbackStats: CodingStats): Promise<LiveStatsResult> {
  const now = Date.now();

  // 1. Check local cache first to prevent rate limiting
  try {
    const cachedStr = localStorage.getItem(CACHE_STORAGE_KEY);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (cached.timestamp && now - cached.timestamp < CACHE_DURATION_MS && cached.stats) {
        return {
          stats: { ...fallbackStats, ...cached.stats },
          isLive: Boolean(cached.isLive),
          lastUpdated: cached.lastUpdated || 'Recently Cached',
          source: 'cached',
          syncedPlatforms: cached.syncedPlatforms || {
            leetcode: false,
            codeforces: Boolean(cached.isLive),
            codechef: false
          }
        };
      }
    }
  } catch (e) {
    console.warn('Error reading coding stats cache:', e);
  }

  // 2. Prepare dynamic container starting with valid fallback numbers
  const updatedStats: CodingStats = { ...fallbackStats };
  const syncedPlatforms = {
    leetcode: false,
    codeforces: false,
    codechef: false
  };

  // Derive handles from URLs or fallback usernames
  const lcUsername =
    fallbackStats.leetcodeUsername ||
    fallbackStats.leetcodeUrl?.split('/u/')[1]?.replace(/\/$/, '') ||
    fallbackStats.leetcodeUrl?.split('/profile/')[1]?.replace(/\/$/, '') ||
    '';

  const cfUsername =
    fallbackStats.codeforcesUsername ||
    fallbackStats.codeforcesUrl?.split('/profile/')[1]?.replace(/\/$/, '') ||
    '';

  const ccUsername =
    fallbackStats.codechefUsername ||
    fallbackStats.codechefUrl?.split('/users/')[1]?.replace(/\/$/, '') ||
    '';

  // --- A. Codeforces Official Public REST API ---
  if (cfUsername) {
    try {
      const res = await fetchWithTimeout(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(cfUsername)}`,
        3000
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.result && data.result[0]) {
          const user = data.result[0];
          if (user.maxRating) updatedStats.codeforcesRating = user.maxRating;
          if (user.maxRank) updatedStats.codeforcesStatus = `${user.maxRating} Max Rating (${user.maxRank})`;
          syncedPlatforms.codeforces = true;
        }
      }
    } catch {
      // Gracefully preserve fallback
    }
  }

  // --- B. LeetCode Multi-Tier Sync ---
  if (lcUsername) {
    const lcData = await fetchLeetCodeStats(lcUsername);
    if (lcData) {
      if (lcData.totalSolved !== undefined) updatedStats.totalSolved = lcData.totalSolved;
      if (lcData.easy !== undefined) updatedStats.easy = lcData.easy;
      if (lcData.medium !== undefined) updatedStats.medium = lcData.medium;
      if (lcData.hard !== undefined) updatedStats.hard = lcData.hard;
      if (lcData.rating !== undefined) updatedStats.rating = lcData.rating;
      syncedPlatforms.leetcode = true;
    }
  }

  // --- C. CodeChef Multi-Tier Sync ---
  if (ccUsername) {
    const ccData = await fetchCodeChefStats(ccUsername);
    if (ccData) {
      if (ccData.rating !== undefined) updatedStats.codechefRating = ccData.rating;
      if (ccData.stars !== undefined) updatedStats.codechefStars = ccData.stars;
      syncedPlatforms.codechef = true;
    }
  }

  const anyLiveSuccess =
    syncedPlatforms.codeforces || syncedPlatforms.leetcode || syncedPlatforms.codechef;

  const formattedDate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const liveCount = [
    syncedPlatforms.codeforces && 'CF',
    syncedPlatforms.leetcode && 'LC',
    syncedPlatforms.codechef && 'CC'
  ].filter(Boolean).join(' • ');

  const lastUpdatedText = anyLiveSuccess
    ? `Live Sync: ${liveCount} (${formattedDate})`
    : fallbackStats.lastUpdated || 'Verified Archive';

  // 3. Save to localStorage cache
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({
        timestamp: now,
        stats: updatedStats,
        isLive: anyLiveSuccess,
        lastUpdated: lastUpdatedText,
        syncedPlatforms
      })
    );
  } catch (e) {
    console.warn('Error saving coding stats cache:', e);
  }

  return {
    stats: updatedStats,
    isLive: anyLiveSuccess,
    lastUpdated: lastUpdatedText,
    source: anyLiveSuccess ? 'live_api' : 'fallback',
    syncedPlatforms
  };
}

export function clearCodingStatsCache(): void {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (e) {
    console.warn('Error clearing stats cache:', e);
  }
}
