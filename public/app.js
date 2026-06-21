// --------------------------------------------------
// API KEY STORAGE
// --------------------------------------------------
const KEYS = {
  chatgpt: 'keyOpenAI',
  claude: 'keyAnthropic',
  gemini: 'keyGemini'
};

function saveKeys() {
  localStorage.setItem('pm_key_openai', document.getElementById('keyOpenAI').value.trim());
  localStorage.setItem('pm_key_gemini', document.getElementById('keyGemini').value.trim());
  localStorage.setItem('pm_key_anthropic', document.getElementById('keyAnthropic').value.trim());
  localStorage.setItem('pm_proxy_anthropic', document.getElementById('proxyAnthropic').value.trim());
  showAlert("Credentials stored securely locally.", "success");
}

function loadKeys() {
  document.getElementById('keyOpenAI').value = localStorage.getItem('pm_key_openai') || '';
  document.getElementById('keyGemini').value = localStorage.getItem('pm_key_gemini') || '';
  document.getElementById('keyAnthropic').value = localStorage.getItem('pm_key_anthropic') || '';
  document.getElementById('proxyAnthropic').value = localStorage.getItem('pm_proxy_anthropic') || '';
}

// Password view togglers
document.querySelectorAll('.password-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input.type === 'password') {
      input.type = 'text';
      btn.style.color = 'var(--cyan-glow)';
    } else {
      input.type = 'password';
      btn.style.color = 'var(--text-muted)';
    }
  });
});

// --------------------------------------------------
// MOCK PROMPT REWRITER (FAILSAFE FALLBACK)
// --------------------------------------------------
const MOCK_DATABANK = {
  code: {
    title: "Software Engineering Blueprint",
    chatgpt: `### Act as: Senior Principal Architect
### Context
You are optimizing a software engineering requirement: \n"{INPUT}"

### Instructions
1. Design a clean, modular solution layout in Markdown formatting.
2. Structure implementation guidelines, avoiding conversational preamble.
3. Write clean, production-grade code snippets showing error safety and clean architecture.

### Output Outline
- **Component Design System**: Structural view of modules.
- **Implementation Strategy**: Coding details & optimizations.
- **Reference Implementation**: Completed code files.
- **Robustness Checklist**: Error handlers & testing scripts.`,
    claude: `<role>Senior Principal Software Architect & Systems Designer</role>

<context>
The developer is request coding advice regarding:
"{INPUT}"
</context>

<instructions>
1. Deliver XML-delimited architecture blueprints and functional requirements.
2. Outline components, interface contracts, and dependency graphs.
3. Proactively supply modular, production-ready implementation routines.
4. Output must contain direct, actionable instructions with zero marketing text.
</instructions>

<specifications>
Please provide:
- <architecture_overview>System mapping</architecture_overview>
- <interface_contracts>API / Class design</interface_contracts>
- <code_implementation>Robust code block</code_implementation>
- <edge_cases>Corner cases and recovery systems</edge_cases>
</specifications>`,
    gemini: `## System Persona: Advanced Code Architect
Optimize the raw coding objective: \n"{INPUT}"

## Chain of Thought Analysis
1. Deconstruct requirements into deterministic logic steps.
2. Verify potential edge conditions, memory overheads, and security variables.
3. Output executable modules using strict typing and clean coding standards.

## Execution Framework
- **Logical Breakdown**: Step-by-step processing system.
- **Code Segment**: Optimized and validated codebase.
- **Scalability Metrics**: How this scales under high concurrency.
- **Validation Pipeline**: Exact unit tests to verify parameters.`
  },
  creative: {
    title: "Content Engineering Framework",
    chatgpt: `### Role: Creative Director & Copywriting Expert
### Core Objective
Transform raw drafting requirements: \n"{INPUT}"

### Parameters
- **Target Audience Profile**: Modern, visual, detail-oriented creatives.
- **Voice / Tone**: Sophisticated, premium, opinionated, authoritative yet readable.
- **Formatting style**: Elegant markdown layout with highlight blocks.

### Deliverables Outline
1. **Hook & Core Narrative**: Immediate retention mechanisms.
2. **Body Copy & Structural Grid**: Segmented content sections.
3. **Interactive Copy Callouts**: Engagement points.
4. **Editorial Constraints Checklist**: What keywords or tones to block.`,
    claude: `<persona>Executive Copywriter & Creative Consultant</persona>

<brief>
Generate a premium writing campaign structure representing:
"{INPUT}"
</brief>

<guidelines>
1. Establish a strong narrative arc with high emotional resonance.
2. Avoid clichés, boilerplate corporate filler, and typical marketing adjectives.
3. Format output clearly utilizing structural XML sections to distinguish segments.
</guidelines>

<structure>
Provide details within:
- <narrative_hook>Introductory retention anchor</narrative_hook>
- <core_message_layers>Substantive content arguments</core_message_layers>
- <call_to_action>Highly specific, frictionless conversion drivers</call_to_action>
</structure>`,
    gemini: `## Strategic Role: Communication & Content Strategist
Analyze and structure the creative brief: \n"{INPUT}"

## Intent & Structural Strategy
- Target audience alignment.
- Semantic layering: construct compelling analogies to explain complex topics.
- Multi-channel delivery plan: adapt tone for varying platforms.

## Structural Output
- **Target Persona Alignment**: Who reads this and why they care.
- **Draft Framework**: Highly structured content paragraphs.
- **Refinement Strategy**: How to tailor this to specific marketing mediums.
- **Engagement KPI Matrix**: Metrics for success.`
  },
  general: {
    title: "Precision Execution Command",
    chatgpt: `### Persona: Elite Operations Analyst
### Task Framing
You are given a raw operational goal: \n"{INPUT}"

### Instructions
1. Deconstruct the objective into discrete, sequential steps.
2. Define role boundaries, context limits, and delivery deadlines.
3. Use markdown tables, bold key metrics, and bulleted steps.
4. Filter out redundant filler words and meta-commentary.

### Structured Output Template
1. **Critical Objectives**: Key operational requirements.
2. **Work Breakdown Schedule**: Action items list.
3. **Risk Profile Matrix**: Obstacles & mitigation routines.
4. **Evaluation Criteria**: Definitions of success.`,
    claude: `<role>Expert Systems Analyst & Strategy Coordinator</role>

<task_context>
The organization is deploying an initiative based on:
"{INPUT}"
</task_context>

<operational_protocols>
1. Deconstruct the request into discrete execution blocks.
2. Map resource constraints, logical assumptions, and success standards.
3. Use strict tags to encapsulate operational dimensions.
</operational_protocols>

<response_architecture>
- <scope_definition>Scope limits and constraints</scope_definition>
- <execution_phases>Phase by phase steps</execution_phases>
- <metrics_of_success>Deterministic checklist of goals</metrics_of_success>
</response_architecture>`,
    gemini: `## Strategic Framework: Logic Optimization Engine
Analyze the incoming workflow request: \n"{INPUT}"

## Chain of Logic Deconstruction
1. Identify underlying goals and dependencies.
2. Model potential system failures or process chokepoints.
3. Generate a highly structured, step-by-step action plan.

## Optimization Output
- **Objective Mapping**: Core milestones.
- **Step-by-Step Logic**: Structural pipeline steps.
- **Resource Constraints**: Assumptions and budget thresholds.
- **Verification Parameters**: Metrics to confirm target execution.`
  }
};

