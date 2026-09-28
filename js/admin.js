/**
 * BULLET MASTER // Developer Access & Real-Time Moderation Dashboard
 * Admin Code: 1412 (Strictly NO hints in UI)
 */

class AdminController {
  constructor() {
    this.adminPasscode = '1412';

    // DOM Elements - Developer Auth
    this.devOptionBtn = document.getElementById('devOptionBtn');
    this.devModal = document.getElementById('devModal');
    this.closeDevModalBtn = document.getElementById('closeDevModalBtn');
    this.devAuthForm = document.getElementById('devAuthForm');
    this.devCodeInput = document.getElementById('devCodeInput');
    this.devAuthError = document.getElementById('devAuthError');
    this.adminBadge = document.getElementById('adminBadge');
    this.logoutAdminBtn = document.getElementById('logoutAdminBtn');

    // DOM Elements - Admin Dashboard
    this.openAdminDashBtn = document.getElementById('openAdminDashBtn');
    this.adminDashboardModal = document.getElementById('adminDashboardModal');
    this.closeAdminDashBtn = document.getElementById('closeAdminDashBtn');
    this.adminExitLockBtn = document.getElementById('adminExitLockBtn');
    this.adminRefreshBtn = document.getElementById('adminRefreshBtn');
    this.adminPurgeAllBtn = document.getElementById('adminPurgeAllBtn');
    this.adminSimulateSpikeBtn = document.getElementById('adminSimulateSpikeBtn');

    // Dashboard Telemetry KPIs
    this.dashTotalArticles = document.getElementById('dashTotalArticles');
    this.dashRedlineCount = document.getElementById('dashRedlineCount');
    this.dashAvgRPM = document.getElementById('dashAvgRPM');
    this.dashDeletedCount = document.getElementById('dashDeletedCount');
    this.adminModerationTableBody = document.getElementById('adminModerationTableBody');
    this.adminAuditLog = document.getElementById('adminAuditLog');

    this.initEventListeners();
    this.checkAdminState();
  }

