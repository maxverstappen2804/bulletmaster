/**
 * BULLET MASTER // Main Application Controller
 * Handles UI interactions, Feed rendering, Post creation with images,
 * Tachometer synchronization, and Toast notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Tachometer Gauge
  window.gauge = new TachometerGauge('tachometerCanvas');

  // DOM Elements
  const viralInput = document.getElementById('viralInput');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const revGaugeBtn = document.getElementById('revGaugeBtn');
  const publishInputBtn = document.getElementById('publishInputBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Audio Controls
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  const audioStatusText = document.getElementById('audioStatusText');

  // Throttle Override Buttons
  const revIdleBtn = document.getElementById('revIdleBtn');
  const revMidBtn = document.getElementById('revMidBtn');
  const revRedlineBtn = document.getElementById('revRedlineBtn');

  // Feed Elements
  const newsFeedGrid = document.getElementById('newsFeedGrid');
  const feedEmptyState = document.getElementById('feedEmptyState');
  const feedFilterTabs = document.querySelectorAll('.filter-tab');
  const feedSearchInput = document.getElementById('feedSearchInput');
  const navMaxRPM = document.getElementById('navMaxRPM');
  const navPostCount = document.getElementById('navPostCount');
  const filterCountAll = document.getElementById('filterCountAll');
  const filterCountRedline = document.getElementById('filterCountRedline');

  // Add News Modal Elements
  const addNewsModal = document.getElementById('addNewsModal');
  const openNewPostBtn = document.getElementById('openNewPostBtn');
  const floatingAddBtn = document.getElementById('floatingAddBtn');
  const addNewsQuickBtn = document.getElementById('addNewsQuickBtn');
  const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
  const closeAddNewsModalBtn = document.getElementById('closeAddNewsModalBtn');
  const cancelAddNewsBtn = document.getElementById('cancelAddNewsBtn');
  const addNewsForm = document.getElementById('addNewsForm');
  const articleTitle = document.getElementById('articleTitle');
  const articlePlatform = document.getElementById('articlePlatform');
  const articleAuthor = document.getElementById('articleAuthor');
  const articleContent = document.getElementById('articleContent');
  const articleImageUrl = document.getElementById('articleImageUrl');
  const articleImageFile = document.getElementById('articleImageFile');
  const fileUploadLabel = document.getElementById('fileUploadLabel');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const modalEstimateRPM = document.getElementById('modalEstimateRPM');
  const imgPresetBtns = document.querySelectorAll('.img-preset-btn');

  // State
  let currentFilter = 'all';
  let currentSearchQuery = '';
  let attachedImageDataUrl = '';

  // ================= 1. AUDIO TOGGLE =================
  function updateAudioUI() {
    const isEnabled = window.soundEngine.enabled;
    if (audioIcon) {
      audioIcon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
      audioIcon.className = isEnabled ? 'w-4 h-4 text-cyber-cyan' : 'w-4 h-4 text-slate-500';
    }
    if (audioStatusText) {
      audioStatusText.textContent = isEnabled ? 'SFX: ON' : 'SFX: MUTED';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const state = window.soundEngine.toggle();
      updateAudioUI();
      showToast(state ? 'Sound FX Enabled' : 'Sound FX Muted', 'info');
    });
  }
  updateAudioUI();

  // ================= 2. VIRALITY ANALYSIS & GAUGE REV =================
  window.updateTelemetryHUD = function(analysis) {
    const speedEl = document.getElementById('telemetrySpeed');
    const bulletEl = document.getElementById('telemetryBulletClass');
    const sentEl = document.getElementById('telemetrySentiment');
    const contEl = document.getElementById('telemetryControversy');

    if (speedEl) speedEl.textContent = `${analysis.speedMph || 0} MPH`;
    if (bulletEl) {
      bulletEl.textContent = analysis.bulletClass || 'STANDBY';
      bulletEl.style.color = analysis.bulletColor || '#00f2fe';
    }
    if (sentEl) {
      sentEl.textContent = analysis.sentiment || 'NOMINAL';
      sentEl.style.color = analysis.sentimentColor || '#00f59b';
    }
    if (contEl) contEl.textContent = `${analysis.controversy || 0}%`;
  };

  function performAnalysisAndRev(text) {
    const analysis = window.viralityAnalyzer.analyze(text);
    window.gauge.setTargetRPM(analysis.rpm, true);
    window.updateTelemetryHUD(analysis);

    // Vibration effect if redline
    const canvas = document.getElementById('tachometerCanvas');
    if (canvas) {
      if (analysis.rpm >= 8000) {
        canvas.classList.add('tachometer-redline-vibrate');
        setTimeout(() => canvas.classList.remove('tachometer-redline-vibrate'), 1200);
      } else {
        canvas.classList.remove('tachometer-redline-vibrate');
      }
    }

    return analysis;
  }

  if (revGaugeBtn) {
    revGaugeBtn.addEventListener('click', () => {
      const text = viralInput.value.trim();
      if (!text) {
        showToast('Please paste a headline or post first', 'warning');
        viralInput.focus();
        return;
      }
      performAnalysisAndRev(text);
      showToast('Tachometer gauge revving to dispatch velocity', 'info');
    });
  }

  if (clearInputBtn) {
    clearInputBtn.addEventListener('click', () => {
      viralInput.value = '';
      window.gauge.setTargetRPM(800, false);
      window.updateTelemetryHUD(window.viralityAnalyzer.analyze(''));
    });
  }

  // Quick Preset Buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      if (text) {
        viralInput.value = text;
        performAnalysisAndRev(text);
        showToast('Preset loaded & gauge spun up', 'info');
      }
    });
  });

  // Manual Throttle Overrides
  if (revIdleBtn) {
    revIdleBtn.addEventListener('click', () => {
      window.gauge.setTargetRPM(800, true);
      window.updateTelemetryHUD({ speedMph: 15, bulletClass: 'IDLE SPREAD', bulletColor: '#94a3b8', sentiment: 'CALM', sentimentColor: '#94a3b8', controversy: 5 });
    });
  }
  if (revMidBtn) {
    revMidBtn.addEventListener('click', () => {
      window.gauge.setTargetRPM(5500, true);
      window.updateTelemetryHUD({ speedMph: 154, bulletClass: 'HOLLOW POINT', bulletColor: '#ffb703', sentiment: 'HIGH TRACTION', sentimentColor: '#00f59b', controversy: 48 });
    });
  }
  if (revRedlineBtn) {
    revRedlineBtn.addEventListener('click', () => {
      window.gauge.setTargetRPM(9800, true);
      window.updateTelemetryHUD({ speedMph: 274, bulletClass: 'RAILGUN KINETIC [REDLINE]', bulletColor: '#ff0844', sentiment: 'CRITICAL SHOCKWAVE', sentimentColor: '#ff0844', controversy: 94 });
    });
  }

  // Push to Feed button from Hero
  if (publishInputBtn) {
    publishInputBtn.addEventListener('click', () => {
      const text = viralInput.value.trim();
      openPostModalWithContent(text);
    });
  }

  // ================= 3. ADD NEWS MODAL WITH IMAGE =================
  function openAddModal() {
    if (window.soundEngine) window.soundEngine.playClick();
    addNewsModal.classList.remove('hidden');
    setTimeout(() => articleTitle.focus(), 100);
  }

  function closeAddModal() {
    addNewsModal.classList.add('hidden');
    addNewsForm.reset();
    attachedImageDataUrl = '';
    imagePreviewContainer.classList.add('hidden');
    imagePreview.src = '';
    fileUploadLabel.textContent = 'Upload Local Image';
    modalEstimateRPM.textContent = '--- RPM';
  }

  function openPostModalWithContent(text) {
    openAddModal();
    if (text) {
      // Split into headline & content if long
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        articleTitle.value = lines[0];
        articleContent.value = lines.slice(1).join('\n');
      } else {
        articleTitle.value = text.substring(0, 100);
        articleContent.value = text;
      }
      updateEstimateRPM();
    }
  }

  [openNewPostBtn, floatingAddBtn, addNewsQuickBtn, emptyStateAddBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => openAddModal());
  });

  if (closeAddNewsModalBtn) closeAddNewsModalBtn.addEventListener('click', () => closeAddModal());
  if (cancelAddNewsBtn) cancelAddNewsBtn.addEventListener('click', () => closeAddModal());

  // Real-time Estimate RPM while typing in Modal
  function updateEstimateRPM() {
    const combined = `${articleTitle.value} ${articleContent.value}`;
    if (combined.trim().length > 3) {
      const res = window.viralityAnalyzer.analyze(combined);
      modalEstimateRPM.textContent = `${res.rpm.toLocaleString()} RPM (${res.bulletClass})`;
      modalEstimateRPM.style.color = res.bulletColor;
    } else {
      modalEstimateRPM.textContent = '--- RPM';
      modalEstimateRPM.style.color = '#00f2fe';
    }
  }

  articleTitle.addEventListener('input', updateEstimateRPM);
  articleContent.addEventListener('input', updateEstimateRPM);

  // Image Upload Handling (Local File to Base64 Data URL)
  articleImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file too large (Max 5MB)', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        attachedImageDataUrl = event.target.result;
        imagePreview.src = attachedImageDataUrl;
        imagePreviewContainer.classList.remove('hidden');
        fileUploadLabel.textContent = file.name.substring(0, 18) + '...';
        articleImageUrl.value = ''; // clear url if file uploaded
      };
      reader.readAsDataURL(file);
    }
  });

  // Image URL input live preview
  articleImageUrl.addEventListener('input', () => {
    const url = articleImageUrl.value.trim();
    if (url) {
      attachedImageDataUrl = url;
      imagePreview.src = url;
      imagePreviewContainer.classList.remove('hidden');
      fileUploadLabel.textContent = 'Upload Local Image';
    } else {
      attachedImageDataUrl = '';
      imagePreviewContainer.classList.add('hidden');
    }
  });

  // Remove Image button
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      attachedImageDataUrl = '';
      articleImageUrl.value = '';
      articleImageFile.value = '';
      imagePreview.src = '';
      imagePreviewContainer.classList.add('hidden');
      fileUploadLabel.textContent = 'Upload Local Image';
    });
  }

  // Quick Image Preset buttons
  imgPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-img');
      if (url) {
        articleImageUrl.value = url;
        attachedImageDataUrl = url;
        imagePreview.src = url;
        imagePreviewContainer.classList.remove('hidden');
        fileUploadLabel.textContent = 'Upload Local Image';
      }
    });
  });

  // Form Submit Handler
  addNewsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = articleTitle.value.trim();
    const content = articleContent.value.trim();
    const platform = articlePlatform.value;
    const author = articleAuthor.value.trim() || 'Anonymous Dispatcher';

    if (!title || !content) {
      showToast('Please fill in headline and content', 'warning');
      return;
    }

    // Default image if none provided
    const defaultImages = [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ];
    const finalImage = attachedImageDataUrl || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    // Analyze virality
    const analysis = window.viralityAnalyzer.analyze(`${title} ${content}`);

    // Create article
    const newArticle = window.bulletStore.addArticle({
      title,
      content,
      platform,
      author,
      imageUrl: finalImage,
      rpm: analysis.rpm,
      speedMph: analysis.speedMph,
      bulletClass: analysis.bulletClass,
      bulletColor: analysis.bulletColor,
      sentiment: analysis.sentiment,
      sentimentColor: analysis.sentimentColor,
      controversy: analysis.controversy
    });

    // Rev gauge to new article's RPM
    window.gauge.setTargetRPM(analysis.rpm, true);
    window.updateTelemetryHUD(analysis);

    // Close modal
    closeAddModal();

    // Re-render feed
    renderFeed();

    showToast(`DISPATCH PUBLISHED: Spun to ${analysis.rpm.toLocaleString()} RPM!`, 'success');

    // Smooth scroll to feed
    const feedSection = document.getElementById('feedSection');
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ================= 4. FEED RENDERING & FILTERING =================
  window.renderFeed = function() {
    const articles = window.bulletStore.getAllArticles();
    const isAdmin = window.bulletStore.isAdmin();

    // Update Global Ticker Stats
    const redlineCount = articles.filter(a => a.rpm >= 8000).length;
    const maxRPM = articles.length > 0 ? Math.max(...articles.map(a => a.rpm || 0)) : 0;

    if (navMaxRPM) navMaxRPM.textContent = `${maxRPM.toLocaleString()} RPM`;
    if (navPostCount) navPostCount.textContent = articles.length;
    if (filterCountAll) filterCountAll.textContent = articles.length;
    if (filterCountRedline) filterCountRedline.textContent = redlineCount;

    // Filter Logic
    let filtered = articles;

    if (currentFilter === 'redline') {
      filtered = filtered.filter(a => a.rpm >= 8000);
    } else if (currentFilter !== 'all') {
      filtered = filtered.filter(a => (a.platform || '').toLowerCase() === currentFilter.toLowerCase());
    }

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.title || '').toLowerCase().includes(q) || 
        (a.content || '').toLowerCase().includes(q) || 
        (a.author || '').toLowerCase().includes(q)
      );
    }

    // Render Cards or Empty State
    if (filtered.length === 0) {
      newsFeedGrid.innerHTML = '';
      feedEmptyState.classList.remove('hidden');
    } else {
      feedEmptyState.classList.add('hidden');
      newsFeedGrid.innerHTML = filtered.map(article => {
        const isRedline = (article.rpm || 0) >= 8000;
        return `
          <div class="news-card group relative bg-cyber-card border ${isRedline ? 'border-cyber-redline/60 hover:shadow-neon-red' : 'border-cyber-cardBorder hover:border-cyber-cyan/50 hover:shadow-neon-cyan'} rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between">
            
            <!-- Redline Flame Badge if > 8000 RPM -->
            ${isRedline ? `
              <div class="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-mono font-black border border-red-400 shadow-lg animate-pulse">
                <i data-lucide="flame" class="w-3.5 h-3.5 fill-white"></i>
                <span>REDLINE</span>
              </div>
            ` : ''}

            <!-- Card Image Wrap -->
            <div class="relative card-image-wrap h-52 w-full overflow-hidden bg-cyber-black">
              <img src="${article.imageUrl}" alt="${escapeHtml(article.title)}" 
                class="w-full h-full object-cover" 
                onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'">
              
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-cyber-card via-transparent to-transparent"></div>

              <!-- Platform Badge -->
              <div class="absolute top-3 left-3 z-10">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${getPlatformBadgeClass(article.platform)}">
                  ${article.platform || 'news'}
                </span>
              </div>

              <!-- Live Tachometer RPM Badge on Image -->
              <div class="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-cyber-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyber-cardBorder">
                <i data-lucide="gauge" class="w-4 h-4 ${isRedline ? 'text-cyber-redline' : 'text-cyber-cyan'}"></i>
                <span class="font-gauge text-xs font-bold ${isRedline ? 'text-cyber-redline' : 'text-cyber-cyan'}">
                  ${(article.rpm || 0).toLocaleString()} RPM
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <!-- Author & Time -->
                <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <span class="text-slate-300 font-semibold">${escapeHtml(article.author || 'Anonymous')}</span>
                  <span>${formatTime(article.timestamp)}</span>
                </div>

                <!-- Headline -->
                <h3 class="font-display font-bold text-lg text-white group-hover:text-cyber-cyan transition-colors line-clamp-2 leading-snug">
                  ${escapeHtml(article.title)}
                </h3>

                <!-- Excerpt -->
                <p class="text-xs text-slate-400 font-sans mt-2 line-clamp-3 leading-relaxed">
                  ${escapeHtml(article.content)}
                </p>
              </div>

              <!-- Telemetry Pills Footer -->
              <div class="space-y-3 pt-3 border-t border-cyber-cardBorder/70">
                <div class="flex items-center justify-between text-xs font-mono">
                  <span class="text-slate-500">IMPACT CLASS:</span>
                  <span class="font-display font-bold uppercase text-[11px]" style="color: ${article.bulletColor || '#00f2fe'}">
                    ${article.bulletClass || 'STANDBY'}
                  </span>
                </div>

                <!-- Action Controls: Rev in Gauge & Admin Delete -->
                <div class="flex items-center gap-2 pt-1">
                  <!-- Rev in Gauge Button -->
                  <button onclick="window.inspectArticle('${article.id}')" 
                    class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyber-dark hover:bg-slate-800 text-slate-200 hover:text-cyber-cyan border border-cyber-cardBorder hover:border-cyber-cyan/50 text-xs font-mono font-bold transition-all">
                    <i data-lucide="gauge" class="w-3.5 h-3.5 text-cyber-cyan"></i>
                    <span>INSPECT GAUGE</span>
                  </button>

                  <!-- ADMIN DELETE BUTTON (Granted only when Admin Code 1412 entered) -->
                  ${isAdmin ? `
                    <button onclick="window.adminDeleteArticle('${article.id}')" 
                      title="Admin Purge Dispatch"
                      class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white text-xs font-mono font-bold transition-all">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      <span>DELETE</span>
                    </button>
                  ` : ''}
                </div>
              </div>

            </div>

          </div>
        `;
      }).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  };

  // Inspect Article in Main Tachometer Cockpit
  window.inspectArticle = function(id) {
    const articles = window.bulletStore.getAllArticles();
    const article = articles.find(a => a.id === id);
    if (!article) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    viralInput.value = article.title + '\n\n' + article.content;
    window.gauge.setTargetRPM(article.rpm || 6500, true);
    window.updateTelemetryHUD(article);

    showToast(`Synchronized gauge to ${article.rpm.toLocaleString()} RPM`, 'info');
  };

  // Admin Direct Delete from Feed Card
  window.adminDeleteArticle = function(id) {
    if (!window.bulletStore.isAdmin()) return;

    if (confirm('ADMIN PURGE: Delete this dispatch permanently?')) {
      const ok = window.bulletStore.deleteArticle(id);
      if (ok) {
        if (window.soundEngine) window.soundEngine.playClick();
        showToast('Dispatch purged from live feed by Administrator', 'warning');
        renderFeed();
      }
    }
  };

  // Filter Tab Clicks
  feedFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      feedFilterTabs.forEach(t => {
        t.className = 'filter-tab px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyber-dark text-slate-300 hover:text-white border border-cyber-cardBorder transition-all';
      });
      tab.className = 'filter-tab px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyber-cyan text-black border border-cyber-cyan shadow-neon-cyan transition-all';

      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderFeed();
    });
  });

  // Search Input
  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderFeed();
    });
  }

  // ================= 5. TOAST NOTIFICATION UTILITY =================
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    let borderColor = 'border-cyber-cyan';
    let iconName = 'info';
    let textColor = 'text-cyber-cyan';

    if (type === 'success') {
      borderColor = 'border-emerald-500';
      iconName = 'check-circle';
      textColor = 'text-emerald-400';
    } else if (type === 'warning' || type === 'error') {
      borderColor = 'border-cyber-redline';
      iconName = 'alert-triangle';
      textColor = 'text-cyber-redline';
    }

    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-2xl bg-cyber-card/95 backdrop-blur-md border ${borderColor} shadow-2xl text-xs font-mono text-slate-200 pointer-events-auto min-w-[280px] max-w-sm`;
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-4 h-4 ${textColor} flex-shrink-0"></i>
      <span class="flex-1">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  };

  // Helper formatting functions
  function getPlatformBadgeClass(p) {
    switch (p) {
      case 'twitter': return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      case 'reddit': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'news': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'tiktok': return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  }

  function formatTime(ts) {
    if (!ts) return 'Just now';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Initial feed render
  renderFeed();

  // Initial rev on startup to show off the gauge!
  setTimeout(() => {
    const articles = window.bulletStore.getAllArticles();
    if (articles.length > 0) {
      const topArticle = articles[0];
      viralInput.value = topArticle.title;
      window.gauge.setTargetRPM(topArticle.rpm, true);
      window.updateTelemetryHUD(topArticle);
    }
  }, 400);

  // Listen for broadcast sync from other tabs
  window.addEventListener('bullet_data_updated', () => {
    renderFeed();
  });
});
