import './style.css';

// -------------------------------------------------------------
// 1. Quản lý DOM Elements
// -------------------------------------------------------------

// API Elements
const apiKeyInput = document.getElementById('input-api-key');
const toggleKeyBtn = document.getElementById('btn-toggle-key-visibility');
const saveKeyBtn = document.getElementById('btn-save-key');
const clearKeyBtn = document.getElementById('btn-clear-key');
const keyStatusText = document.getElementById('key-status-text');

// Studio Navigation Tabs
const tabSingleBtn = document.getElementById('btn-tab-single');
const tabMultiBtn = document.getElementById('btn-tab-multi');
const tabScriptBtn = document.getElementById('btn-tab-script');

// Script Assistant Elements
const scriptPanel = document.getElementById('panel-script-assistant');
const scriptIdeaInput = document.getElementById('input-script-idea');
const scriptGenreSelect = document.getElementById('select-script-genre');
const generateScriptBtn = document.getElementById('btn-generate-script');

// Generator Elements
const textInput = document.getElementById('text-input');
const sampleTextBtn = document.getElementById('btn-sample-text');
const importFileBtn = document.getElementById('btn-import-file');
const inputFileElement = document.getElementById('input-file-element');
const charCounter = document.getElementById('char-counter');
const voiceSelect = document.getElementById('select-voice');
const emotionSelect = document.getElementById('select-emotion');
const customPromptWrapper = document.getElementById('custom-prompt-wrapper');
const customPromptInput = document.getElementById('input-custom-prompt');
const generateBtn = document.getElementById('btn-generate');
const multiSpeakerInfo = document.getElementById('multi-speaker-info');
const sampleDialogueBtn = document.getElementById('btn-sample-dialogue');
const settingsGridSingle = document.getElementById('settings-grid-single');

// BGM Mixer Elements
const checkEnableBgm = document.getElementById('check-enable-bgm');
const bgmControlsBody = document.getElementById('bgm-controls-body');
const selectBgmTheme = document.getElementById('select-bgm-theme');
const customBgmFileInput = document.getElementById('input-custom-bgm-file');
const sliderBgmVolume = document.getElementById('slider-bgm-volume');
const bgmVolVal = document.getElementById('bgm-vol-val');
const checkAutoDucking = document.getElementById('check-auto-ducking');

// Player Elements
const emptyState = document.getElementById('audio-empty-state');
const playerWrapper = document.getElementById('audio-player-wrapper');
const mainAudio = document.getElementById('main-audio-element');
const playPauseBtn = document.getElementById('btn-play-pause');
const playerProgress = document.getElementById('player-progress');
const currentTimeSpan = document.getElementById('player-current-time');
const durationTimeSpan = document.getElementById('player-duration');
const muteBtn = document.getElementById('btn-mute');
const volumeSlider = document.getElementById('player-volume');
const speedButtonsGroup = document.getElementById('speed-buttons-group');

// Visualizer & Download Elements
const canvas = document.getElementById('waveform-canvas');
const visualizerStatus = document.getElementById('visualizer-status-text');
const downloadWavLink = document.getElementById('link-download-wav');

// State Variables
let apiKey = '';
let audioCtx = null;
let analyser = null;
let source = null;
let visualizerAnimationId = null;
let currentPlaybackSpeed = 1.0;
let activeMode = 'single'; // 'single' | 'multi' | 'script'

// BGM Audio Nodes
let bgmAudioElement = null;
let bgmGainNode = null;
let voiceGainNode = null;
let bgmSourceNode = null;
let synthBgmOscillators = [];

// Danh sách văn bản mẫu
const SAMPLE_TEXTS = [
  "Chào mừng bạn đến với ứng dụng Gemini Voice Studio Pro. Đây là công cụ tạo giọng nói trí tuệ nhân tạo chất lượng cao, giúp bạn truyền tải thông điệp bằng tiếng Việt một cách sống động nhất.",
  "Ngày xưa, ở một ngôi làng nhỏ ven sông, có một cậu bé luôn mơ ước được bay lên các vì sao. Cậu thường ngồi dưới gốc đa cổ thụ, nhìn lên bầu trời đêm lấp lánh và thầm thì tự kể những câu chuyện phiêu lưu của riêng mình.",
  "Nhanh hơn. Thông minh hơn. Khám phá ngay công nghệ chuyển đổi văn bản thành giọng nói thế hệ mới từ Google Gemini. Hãy bấm nút tạo giọng nói và cảm nhận sự khác biệt!"
];
let currentSampleIndex = 0;

