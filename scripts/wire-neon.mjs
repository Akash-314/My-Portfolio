import fs from 'fs';

let content = fs.readFileSync('src/context/PortfolioContext.tsx', 'utf8');

// 1. Add import for neonService
if (!content.includes('neonService')) {
  content = content.replace(
    "import type {",
    "import { uploadResumeToNeonStorage, saveMessageToNeon, fetchMessagesFromNeon } from '../services/neonService';\nimport type {"
  );
}

// 2. Enhance uploadResumeFile
const oldUploadAnchor = "    if (file.size > 3.5 * 1024 * 1024) {";
const newUploadCode = `    // Try uploading to Neon Object Storage first
    try {
      const neonRes = await uploadResumeToNeonStorage(file);
      if (neonRes.success && neonRes.url) {
        setUploadedResumeData(neonRes.url);
        setResumeSettings({
          sourceType: 'upload',
          url: neonRes.url,
          fileName: neonRes.fileName || file.name,
          fileSize: neonRes.fileSize || 'PDF',
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        return { success: true, message: \`Uploaded to Neon Object Storage: \${file.name}!\` };
      }
    } catch (err) {
      console.warn('Neon storage upload fallback to local storage:', err);
    }

    if (file.size > 3.5 * 1024 * 1024) {`;

if (!content.includes('uploadResumeToNeonStorage(file)')) {
  content = content.replace(oldUploadAnchor, newUploadCode);
}

// 3. Enhance addMessage to also persist to Neon Postgres
const oldAddMsgAnchor = `    setMessages((prev) => [newMsg, ...prev]);
  };`;
const newAddMsgCode = `    setMessages((prev) => [newMsg, ...prev]);

    // Asynchronously replicate message to Neon Postgres
    saveMessageToNeon(newMsg).catch((err) => {
      console.warn('Could not replicate message to Neon Postgres:', err);
    });
  };`;

if (!content.includes('saveMessageToNeon(newMsg)')) {
  content = content.replace(oldAddMsgAnchor, newAddMsgCode);
}

// 4. Also fetch from Neon on initial load if available
const oldInitEffect = `  // Persist State Changes`;
const newInitEffect = `  // Sync initial messages from Neon Postgres if available
  useEffect(() => {
    fetchMessagesFromNeon().then((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages((prev) => {
          const map = new Map();
          [...prev, ...remoteMsgs].forEach((m) => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
      }
    }).catch(() => {});
  }, []);

  // Persist State Changes`;

if (!content.includes('fetchMessagesFromNeon()')) {
  content = content.replace(oldInitEffect, newInitEffect);
}

fs.writeFileSync('src/context/PortfolioContext.tsx', content, 'utf8');
console.log('Successfully wired Neon into src/context/PortfolioContext.tsx');

