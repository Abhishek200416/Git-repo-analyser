
export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export class GitHubRateLimitError extends Error {
  resetAt: number | null;
  constructor(message: string, resetAt: number | null = null) {
    super(message);
    this.name = 'GitHubRateLimitError';
    this.resetAt = resetAt;
  }
}

export const parseGitHubUrl = (url: string): GitHubRepoInfo | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
};

export const fetchWithTimeout = async (resource: string, options: any = {}) => {
  const { timeout = 30000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    
    if (response.status === 403) {
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      const resetAt = rateLimitReset ? parseInt(rateLimitReset, 10) * 1000 : null;
      throw new GitHubRateLimitError('GitHub API rate limit exceeded.', resetAt);
    }
    
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout / 1000} seconds. The repository might be too large or GitHub API is slow.`);
    }
    throw error;
  }
};