// Danh sách cảm xúc/tông giọng tương ứng với các Prompts hướng dẫn
const EMOTION_PROMPTS = {
  default: "Đọc trôi chảy, tự nhiên với ngữ điệu chuẩn tiếng Việt.",
  tvc: "Đọc với phong cách TVC quảng cáo thương hiệu chuyên nghiệp. Ngữ điệu cực kỳ cuốn hút, tràn đầy năng lượng, hào hứng, tự tin và truyền cảm hứng mạnh mẽ. Nhấn mạnh rõ rệt vào các tính từ và từ khóa quan trọng, tốc độ đọc vừa phải, dứt khoát và đầy sức thuyết phục.",
  ads: "Đọc với phong cách video quảng cáo ngắn trên mạng xã hội (TikTok, Facebook Reels, Youtube Shorts). Giọng điệu thân thiện, cực kỳ năng động, nhịp điệu nhanh nhẹn, lôi cuốn và bắt tai ngay từ giây đầu tiên. Nhấn nhá linh hoạt để giữ chân người nghe và kích thích sự tò mò.",
  review: "Đọc với phong cách thuyết minh phim, review phim truyền cảm. Ngữ điệu tự nhiên, trôi chảy, nhịp điệu vừa phải, biến đổi biểu cảm linh hoạt theo từng tình tiết kịch tính, lôi cuốn và tạo sự gắn kết cảm xúc với người nghe.",
  news: "Đọc với phong cách phát thanh viên Thời sự hoặc Tin tức báo chí chính luận chuyên nghiệp. Giọng điệu trang trọng, nghiêm túc, khách quan, không biểu cảm thái quá. Phát âm cực kỳ rõ ràng, tròn vành rõ chữ, ngắt nghỉ đúng dấu câu, giữ nhịp điệu đều đặn và uy tín.",
  story: "Đọc với phong cách kể chuyện (Storytelling) hoặc tâm sự radio. Giọng đọc ấm áp, nhẹ nhàng, sâu lắng và truyền cảm xúc sâu sắc. Tốc độ đọc chậm rãi, thì thầm, thân mật như đang tâm sự riêng với một người bạn.",
  horror: "Đọc với phong cách kể truyện ma, truyện trinh thám kinh dị bí ẩn. Giọng đọc ma mị, trầm lắng, lạnh lùng và đáng sợ. Tốc độ đọc rất chậm, có phần kéo dài nhẹ ở cuối câu và chừa các khoảng lặng kịch tính giữa các câu để tạo cảm giác rùng rợn, hồi hộp và ám ảnh.",
  elearning: "Đọc với phong cách bài giảng E-Learning, thuyết trình giáo dục hoặc hướng dẫn khoa học. Giọng đọc kiên nhẫn, dễ chịu, phát âm rõ chữ, nhịp điệu chậm rãi và mạch lạc rõ ràng từng phần giúp người nghe dễ dàng tiếp thu, hiểu và ghi nhớ kiến thức.",
  comedy: "Đọc với phong cách dí dỏm, vui tươi và hóm hỉnh. Nhịp điệu linh hoạt, nhanh nhẹn, nhấn nhá cường điệu nhẹ vào các câu thoại, chi tiết hài hước hoặc kịch tính vui vẻ để mang lại sự sảng khoái và tiếng cười cho người nghe.",
  meditation: "Đọc với phong cách dẫn thiền định (Meditation) hoặc podcast thư giãn tối đa. Tông giọng cực kỳ mềm mại, nhẹ nhàng như hơi thở, tốc độ đọc siêu chậm, nhịp thở đều đặn và êm ái. Tạo không gian bình yên, tĩnh lặng, an lành và thư giãn tuyệt đối cho tâm trí."
};

// -------------------------------------------------------------
// 2. Logic API Key
// -------------------------------------------------------------

function initApiKey() {
  const savedKey = localStorage.getItem('gemini_api_key');
  if (savedKey) {
    apiKey = savedKey;
    apiKeyInput.value = '••••••••••••••••••••••••••••••••••••';
    keyStatusText.textContent = '✅ API Key đã được cấu hình từ bộ nhớ cục bộ.';
    keyStatusText.className = 'api-note success-status';
    checkGenerateState();
  }
}

