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

// Generator Elements
const textInput = document.getElementById('text-input');
const sampleTextBtn = document.getElementById('btn-sample-text');
const charCounter = document.getElementById('char-counter');
const voiceSelect = document.getElementById('select-voice');
const emotionSelect = document.getElementById('select-emotion');
const customPromptWrapper = document.getElementById('custom-prompt-wrapper');
const customPromptInput = document.getElementById('input-custom-prompt');
const generateBtn = document.getElementById('btn-generate');

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

// Danh sách văn bản mẫu
const SAMPLE_TEXTS = [
  "Chào mừng bạn đến với ứng dụng Gemini Voice Generator. Đây là công cụ tạo giọng nói trí tuệ nhân tạo chất lượng cao, giúp bạn truyền tải thông điệp bằng tiếng Việt một cách sống động nhất.",
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
// 3. Logic Nhập liệu & Tham số
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
  
  // Xoay vòng văn bản mẫu
  currentSampleIndex = (currentSampleIndex + 1) % SAMPLE_TEXTS.length;
});

emotionSelect.addEventListener('change', () => {
  if (emotionSelect.value === 'custom') {
    customPromptWrapper.classList.remove('hidden');
  } else {
    customPromptWrapper.classList.add('hidden');
  }
});

// -------------------------------------------------------------
// 4. Logic Sinh âm thanh & Chuyển đổi PCM sang WAV
// -------------------------------------------------------------

// Viết chuỗi ASCII vào DataView
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Chèn 44-byte WAV header vào mảng bytes PCM 16-bit 24kHz Mono
function pcmToWav(pcmUint8Array, sampleRate = 24000) {
  const buffer = new ArrayBuffer(44 + pcmUint8Array.byteLength);
  const view = new DataView(buffer);
  
  // 1. "RIFF"
  writeString(view, 0, 'RIFF');
  // 2. File size minus 8 bytes
  view.setUint32(4, 36 + pcmUint8Array.byteLength, true);
  // 3. "WAVE"
  writeString(view, 8, 'WAVE');
  // 4. "fmt "
  writeString(view, 12, 'fmt ');
  // 5. Length of format chunk (16)
  view.setUint32(16, 16, true);
  // 6. Format (1 = raw PCM)
  view.setUint16(20, 1, true);
  // 7. Channels (1 = Mono)
  view.setUint16(22, 1, true);
  // 8. Sample Rate (24000 Hz)
  view.setUint32(24, sampleRate, true);
  // 9. Byte Rate (SampleRate * Channels * BitsPerSample / 8) = 24000 * 1 * 2 = 48000 B/s
  view.setUint32(28, sampleRate * 2, true);
  // 10. Block Align (Channels * BitsPerSample / 8) = 1 * 2 = 2 bytes
  view.setUint16(32, 2, true);
  // 11. Bits per Sample (16-bit)
  view.setUint16(34, 16, true);
  // 12. "data"
  writeString(view, 36, 'data');
  // 13. Data chunk size (pcm data length)
  view.setUint32(40, pcmUint8Array.byteLength, true);
  
  // Ghép dữ liệu PCM vào sau Header
  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(pcmUint8Array, 44);
  
  return wavBytes;
}

generateBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text || !apiKey) return;
  
  // Thay đổi trạng thái UI sang Loading
  generateBtn.disabled = true;
  generateBtn.classList.add('loading-pulse');
  const originalBtnText = generateBtn.querySelector('.btn-text').textContent;
  generateBtn.querySelector('.btn-text').textContent = 'Đang tạo giọng nói AI...';
  
  try {
    // Xác định cấu hình chỉ dẫn cảm xúc
    let emotionPrompt = EMOTION_PROMPTS.default;
    if (emotionSelect.value === 'custom') {
      emotionPrompt = customPromptInput.value.trim() || EMOTION_PROMPTS.default;
    } else {
      emotionPrompt = EMOTION_PROMPTS[emotionSelect.value];
    }
    
    // Tạo prompt cuối cùng gửi lên Gemini
    // Hướng dẫn rõ ràng để mô hình chỉ đọc đúng văn bản mục tiêu, không tự phát ngôn chào hỏi.
    const finalPrompt = `Bạn là một trợ lý ảo đọc sách chuyên nghiệp. Đọc to và rõ ràng văn bản sau bằng tiếng Việt. KHÔNG được thêm bất kỳ câu mở đầu, kết thúc hoặc từ ngữ nào nằm ngoài văn bản được cung cấp.
Hướng dẫn về ngữ điệu/cảm xúc khi đọc: ${emotionPrompt}

Văn bản cần đọc:
"${text}"`;

    const voiceName = voiceSelect.value;
    
    // Gọi API của Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: finalPrompt }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        }
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Lỗi HTTP ${response.status}`;
      throw new Error(errMsg);
    }
    
    const result = await response.json();
    const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("Không nhận được dữ liệu âm thanh từ mô hình AI. Hãy thử kiểm tra lại văn bản hoặc thử lại.");
    }
    
    // Giải mã Base64 thành byte PCM thô
    const binaryString = atob(base64Audio);
    const pcmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }
    
    // Chuyển đổi thành WAV (Gemini mặc định trả về PCM 24000Hz)
    const wavBytes = pcmToWav(pcmBytes, 24000);
    
    // Tạo URL phát âm thanh
    const audioBlob = new Blob([wavBytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Nạp âm thanh vào trình phát
    mainAudio.src = audioUrl;
    mainAudio.load();
    
    // Thiết lập nút tải xuống
    downloadWavLink.href = audioUrl;
    
    // Hiển thị trình phát
    emptyState.classList.add('hidden');
    playerWrapper.classList.remove('hidden');
    
    // Đặt trạng thái visualizer
    visualizerStatus.textContent = 'Đã tạo âm thanh thành công. Nhấn phát để nghe!';
    
    // Tự động tua slide phát về đầu
    resetPlayerUI();
    
  } catch (error) {
    console.error(error);
    alert(`Có lỗi xảy ra: ${error.message}`);
  } finally {
    // Khôi phục trạng thái button
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading-pulse');
    generateBtn.querySelector('.btn-text').textContent = originalBtnText;
    checkGenerateState();
  }
});

// -------------------------------------------------------------
// 5. Logic Trình phát nhạc Custom (Audio Player)
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

// Cập nhật thời lượng khi file audio tải xong
mainAudio.addEventListener('loadedmetadata', () => {
  durationTimeSpan.textContent = formatTime(mainAudio.duration);
  playerProgress.max = Math.floor(mainAudio.duration);
});

// Phát / Tạm dừng
playPauseBtn.addEventListener('click', () => {
  if (mainAudio.paused) {
    mainAudio.play();
    playPauseBtn.textContent = '⏸';
    playPauseBtn.classList.add('playing');
    visualizerStatus.textContent = 'Đang phát...';
    
    // Kích hoạt Visualizer bằng Web Audio API
    startVisualizer();
  } else {
    mainAudio.pause();
    playPauseBtn.textContent = '▶';
    playPauseBtn.classList.remove('playing');
    visualizerStatus.textContent = 'Đang tạm dừng';
  }
});

// Cập nhật thanh tiến trình theo thời gian chạy
mainAudio.addEventListener('timeupdate', () => {
  playerProgress.value = Math.floor(mainAudio.currentTime);
  currentTimeSpan.textContent = formatTime(mainAudio.currentTime);
});

// Khi người dùng tự tua nhạc bằng thanh kéo
playerProgress.addEventListener('input', () => {
  mainAudio.currentTime = playerProgress.value;
  currentTimeSpan.textContent = formatTime(mainAudio.currentTime);
});

// Kết thúc âm thanh
mainAudio.addEventListener('ended', () => {
  playPauseBtn.textContent = '▶';
  playPauseBtn.classList.remove('playing');
  playerProgress.value = 0;
  currentTimeSpan.textContent = '0:00';
  visualizerStatus.textContent = 'Phát xong âm thanh';
});

// Quản lý âm lượng
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
// 6. Logic Sóng nhạc Visualizer (Web Audio API)
// -------------------------------------------------------------

function startVisualizer() {
  if (audioCtx) {
    // Nếu context bị suspend bởi trình duyệt, kích hoạt lại
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }
  
  try {
    // Khởi tạo AudioContext
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128; // Tốc độ phân tích âm thanh tốt cho hiển thị
    
    // Nối âm thanh từ Audio element vào hệ thống phân tích sóng
    source = audioCtx.createMediaElementSource(mainAudio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    drawWaveform();
  } catch (err) {
    console.warn("Không khởi tạo được AudioContext (CORS hoặc hạn chế trình duyệt):", err);
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
    
    // Tạo hiệu ứng mờ nhòe (motion blur trail) bằng cách vẽ đè lớp đen bán trong suốt
    ctx.fillStyle = 'rgba(10, 11, 16, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Lấy dữ liệu phân tích dạng tần số sóng âm
    analyser.getByteFrequencyData(dataArray);
    
    const barWidth = (width / bufferLength) * 1.6;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      // Chuẩn hóa độ cao
      barHeight = (dataArray[i] / 255) * height * 0.85;
      
      // Đảm bảo luôn vẽ các vạch nhỏ tối thiểu ngay cả khi đứng im
      if (barHeight < 4) {
        barHeight = 4;
      }
      
      // Tạo dải màu chuyển màu neon xanh dương - neon tím mượt mà
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, '#4facfe');
      gradient.addColorStop(0.5, '#00f2fe');
      gradient.addColorStop(1, '#9b51e0');
      
      ctx.fillStyle = gradient;
      
      // Vẽ thanh bo tròn đầu nhẹ
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 3, barHeight, [4, 4, 0, 0]);
      ctx.fill();
      
      x += barWidth;
    }
  }
  
  draw();
}

// Vẽ một đường thẳng/sóng tĩnh ban đầu trên canvas
function drawStaticWaveform() {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.fillStyle = '#0a0b10';
  ctx.fillRect(0, 0, width, height);
  
  // Vẽ một dải sóng tĩnh
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
// 7. Khởi tạo ứng dụng
// -------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  initApiKey();
  checkGenerateState();
  drawStaticWaveform();
});
