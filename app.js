/**
 * Hanzi Practice & Sentence Challenge - Main Application Engine
 * Supports HanziWriter Interactive Stroke Quiz, Freehand Canvas, Audio TTS, and Sentence Building
 */

(function () {
  'use strict';

  // --- Audio Sound Effects via Web Audio API ---
  const AudioEffects = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    playTone(freq, duration, type = 'sine', gainVal = 0.15) {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio tone error:', e);
      }
    },
    playCorrectStroke() {
      this.playTone(587.33, 0.12, 'sine', 0.1); // D5 note
    },
    playMistake() {
      this.playTone(220, 0.2, 'triangle', 0.12); // Low A3
    },
    playCompleteWord() {
      // Little success arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.25, 'sine', 0.15);
        }, idx * 110);
      });
    }
  };

  // --- Confetti Animation ---
  const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    init() {
      this.canvas = document.getElementById('confetti-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    },
    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    fire() {
      if (!this.canvas || !this.ctx) return;
      this.particles = [];
      const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
      for (let i = 0; i < 90; i++) {
        this.particles.push({
          x: window.innerWidth * (0.3 + Math.random() * 0.4),
          y: window.innerHeight * 0.4,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.9) * 16,
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }
      if (!this.animationId) {
        this.loop();
      }
    },
    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let alive = false;
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;
        if (p.opacity > 0) {
          alive = true;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0, p.opacity);
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.ctx.restore();
        }
      }
      if (alive) {
        this.animationId = requestAnimationFrame(() => this.loop());
      } else {
        this.animationId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  };

  // --- App State ---
  const state = {
    words: window.HSK4_WORDS || [],
    currentIndex: 0,
    currentCharIndex: 0,
    mode: 'quiz', // 'quiz' or 'freehand'
    gridType: 'mizige', // 'mizige', 'tianzige', 'blank'
    brushSize: 8,
    isAnswerRevealed: false,
    isWatermarkVisible: false,
    charCompletion: [],
    // Freehand drawing state
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    drawingHistory: [],
    // Sentence challenge state
    currentExampleIndex: 0,
    sentenceWatermarkVisible: true,
    sentenceBrushSize: 3,
    sentenceBrushColor: '#0f172a',
    sentenceIsDrawing: false,
    sentenceStrokes: [],
    currentSentenceStroke: null,
    isSentencePeekHidden: false,
    scramblePlacedIndices: [],
    scrambleUserOrder: [],
    scrambleShuffledWords: []
  };

  // DOM Elements cache
  const dom = {
    wordProgressBadge: document.getElementById('word-progress-badge'),
    questionIndexLabel: document.getElementById('question-index-label'),
    pinyinText: document.getElementById('pinyin-text'),
    meaningEn: document.getElementById('meaning-en'),
    meaningId: document.getElementById('meaning-id'),
    btnSpeakVocab: document.getElementById('btn-speak-vocab'),
    charTabsContainer: document.getElementById('char-tabs-container'),
    hanziRevealBox: document.getElementById('hanzi-reveal-box'),
    btnToggleReveal: document.getElementById('btn-toggle-reveal'),
    btnAnimateStroke: document.getElementById('btn-animate-stroke'),
    btnStrokeCount: document.getElementById('btn-stroke-count'),
    btnMarkIncorrect: document.getElementById('btn-mark-incorrect'),
    btnMarkCorrect: document.getElementById('btn-mark-correct'),
    btnModeQuiz: document.getElementById('btn-mode-quiz'),
    btnModeFreehand: document.getElementById('btn-mode-freehand'),
    canvasModeBadge: document.getElementById('canvas-mode-badge'),
    gridSvg: document.getElementById('grid-svg'),
    gridBtns: document.querySelectorAll('.grid-btn'),
    btnToggleWatermark: document.getElementById('btn-toggle-watermark'),
    watermarkOverlay: document.getElementById('watermark-overlay'),
    btnUndoStroke: document.getElementById('btn-undo-stroke'),
    btnClearCanvas: document.getElementById('btn-clear-canvas'),
    hanziWriterContainer: document.getElementById('hanzi-writer-container'),
    freehandCanvas: document.getElementById('freehand-canvas'),
    paintTools: document.getElementById('paint-tools'),
    brushSizeBtns: document.querySelectorAll('.btn-brush-size'),
    btnCheckDrawing: document.getElementById('btn-check-drawing'),
    strokeStatusBar: document.getElementById('stroke-status-bar'),
    // Sentence challenge elements
    challengeSection: document.getElementById('challenge-section'),
    challengeTargetWord: document.getElementById('challenge-target-word'),
    sentenceCounterBadge: document.getElementById('sentence-counter-badge'),
    btnNextSentence: document.getElementById('btn-next-sentence'),
    tabSentenceWrite: document.getElementById('tab-sentence-write'),
    tabScramble: document.getElementById('tab-scramble'),
    tabFreeWriting: document.getElementById('tab-free-writing'),
    viewSentenceWrite: document.getElementById('view-sentence-write'),
    viewScramble: document.getElementById('view-scramble'),
    viewFreeWriting: document.getElementById('view-free-writing'),
    // Sentence writing elements
    sentenceTargetZh: document.getElementById('sentence-target-zh'),
    sentenceTargetPy: document.getElementById('sentence-target-py'),
    sentenceTargetId: document.getElementById('sentence-target-id'),
    sentenceCharChips: document.getElementById('sentence-char-chips'),
    btnSpeakSentenceTarget: document.getElementById('btn-speak-sentence-target'),
    btnTogglePeekSentence: document.getElementById('btn-toggle-peek-sentence'),
    btnToggleSentenceWatermark: document.getElementById('btn-toggle-sentence-watermark'),
    sentenceDrawCanvas: document.getElementById('sentence-draw-canvas'),
    btnUndoSentenceStroke: document.getElementById('btn-undo-sentence-stroke'),
    btnClearSentenceCanvas: document.getElementById('btn-clear-sentence-canvas'),
    btnFinishSentenceWriting: document.getElementById('btn-finish-sentence-writing'),
    sentenceWritingFeedback: document.getElementById('sentence-writing-feedback'),
    sentenceBrushBtns: document.querySelectorAll('.btn-s-brush'),
    sentenceColorBtns: document.querySelectorAll('.btn-s-color'),
    // Scramble elements
    sentenceDropzone: document.getElementById('sentence-dropzone'),
    scrambleTilesPool: document.getElementById('scramble-tiles-pool'),
    btnResetScramble: document.getElementById('btn-reset-scramble'),
    btnCheckSentence: document.getElementById('btn-check-sentence'),
    scrambleResultBox: document.getElementById('scramble-result-box'),
    resSentenceZh: document.getElementById('res-sentence-zh'),
    resSentencePinyin: document.getElementById('res-sentence-pinyin'),
    resSentenceMeaning: document.getElementById('res-sentence-meaning'),
    btnSpeakSentence: document.getElementById('btn-speak-sentence'),
    // Free writing elements
    freeTargetWord: document.getElementById('free-target-word'),
    freeSentenceInput: document.getElementById('free-sentence-input'),
    badgeWordIncluded: document.getElementById('badge-word-included'),
    btnSpeakFreeSentence: document.getElementById('btn-speak-free-sentence'),
    btnShowSampleSentence: document.getElementById('btn-show-sample-sentence'),
    sampleSentenceHintBox: document.getElementById('sample-sentence-hint-box'),
    sampleZhText: document.getElementById('sample-zh-text'),
    samplePyText: document.getElementById('sample-py-text'),
    sampleIdText: document.getElementById('sample-id-text'),
    // Nav elements
    btnPrevWord: document.getElementById('btn-prev-word'),
    btnNextWord: document.getElementById('btn-next-word'),
    btnJumpChallenge: document.getElementById('btn-jump-challenge'),
    btnOpenVocabModal: document.getElementById('btn-open-vocab-modal'),
    btnRandomWord: document.getElementById('btn-random-word'),
    vocabModal: document.getElementById('vocab-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    vocabSearchInput: document.getElementById('vocab-search-input'),
    vocabListContainer: document.getElementById('vocab-list-container'),
    pillVocab: document.getElementById('pill-vocab'),
    pillChallenge: document.getElementById('pill-challenge')
  };

  let writerInstance = null;
  const canvasCtx = dom.freehandCanvas.getContext('2d');
  const sentenceCanvasCtx = dom.sentenceDrawCanvas ? dom.sentenceDrawCanvas.getContext('2d') : null;

  // --- Initialize App ---
  function init() {
    Confetti.init();
    setupCanvas();
    renderGrid(state.gridType);
    initSentenceDrawingListeners();
    bindEvents();
    loadWord(0);
    renderVocabModalList();
  }

  // --- Render Chinese Grid (Mizige, Tianzige, Blank) ---
  function renderGrid(type) {
    dom.gridType = type;
    const svg = dom.gridSvg;
    svg.innerHTML = '';

    if (type === 'blank') return;

    // Outer border
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '2');
    rect.setAttribute('y', '2');
    rect.setAttribute('width', '396');
    rect.setAttribute('height', '396');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', '#dc2626');
    rect.setAttribute('stroke-width', '2.5');
    rect.setAttribute('stroke-opacity', '0.4');
    svg.appendChild(rect);

    // Helper to create dashed line
    const createLine = (x1, y1, x2, y2) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#dc2626');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '6,6');
      line.setAttribute('stroke-opacity', '0.35');
      return line;
    };

    // Horizontal & Vertical Center Lines
    svg.appendChild(createLine(0, 200, 400, 200));
    svg.appendChild(createLine(200, 0, 200, 400));

    // Mizige diagonal lines
    if (type === 'mizige') {
      svg.appendChild(createLine(0, 0, 400, 400));
      svg.appendChild(createLine(0, 400, 400, 0));
    }
  }

  // --- Setup Freehand Paint Canvas ---
  function setupCanvas() {
    const canvas = dom.freehandCanvas;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    canvasCtx.scale(dpr, dpr);
    canvasCtx.lineCap = 'round';
    canvasCtx.lineJoin = 'round';
    saveCanvasState();
  }

  function saveCanvasState() {
    if (state.drawingHistory.length > 25) {
      state.drawingHistory.shift();
    }
    state.drawingHistory.push(dom.freehandCanvas.toDataURL());
  }

  function undoCanvas() {
    if (state.drawingHistory.length > 1) {
      state.drawingHistory.pop(); // remove current
      const prevState = state.drawingHistory[state.drawingHistory.length - 1];
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        canvasCtx.clearRect(0, 0, 400, 400);
        canvasCtx.drawImage(img, 0, 0, 400, 400);
      };
      img.src = prevState;
    } else {
      clearCanvasOnly();
    }
  }

  function clearCanvasOnly() {
    canvasCtx.clearRect(0, 0, 400, 400);
    state.drawingHistory = [dom.freehandCanvas.toDataURL()];
  }

  // --- Speech Synthesis Helper ---
  function speakChinese(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.88; // clear learner-friendly pace
    
    // Pick Chinese voice if available
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }
    window.speechSynthesis.speak(utterance);
  }

  // --- Load Vocabulary Word ---
  function loadWord(index) {
    if (index < 0 || index >= state.words.length) return;
    state.currentIndex = index;
    state.currentCharIndex = 0;
    state.currentExampleIndex = 0;
    state.isAnswerRevealed = false;
    state.isWatermarkVisible = false;

    const word = state.words[index];
    if (word.examples && word.examples.length) {
      word.example = word.examples[state.currentExampleIndex];
    }
    state.charCompletion = new Array(word.characters.length).fill(false);

    // Update UI elements
    dom.wordProgressBadge.textContent = `Kata ${word.id} dari ${state.words.length}`;
    dom.questionIndexLabel.textContent = `Question ${word.id} of ${state.words.length}`;
    dom.pinyinText.textContent = word.pinyin;
    dom.meaningEn.textContent = word.english;
    dom.meaningId.textContent = word.indonesian || word.english;
    dom.hanziRevealBox.textContent = '?';
    dom.hanziRevealBox.classList.add('hidden-char');
    dom.watermarkOverlay.classList.add('hidden');
    dom.challengeSection.classList.remove('highlight');

    // Render character tabs for multi-character words
    renderCharTabs(word.characters);

    // Setup Challenge Area
    dom.challengeTargetWord.textContent = `Target: ${word.hanzi} (${word.pinyin})`;
    dom.freeTargetWord.textContent = word.hanzi;
    setupSentenceWriting(word);
    setupSentenceScramble(word);
    setupFreeWriting(word);

    // Reset status and canvas
    clearCanvasOnly();
    loadCharacterWriting(word.characters[0]);
  }

  // --- Render Multi-character Tabs ---
  function renderCharTabs(chars) {
    dom.charTabsContainer.innerHTML = '';
    chars.forEach((char, idx) => {
      const btn = document.createElement('button');
      btn.className = `char-tab-btn ${idx === state.currentCharIndex ? 'active' : ''}`;
      btn.innerHTML = `<span>[${idx + 1}]</span> <span>${state.charCompletion[idx] ? char : '?'}</span>`;
      btn.addEventListener('click', () => {
        state.currentCharIndex = idx;
        updateCharTabsVisual();
        loadCharacterWriting(chars[idx]);
      });
      dom.charTabsContainer.appendChild(btn);
    });
  }

  function updateCharTabsVisual() {
    const word = state.words[state.currentIndex];
    const buttons = dom.charTabsContainer.querySelectorAll('.char-tab-btn');
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === state.currentCharIndex);
      if (state.charCompletion[idx]) {
        btn.classList.add('completed');
        btn.innerHTML = `<span>[${idx + 1}]</span> <span>${word.characters[idx]}</span> <span class="check-icon">✓</span>`;
      } else {
        btn.innerHTML = `<span>[${idx + 1}]</span> <span>${idx === state.currentCharIndex ? '✍️' : '?'}</span>`;
      }
    });
  }

  // --- Load Character in Canvas / HanziWriter ---
  function loadCharacterWriting(char) {
    dom.watermarkOverlay.textContent = char;
    if (state.isAnswerRevealed) {
      dom.hanziRevealBox.textContent = char;
      dom.hanziRevealBox.classList.remove('hidden-char');
    } else {
      dom.hanziRevealBox.textContent = '?';
      dom.hanziRevealBox.classList.add('hidden-char');
    }

    clearCanvasOnly();
    updateStatus(`Goreskan karakter '${char}' di kanvas...`, 'normal');

    if (state.mode === 'quiz') {
      initHanziWriterQuiz(char);
    } else {
      // Freehand mode
      destroyHanziWriter();
    }
  }

  // --- HanziWriter Stroke Quiz ---
  function initHanziWriterQuiz(char) {
    dom.hanziWriterContainer.innerHTML = '';
    destroyHanziWriter();

    if (typeof HanziWriter === 'undefined') {
      updateStatus('Mode Kuis Goresan membutuhkan koneksi ke perpustakaan Hanzi. Beralih ke Mode Tulis Bebas.', 'error');
      switchMode('freehand');
      return;
    }

    try {
      writerInstance = HanziWriter.create('hanzi-writer-container', char, {
        width: 380,
        height: 380,
        showOutline: false,
        showCharacter: false,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 150,
        strokeColor: '#0f172a',
        radicalColor: '#2563eb',
        drawingWidth: 20,
        drawingColor: '#2563eb',
        highlightColor: '#10b981',
        strokeHighlightSpeed: 1.5,
        charDataLoader: (targetChar, onComplete, onFail) => {
          HanziWriter.loadCharacterData(targetChar)
            .then(onComplete)
            .catch(() => {
              updateStatus(`Panduan stroke untuk '${char}' siap di kanvas tulis bebas!`, 'normal');
              if (onFail) onFail();
            });
        }
      });

      writerInstance.quiz({
        onCorrectStroke(strokeData) {
          AudioEffects.playCorrectStroke();
          updateStatus(`Hebat! Goresan ke-${strokeData.strokeNum + 1} benar. (Sisa: ${strokeData.strokesRemaining})`, 'success');
        },
        onMistake(strokeData) {
          AudioEffects.playMistake();
          updateStatus(`Goresan kurang tepat atau salah arah. Coba lagi! (Salah: ${strokeData.mistakesOnStroke})`, 'error');
        },
        onComplete(summary) {
          onCharacterSuccess(char);
        }
      });
    } catch (err) {
      console.warn('HanziWriter init error:', err);
      updateStatus(`Siap menulis di kanvas.`, 'normal');
    }
  }

  function destroyHanziWriter() {
    if (writerInstance) {
      try {
        if (typeof writerInstance.cancelQuiz === 'function') {
          writerInstance.cancelQuiz();
        }
      } catch (e) {}
      writerInstance = null;
    }
    dom.hanziWriterContainer.innerHTML = '';
  }

  // --- Character Completion Handler ---
  function onCharacterSuccess(char) {
    AudioEffects.playCompleteWord();
    state.charCompletion[state.currentCharIndex] = true;
    updateCharTabsVisual();

    const word = state.words[state.currentIndex];
    const isAllDone = state.charCompletion.every(Boolean);

    if (isAllDone) {
      Confetti.fire();
      updateStatus(`🎉 Luar biasa! Seluruh karakter kata "${word.hanzi}" berhasil ditulis dengan benar!`, 'success');
      dom.hanziRevealBox.textContent = word.hanzi;
      dom.hanziRevealBox.classList.remove('hidden-char');
      
      // Auto unlock and highlight sentence challenge
      dom.challengeSection.classList.add('highlight');
      setTimeout(() => {
        dom.challengeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 600);
    } else {
      // Move to next character in word
      updateStatus(`Bagus! Karakter '${char}' selesai. Lanjut ke karakter berikutnya...`, 'success');
      setTimeout(() => {
        state.currentCharIndex++;
        updateCharTabsVisual();
        loadCharacterWriting(word.characters[state.currentCharIndex]);
      }, 800);
    }
  }

  // --- Status Message Helper ---
  function updateStatus(text, type = 'normal') {
    dom.strokeStatusBar.textContent = text;
    dom.strokeStatusBar.className = `stroke-status-bar ${type}`;
  }

  // --- Switch Mode between HanziWriter Quiz and Freehand Paint ---
  function switchMode(newMode) {
    state.mode = newMode;
    dom.btnModeQuiz.classList.toggle('active', newMode === 'quiz');
    dom.btnModeFreehand.classList.toggle('active', newMode === 'freehand');

    if (newMode === 'quiz') {
      dom.canvasModeBadge.textContent = 'Mode: Kuis Otomatis';
      dom.canvasModeBadge.style.background = '#e0f2fe';
      dom.canvasModeBadge.style.color = '#0284c7';
      dom.freehandCanvas.style.pointerEvents = 'none';
      const char = state.words[state.currentIndex].characters[state.currentCharIndex];
      initHanziWriterQuiz(char);
    } else {
      dom.canvasModeBadge.textContent = 'Mode: Tulis Bebas (Paint)';
      dom.canvasModeBadge.style.background = '#fef3c7';
      dom.canvasModeBadge.style.color = '#b45309';
      dom.freehandCanvas.style.pointerEvents = 'auto';
      destroyHanziWriter();
      updateStatus('Tulis bebas dengan kuas kaligrafi. Gunakan tombol "Cek Bentuk" untuk mencocokkan.', 'normal');
    }
  }

  // --- Sentence Writing (Tulis Kalimat di Lembar Tianzige) Setup ---
  function setupSentenceWriting(word) {
    if (!word || !word.example) return;
    const ex = word.example;

    // Update sentence display
    dom.sentenceTargetZh.textContent = ex.zh;
    dom.sentenceTargetPy.textContent = ex.pinyin;
    dom.sentenceTargetId.textContent = `Arti: ${ex.id}`;

    // Update sentence counter badge
    const totalExamples = (word.examples && word.examples.length) || 1;
    dom.sentenceCounterBadge.textContent = `Kalimat ${state.currentExampleIndex + 1} dari ${totalExamples}`;

    // Reset peek view
    state.isSentencePeekHidden = false;
    dom.sentenceTargetZh.classList.remove('hidden-peek');
    dom.btnTogglePeekSentence.textContent = '👁️ Intip Kalimat';

    // Reset feedback
    dom.sentenceWritingFeedback.style.display = 'none';

    // Render character chips for each character of the sentence
    renderSentenceCharChips(ex.zh);

    // Clear sentence strokes history and redraw Tianzige sheet
    state.sentenceStrokes = [];
    renderSentenceSheetBackground();
  }

  // Render individual character chips of the sentence
  function renderSentenceCharChips(sentenceText) {
    dom.sentenceCharChips.innerHTML = '';
    const chineseChars = Array.from(sentenceText).filter(c => /[\u4e00-\u9fa5]/.test(c));
    chineseChars.forEach((char) => {
      const chip = document.createElement('button');
      chip.className = 'sentence-char-chip';
      chip.textContent = char;
      chip.title = `Klik untuk berlatih stroke '${char}'`;
      chip.addEventListener('click', () => {
        initHanziWriterQuiz(char);
        updateStatus(`Menampilkan panduan goresan untuk karakter '${char}' dari kalimat!`, 'success');
        window.scrollTo({ top: 120, behavior: 'smooth' });
      });
      dom.sentenceCharChips.appendChild(chip);
    });
  }

  // Draw Tianzige background & faint watermark on sentence canvas
  function renderSentenceSheetBackground() {
    if (!sentenceCanvasCtx || !dom.sentenceDrawCanvas) return;
    const canvas = dom.sentenceDrawCanvas;
    const ctx = sentenceCanvasCtx;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle paper white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const word = state.words[state.currentIndex];
    const sentenceZh = (word && word.example && word.example.zh) || '';
    const chars = Array.from(sentenceZh);

    // Grid geometry
    const boxSize = 64;
    const gap = 8;
    const startX = 14;
    const startY = 16;
    const cols = Math.floor((w - startX * 2 + gap) / (boxSize + gap));
    const totalBoxes = Math.max(chars.length, cols * 2);

    for (let i = 0; i < totalBoxes; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (row >= 3) break;

      const bx = startX + col * (boxSize + gap);
      const by = startY + row * (boxSize + gap);
      const char = chars[i] || '';

      // Red Tianzige outer box
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, boxSize, boxSize);

      // Dashed crosshairs (Tian-Zi Ge: +)
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = 1;

      // Horizontal dashed line
      ctx.beginPath();
      ctx.moveTo(bx, by + boxSize / 2);
      ctx.lineTo(bx + boxSize, by + boxSize / 2);
      ctx.stroke();

      // Vertical dashed line
      ctx.beginPath();
      ctx.moveTo(bx + boxSize / 2, by);
      ctx.lineTo(bx + boxSize / 2, by + boxSize);
      ctx.stroke();

      ctx.restore();

      // Watermark faint character (if enabled and char is present)
      if (state.sentenceWatermarkVisible && char) {
        ctx.save();
        ctx.font = "38px 'KaiTi', 'STKaiti', 'PingFang SC', serif";
        ctx.fillStyle = 'rgba(148, 163, 184, 0.38)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, bx + boxSize / 2, by + boxSize / 2 + 2);
        ctx.restore();
      }
    }

    // Redraw user committed strokes
    state.sentenceStrokes.forEach(stroke => {
      if (!stroke.points || stroke.points.length === 0) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let j = 1; j < stroke.points.length; j++) {
        ctx.lineTo(stroke.points[j].x, stroke.points[j].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  // --- Sentence Drawing Listeners ---
  function initSentenceDrawingListeners() {
    const canvas = dom.sentenceDrawCanvas;
    if (!canvas) return;

    const getSentenceCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
      return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height
      };
    };

    const startSentenceDraw = (e) => {
      e.preventDefault();
      state.sentenceIsDrawing = true;
      const pos = getSentenceCanvasPos(e);
      state.currentSentenceStroke = {
        points: [pos],
        color: state.sentenceBrushColor,
        size: state.sentenceBrushSize
      };

      // Draw initial dot
      if (sentenceCanvasCtx) {
        sentenceCanvasCtx.save();
        sentenceCanvasCtx.beginPath();
        sentenceCanvasCtx.arc(pos.x, pos.y, state.sentenceBrushSize / 2, 0, Math.PI * 2);
        sentenceCanvasCtx.fillStyle = state.sentenceBrushColor;
        sentenceCanvasCtx.fill();
        sentenceCanvasCtx.restore();
      }
    };

    const moveSentenceDraw = (e) => {
      if (!state.sentenceIsDrawing || !state.currentSentenceStroke) return;
      e.preventDefault();
      const pos = getSentenceCanvasPos(e);
      const lastPos = state.currentSentenceStroke.points[state.currentSentenceStroke.points.length - 1];
      state.currentSentenceStroke.points.push(pos);

      if (sentenceCanvasCtx && lastPos) {
        sentenceCanvasCtx.save();
        sentenceCanvasCtx.beginPath();
        sentenceCanvasCtx.moveTo(lastPos.x, lastPos.y);
        sentenceCanvasCtx.lineTo(pos.x, pos.y);
        sentenceCanvasCtx.strokeStyle = state.sentenceBrushColor;
        sentenceCanvasCtx.lineWidth = state.sentenceBrushSize;
        sentenceCanvasCtx.lineCap = 'round';
        sentenceCanvasCtx.lineJoin = 'round';
        sentenceCanvasCtx.stroke();
        sentenceCanvasCtx.restore();
      }
    };

    const stopSentenceDraw = (e) => {
      if (!state.sentenceIsDrawing) return;
      state.sentenceIsDrawing = false;
      if (state.currentSentenceStroke && state.currentSentenceStroke.points.length > 0) {
        state.sentenceStrokes.push(state.currentSentenceStroke);
        state.currentSentenceStroke = null;
      }
    };

    canvas.addEventListener('pointerdown', startSentenceDraw);
    canvas.addEventListener('pointermove', moveSentenceDraw);
    canvas.addEventListener('pointerup', stopSentenceDraw);
    canvas.addEventListener('pointercancel', stopSentenceDraw);
    canvas.addEventListener('pointerleave', stopSentenceDraw);
  }

  // --- Sentence Scramble Setup (Susun Kata) ---
  function setupSentenceScramble(word) {
    const ex = word.example;
    state.scramblePlacedIndices = [];
    state.scrambleUserOrder = [];

    // Shuffle words
    const originalWords = [...ex.words];
    const indexedWords = originalWords.map((w, idx) => ({ word: w, originalIndex: idx }));
    // Fisher-Yates shuffle
    for (let i = indexedWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedWords[i], indexedWords[j]] = [indexedWords[j], indexedWords[i]];
    }
    state.scrambleShuffledWords = indexedWords;

    // Reset Dropzone & Pool
    dom.sentenceDropzone.innerHTML = '<span class="dropzone-placeholder" id="dropzone-hint">Klik kata di bawah untuk meletakkannya di sini...</span>';
    dom.scrambleResultBox.classList.remove('show');
    renderScramblePool();
  }

  function renderScramblePool() {
    dom.scrambleTilesPool.innerHTML = '';
    state.scrambleShuffledWords.forEach((item, poolIdx) => {
      const tile = document.createElement('div');
      tile.className = `word-tile ${state.scramblePlacedIndices.includes(poolIdx) ? 'placed' : ''}`;
      tile.textContent = item.word;
      tile.addEventListener('click', () => {
        if (!state.scramblePlacedIndices.includes(poolIdx)) {
          placeTileInSentence(item, poolIdx);
        }
      });
      dom.scrambleTilesPool.appendChild(tile);
    });
  }

  function placeTileInSentence(item, poolIdx) {
    state.scramblePlacedIndices.push(poolIdx);
    state.scrambleUserOrder.push({ item, poolIdx });

    // Hide placeholder
    const hint = dom.sentenceDropzone.querySelector('.dropzone-placeholder');
    if (hint) hint.remove();

    // Create placed tile
    const placedTile = document.createElement('div');
    placedTile.className = 'word-tile in-sentence';
    placedTile.textContent = item.word;
    placedTile.title = 'Klik untuk mengembalikan ke bawah';
    placedTile.addEventListener('click', () => {
      removeTileFromSentence(item, poolIdx, placedTile);
    });
    dom.sentenceDropzone.appendChild(placedTile);

    renderScramblePool();
  }

  function removeTileFromSentence(item, poolIdx, placedTileElement) {
    placedTileElement.remove();
    state.scramblePlacedIndices = state.scramblePlacedIndices.filter(i => i !== poolIdx);
    state.scrambleUserOrder = state.scrambleUserOrder.filter(u => u.poolIdx !== poolIdx);

    if (state.scrambleUserOrder.length === 0) {
      dom.sentenceDropzone.innerHTML = '<span class="dropzone-placeholder" id="dropzone-hint">Klik kata di bawah untuk meletakkannya di sini...</span>';
    }
    renderScramblePool();
  }

  function checkSentenceOrder() {
    const word = state.words[state.currentIndex];
    const targetSentence = word.example.words.join('');
    const userSentence = state.scrambleUserOrder.map(u => u.item.word).join('');

    if (userSentence === targetSentence) {
      AudioEffects.playCompleteWord();
      Confetti.fire();
      dom.resSentenceZh.textContent = word.example.zh;
      dom.resSentencePinyin.textContent = word.example.pinyin;
      dom.resSentenceMeaning.textContent = `Arti: ${word.example.id}`;
      dom.scrambleResultBox.classList.add('show');
      speakChinese(word.example.zh);
    } else {
      AudioEffects.playMistake();
      alert('Urutan kalimat belum tepat. Perhatikan subjek, keterangan waktu, dan predikatnya, lalu coba lagi!');
    }
  }

  // --- Free Writing Setup ---
  function setupFreeWriting(word) {
    dom.freeSentenceInput.value = '';
    dom.badgeWordIncluded.className = 'target-check-badge';
    dom.badgeWordIncluded.textContent = `Status: Belum mengandung kata "${word.hanzi}"`;

    dom.sampleZhText.textContent = word.example.zh;
    dom.samplePyText.textContent = word.example.pinyin;
    dom.sampleIdText.textContent = `Arti: ${word.example.id}`;
    dom.sampleSentenceHintBox.style.display = 'none';
  }

  // --- Freehand Paint Drawing Listeners ---
  function initDrawingListeners() {
    const canvas = dom.freehandCanvas;

    const getCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: ((clientX - rect.left) / rect.width) * 400,
        y: ((clientY - rect.top) / rect.height) * 400
      };
    };

    const startDraw = (e) => {
      if (state.mode !== 'freehand') return;
      e.preventDefault();
      state.isDrawing = true;
      const pos = getCanvasPos(e);
      state.lastX = pos.x;
      state.lastY = pos.y;
      canvasCtx.beginPath();
      canvasCtx.arc(pos.x, pos.y, state.brushSize / 2, 0, Math.PI * 2);
      canvasCtx.fillStyle = '#0f172a';
      canvasCtx.fill();
    };

    const drawMove = (e) => {
      if (!state.isDrawing || state.mode !== 'freehand') return;
      e.preventDefault();
      const pos = getCanvasPos(e);

      canvasCtx.beginPath();
      canvasCtx.moveTo(state.lastX, state.lastY);
      canvasCtx.lineTo(pos.x, pos.y);
      canvasCtx.strokeStyle = '#0f172a';
      canvasCtx.lineWidth = state.brushSize;
      canvasCtx.stroke();

      state.lastX = pos.x;
      state.lastY = pos.y;
    };

    const stopDraw = (e) => {
      if (!state.isDrawing) return;
      state.isDrawing = false;
      saveCanvasState();
    };

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', drawMove);
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);
    canvas.addEventListener('pointerleave', stopDraw);
  }

  // --- Visual Shape Verification in Freehand Mode ---
  function checkFreehandShape() {
    const char = state.words[state.currentIndex].characters[state.currentCharIndex];
    // Briefly flash the character watermark with high contrast for self-checking
    dom.watermarkOverlay.classList.remove('hidden');
    dom.watermarkOverlay.style.color = 'rgba(239, 68, 68, 0.45)'; // Semi-transparent red overlay
    updateStatus(`Perhatikan garis merah bayangan '${char}' untuk membandingkan bentuk goresanmu!`, 'normal');

    setTimeout(() => {
      dom.watermarkOverlay.style.color = 'rgba(200, 200, 200, 0.22)';
      if (!state.isWatermarkVisible) {
        dom.watermarkOverlay.classList.add('hidden');
      }
    }, 3500);
  }

  // --- Render 600 Vocab Modal ---
  function renderVocabModalList(filter = '') {
    const container = dom.vocabListContainer;
    container.innerHTML = '';
    const query = filter.toLowerCase().trim();

    const filtered = state.words.filter(w => {
      if (!query) return true;
      return (
        w.hanzi.includes(query) ||
        w.pinyin.toLowerCase().includes(query) ||
        w.english.toLowerCase().includes(query) ||
        (w.indonesian && w.indonesian.toLowerCase().includes(query)) ||
        w.id.toString() === query
      );
    });

    filtered.slice(0, 150).forEach(w => {
      const card = document.createElement('div');
      card.className = 'vocab-item-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="v-hanzi">${w.hanzi}</span>
          <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">#${w.id}</span>
        </div>
        <div class="v-pinyin">${w.pinyin}</div>
        <div class="v-meaning">${w.indonesian || w.english}</div>
      `;
      card.addEventListener('click', () => {
        dom.vocabModal.classList.remove('open');
        loadWord(w.id - 1);
      });
      container.appendChild(card);
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding:20px; color:#94a3b8; text-align:center;">Kosakata tidak ditemukan.</div>';
    }
  }

  // --- Bind Event Listeners ---
  function bindEvents() {
    initDrawingListeners();

    // Mode Buttons
    dom.btnModeQuiz.addEventListener('click', () => switchMode('quiz'));
    dom.btnModeFreehand.addEventListener('click', () => switchMode('freehand'));

    // Grid selector buttons
    dom.gridBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.gridBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGrid(btn.getAttribute('data-grid'));
      });
    });

    // Brush sizes
    dom.brushSizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.brushSizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.brushSize = parseInt(btn.getAttribute('data-size'), 10);
      });
    });

    // Audio button
    dom.btnSpeakVocab.addEventListener('click', () => {
      const word = state.words[state.currentIndex];
      speakChinese(word.hanzi);
    });

    // Canvas tools
    dom.btnClearCanvas.addEventListener('click', () => {
      clearCanvasOnly();
      if (state.mode === 'quiz') {
        const char = state.words[state.currentIndex].characters[state.currentCharIndex];
        initHanziWriterQuiz(char);
      }
    });

    dom.btnUndoStroke.addEventListener('click', () => undoCanvas());

    dom.btnToggleWatermark.addEventListener('click', () => {
      state.isWatermarkVisible = !state.isWatermarkVisible;
      dom.watermarkOverlay.classList.toggle('hidden', !state.isWatermarkVisible);
    });

    dom.btnCheckDrawing.addEventListener('click', () => checkFreehandShape());

    // Reveal answer button
    dom.btnToggleReveal.addEventListener('click', () => {
      state.isAnswerRevealed = !state.isAnswerRevealed;
      const word = state.words[state.currentIndex];
      if (state.isAnswerRevealed) {
        dom.hanziRevealBox.textContent = word.characters[state.currentCharIndex];
        dom.hanziRevealBox.classList.remove('hidden-char');
        dom.btnToggleReveal.textContent = '🙈 Sembunyikan';
      } else {
        dom.hanziRevealBox.textContent = '?';
        dom.hanziRevealBox.classList.add('hidden-char');
        dom.btnToggleReveal.textContent = '👁️ Intip Karakter';
      }
    });

    // Animate stroke order
    dom.btnAnimateStroke.addEventListener('click', () => {
      const char = state.words[state.currentIndex].characters[state.currentCharIndex];
      if (writerInstance && typeof writerInstance.animateCharacter === 'function') {
        writerInstance.animateCharacter();
      } else if (typeof HanziWriter !== 'undefined') {
        destroyHanziWriter();
        writerInstance = HanziWriter.create('hanzi-writer-container', char, {
          width: 380,
          height: 380,
          showOutline: true,
          showCharacter: true
        });
        writerInstance.animateCharacter({
          onComplete: () => {
            if (state.mode === 'quiz') {
              initHanziWriterQuiz(char);
            }
          }
        });
      }
    });

    // Stroke count guidance
    dom.btnStrokeCount.addEventListener('click', () => {
      const char = state.words[state.currentIndex].characters[state.currentCharIndex];
      speakChinese(char);
      dom.watermarkOverlay.classList.remove('hidden');
      setTimeout(() => {
        if (!state.isWatermarkVisible) dom.watermarkOverlay.classList.add('hidden');
      }, 2500);
    });

    // Answer evaluation buttons
    dom.btnMarkCorrect.addEventListener('click', () => {
      const char = state.words[state.currentIndex].characters[state.currentCharIndex];
      onCharacterSuccess(char);
    });

    dom.btnMarkIncorrect.addEventListener('click', () => {
      AudioEffects.playMistake();
      updateStatus('Tidak apa-apa, ayo hapus dan coba tulis ulang!', 'error');
      clearCanvasOnly();
      const char = state.words[state.currentIndex].characters[state.currentCharIndex];
      if (state.mode === 'quiz') initHanziWriterQuiz(char);
    });

    // Sentence writing sheet actions
    if (dom.btnUndoSentenceStroke) {
      dom.btnUndoSentenceStroke.addEventListener('click', () => {
        if (state.sentenceStrokes.length > 0) {
          state.sentenceStrokes.pop();
          renderSentenceSheetBackground();
        }
      });
    }

    if (dom.btnClearSentenceCanvas) {
      dom.btnClearSentenceCanvas.addEventListener('click', () => {
        state.sentenceStrokes = [];
        renderSentenceSheetBackground();
      });
    }

    if (dom.btnToggleSentenceWatermark) {
      dom.btnToggleSentenceWatermark.addEventListener('click', () => {
        state.sentenceWatermarkVisible = !state.sentenceWatermarkVisible;
        dom.btnToggleSentenceWatermark.textContent = state.sentenceWatermarkVisible ? '👻 Bayangan: ON' : '👻 Bayangan: OFF';
        dom.btnToggleSentenceWatermark.classList.toggle('active', state.sentenceWatermarkVisible);
        renderSentenceSheetBackground();
      });
    }

    if (dom.btnTogglePeekSentence) {
      dom.btnTogglePeekSentence.addEventListener('click', () => {
        state.isSentencePeekHidden = !state.isSentencePeekHidden;
        dom.sentenceTargetZh.classList.toggle('hidden-peek', state.isSentencePeekHidden);
        dom.btnTogglePeekSentence.textContent = state.isSentencePeekHidden ? '🙈 Tampilkan' : '👁️ Intip Kalimat';
      });
    }

    if (dom.btnSpeakSentenceTarget) {
      dom.btnSpeakSentenceTarget.addEventListener('click', () => {
        const word = state.words[state.currentIndex];
        if (word && word.example) {
          speakChinese(word.example.zh);
        }
      });
    }

    if (dom.btnFinishSentenceWriting) {
      dom.btnFinishSentenceWriting.addEventListener('click', () => {
        AudioEffects.playCompleteWord();
        Confetti.fire();
        dom.sentenceWritingFeedback.style.display = 'flex';
        dom.sentenceWritingFeedback.className = 'stroke-status-bar success';
        dom.sentenceWritingFeedback.textContent = '🎉 Luar biasa! Latihan menulis kalimat di lembar Tianzige selesai!';
      });
    }

    if (dom.btnNextSentence) {
      dom.btnNextSentence.addEventListener('click', () => {
        const word = state.words[state.currentIndex];
        const total = (word.examples && word.examples.length) || 1;
        state.currentExampleIndex = (state.currentExampleIndex + 1) % total;
        word.example = word.examples[state.currentExampleIndex];
        setupSentenceWriting(word);
        setupSentenceScramble(word);
        setupFreeWriting(word);
        AudioEffects.playTone(660, 0.15, 'sine', 0.12);
      });
    }

    if (dom.sentenceBrushBtns) {
      dom.sentenceBrushBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          dom.sentenceBrushBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.sentenceBrushSize = parseInt(btn.dataset.size, 10);
        });
      });
    }

    if (dom.sentenceColorBtns) {
      dom.sentenceColorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          dom.sentenceColorBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.sentenceBrushColor = btn.dataset.color;
        });
      });
    }

    // Sentence challenge actions
    dom.btnCheckSentence.addEventListener('click', checkSentenceOrder);
    dom.btnResetScramble.addEventListener('click', () => {
      setupSentenceScramble(state.words[state.currentIndex]);
    });
    dom.btnSpeakSentence.addEventListener('click', () => {
      const word = state.words[state.currentIndex];
      speakChinese(word.example.zh);
    });

    // Free writing input listener
    dom.freeSentenceInput.addEventListener('input', (e) => {
      const text = e.target.value.trim();
      const target = state.words[state.currentIndex].hanzi;
      if (text.includes(target)) {
        dom.badgeWordIncluded.className = 'target-check-badge valid';
        dom.badgeWordIncluded.textContent = `✓ Mengandung kata "${target}" (${text.length} karakter)`;
      } else {
        dom.badgeWordIncluded.className = 'target-check-badge';
        dom.badgeWordIncluded.textContent = `Status: Belum mengandung kata "${target}"`;
      }
    });

    dom.btnSpeakFreeSentence.addEventListener('click', () => {
      const text = dom.freeSentenceInput.value.trim();
      if (!text) {
        alert('Silakan tulis kalimat Anda terlebih dahulu!');
        return;
      }
      speakChinese(text);
    });

    dom.btnShowSampleSentence.addEventListener('click', () => {
      const box = dom.sampleSentenceHintBox;
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });

    // Challenge Tab switching (3 tabs: Sentence Write Canvas, Scramble Puzzle, Free Typing)
    if (dom.tabSentenceWrite) {
      dom.tabSentenceWrite.addEventListener('click', () => {
        dom.tabSentenceWrite.classList.add('active');
        dom.tabScramble.classList.remove('active');
        dom.tabFreeWriting.classList.remove('active');
        dom.viewSentenceWrite.style.display = 'block';
        dom.viewScramble.style.display = 'none';
        dom.viewFreeWriting.style.display = 'none';
        renderSentenceSheetBackground();
      });
    }

    dom.tabScramble.addEventListener('click', () => {
      dom.tabScramble.classList.add('active');
      if (dom.tabSentenceWrite) dom.tabSentenceWrite.classList.remove('active');
      dom.tabFreeWriting.classList.remove('active');
      if (dom.viewSentenceWrite) dom.viewSentenceWrite.style.display = 'none';
      dom.viewScramble.style.display = 'block';
      dom.viewFreeWriting.style.display = 'none';
    });

    dom.tabFreeWriting.addEventListener('click', () => {
      dom.tabFreeWriting.classList.add('active');
      if (dom.tabSentenceWrite) dom.tabSentenceWrite.classList.remove('active');
      dom.tabScramble.classList.remove('active');
      if (dom.viewSentenceWrite) dom.viewSentenceWrite.style.display = 'none';
      dom.viewScramble.style.display = 'none';
      dom.viewFreeWriting.style.display = 'block';
    });

    // Nav Pill shortcuts
    dom.pillVocab.addEventListener('click', () => {
      dom.pillVocab.classList.add('active');
      dom.pillChallenge.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    dom.pillChallenge.addEventListener('click', () => {
      dom.pillChallenge.classList.add('active');
      dom.pillVocab.classList.remove('active');
      dom.challengeSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Navigation (Next / Prev / Random)
    dom.btnPrevWord.addEventListener('click', () => {
      if (state.currentIndex > 0) loadWord(state.currentIndex - 1);
    });

    dom.btnNextWord.addEventListener('click', () => {
      if (state.currentIndex < state.words.length - 1) loadWord(state.currentIndex + 1);
    });

    dom.btnJumpChallenge.addEventListener('click', () => {
      dom.challengeSection.scrollIntoView({ behavior: 'smooth' });
      dom.challengeSection.classList.add('highlight');
      setTimeout(() => dom.challengeSection.classList.remove('highlight'), 3000);
    });

    dom.btnRandomWord.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * state.words.length);
      loadWord(randomIndex);
    });

    // Vocab Modal
    dom.btnOpenVocabModal.addEventListener('click', () => {
      dom.vocabModal.classList.add('open');
      dom.vocabSearchInput.value = '';
      renderVocabModalList();
      dom.vocabSearchInput.focus();
    });

    dom.btnCloseModal.addEventListener('click', () => {
      dom.vocabModal.classList.remove('open');
    });

    dom.vocabModal.addEventListener('click', (e) => {
      if (e.target === dom.vocabModal) dom.vocabModal.classList.remove('open');
    });

    dom.vocabSearchInput.addEventListener('input', (e) => {
      renderVocabModalList(e.target.value);
    });

    // Keyboard shortcuts (ArrowLeft / ArrowRight)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') dom.btnPrevWord.click();
      if (e.key === 'ArrowRight') dom.btnNextWord.click();
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