toggleKeyBtn.addEventListener('click', () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    if (apiKey) {
      apiKeyInput.value = apiKey;
    }
    toggleKeyBtn.textContent = '🙈';
  } else {
    apiKeyInput.type = 'password';
    if (apiKey) {
      apiKeyInput.value = '••••••••••••••••••••••••••••••••••••';
    }
    toggleKeyBtn.textContent = '👁️';
  }
});

saveKeyBtn.addEventListener('click', () => {
  const enteredKey = apiKeyInput.value.trim();
  if (!enteredKey || enteredKey.includes('•••')) {
    alert('Vui lòng nhập một API Key hợp lệ.');
    return;
  }
  
  apiKey = enteredKey;
  localStorage.setItem('gemini_api_key', apiKey);
  apiKeyInput.value = '••••••••••••••••••••••••••••••••••••';
  apiKeyInput.type = 'password';
  toggleKeyBtn.textContent = '👁️';
  
  keyStatusText.textContent = '✅ API Key đã được lưu thành công!';
  keyStatusText.className = 'api-note success-status';
  checkGenerateState();
});

clearKeyBtn.addEventListener('click', () => {
  apiKey = '';
  localStorage.removeItem('gemini_api_key');
  apiKeyInput.value = '';
  keyStatusText.textContent = '⚠️ API Key đã bị xóa. Vui lòng nhập key mới để sử dụng.';
  keyStatusText.className = 'api-note error-status';
  checkGenerateState();
});

// -------------------------------------------------------------
// 3. Logic Navigation Tabs & Studio Modes
// -------------------------------------------------------------

function switchTab(mode) {
  activeMode = mode;
  tabSingleBtn.classList.remove('active');
  tabMultiBtn.classList.remove('active');
  tabScriptBtn.classList.remove('active');

  if (mode === 'single') {
    tabSingleBtn.classList.add('active');
    scriptPanel.classList.add('hidden');
    multiSpeakerInfo.classList.add('hidden');
    settingsGridSingle.classList.remove('hidden');
  } else if (mode === 'multi') {
    tabMultiBtn.classList.add('active');
    scriptPanel.classList.add('hidden');
    multiSpeakerInfo.classList.remove('hidden');
    settingsGridSingle.classList.add('hidden');
  } else if (mode === 'script') {
    tabScriptBtn.classList.add('active');
    scriptPanel.classList.remove('hidden');
    multiSpeakerInfo.classList.add('hidden');
    settingsGridSingle.classList.remove('hidden');
  }
}

tabSingleBtn.addEventListener('click', () => switchTab('single'));
tabMultiBtn.addEventListener('click', () => switchTab('multi'));
tabScriptBtn.addEventListener('click', () => switchTab('script'));

// Nạp kịch bản mẫu Multi-speaker
sampleDialogueBtn.addEventListener('click', () => {
  textInput.value = `[Aoede]: Chào anh Fenrir! Anh đã nghe tin về ứng dụng Gemini AI Voice Studio Pro mới chưa?
[Fenrir]: Chào em Aoede! Anh nghe rồi chứ, công cụ này hỗ trợ đọc kịch bản đối thoại đa nhân vật và trộn nhạc nền cực kỳ ấn tượng!
[Aoede]: Đúng rồi anh, công nghệ AI từ Google giúp giọng đọc biểu cảm và tự nhiên hơn bao giờ hết!`;
  textInput.dispatchEvent(new Event('input'));
});

// -------------------------------------------------------------
// 4. Logic Nhập liệu, Import File & AI Script Assistant
// -------------------------------------------------------------

function checkGenerateState() {
  const hasKey = apiKey.length > 0;
  const hasText = textInput.value.trim().length > 0;
  generateBtn.disabled = !(hasKey && hasText);
}

textInput.addEventListener('input', () => {
  const currentLength = textInput.value.length;
  charCounter.textContent = `${currentLength.toLocaleString()} / 10,000 ký tự`;
  checkGenerateState();
});

sampleTextBtn.addEventListener('click', () => {
  textInput.value = SAMPLE_TEXTS[currentSampleIndex];
  textInput.dispatchEvent(new Event('input'));
  currentSampleIndex = (currentSampleIndex + 1) % SAMPLE_TEXTS.length;
});

// Nạp file .txt / .md từ máy cá nhân
importFileBtn.addEventListener('click', () => {
  inputFileElement.click();
});