  initEventListeners() {
    // Open Developer Modal
    if (this.devOptionBtn) {
      this.devOptionBtn.addEventListener('click', () => this.openDevModal());
    }

    // Close Developer Modal
    if (this.closeDevModalBtn) {
      this.closeDevModalBtn.addEventListener('click', () => this.closeDevModal());
    }

    // Dev Form Submit
    if (this.devAuthForm) {
      this.devAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.verifyCode();
      });
    }

    // Open Admin Dashboard
    if (this.openAdminDashBtn) {
      this.openAdminDashBtn.addEventListener('click', () => this.openDashboard());
    }

    // Close Admin Dashboard
    if (this.closeAdminDashBtn) {
      this.closeAdminDashBtn.addEventListener('click', () => this.closeDashboard());
    }

    // Lock & Exit Admin
    if (this.logoutAdminBtn) {
      this.logoutAdminBtn.addEventListener('click', () => this.revokeAdmin());
    }
    if (this.adminExitLockBtn) {
      this.adminExitLockBtn.addEventListener('click', () => this.revokeAdmin());
    }

    // Refresh Dashboard
    if (this.adminRefreshBtn) {
      this.adminRefreshBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.renderDashboard();
        window.showToast('Moderation queue synchronized', 'info');
      });
    }

    // Reset Demo Data
    if (this.adminPurgeAllBtn) {
      this.adminPurgeAllBtn.addEventListener('click', () => {
        if (confirm('Revert all dispatches to original telemetry factory defaults?')) {
          window.bulletStore.resetToDefaults();
          this.renderDashboard();
          if (window.renderFeed) window.renderFeed();
          window.showToast('Database reset to factory defaults', 'warning');
        }
      });
    }

    // Simulate Live Traffic Spike
    if (this.adminSimulateSpikeBtn) {
      this.adminSimulateSpikeBtn.addEventListener('click', () => this.simulateViralSpike());
    }

    // Listen for broadcast sync
    window.addEventListener('bullet_data_updated', () => {
      this.checkAdminState();
      if (!this.adminDashboardModal.classList.contains('hidden')) {
        this.renderDashboard();
      }
    });
  }

  openDevModal() {
    if (window.bulletStore.isAdmin()) {
      this.openDashboard();
      return;
    }
    if (window.soundEngine) window.soundEngine.playClick();
    this.devAuthError.classList.add('hidden');
    this.devCodeInput.value = '';
    this.devModal.classList.remove('hidden');
    setTimeout(() => this.devCodeInput.focus(), 100);
  }

  closeDevModal() {
    this.devModal.classList.add('hidden');
  }

  verifyCode() {
    const entered = this.devCodeInput.value.trim();

    if (entered === this.adminPasscode) {
      // Access Granted
      if (window.soundEngine) window.soundEngine.playSuccess();
      window.bulletStore.setAdmin(true);
      this.closeDevModal();
      this.checkAdminState();
      window.showToast('ADMIN PRIVILEGES GRANTED // FULL MODERATION UNLOCKED', 'success');

      // Refresh feed cards to render delete buttons
      if (window.renderFeed) window.renderFeed();

      // Open Admin Dashboard immediately
      this.openDashboard();
    } else {
      // Access Denied (Strictly No Hints)
      if (window.soundEngine) window.soundEngine.playDenied();
      this.devAuthError.classList.remove('hidden');
      this.devCodeInput.classList.add('border-red-500', 'animate-shake');
      setTimeout(() => {
        this.devCodeInput.classList.remove('animate-shake');
      }, 500);
      this.devCodeInput.select();
    }
  }

  revokeAdmin() {
    if (window.soundEngine) window.soundEngine.playClick();
    window.bulletStore.setAdmin(false);
    this.closeDashboard();
    this.checkAdminState();
    if (window.renderFeed) window.renderFeed();
    window.showToast('Admin session terminated & locked', 'info');
  }

  checkAdminState() {
    const isAdmin = window.bulletStore.isAdmin();
    if (isAdmin) {
      this.adminBadge.classList.remove('hidden');
      this.devOptionBtn.classList.add('border-amber-400', 'text-amber-400', 'bg-amber-400/10');
      this.devOptionBtn.innerHTML = '<i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i><span class="hidden lg:inline text-emerald-400">ADMIN ACTIVE</span>';
    } else {
      this.adminBadge.classList.add('hidden');
      this.devOptionBtn.classList.remove('border-amber-400', 'text-amber-400', 'bg-amber-400/10');
      this.devOptionBtn.innerHTML = '<i data-lucide="terminal" class="w-4 h-4 text-amber-400"></i><span class="hidden lg:inline">DEVELOPER</span>';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  openDashboard() {
    if (!window.bulletStore.isAdmin()) {
      this.openDevModal();
      return;
    }
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderDashboard();
    this.adminDashboardModal.classList.remove('hidden');
  }

  closeDashboard() {
    this.adminDashboardModal.classList.add('hidden');
  }

  renderDashboard() {
    const articles = window.bulletStore.getAllArticles();
    const deletedCount = window.bulletStore.getDeletedCount();

    // 1. Calculate KPIs
    const totalCount = articles.length;
    const redlineCount = articles.filter(a => a.rpm >= 8000).length;
    const avgRPM = totalCount > 0 
      ? Math.round(articles.reduce((acc, a) => acc + (a.rpm || 0), 0) / totalCount)
      : 0;

    // Update KPI Elements
    if (this.dashTotalArticles) this.dashTotalArticles.textContent = totalCount;
    if (this.dashRedlineCount) this.dashRedlineCount.textContent = redlineCount;
    if (this.dashAvgRPM) this.dashAvgRPM.textContent = `${avgRPM.toLocaleString()} RPM`;
    if (this.dashDeletedCount) this.dashDeletedCount.textContent = deletedCount;

    // 2. Render Moderation Table
    if (this.adminModerationTableBody) {
      if (articles.length === 0) {
        this.adminModerationTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="py-8 text-center text-slate-500 font-mono">
              NO ACTIVE DISPATCHES IN QUEUE
            </td>
          </tr>
        `;
      } else {
        this.adminModerationTableBody.innerHTML = articles.map(article => {
          const isRedline = article.rpm >= 8000;
          return `
            <tr class="hover:bg-cyber-cardBorder/30 transition-colors">
              <td class="py-3 px-4 flex items-center gap-3">
                <img src="${article.imageUrl}" alt="" class="w-10 h-10 rounded-lg object-cover border border-cyber-cardBorder flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80'">
                <div class="max-w-xs truncate">
                  <div class="font-bold text-white truncate">${this.escapeHtml(article.title)}</div>
                  <div class="text-[10px] text-slate-400 truncate">${this.escapeHtml(article.author || 'Anonymous')}</div>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold ${this.getPlatformBadgeClass(article.platform)}">
                  ${article.platform || 'news'}
                </span>
              </td>
              <td class="py-3 px-4 font-gauge font-bold ${isRedline ? 'text-cyber-redline' : 'text-cyber-cyan'}">
                ${(article.rpm || 0).toLocaleString()} RPM
              </td>
              <td class="py-3 px-4">
                <span class="text-[10px] px-2 py-0.5 rounded font-display font-bold uppercase" style="color: ${article.bulletColor || '#00f2fe'}; background-color: ${article.bulletColor ? article.bulletColor + '15' : 'rgba(0,242,254,0.1)'}">
                  ${article.bulletClass || 'STANDBY'}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-400 text-[11px]">
                ${this.formatTime(article.timestamp)}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button onclick="window.adminController.inspectInGauge('${article.id}')" 
                    title="Load into Cockpit Tachometer" 
                    class="p-1.5 rounded-lg bg-cyber-black hover:bg-cyber-cyan/20 border border-slate-700 hover:border-cyber-cyan text-cyber-cyan transition-all">
                    <i data-lucide="gauge" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="window.adminController.deleteArticleFromDash('${article.id}')" 
                    title="Admin Purge Article" 
                    class="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    <span>PURGE</span>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 3. Render Audit Log
    if (this.adminAuditLog) {
      const logs = window.bulletStore.getAuditLogs();
      if (logs.length === 0) {
        this.adminAuditLog.innerHTML = '<div class="text-slate-600">No events logged yet.</div>';
      } else {
        this.adminAuditLog.innerHTML = logs.map(log => `
          <div class="flex items-start justify-between gap-2 border-b border-cyber-cardBorder/40 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-cyber-cyan font-bold">[${log.action}]</span>
              <span class="text-slate-300">${this.escapeHtml(log.details)}</span>
            </div>
            <span class="text-[10px] text-slate-500 whitespace-nowrap">${log.time}</span>
          </div>
        `).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  deleteArticleFromDash(id) {
    if (confirm('ADMIN VERIFICATION: Are you sure you want to permanently purge this dispatch from the system?')) {
      const success = window.bulletStore.deleteArticle(id);
      if (success) {
        if (window.soundEngine) window.soundEngine.playClick();
        window.showToast('Dispatch purged by administrator', 'warning');
        this.renderDashboard();
        if (window.renderFeed) window.renderFeed();
      }
    }
  }

  inspectInGauge(id) {
    const articles = window.bulletStore.getAllArticles();
    const article = articles.find(a => a.id === id);
    if (!article) return;

    this.closeDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load into input & rev tachometer
    const input = document.getElementById('viralInput');
    if (input) input.value = article.title + '\n\n' + article.content;

    if (window.gauge) {
      window.gauge.setTargetRPM(article.rpm || 6500, true);
    }
    if (window.updateTelemetryHUD) {
      window.updateTelemetryHUD(article);
    }

    window.showToast(`Inspecting: ${article.rpm} RPM Tachometer Rev`, 'info');
  }

  simulateViralSpike() {
    const mockSpikes = [
      {
        title: 'ALERT: Major Telecommunications Underwater Cable Cut in Pacific Ocean',
        content: 'Multiple global internet backbones report 40% packet drops across trans-pacific routes following deep sea seismic event.',
        platform: 'news',
        author: 'Global NetOps Watch',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        rpm: 9780,
        bulletClass: 'RAILGUN KINETIC [REDLINE]',
        bulletColor: '#ff0844',
        sentiment: 'CRITICAL SHOCKWAVE',
        sentimentColor: '#ff0844',
        controversy: 79
      },
      {
        title: 'r/Technology: Anonymous whistleblower drops 50GB verified source code of next-gen AI search index',
        content: 'Engineers confirm internal training prompts and secret ranking weights revealed in massive GitHub leak.',
        platform: 'reddit',
        author: 'u/GhostSignal_01',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        rpm: 9320,
        bulletClass: 'RAILGUN KINETIC [REDLINE]',
        bulletColor: '#ff0844',
        sentiment: 'EUPHORIC HYPER-SURGE',
        sentimentColor: '#00f59b',
        controversy: 89
      }
    ];

    const pick = mockSpikes[Math.floor(Math.random() * mockSpikes.length)];
    const created = window.bulletStore.addArticle(pick);

    if (window.soundEngine) window.soundEngine.playRev(created.rpm);
    if (window.gauge) window.gauge.setTargetRPM(created.rpm);
    if (window.updateTelemetryHUD) window.updateTelemetryHUD(created);

    this.renderDashboard();
    if (window.renderFeed) window.renderFeed();
    window.showToast(`⚡ SIMULATED VIRAL SPIKE INJECTED: ${created.rpm} RPM!`, 'error');
  }

  getPlatformBadgeClass(p) {
    switch (p) {
      case 'twitter': return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
      case 'reddit': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'news': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'tiktok': return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  }

  formatTime(ts) {
    if (!ts) return 'Just now';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.adminController = new AdminController();
});
