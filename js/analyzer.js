/**
 * BULLET MASTER // Virality & Kinetic Text Analyzer
 * Computes Tachometer RPM, Bullet Impact Class, Spread Velocity, and Sentiment
 */

class ViralityAnalyzer {
  constructor() {
    this.highImpactWords = [
      'breaking', 'urgent', 'leaked', 'secret', 'nuclear', 'glitch', 'shocking', 'uncovered',
      'whistleblower', 'elon', 'musk', 'trump', 'biden', 'agi', 'openai', 'nvidia', 'crypto',
      'bitcoin', 'crash', 'skyrocket', 'massive', 'ban', 'banned', 'lawsuit', 'arrested',
      'exposed', 'insane', 'apocalypse', 'revolution', 'ai', 'cancelled', 'died', 'fired',
      'billions', 'trillions', 'war', 'surrender', 'holy shit', 'omg', 'wtf', 'darknet'
    ];

    this.moderateImpactWords = [
      'new', 'update', 'official', 'announced', 'release', 'launch', 'record', 'huge',
      'game', 'movie', 'viral', 'trend', 'meta', 'apple', 'google', 'tesla', 'market',
      'future', 'warning', 'emergency', 'hacked', 'investigation', 'scandal'
    ];

    this.sentimentPositiveWords = [
      'skyrocket', 'win', 'breakthrough', 'record', 'cure', 'best', 'legend', 'profit', 'surged', 'unreal', 'holy grail'
    ];

    this.sentimentNegativeWords = [
      'crash', 'crisis', 'lawsuit', 'scam', 'fraud', 'arrest', 'fired', 'ruined', 'dead', 'ban', 'failure', 'collapse'
    ];
  }

  analyze(text) {
    if (!text || text.trim().length === 0) {
      return {
        rpm: 800,
        speedMph: 15,
        bulletClass: 'STANDBY',
        bulletColor: '#64748b',
        sentiment: 'NEUTRAL',
        sentimentColor: '#94a3b8',
        controversy: 0,
        summary: 'Awaiting dispatch telemetry'
      };
    }

    const cleanText = text.trim();
    const lower = cleanText.toLowerCase();
    const words = lower.split(/\s+/);
    const wordCount = words.length;

    let baseScore = 2000;

    // 1. Keyword impact scoring
    let keywordHits = 0;
    this.highImpactWords.forEach(w => {
      if (lower.includes(w)) {
        baseScore += 950;
        keywordHits += 2;
      }
    });

    this.moderateImpactWords.forEach(w => {
      if (lower.includes(w)) {
        baseScore += 450;
        keywordHits += 1;
      }
    });

    // 2. Caps Lock / Urgency ratio
    const upperCount = (cleanText.match(/[A-Z]/g) || []).length;
    const totalLetters = (cleanText.match(/[a-zA-Z]/g) || []).length;
    if (totalLetters > 0) {
      const capsRatio = upperCount / totalLetters;
      if (capsRatio > 0.3) baseScore += 1200;
      else if (capsRatio > 0.15) baseScore += 600;
    }

    // 3. Exclamations and question marks
    const exclamations = (cleanText.match(/!/g) || []).length;
    const questionMarks = (cleanText.match(/\?/g) || []).length;
    baseScore += Math.min(exclamations * 300, 1200);
    baseScore += Math.min(questionMarks * 200, 600);

    // 4. Numbers / Quantified claims (e.g. $4 Billion, 40%, 12 minutes)
    const numbersMatch = (cleanText.match(/\d+(\.\d+)?(%|\$|k|m|b)?/gi) || []).length;
    baseScore += Math.min(numbersMatch * 350, 1400);

    // 5. Word count multiplier (punchy headlines or juicy paragraphs)
    if (wordCount >= 5 && wordCount <= 28) {
      baseScore += 800; // Optimal viral headline sweet spot
    } else if (wordCount > 50) {
      baseScore += 500;
    }

    // 6. Platform hooks (@mentions, r/subreddit, #hashtags)
    if (lower.includes('r/') || lower.includes('@') || lower.includes('#')) {
      baseScore += 500;
    }

    // Dynamic ceiling calculation
    let finalRPM = Math.round(baseScore);
    // Add realistic micro variance based on text hash
    let hash = 0;
    for (let i = 0; i < cleanText.length; i++) {
      hash = (hash << 5) - hash + cleanText.charCodeAt(i);
      hash |= 0;
    }
    const variance = (Math.abs(hash) % 400) - 200;
    finalRPM += variance;

    // Clamp between 1200 and 9950
    finalRPM = Math.max(1200, Math.min(9950, finalRPM));

    // Bullet Impact Classification
    let bulletClass = 'RUBBER BULLET';
    let bulletColor = '#94a3b8';
    if (finalRPM >= 8500) {
      bulletClass = 'RAILGUN KINETIC [REDLINE]';
      bulletColor = '#ff0844';
    } else if (finalRPM >= 6800) {
      bulletClass = 'ARMOR PIERCING';
      bulletColor = '#ff6a00';
    } else if (finalRPM >= 4200) {
      bulletClass = 'HOLLOW POINT';
      bulletColor = '#ffb703';
    } else {
      bulletClass = 'RUBBER BULLET';
      bulletColor = '#00f59b';
    }

    // Spread Velocity (MPH equivalent)
    const speedMph = Math.round((finalRPM / 10000) * 280);

    // Sentiment Calculation
    let posScore = 0;
    let negScore = 0;
    this.sentimentPositiveWords.forEach(w => { if (lower.includes(w)) posScore++; });
    this.sentimentNegativeWords.forEach(w => { if (lower.includes(w)) negScore++; });

    let sentiment = 'NEUTRAL';
    let sentimentColor = '#94a3b8';
    if (posScore > negScore) {
      sentiment = finalRPM > 7000 ? 'EUPHORIC HYPER-SURGE' : 'POSITIVE BUZZ';
      sentimentColor = '#00f59b';
    } else if (negScore > posScore) {
      sentiment = finalRPM > 7000 ? 'CRITICAL SHOCKWAVE' : 'NEGATIVE VOLATILITY';
      sentimentColor = '#ff0844';
    } else if (finalRPM > 7500) {
      sentiment = 'HIGH-OCTANE CONTROVERSY';
      sentimentColor = '#ffb703';
    }

    // Controversy percentage
    const controversy = Math.min(98, Math.round(((keywordHits * 12) + (exclamations * 8) + (finalRPM / 180))));

    return {
      rpm: finalRPM,
      speedMph,
      bulletClass,
      bulletColor,
      sentiment,
      sentimentColor,
      controversy,
      isRedline: finalRPM >= 8000
    };
  }
}

window.viralityAnalyzer = new ViralityAnalyzer();
