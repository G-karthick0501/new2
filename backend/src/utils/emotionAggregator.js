// backend/src/utils/emotionAggregator.js
/**
 * Simple Emotion Aggregator
 * Converts raw emotion snapshots into summary statistics
 */

class EmotionAggregator {
  
  /**
   * Main function: Process emotion history into summary
   */
  static aggregate(emotionHistory) {
    if (!emotionHistory || emotionHistory.length === 0) {
      return null;
    }

    // Get top 3 emotions
    const emotionCounts = {};
    emotionHistory.forEach(record => {
      const emotion = record.dominant_emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Calculate average percentages for each emotion
    const emotionTotals = {
      happy: 0, sad: 0, angry: 0, fear: 0, 
      neutral: 0, surprise: 0, disgust: 0
    };

    emotionHistory.forEach(record => {
      const emotions = record.all_emotions || {};
      Object.keys(emotionTotals).forEach(emotion => {
        emotionTotals[emotion] += emotions[emotion] || 0;
      });
    });

    const distribution = {};
    Object.keys(emotionTotals).forEach(emotion => {
      distribution[emotion] = parseFloat((emotionTotals[emotion] / emotionHistory.length).toFixed(2));
    });

    // Calculate nervousness score (0-10)
    const nervousness = parseFloat((
      (distribution.fear * 0.5) + 
      (distribution.sad * 0.3) + 
      (distribution.angry * 0.2)
    ).toFixed(2));

    return {
      dominantEmotions,           // ["neutral", "fear", "happy"]
      emotionDistribution: distribution,  // {neutral: 45.2, fear: 28.1, ...}
      nervousnessScore: nervousness,      // 6.8
      totalFrames: emotionHistory.length  // 104
    };
  }
}

module.exports = EmotionAggregator;