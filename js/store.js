/**
 * BULLET MASTER // LocalStorage Data Store & Multi-Tab Broadcast Sync
 * Handles persistence, default viral articles, real-time sync, and audit logging.
 */

class BulletStore {
  constructor() {
    this.storageKey = 'bullet_articles_v2';
    this.auditKey = 'bullet_audit_logs_v2';
    this.adminKey = 'bullet_admin_auth';
    this.deletedCountKey = 'bullet_admin_deleted_count';
    
    // BroadcastChannel for cross-tab real-time sync
    this.channel = null;
    try {
      if (window.BroadcastChannel) {
        this.channel = new BroadcastChannel('bullet_master_sync');
        this.channel.onmessage = (event) => this.handleBroadcast(event);
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }

    this.initDefaults();
  }

  handleBroadcast(event) {
    if (!event || !event.data) return;
    const { type, payload } = event.data;
    console.log('[REAL-TIME SYNC] Event received:', type, payload);
    
    // Dispatch custom DOM event so UI re-renders immediately
    window.dispatchEvent(new CustomEvent('bullet_data_updated', { detail: { type, payload } }));
  }

  broadcast(type, payload = {}) {
    if (this.channel) {
      this.channel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }

  initDefaults() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      const defaults = [
        {
          id: 'post_1',
          title: 'BREAKING: Autonomous Space Mining Probe Extracts $800M Pure Platinum Asteroid Core',
          content: 'Deep space telemetry confirms asteroid redirect mission succeeded with autonomous robotic drill extracting ultra-high purity platinum isotopes near Lagrange Point 2.',
          platform: 'news',
          author: 'Global Aerospace Wire',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
          rpm: 9650,
          speedMph: 270,
          bulletClass: 'RAILGUN KINETIC [REDLINE]',
          bulletColor: '#ff0844',
          sentiment: 'EUPHORIC HYPER-SURGE',
          sentimentColor: '#00f59b',
          controversy: 84,
          timestamp: Date.now() - 1000 * 60 * 18, // 18m ago
          pinned: true
        },
        {
          id: 'post_2',
          title: "Elon Musk: 'Switching global servers to neural hive-mind at midnight. The code will think for itself.'",
          content: "Spicy midnight announcement sparks massive chaos on tech Twitter with 3.2M retweets in under an hour. Engineers worldwide debate if this is real or an elaborate test.",
          platform: 'twitter',
          author: '@elonmusk',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          rpm: 9140,
          speedMph: 256,
          bulletClass: 'RAILGUN KINETIC [REDLINE]',
          bulletColor: '#ff0844',
          sentiment: 'HIGH-OCTANE CONTROVERSY',
          sentimentColor: '#ffb703',
          controversy: 92,
          timestamp: Date.now() - 1000 * 60 * 45
        },
        {
          id: 'post_3',
          title: 'r/WallStreetBets trader discovers glitch in broker API that caused multi-billion liquidation ripple',
          content: 'A retail trader on Reddit spotted an undocumented pricing latency loop that triggered a cascading stop-loss chain reaction across 4 market makers.',
          platform: 'reddit',
          author: 'u/DiamondApex_07',
          imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
          rpm: 7850,
          speedMph: 220,
          bulletClass: 'ARMOR PIERCING',
          bulletColor: '#ff6a00',
          sentiment: 'CRITICAL SHOCKWAVE',
          sentimentColor: '#ff0844',
          controversy: 88,
          timestamp: Date.now() - 1000 * 60 * 120
        },
        {
          id: 'post_4',
          title: 'Leaked 2-Nanometer Quantum Photonic Chip Architecture Outperforms Traditional Superclusters',
          content: 'Schematics leaked on an engineering discord channel show revolutionary room-temperature lightwave interconnects that slash power draw by 94%.',
          platform: 'news',
          author: 'Silicon Underground',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          rpm: 6920,
          speedMph: 194,
          bulletClass: 'ARMOR PIERCING',
          bulletColor: '#ff6a00',
          sentiment: 'EUPHORIC HYPER-SURGE',
          sentimentColor: '#00f59b',
          controversy: 42,
          timestamp: Date.now() - 1000 * 60 * 240
        },
        {
          id: 'post_5',
          title: 'Viral Video: Hidden subterranean cyberpunk arcade discovered under historic subway station',
          content: 'Over 28 million views on TikTok as urban explorers uncover a fully powered, neon-drenched retro-futuristic lounge preserved behind an emergency hatch.',
          platform: 'tiktok',
          author: '@subway_runner',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
          rpm: 4950,
          speedMph: 138,
          bulletClass: 'HOLLOW POINT',
          bulletColor: '#ffb703',
          sentiment: 'POSITIVE BUZZ',
          sentimentColor: '#00f59b',
          controversy: 35,
          timestamp: Date.now() - 1000 * 60 * 360
        }
      ];

      localStorage.setItem(this.storageKey, JSON.stringify(defaults));
      this.logAudit('SYSTEM_INIT', 'Default viral telemetry dispatches loaded into system memory.');
    }
  }