inputFileElement.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    textInput.value = event.target.result;
    textInput.dispatchEvent(new Event('input'));
  };
  reader.readAsText(file);
});

emotionSelect.addEventListener('change', () => {
  if (emotionSelect.value === 'custom') {
    customPromptWrapper.classList.remove('hidden');
  } else {
    customPromptWrapper.classList.add('hidden');
  }
});

// Sáng tạo kịch bản tự động bằng Gemini AI Text Generation
generateScriptBtn.addEventListener('click', async () => {
  const idea = scriptIdeaInput.value.trim();
  if (!idea) {
    alert("Vui lòng nhập ý tưởng kịch bản bạn muốn tạo.");
    return;
  }
  if (!apiKey) {
    alert("Vui lòng cấu hình Gemini API Key trước.");
    return;
  }

  generateScriptBtn.disabled = true;
  generateScriptBtn.textContent = "🤖 Đang sáng tạo kịch bản...";

  try {
    const genre = scriptGenreSelect.value;
    let genreInstruction = "Viết kịch bản hấp dẫn, tự nhiên.";
    if (genre === 'tvc') genreInstruction = "Viết kịch bản TVC quảng cáo ngắn, sôi nổi, lôi cuốn, có điểm nhấn thương hiệu.";
    if (genre === 'tiktok') genreInstruction = "Viết kịch bản video ngắn TikTok/Reels giật gân, câu hook hấp dẫn ở 3s đầu.";
    if (genre === 'dialogue') genreInstruction = "Viết kịch bản đối thoại giữa 2 nhân vật [Aoede] (Nữ trong trẻo) và [Fenrir] (Nam trầm ấm) nói chuyện qua lại tự nhiên.";
    if (genre === 'review') genreInstruction = "Viết kịch bản thuyết minh review phim kịch tính, lôi cuốn.";
    if (genre === 'horror') genreInstruction = "Viết kịch bản truyện ma kinh dị ngắn u tối, rùng rợn.";

    const promptText = `Bạn là một biên kịch chuyên nghiệp. Hãy dựa trên ý tưởng sau để viết kịch bản hoàn chỉnh bằng tiếng Việt.
Ý tưởng: "${idea}"
Yêu cầu thể loại: ${genreInstruction}

Quy tắc:
- CHỈ trả về đúng nội dung kịch bản cần đọc. KHÔNG kèm lời chào hay giải thích.
- Nếu là thể loại đối thoại, hãy ghi rõ dạng [Aoede]: ... và [Fenrir]: ...`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Lỗi gọi Gemini API (${response.status})`);
    }

    const data = await response.json();
    const scriptText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (scriptText) {
      textInput.value = scriptText.trim();
      textInput.dispatchEvent(new Event('input'));
      if (genre === 'dialogue') {
        switchTab('multi');
      } else {
        switchTab('single');
      }
    } else {
      throw new Error("Không nhận được nội dung kịch bản từ AI.");
    }
  } catch (err) {
    console.error(err);
    alert(`Lỗi tạo kịch bản: ${err.message}`);
  } finally {
    generateScriptBtn.disabled = false;
    generateScriptBtn.textContent = "🤖 Sáng tạo Kịch bản bằng AI";
  }
});

// -------------------------------------------------------------
// 5. Logic BGM Mixer & Web Audio Auto-Ducking
// -------------------------------------------------------------

checkEnableBgm.addEventListener('change', () => {
  if (checkEnableBgm.checked) {
    bgmControlsBody.classList.remove('hidden');
  } else {
    bgmControlsBody.classList.add('hidden');
    stopBgm();
  }
});

sliderBgmVolume.addEventListener('input', () => {
  bgmVolVal.textContent = `${sliderBgmVolume.value}%`;
  if (bgmGainNode && audioCtx) {
    const vol = sliderBgmVolume.value / 100;
    bgmGainNode.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
  }
});

selectBgmTheme.addEventListener('change', () => {
  if (selectBgmTheme.value === 'custom') {
    customBgmFileInput.click();
  } else {
    if (bgmAudioElement) {
      bgmAudioElement.pause();
      bgmAudioElement = null;
    }
  }
});

customBgmFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  bgmAudioElement = new Audio(url);
  bgmAudioElement.loop = true;
  bgmSourceNode = null; // Reset MediaElementSource node to allow reconnecting
});

// Tổng hợp giai điệu nhạc nền Synth mượt mà bằng Web Audio API khi không nạp file ngoài
function playSynthBgm(theme, ctx, outputNode) {
  stopSynthBgm();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, now);
  masterGain.connect(outputNode);

  let freqs = [220, 277.18, 329.63, 440]; // A Major Chord default (TVC)
  if (theme === 'horror') freqs = [110, 116.54, 155.56, 220]; // Dissonant Horror Pad
  if (theme === 'relax') freqs = [174.61, 220, 261.63, 329.63]; // Fmaj7 Relax Pad
  if (theme === 'news') freqs = [130.81, 196.00, 261.63, 392.00]; // C Power Pulse

  freqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = theme === 'horror' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Slow LFO Modulator for ambient feel
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(5, now);
    lfo.connect(osc.frequency);

    osc.connect(masterGain);
    osc.start(now);
    lfo.start(now);

    synthBgmOscillators.push(osc, lfo);
  });
}

function stopSynthBgm() {
  synthBgmOscillators.forEach(osc => {
    try { osc.stop(); } catch (_) {}
  });
  synthBgmOscillators = [];
}

function startBgm() {
  if (!checkEnableBgm.checked) return;
  if (!audioCtx) return;

  const targetVol = (sliderBgmVolume.value / 100);
  if (!bgmGainNode) {
    bgmGainNode = audioCtx.createGain();
    bgmGainNode.connect(analyser || audioCtx.destination);
  }
  bgmGainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.1);

  if (selectBgmTheme.value === 'custom' && bgmAudioElement) {
    if (!bgmSourceNode) {
      bgmSourceNode = audioCtx.createMediaElementSource(bgmAudioElement);
      bgmSourceNode.connect(bgmGainNode);
    }
    bgmAudioElement.play().catch(console.warn);
  } else {
    playSynthBgm(selectBgmTheme.value, audioCtx, bgmGainNode);
  }
}

function applyAutoDucking(isSpeaking) {
  if (!checkEnableBgm.checked || !bgmGainNode || !audioCtx) return;
  if (!checkAutoDucking.checked) return;

  const baseVol = sliderBgmVolume.value / 100;
  const targetVol = isSpeaking ? baseVol * 0.25 : baseVol; // Giảm âm xuống 25% khi nói
  bgmGainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.3);
}

function stopBgm() {
  stopSynthBgm();
  if (bgmAudioElement) {
    bgmAudioElement.pause();
  }
}

// -------------------------------------------------------------
// 6. Logic Sinh âm thanh & Chuyển đổi PCM sang WAV
// -------------------------------------------------------------

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function pcmToWav(pcmUint8Array, sampleRate = 24000) {
  const buffer = new ArrayBuffer(44 + pcmUint8Array.byteLength);
  const view = new DataView(buffer);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmUint8Array.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcmUint8Array.byteLength, true);
  
  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(pcmUint8Array, 44);
  return wavBytes;
}

// Thư viện 30 giọng đọc hợp lệ của Gemini API
const VALID_PREBUILT_VOICES = [
  "Aoede", "Erinome", "Autonoe", "Laomedeia", "Sadachbia", "Leda", "Despina", "Pulcherrima", "Achernar", "Enceladus",
  "Fenrir", "Puck", "Orus", "Kore", "Charon", "Rasalgethi", "Alnilam", "Algenib", "Gacrux", "Sulafat",
  "Zephyr", "Umbriel", "Schedar", "Achird", "Algieba", "Zubenelgenubi", "Sadaltager", "Callirrhoe", "Iapetus", "Vindemiatrix"
];

function sanitizeVoiceName(rawVoice) {
  if (!rawVoice) return voiceSelect.value;
  const clean = rawVoice.trim();
  
  // Ánh xạ các tên viết tắt / tiếng Việt phổ biến
  if (/^nam$/i.test(clean)) return "Fenrir";
  if (/^(nữ|nu)$/i.test(clean)) return "Aoede";

  const matched = VALID_PREBUILT_VOICES.find(v => v.toLowerCase() === clean.toLowerCase());
  return matched || voiceSelect.value;
}

// Phân tích kịch bản Multi-speaker [VoiceName]: Text
function parseMultiSpeakerScript(rawText) {
  const lines = rawText.split('\n');
  const dialogueChunks = [];

  const speakerRegex = /^\[([^\]]+)\]\s*:\s*(.+)$/;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    const match = line.match(speakerRegex);
    if (match) {
      dialogueChunks.push({
        voice: sanitizeVoiceName(match[1]),
        text: match[2]
      });
    } else {
      dialogueChunks.push({
        voice: voiceSelect.value,
        text: line
      });
    }
  }

  return dialogueChunks;
}

// Gọi API sinh PCM cho 1 đoạn thoại
async function fetchPcmChunk(text, voiceName, emotionPrompt) {
  const finalPrompt = `Bạn là một trợ lý ảo đọc sách chuyên nghiệp. Đọc to và rõ ràng văn bản sau bằng tiếng Việt. KHÔNG được thêm bất kỳ câu mở đầu, kết thúc hoặc từ ngữ nào nằm ngoài văn bản được cung cấp.
Hướng dẫn về ngữ điệu/cảm xúc khi đọc: ${emotionPrompt}

Văn bản cần đọc:
"${text}"`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: finalPrompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Lỗi HTTP ${response.status}`);
  }

  const result = await response.json();
  const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Không nhận được dữ liệu âm thanh từ mô hình AI.");
  }

  const binaryString = atob(base64Audio);
  const pcmBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  return pcmBytes;
}

generateBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text || !apiKey) return;
  
  generateBtn.disabled = true;
  generateBtn.classList.add('loading-pulse');
  const originalBtnText = generateBtn.querySelector('.btn-text').textContent;
  generateBtn.querySelector('.btn-text').textContent = 'Đang tạo âm thanh Studio...';
  
  try {
    let emotionPrompt = EMOTION_PROMPTS.default;
    if (emotionSelect.value === 'custom') {
      emotionPrompt = customPromptInput.value.trim() || EMOTION_PROMPTS.default;
    } else {
      emotionPrompt = EMOTION_PROMPTS[emotionSelect.value];
    }

    let finalPcmBytes = null;

    // Kiểm tra xem có chứa cú pháp Multi-speaker không hoặc ở Tab Multi
    const isMultiScript = text.includes('[') && text.includes(']:');

    if (isMultiScript || activeMode === 'multi') {
      const dialogueChunks = parseMultiSpeakerScript(text);
      if (dialogueChunks.length === 0) {
        throw new Error("Không tìm thấy dòng thoại hợp lệ.");
      }

      const pcmList = [];
      let totalLength = 0;

      // Khoảng lặng 0.35s giữa các câu nói (24000Hz * 0.35s * 2 bytes = 16800 bytes)
      const silenceBytes = new Uint8Array(16800);

      for (let i = 0; i < dialogueChunks.length; i++) {
        const chunk = dialogueChunks[i];
        generateBtn.querySelector('.btn-text').textContent = `Đang xử lý đoạn thoại ${i + 1}/${dialogueChunks.length}...`;
        const pcm = await fetchPcmChunk(chunk.text, chunk.voice, emotionPrompt);
        pcmList.push(pcm);
        totalLength += pcm.byteLength;

        if (i < dialogueChunks.length - 1) {
          pcmList.push(silenceBytes);
          totalLength += silenceBytes.byteLength;
        }
      }

      // Ghép các mảng PCM lại thành 1 mảng lớn
      finalPcmBytes = new Uint8Array(totalLength);
      let offset = 0;
      for (const pcm of pcmList) {
        finalPcmBytes.set(pcm, offset);
        offset += pcm.byteLength;
      }
    } else {
      // Chế độ Đọc Đơn tiêu chuẩn
      finalPcmBytes = await fetchPcmChunk(text, voiceSelect.value, emotionPrompt);
    }
    
    // Chuyển đổi sang file WAV
    const wavBytes = pcmToWav(finalPcmBytes, 24000);
    const audioBlob = new Blob([wavBytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    mainAudio.src = audioUrl;
    mainAudio.load();
    
    downloadWavLink.href = audioUrl;
    
    emptyState.classList.add('hidden');
    playerWrapper.classList.remove('hidden');
    
    visualizerStatus.textContent = 'Đã tạo âm thanh Studio thành công. Nhấn phát để nghe!';
    resetPlayerUI();
    
  } catch (error) {
    console.error(error);
    alert(`Có lỗi xảy ra: ${error.message}`);
  } finally {
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading-pulse');
    generateBtn.querySelector('.btn-text').textContent = originalBtnText;
    checkGenerateState();
  }
});