function enhancePromptLocal(rawText, provider) {
  const text = rawText.trim();
  let category = 'general';
  
  const codingKeywords = ['code', 'build', 'python', 'javascript', 'html', 'css', 'function', 'api', 'dev', 'software', 'app', 'database', 'sql', 'git', 'script'];
  const creativeKeywords = ['write', 'story', 'blog', 'article', 'copy', 'essay', 'email', 'script', 'content', 'creative', 'marketing', 'ad', 'newsletter'];
  
  const textLower = text.toLowerCase();
  if (codingKeywords.some(kw => textLower.includes(kw))) {
    category = 'code';
  } else if (creativeKeywords.some(kw => textLower.includes(kw))) {
    category = 'creative';
  }

  const template = MOCK_DATABANK[category][provider];
  return template.replace('{INPUT}', text);
}

// --------------------------------------------------
// APPLICATION STATE MANAGEMENT
// --------------------------------------------------
let isProcessing = false;
let particlesReduced = false;
let historyData = [];

// Initialize state
document.addEventListener('DOMContentLoaded', () => {
  document.body.className = 'theme-chatgpt';
  loadKeys();
  loadHistory();
  fetchHistory();
  initUIListeners();
  initThreeScene();
});

const statusAlert = document.getElementById('statusAlert');
const alertMessage = document.getElementById('alertMessage');

function showAlert(msg, type = "error") {
  alertMessage.textContent = msg;
  statusAlert.className = `alert-banner active ${type}`;
  if (type === 'error') {
    triggerThreeErrorState();
  }
  setTimeout(() => {
    statusAlert.classList.remove('active');
  }, 5000);
}

// History Storage
function loadHistory() {
  try {
    const stored = localStorage.getItem('pm_history');
    if (stored) {
      historyData = JSON.parse(stored);
      renderHistory();
    }
  } catch (e) {
    console.error("Error reading history", e);
  }
}