  getAllArticles() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading articles', e);
      return [];
    }
  }

  saveArticles(articles) {
    localStorage.setItem(this.storageKey, JSON.stringify(articles));
  }

  addArticle(article) {
    const articles = this.getAllArticles();
    const newArticle = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      ...article
    };

    articles.unshift(newArticle);
    this.saveArticles(articles);
    this.logAudit('DISPATCH_PUBLISHED', `New post: "${newArticle.title.substring(0, 36)}..." (${newArticle.rpm} RPM)`);
    this.broadcast('ARTICLE_ADDED', newArticle);
    return newArticle;
  }

  deleteArticle(id) {
    const articles = this.getAllArticles();
    const target = articles.find(a => a.id === id);
    if (!target) return false;

    const filtered = articles.filter(a => a.id !== id);
    this.saveArticles(filtered);

    // Track total deleted count for admin dashboard
    const currentDel = parseInt(localStorage.getItem(this.deletedCountKey) || '0', 10);
    localStorage.setItem(this.deletedCountKey, (currentDel + 1).toString());

    this.logAudit('ADMIN_DELETE', `Purged article: "${target.title.substring(0, 36)}..." [ID: ${id}]`);
    this.broadcast('ARTICLE_DELETED', { id, title: target.title });
    return true;
  }

  getDeletedCount() {
    return parseInt(localStorage.getItem(this.deletedCountKey) || '0', 10);
  }

  resetToDefaults() {
    localStorage.removeItem(this.storageKey);
    this.initDefaults();
    this.logAudit('ADMIN_RESET', 'Demo database restored to default factory telemetry state.');
    this.broadcast('DATABASE_RESET');
  }

  // AUDIT LOGS
  logAudit(action, details) {
    try {
      const logs = this.getAuditLogs();
      const newLog = {
        id: 'log_' + Date.now(),
        action,
        details,
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now()
      };
      logs.unshift(newLog);
      // Keep last 40 logs
      if (logs.length > 40) logs.pop();
      localStorage.setItem(this.auditKey, JSON.stringify(logs));
      this.broadcast('AUDIT_LOG_ADDED', newLog);
    } catch (e) {}
  }

  getAuditLogs() {
    try {
      const data = localStorage.getItem(this.auditKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // ADMIN STATE
  isAdmin() {
    return localStorage.getItem(this.adminKey) === 'true';
  }

  setAdmin(status) {
    if (status) {
      localStorage.setItem(this.adminKey, 'true');
      this.logAudit('AUTH_GRANTED', 'Admin privileges granted via Developer Terminal code verification.');
    } else {
      localStorage.removeItem(this.adminKey);
      this.logAudit('AUTH_REVOKED', 'Admin terminal session closed and locked.');
    }
    this.broadcast('ADMIN_STATE_CHANGED', { isAdmin: status });
  }
}

window.bulletStore = new BulletStore();
