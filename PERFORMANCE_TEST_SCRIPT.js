/**
 * Performance Test Helper Script
 * To use: Copy-paste into Chrome DevTools Console on the dashboard map
 */

(function() {
  const metrics = {
    startTime: null,
    frameCount: 0,
    frameTimes: [],
    lastFrameTime: performance.now(),
    memorySnapshots: [],
    testStartMemory: 0,
  };

  // Simple FPS counter
  function updateMetrics() {
    const now = performance.now();
    const frameTime = now - metrics.lastFrameTime;
    
    metrics.frameTimes.push(frameTime);
    metrics.frameCount++;
    metrics.lastFrameTime = now;

    // Keep only last 300 frames (~5 seconds at 60fps)
    if (metrics.frameTimes.length > 300) {
      metrics.frameTimes.shift();
    }
  }

  // Calculate statistics
  function getStats() {
    if (metrics.frameTimes.length === 0) return null;

    const times = metrics.frameTimes;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const max = Math.max(...times);
    const min = Math.min(...times);
    const fps = Math.round(1000 / avg);
    const droppedFrames = times.filter(t => t > 16.67).length;

    return {
      fps,
      avgFrameTime: avg.toFixed(2),
      minFrameTime: min.toFixed(2),
      maxFrameTime: max.toFixed(2),
      p95FrameTime: p95.toFixed(2),
      p99FrameTime: p99.toFixed(2),
      droppedFrames,
      droppedFramesPercent: ((droppedFrames / times.length) * 100).toFixed(1),
    };
  }

  // Memory snapshot
  function captureMemory() {
    if (performance.memory) {
      metrics.memorySnapshots.push({
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize / 1048576, // MB
        totalJSHeapSize: performance.memory.totalJSHeapSize / 1048576, // MB
      });
    }
  }

  // Start monitoring
  window.startPerformanceTest = function() {
    console.log('🚀 Performance test started. Will auto-log stats every 5 seconds.');
    metrics.startTime = performance.now();
    metrics.testStartMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Store RAF loop for stats
    const originalRAF = window.requestAnimationFrame;
    let rafCount = 0;
    
    window.requestAnimationFrame = function(cb) {
      updateMetrics();
      rafCount++;
      if (rafCount % 300 === 0) { // Every 5s at 60fps
        captureMemory();
        const stats = getStats();
        if (stats) {
          console.table(stats);
        }
      }
      return originalRAF(cb);
    };
  };

  // Stop and report
  window.stopPerformanceTest = function() {
    const duration = ((performance.now() - metrics.startTime) / 1000).toFixed(1);
    const stats = getStats();
    const memStart = metrics.memorySnapshots[0];
    const memEnd = metrics.memorySnapshots[metrics.memorySnapshots.length - 1];
    
    console.log('\n📊 PERFORMANCE TEST RESULTS\n');
    console.log(`Test Duration: ${duration}s`);
    console.log(`Total Frames: ${metrics.frameCount}`);
    console.table(stats);
    
    if (memStart && memEnd) {
      const memGrowth = memEnd.usedJSHeapSize - memStart.usedJSHeapSize;
      console.log('\n💾 MEMORY METRICS\n');
      console.log(`Start Memory: ${memStart.usedJSHeapSize.toFixed(1)} MB`);
      console.log(`End Memory: ${memEnd.usedJSHeapSize.toFixed(1)} MB`);
      console.log(`Memory Growth: ${memGrowth.toFixed(1)} MB`);
    }
  };

  console.log('✅ Performance test helpers loaded!');
  console.log('Usage:');
  console.log('  window.startPerformanceTest() - Begin monitoring');
  console.log('  window.stopPerformanceTest()  - End test and show results');
})();