function saveToHistory(raw, enhanced, provider) {
  const item = {
    id: Date.now(),
    raw,
    enhanced,
    provider,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
  };
  historyData.unshift(item);
  if (historyData.length > 5) {
    historyData.pop();
  }
  localStorage.setItem('pm_history', JSON.stringify(historyData));
  renderHistory();
}

function renderHistory() {
  const listContainer = document.getElementById('historyList');
  if (historyData.length === 0) {
    listContainer.innerHTML = '<div class="history-empty">No records stored yet. Optimize some prompts!</div>';
    return;
  }
  
  listContainer.innerHTML = historyData.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-meta">
        <span class="history-model">${item.provider}</span>
        <span class="history-date">${item.date}</span>
      </div>
      <div class="history-preview">${escapeHTML(item.raw)}</div>
    </div>
  `).join('');

  listContainer.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.getAttribute('data-id'));
      const selected = historyData.find(x => x.id === id);
      if (selected) {
        document.getElementById('rawInput').value = selected.raw;
        document.querySelectorAll('.provider-btn').forEach(btn => {
          if (btn.getAttribute('data-provider') === selected.provider) {
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
          } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
          }
        });
        document.body.className = `theme-${selected.provider}`;
        
        const outputPlaceholder = document.getElementById('outputPlaceholder');
        const outputDisplay = document.getElementById('outputDisplay');
        outputPlaceholder.style.display = 'none';
        outputDisplay.style.display = 'block';
        outputDisplay.textContent = selected.enhanced;
        
        const historyDrawer = document.getElementById('historyDrawer');
        historyDrawer.classList.remove('active');
        historyDrawer.setAttribute('aria-hidden', 'true');
        showAlert("History item loaded.", "success");
      }
    });
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// --------------------------------------------------
// SERVER HISTORY API INTERFACE
// --------------------------------------------------
let serverHistory = [];

async function fetchHistory() {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    serverHistory = await response.json();
    renderServerHistory();
  } catch (error) {
    // Fail silently
  }
}

function getRelativeTime(timestamp) {
  const elapsed = Date.now() - new Date(timestamp).getTime();
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  if (elapsed < msPerMinute) {
    return 'just now';
  } else if (elapsed < msPerHour) {
    const mins = Math.round(elapsed / msPerMinute);
    return mins === 1 ? '1 min ago' : `${mins} min ago`;
  } else if (elapsed < msPerDay) {
    const hrs = Math.round(elapsed / msPerHour);
    return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  } else {
    const days = Math.round(elapsed / msPerDay);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
}

function renderServerHistory() {
  const container = document.getElementById('leftHistoryList');
  if (!container) return;

  if (serverHistory.length === 0) {
    container.innerHTML = '<div class="history-empty">No history yet — your optimized prompts will appear here</div>';
    return;
  }

  container.innerHTML = serverHistory.map(item => `
    <div class="left-history-item" data-id="${item.id}">
      <div class="left-history-meta">
        <span class="left-history-provider ${item.provider}">${item.provider}</span>
        <span class="left-history-date">${getRelativeTime(item.timestamp)}</span>
      </div>
      <div class="left-history-preview">${escapeHTML(item.rawText)}</div>
      <div class="left-history-actions">
        <button class="left-history-delete-btn" data-id="${item.id}" title="Delete entry" aria-label="Delete entry">
          <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  // Add click listener to each item to load the values
  container.querySelectorAll('.left-history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.left-history-delete-btn')) return;

      const id = el.getAttribute('data-id');
      const selected = serverHistory.find(x => x.id === id);
      if (selected) {
        document.getElementById('rawInput').value = selected.rawText;
        
        document.querySelectorAll('.provider-btn').forEach(btn => {
          if (btn.getAttribute('data-provider') === selected.provider) {
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
          } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
          }
        });
        document.body.className = `theme-${selected.provider}`;

        const tempVal = selected.temperature !== undefined ? selected.temperature : 0.5;
        document.getElementById('tempSlider').value = tempVal;
        document.getElementById('sliderValue').textContent = tempVal;

        const outputPlaceholder = document.getElementById('outputPlaceholder');
        const outputDisplay = document.getElementById('outputDisplay');
        outputPlaceholder.style.display = 'none';
        outputDisplay.style.display = 'block';
        outputDisplay.textContent = selected.optimized;

        const drawer = document.getElementById('leftHistoryDrawer');
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        showAlert("Prompt run loaded from history.", "success");
      }
    });
  });

  // Add click listener to each delete button
  container.querySelectorAll('.left-history-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      await deleteHistoryItem(id);
    });
  });
}

async function deleteHistoryItem(id) {
  try {
    const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    await fetchHistory();
    showAlert("History item deleted.", "success");
  } catch (error) {
    showAlert("Failed to delete history item.");
  }
}