// -------------------------------------------------------------
// 7. Logic Trình phát nhạc & Tốc độ phát (Audio Player & Speed)
// -------------------------------------------------------------

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function resetPlayerUI() {
  playPauseBtn.textContent = '▶';
  playPauseBtn.classList.remove('playing');
  playerProgress.value = 0;
  currentTimeSpan.textContent = '0:00';
  durationTimeSpan.textContent = '0:00';
}

// Chỉnh tốc độ đọc (Playback Speed)
speedButtonsGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-speed');
  if (!btn) return;
  
  speedButtonsGroup.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  currentPlaybackSpeed = parseFloat(btn.dataset.speed);
  mainAudio.playbackRate = currentPlaybackSpeed;
});

mainAudio.addEventListener('loadedmetadata', () => {
  durationTimeSpan.textContent = formatTime(mainAudio.duration);
  playerProgress.max = Math.floor(mainAudio.duration);
  mainAudio.playbackRate = currentPlaybackSpeed;
});

playPauseBtn.addEventListener('click', () => {
  if (mainAudio.paused) {
    mainAudio.play();
    playPauseBtn.textContent = '⏸';
    playPauseBtn.classList.add('playing');
    visualizerStatus.textContent = 'Đang phát âm thanh Studio...';
    
    startVisualizer();
    startBgm();
    applyAutoDucking(true);
  } else {
    mainAudio.pause();
    playPauseBtn.textContent = '▶';
    playPauseBtn.classList.remove('playing');
    visualizerStatus.textContent = 'Đang tạm dừng';
    applyAutoDucking(false);
  }
});

