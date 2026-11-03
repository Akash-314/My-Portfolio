// Service to connect client features to Neon Postgres and Neon Object Storage
export interface NeonStatus {
  status: 'ok' | 'error' | 'disconnected';
  branch?: string;
  postgres?: string;
  objectStorage?: string;
}

export interface StoredMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  dateFormatted: string;
  read: boolean;
}

export async function checkNeonHealth(): Promise<NeonStatus> {
  try {
    const res = await fetch('/api/neon/health');
    if (!res.ok) return { status: 'disconnected' };
    return await res.json();
  } catch {
    return { status: 'disconnected' };
  }
}

export async function saveMessageToNeon(msg: {
  id?: string;
  name: string;
  email: string;
  message: string;
  timestamp?: number;
  dateFormatted?: string;
}): Promise<{ success: boolean; message?: StoredMessage; error?: string }> {
  try {
    const res = await fetch('/api/contact/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to save to database' };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function fetchMessagesFromNeon(): Promise<StoredMessage[]> {
  try {
    const res = await fetch('/api/contact/messages');
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch {
    return [];
  }
}

export async function uploadResumeToNeonStorage(
  file: File
): Promise<{ success: boolean; url?: string; fileName?: string; fileSize?: string; message: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'assets');
    formData.append('key', `resumes/${Date.now()}_${file.name}`);

    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || 'Upload failed' };
    }

    const data = await res.json();
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    return {
      success: true,
      url: data.url,
      fileName: file.name,
      fileSize: sizeStr,
      message: `Uploaded to Neon Object Storage (${sizeStr})!`,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error during upload' };
  }
}