async function clearAllHistory() {
  try {
    const response = await fetch('/api/history', { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    await fetchHistory();
    showAlert("All history cleared.", "success");
  } catch (error) {
    showAlert("Failed to clear history.");
  }
}

// --------------------------------------------------
// UI LAYOUT & CONTROL FLOW
// --------------------------------------------------
function initUIListeners() {
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsModal = document.getElementById('settingsModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  
  const historyToggle = document.getElementById('historyToggle');
  const historyDrawer = document.getElementById('historyDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  const leftHistoryBtn = document.getElementById('leftHistoryBtn');
  const leftHistoryDrawer = document.getElementById('leftHistoryDrawer');
  const leftDrawerCloseBtn = document.getElementById('leftDrawerCloseBtn');
  const leftHistoryClearBtn = document.getElementById('leftHistoryClearBtn');
  
  const motionToggle = document.getElementById('motionToggle');

  const rawInput = document.getElementById('rawInput');
  const enhanceBtn = document.getElementById('enhanceBtn');
  const copyBtn = document.getElementById('copyBtn');
  
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');
  const tempSlider = document.getElementById('tempSlider');
  const sliderValue = document.getElementById('sliderValue');

  // Slider change
  tempSlider.addEventListener('input', () => {
    sliderValue.textContent = tempSlider.value;
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    rawInput.value = '';
    document.getElementById('outputPlaceholder').style.display = 'flex';
    document.getElementById('outputDisplay').style.display = 'none';
    document.getElementById('outputDisplay').innerHTML = '';
    showAlert("Workspace cleared.", "success");
  });

  // Manual Save button
  saveBtn.addEventListener('click', () => {
    const raw = rawInput.value.trim();
    const enhanced = document.getElementById('outputDisplay').textContent.trim();
    if (!raw || !enhanced) {
      showAlert("Cannot save empty prompt run.");
      return;
    }
    const activeBtn = document.querySelector('.provider-btn.active');
    const provider = activeBtn ? activeBtn.getAttribute('data-provider') : 'chatgpt';
    saveToHistory(raw, enhanced, provider);
    showAlert("Prompt saved to history drawer.", "success");
  });

  // Modal Settings
  settingsToggle.addEventListener('click', () => {
    settingsModal.classList.add('active');
    settingsModal.setAttribute('aria-hidden', 'false');
  });
  modalCloseBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    settingsModal.setAttribute('aria-hidden', 'true');
  });
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
      settingsModal.setAttribute('aria-hidden', 'true');
    }
  });
  saveSettingsBtn.addEventListener('click', () => {
    saveKeys();
    settingsModal.classList.remove('active');
    settingsModal.setAttribute('aria-hidden', 'true');
  });

  // Drawer History
  historyToggle.addEventListener('click', () => {
    historyDrawer.classList.add('active');
    historyDrawer.setAttribute('aria-hidden', 'false');
  });
  drawerCloseBtn.addEventListener('click', () => {
    historyDrawer.classList.remove('active');
    historyDrawer.setAttribute('aria-hidden', 'true');
  });

  // Left Drawer History
  leftHistoryBtn.addEventListener('click', () => {
    fetchHistory();
    leftHistoryDrawer.classList.add('active');
    leftHistoryDrawer.setAttribute('aria-hidden', 'false');
  });
  leftDrawerCloseBtn.addEventListener('click', () => {
    leftHistoryDrawer.classList.remove('active');
    leftHistoryDrawer.setAttribute('aria-hidden', 'true');
  });
  leftHistoryClearBtn.addEventListener('click', () => {
    clearAllHistory();
  });

  // Click outside to close left drawer
  document.addEventListener('click', (e) => {
    if (leftHistoryDrawer.classList.contains('active') && 
        !leftHistoryDrawer.contains(e.target) && 
        !leftHistoryBtn.contains(e.target)) {
      leftHistoryDrawer.classList.remove('active');
      leftHistoryDrawer.setAttribute('aria-hidden', 'true');
    }
  });

  // Motion Toggle
  motionToggle.addEventListener('click', () => {
    document.body.classList.toggle('reduced-motion');
    const active = document.body.classList.contains('reduced-motion');
    motionToggle.style.color = active ? 'var(--text-muted)' : 'var(--provider-accent)';
    
    if (active) {
      particlesReduced = true;
      disableThreeAnimations();
    } else {
      particlesReduced = false;
      enableThreeAnimations();
    }
  });

  // Provider Switches
  const providerBtns = document.querySelectorAll('.provider-btn');
  providerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      providerBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      
      const provider = btn.getAttribute('data-provider');
      document.body.className = `theme-${provider}`;
    });
  });

  // 3D holographic tilt on panels (disabled when reduced motion is on)
  const cards = document.querySelectorAll('.hologram-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('reduced-motion')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      const maxTilt = 8; // degrees (subtle tilt matching physical beveled plates)
      const tiltX = percentX * maxTilt;
      const tiltY = -percentY * maxTilt;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  // Emissive Typing Pulse
  rawInput.addEventListener('input', () => {
    triggerTypingPulse();
  });

  // Enhance trigger
  enhanceBtn.addEventListener('click', (e) => {
    if (isProcessing) return;
    
    const text = rawInput.value.trim();
    if (!text) {
      showAlert("Please enter a raw thought first.");
      return;
    }

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    enhanceBtn.appendChild(ripple);
    
    const rect = enhanceBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    
    setTimeout(() => ripple.remove(), 600);
    processPromptEnhance(text);
  });

  // Copy click
  copyBtn.addEventListener('click', () => {
    const text = document.getElementById('outputDisplay').textContent;
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      const copyText = document.getElementById('copyText');
      copyText.textContent = "Copied!";
      copyBtn.style.color = "var(--provider-accent)";
      copyBtn.style.borderColor = "var(--provider-accent)";
      
      setTimeout(() => {
        copyText.textContent = "Copy";
        copyBtn.style.color = "#33333f";
        copyBtn.style.borderColor = "rgba(255, 255, 255, 0.9)";
      }, 2000);
    }).catch(err => {
      showAlert("Failed to copy text.");
    });
  });
}