mainAudio.addEventListener('timeupdate', () => {
  playerProgress.value = Math.floor(mainAudio.currentTime);
  currentTimeSpan.textContent = formatTime(mainAudio.currentTime);
});

playerProgress.addEventListener('input', () => {
  mainAudio.currentTime = playerProgress.value;
  currentTimeSpan.textContent = formatTime(mainAudio.currentTime);
});

mainAudio.addEventListener('ended', () => {
  playPauseBtn.textContent = '▶';
  playPauseBtn.classList.remove('playing');
  playerProgress.value = 0;
  currentTimeSpan.textContent = '0:00';
  visualizerStatus.textContent = 'Phát xong âm thanh';
  applyAutoDucking(false);
  stopBgm();
});

volumeSlider.addEventListener('input', () => {
  const volumeValue = volumeSlider.value / 100;
  mainAudio.volume = volumeValue;
  if (volumeValue === 0) {
    muteBtn.textContent = '🔇';
  } else if (volumeValue < 0.5) {
    muteBtn.textContent = '🔉';
  } else {
    muteBtn.textContent = '🔊';
  }
});

muteBtn.addEventListener('click', () => {
  if (mainAudio.muted) {
    mainAudio.muted = false;
    const vol = volumeSlider.value;
    muteBtn.textContent = vol === '0' ? '🔇' : vol < '50' ? '🔉' : '🔊';
  } else {
    mainAudio.muted = true;
    muteBtn.textContent = '🔇';
  }
});

// -------------------------------------------------------------
// 8. Logic Sóng nhạc Visualizer (Web Audio API)
// -------------------------------------------------------------

function startVisualizer() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }
  
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    
    source = audioCtx.createMediaElementSource(mainAudio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    drawWaveform();
  } catch (err) {
    console.warn("Không khởi tạo được AudioContext:", err);
  }
}

function drawWaveform() {
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function draw() {
    visualizerAnimationId = requestAnimationFrame(draw);
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = 'rgba(10, 11, 16, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    analyser.getByteFrequencyData(dataArray);
    
    const barWidth = (width / bufferLength) * 1.6;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height * 0.85;
      if (barHeight < 4) barHeight = 4;
      
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, '#4facfe');
      gradient.addColorStop(0.5, '#00f2fe');
      gradient.addColorStop(1, '#9b51e0');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 3, barHeight, [4, 4, 0, 0]);
      ctx.fill();
      
      x += barWidth;
    }
  }
  
  draw();
}

function drawStaticWaveform() {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.fillStyle = '#0a0b10';
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = 'rgba(79, 172, 254, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  
  const points = 30;
  const step = width / points;
  for (let i = 0; i <= points; i++) {
    const x = i * step;
    const y = (height / 2) + (Math.sin(i * 0.5) * 4);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// -------------------------------------------------------------
// 9. Khởi tạo ứng dụng
// -------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  initApiKey();
  checkGenerateState();
  drawStaticWaveform();
});