// --------------------------------------------------
// API CALL BACKEND PROXY ROUTING
// --------------------------------------------------
async function processPromptEnhance(rawText) {
  isProcessing = true;
  const enhanceBtn = document.getElementById('enhanceBtn');
  enhanceBtn.disabled = true;
  enhanceBtn.textContent = "Generating...";

  const activeBtn = document.querySelector('.provider-btn.active');
  const provider = activeBtn ? activeBtn.getAttribute('data-provider') : 'chatgpt';

  const outputPlaceholder = document.getElementById('outputPlaceholder');
  const outputDisplay = document.getElementById('outputDisplay');
  outputPlaceholder.style.display = 'none';
  outputDisplay.style.display = 'none';

  // Animations trigger
  triggerThreeScatter();
  await animate3DLaserBeam();

  // Load client keys
  const keyOpenAI = localStorage.getItem('pm_key_openai') || '';
  const keyGemini = localStorage.getItem('pm_key_gemini') || '';
  const keyAnthropic = localStorage.getItem('pm_key_anthropic') || '';
  const creativityTemp = parseFloat(document.getElementById('tempSlider').value);

  let optimizedPrompt = "";
  
  const systemInstruction = "You are an expert prompt engineer. Take the user's rough, informal input and rewrite it as a clear, specific, well-structured prompt optimized for AI agents. Add role framing, context, constraints, and output format instructions. Return only the enhanced prompt, nothing else.";

  try {
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OpenAI-Key': keyOpenAI,
        'X-Gemini-Key': keyGemini,
        'X-Anthropic-Key': keyAnthropic
      },
      body: JSON.stringify({
        rawText,
        provider,
        systemInstruction,
        temperature: creativityTemp // Forward slider temperature
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    optimizedPrompt = data.optimized;
    fetchHistory();
  } catch (error) {
    console.warn("Backend enhance proxy error, running simulation fallback:", error);
    showAlert(`${error.message}. Running offline simulation fallback.`, "error");
    await sleep(1000);
    optimizedPrompt = enhancePromptLocal(rawText, provider);
  }

  // Typewriter display
  outputDisplay.style.display = 'block';
  await typeWritePrompt(outputDisplay, optimizedPrompt);
  
  // Storage log is saved only on manual click "SAVE" in this new mockup UI structure!

  isProcessing = false;
  enhanceBtn.disabled = false;
  enhanceBtn.textContent = "GENERATE";
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

// Typewriter
async function typeWritePrompt(element, text) {
  element.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  element.appendChild(cursor);

  let charIdx = 0;
  const words = text.split('');
  const isMotionDisabled = document.body.classList.contains('reduced-motion');
  
  while (charIdx < words.length) {
    const char = words[charIdx++];
    const textNode = document.createTextNode(char);
    element.insertBefore(textNode, cursor);
    element.scrollTop = element.scrollHeight;
    
    const delay = isMotionDisabled ? 1 : (char === '\n' ? 100 : (char === ' ' || char === ',' ? 15 : 8));
    await sleep(delay);
  }
  setTimeout(() => {
    cursor.remove();
  }, 3000);
}

// --------------------------------------------------
// 3D GRAPHICS SCENE (THREE.JS ENVIRONMENT - GLASS BLOCKS)
// --------------------------------------------------
let scene, camera, renderer;
let shards = [];
let particleSystem;
let dynamicPointLight;
let ambientLight, directionalLightCyan, directionalLightViolet;
let customLaserBeamLine, laserGlowSphere;

let targetCameraX = 0;
let targetCameraY = 0;
let mouseX = 0;
let mouseY = 0;

let pulseIntensity = 1.0;
let colorState = 0;
let colorTransitionCoeff = 0.0;

let isScatterActive = false;
let scatterTimer = 0;
let beamAnimationActive = false;
let beamProgress = 0.0;
let renderRequested = true;
let beamCurve;

function initThreeScene() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas) return;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0e0e12, 1); // Dark background matching design

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0e12, 0.05);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  ambientLight = new THREE.AmbientLight(0x1a1a24);
  scene.add(ambientLight);

  directionalLightCyan = new THREE.DirectionalLight(0x00f5ff, 1.4);
  directionalLightCyan.position.set(6, 6, 3);
  scene.add(directionalLightCyan);

  directionalLightViolet = new THREE.DirectionalLight(0x7b2fff, 1.4);
  directionalLightViolet.position.set(-6, -6, 3);
  scene.add(directionalLightViolet);

  dynamicPointLight = new THREE.PointLight(0x00f5ff, 2, 12);
  dynamicPointLight.position.set(0, 0, 2);
  scene.add(dynamicPointLight);

  // Spawn 6 Glass blocks with unique textures
  const icons = ['python', 'doc', 'code', 'db', 'agent', 'text'];
  
  // Coordinates corresponding to left & right floating layout framing cards
  const blockPositions = [
    new THREE.Vector3(-4.8, 1.8, -1.5),  // Python
    new THREE.Vector3(-4.6, 0.0, -1.0),  // Doc
    new THREE.Vector3(-4.9, -1.8, -1.5), // Code
    new THREE.Vector3(4.8, 1.8, -1.5),   // Db
    new THREE.Vector3(4.5, 0.0, -1.0),   // Agent
    new THREE.Vector3(4.9, -1.8, -1.5)   // Text
  ];

  icons.forEach((iconType, idx) => {
    const mesh = createGlassBlock(iconType);
    const pos = blockPositions[idx];
    mesh.position.copy(pos);
    mesh.rotation.set(Math.random() * 0.2, Math.random() * 0.2, (Math.random() - 0.5) * 0.5);
    scene.add(mesh);

    shards.push({
      mesh,
      basePos: pos.clone(),
      currentPos: pos.clone(),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005 + 0.002,
        (Math.random() - 0.5) * 0.005 + 0.003,
        (Math.random() - 0.5) * 0.002
      ),
      velocity: new THREE.Vector3(),
      noiseOffset: Math.random() * 100,
      scale: 1.0
    });
  });

  // Particle Star Dust
  const particleCount = 200;
  const particleGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 16;
    positions[i+1] = (Math.random() - 0.5) * 10;
    positions[i+2] = (Math.random() - 0.5) * 6 - 2;
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const pTexture = createCircleTexture();
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xE8E8FF,
    size: 0.05,
    transparent: true,
    opacity: 0.35,
    map: pTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(particleGeom, particleMaterial);
  scene.add(particleSystem);

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onDocumentMouseMove);
  animate();
}

// Draw canvas vector icons for high resolution decals inside glass cubes
function createIconTexture(iconType) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Fully transparent background
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, size, size);
  
  // Glow stroke details
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  if (iconType === 'python') {
    // Upper snake (cyan)
    ctx.strokeStyle = '#00F5FF';
    ctx.fillStyle = '#00F5FF';
    ctx.beginPath();
    ctx.moveTo(64, 25);
    ctx.lineTo(82, 25);
    ctx.arcTo(97, 25, 97, 40, 15);
    ctx.lineTo(97, 50);
    ctx.arcTo(97, 65, 82, 65, 15);
    ctx.lineTo(64, 65);
    ctx.stroke();
    // eye
    ctx.beginPath();
    ctx.arc(85, 36, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Lower snake (violet)
    ctx.strokeStyle = '#7B2FFF';
    ctx.fillStyle = '#7B2FFF';
    ctx.beginPath();
    ctx.moveTo(64, 103);
    ctx.lineTo(46, 103);
    ctx.arcTo(31, 103, 31, 88, 15);
    ctx.lineTo(31, 78);
    ctx.arcTo(31, 63, 46, 63, 15);
    ctx.lineTo(64, 63);
    ctx.stroke();
    // eye
    ctx.beginPath();
    ctx.arc(43, 92, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (iconType === 'doc') {
    ctx.strokeStyle = '#00F5FF';
    ctx.strokeRect(34, 24, 60, 80);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(46, 44); ctx.lineTo(82, 44);
    ctx.moveTo(46, 64); ctx.lineTo(82, 64);
    ctx.moveTo(46, 84); ctx.lineTo(70, 84);
    ctx.stroke();
  } else if (iconType === 'code') {
    ctx.strokeStyle = '#7B2FFF';
    ctx.beginPath();
    ctx.moveTo(42, 44); ctx.lineTo(24, 64); ctx.lineTo(42, 84);
    ctx.moveTo(86, 44); ctx.lineTo(104, 64); ctx.lineTo(86, 84);
    ctx.moveTo(70, 32); ctx.lineTo(54, 96);
    ctx.stroke();
  } else if (iconType === 'db') {
    ctx.strokeStyle = '#FFB300';
    ctx.strokeRect(34, 28, 60, 22);
    ctx.strokeRect(34, 53, 60, 22);
    ctx.strokeRect(34, 78, 60, 22);
  } else if (iconType === 'agent') {
    ctx.strokeStyle = '#FF5400';
    ctx.fillStyle = '#FF5400';
    ctx.strokeRect(34, 38, 60, 48);
    ctx.beginPath();
    ctx.moveTo(64, 38); ctx.lineTo(64, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(64, 18, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(48, 54, 4, 0, Math.PI*2);
    ctx.arc(80, 54, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeRect(48, 68, 32, 6);
  } else if (iconType === 'text') {
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#00F5FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Text', 64, 64);
  }
  
  return new THREE.CanvasTexture(canvas);
}

// Helper creating box geometry with texture mapped solely to front face
function createGlassBlock(iconType) {
  const iconTexture = createIconTexture(iconType);
  
  // Transparent glass material sides
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,
    opacity: 0.35,
    transparent: true,
    roughness: 0.08,
    metalness: 0.1,
    ior: 1.55,
    thickness: 0.4,
    clearcoat: 1.0
  });

  // Icon face front
  const iconMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: iconTexture,
    transmission: 0.95,
    opacity: 0.85,
    transparent: true,
    roughness: 0.08,
    metalness: 0.1,
    ior: 1.55,
    thickness: 0.4,
    clearcoat: 1.0
  });

  // Box faces materials array: Right, Left, Top, Bottom, Front, Back
  const materials = [glassMat, glassMat, glassMat, glassMat, iconMat, glassMat];
  const geom = new THREE.BoxGeometry(0.85, 0.85, 0.2);
  return new THREE.Mesh(geom, materials);
}

function createCircleTexture() {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(e) {
  mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  mouseY = -(e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  
  targetCameraX = mouseX * 0.4;
  targetCameraY = mouseY * 0.3;

  const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  dynamicPointLight.position.set(pos.x, pos.y, 1.2);
}

function disableThreeAnimations() {
  renderRequested = false;
}

function enableThreeAnimations() {
  renderRequested = true;
  animate();
}

function triggerTypingPulse() {
  if (document.body.classList.contains('reduced-motion')) return;
  pulseIntensity = 2.4;
}

function triggerThreeErrorState() {
  colorState = 1;
  colorTransitionCoeff = 1.0;
  setTimeout(() => {
    colorState = 0;
  }, 1800);
}

function triggerThreeScatter() {
  isScatterActive = true;
  scatterTimer = 35;
  shards.forEach(s => {
    const dir = s.mesh.position.clone().normalize();
    if (dir.lengthSq() === 0) dir.set(0, 1, 0);
    s.velocity.copy(dir).multiplyScalar(0.18 + Math.random() * 0.1);
  });
}

function animate3DLaserBeam() {
  return new Promise(async (resolve) => {
    if (document.body.classList.contains('reduced-motion')) {
      resolve();
      return;
    }

    const isMobile = window.innerWidth <= 992;
    let startPoint, endPoint, ctrlPoint;

    if (isMobile) {
      startPoint = new THREE.Vector3(0, 2.0, -1);
      endPoint = new THREE.Vector3(0, -2.0, -1);
      ctrlPoint = new THREE.Vector3(1.5, 0, 0);
    } else {
      startPoint = new THREE.Vector3(-3.2, 0, -0.5);
      endPoint = new THREE.Vector3(3.2, 0, -0.5);
      ctrlPoint = new THREE.Vector3(0, 1.6, 1.2);
    }

    beamCurve = new THREE.QuadraticBezierCurve3(startPoint, ctrlPoint, endPoint);
    const points = beamCurve.getPoints(50);

    const activeBtn = document.querySelector('.provider-btn.active');
    const provider = activeBtn ? activeBtn.getAttribute('data-provider') : 'chatgpt';
    
    let beamColor = 0x00f5ff;
    if (provider === 'chatgpt') beamColor = 0x7b2fff;
    if (provider === 'gemini') beamColor = 0xffb300;

    const beamGeom = new THREE.BufferGeometry().setFromPoints(points);
    const beamMat = new THREE.LineBasicMaterial({
      color: beamColor,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    customLaserBeamLine = new THREE.Line(beamGeom, beamMat);
    customLaserBeamLine.geometry.setDrawRange(0, 0);
    scene.add(customLaserBeamLine);

    const sparkGeom = new THREE.SphereGeometry(0.15, 12, 12);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: beamColor,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    laserGlowSphere = new THREE.Mesh(sparkGeom, sparkMat);
    laserGlowSphere.position.copy(startPoint);
    scene.add(laserGlowSphere);

    beamAnimationActive = true;
    beamProgress = 0.0;

    const checkTimer = setInterval(() => {
      if (beamProgress >= 1.0) {
        clearInterval(checkTimer);
        scene.remove(customLaserBeamLine);
        scene.remove(laserGlowSphere);
        customLaserBeamLine.geometry.dispose();
        customLaserBeamLine.material.dispose();
        laserGlowSphere.geometry.dispose();
        laserGlowSphere.material.dispose();
        beamAnimationActive = false;
        resolve();
      }
    }, 16);
  });
}

const clock = new THREE.Clock();

function animate() {
  if (!renderRequested) return;
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  camera.position.x += (targetCameraX - camera.position.x) * 0.05;
  camera.position.y += (targetCameraY - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  if (pulseIntensity > 1.0) {
    pulseIntensity += (1.0 - pulseIntensity) * 0.06;
  }

  if (colorTransitionCoeff > 0.0) {
    colorTransitionCoeff -= 0.04;
  }

  const targetFogColor = new THREE.Color(
    THREE.MathUtils.lerp(0x0e0e12, 0x240e0e, colorTransitionCoeff)
  );
  scene.fog.color.copy(targetFogColor);
  renderer.setClearColor(targetFogColor);

  const alertColor = new THREE.Color(0xff2222);
  const normalCyan = new THREE.Color(0x00f5ff);
  const normalViolet = new THREE.Color(0x7b2fff);

  directionalLightCyan.color.lerpColors(normalCyan, alertColor, colorTransitionCoeff);
  directionalLightViolet.color.lerpColors(normalViolet, alertColor, colorTransitionCoeff);
  dynamicPointLight.color.lerpColors(normalCyan, alertColor, colorTransitionCoeff);

  shards.forEach((s, idx) => {
    // Slow drift & oscillation
    const floatX = Math.cos(time * 0.3 + s.noiseOffset) * 0.1;
    const floatY = Math.sin(time * 0.4 + s.noiseOffset) * 0.1;

    if (isScatterActive) {
      s.mesh.position.add(s.velocity);
      s.velocity.multiplyScalar(0.92);
    }

    const springForce = 0.035;
    s.mesh.position.x += (s.basePos.x + floatX - s.mesh.position.x) * springForce;
    s.mesh.position.y += (s.basePos.y + floatY - s.mesh.position.y) * springForce;
    s.mesh.position.z += (s.basePos.z - s.mesh.position.z) * springForce;

    // Rotate glass blocks
    const speedMultiplier = pulseIntensity;
    s.mesh.rotation.x += s.rotSpeed.x * speedMultiplier;
    s.mesh.rotation.y += s.rotSpeed.y * speedMultiplier;
    s.mesh.rotation.z += s.rotSpeed.z * speedMultiplier;

    // Soft glow logic inside blocks
    const activeIconMat = s.mesh.material[4];
    if (activeIconMat) {
      activeIconMat.emissiveIntensity = pulseIntensity * 0.5;
      
      if (colorTransitionCoeff > 0.001) {
        activeIconMat.color.lerpColors(new THREE.Color(0xffffff), alertColor, colorTransitionCoeff);
      } else {
        activeIconMat.color.setHex(0xffffff);
      }
    }
  });

  if (isScatterActive) {
    scatterTimer--;
    if (scatterTimer <= 0) {
      isScatterActive = false;
    }
  }

  if (particleSystem) {
    particleSystem.position.x = -camera.position.x * 0.3;
    particleSystem.position.y = -camera.position.y * 0.3;
    particleSystem.rotation.y = time * 0.01;
  }

  if (beamAnimationActive && customLaserBeamLine && laserGlowSphere) {
    beamProgress += 0.045;
    if (beamProgress > 1.0) beamProgress = 1.0;

    customLaserBeamLine.geometry.setDrawRange(0, Math.floor(beamProgress * 50));
    
    const currentPos = new THREE.Vector3();
    beamCurve.getPoint(beamProgress, currentPos);
    laserGlowSphere.position.copy(currentPos);
    laserGlowSphere.scale.setScalar(0.8 + Math.random() * 0.4);
  }

  renderer.render(scene, camera);
}
