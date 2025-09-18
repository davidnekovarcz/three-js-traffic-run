# TrafficRun Game - TODO List

## High Priority Issues

### 1. Window Inactive Auto-Pause
**Issue**: Game continues running when browser window/tab becomes inactive
**Location**: `src/main.ts` - Add window visibility change listener
**Implementation**:
- Add `visibilitychange` event listener to detect when window becomes inactive
- Auto-pause game when `document.hidden` is true
- Auto-resume when window becomes active again (if game was running)
- Consider adding a visual indicator that game is paused due to window inactivity

**Code Changes Needed**:
```typescript
// Add to main.ts after existing event listeners
window.addEventListener('visibilitychange', () => {
  if (document.hidden && !paused && !gameOver) {
    pauseGame();
  } else if (!document.hidden && paused && !gameOver) {
    resumeGame();
  }
});
```

### 2. Game Over Pause Fix
**Issue**: Cannot pause game using SPACE key when game is over
**Location**: `src/main.ts` lines 286-297 - Keyboard event handler
**Problem**: Current logic only allows pause/resume when `!gameOver`, but should allow pause during game over
**Implementation**:
- Modify keyboard event handler to allow pause during game over
- Add visual feedback when trying to pause during game over
- Consider showing different pause dialog during game over vs normal pause

**Code Changes Needed**:
```typescript
// Modify the keydown event listener in main.ts
window.addEventListener('keydown', event => {
  if (event.key === ' ') {
    event.preventDefault();
    if (gameOver) {
      // Show game over pause dialog or restart prompt
      return;
    }
    if (paused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }
  // ... rest of the handler
});
```

### 3. Proper Game Restart with Timeout Management
**Issue**: Quick game restarts can leave timeouts running, causing inconsistent game state
**Location**: `src/collision.ts` lines 71-80, `src/main.ts` reset function
**Problem**: `setTimeout` calls in collision effects are not tracked or cleared on restart
**Implementation**:
- Create a timeout management system to track all active timeouts
- Clear all timeouts when game resets
- Add timeout cleanup to the `reset()` function
- Consider using `requestAnimationFrame` instead of `setTimeout` where appropriate

**Code Changes Needed**:
```typescript
// Add to main.ts
let activeTimeouts: number[] = [];

function clearAllTimeouts() {
  activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  activeTimeouts = [];
}

function addTimeout(callback: () => void, delay: number): number {
  const timeoutId = setTimeout(() => {
    activeTimeouts = activeTimeouts.filter(id => id !== timeoutId);
    callback();
  }, delay);
  activeTimeouts.push(timeoutId);
  return timeoutId;
}

// Modify reset() function to clear timeouts
function reset(): void {
  clearAllTimeouts();
  // ... existing reset logic
}
```

## Medium Priority Improvements

### 4. Game State Management Refactor
**Issue**: Game state is scattered across multiple variables and functions
**Location**: Throughout `src/main.ts`
**Implementation**:
- Create a centralized game state object
- Implement proper state transitions
- Add state validation and consistency checks

### 5. Audio State Management
**Issue**: Audio state not properly managed during pause/resume/restart
**Location**: `src/audio.ts`, `src/main.ts`
**Implementation**:
- Ensure audio properly stops/starts on all state changes
- Add audio state to game state management
- Handle audio cleanup on game restart

### 6. Error Handling and Recovery
**Issue**: Limited error handling for edge cases
**Location**: Throughout codebase
**Implementation**:
- Add try-catch blocks around critical operations
- Implement graceful degradation for audio failures
- Add recovery mechanisms for corrupted game state

## Low Priority Enhancements

### 7. Performance Optimizations
**Issue**: Potential performance issues with frequent DOM updates
**Location**: `src/ui.ts`, animation loop
**Implementation**:
- Implement requestAnimationFrame throttling
- Optimize DOM queries and updates
- Add performance monitoring

### 8. Code Organization
**Issue**: Some functions are too long and handle multiple responsibilities
**Location**: `src/main.ts` animation function, collision detection
**Implementation**:
- Break down large functions into smaller, focused functions
- Extract game logic into separate modules
- Improve code readability and maintainability

## Testing Requirements

### 9. Game State Testing
**Issue**: No automated testing for game state transitions
**Implementation**:
- Add unit tests for game state management
- Test pause/resume functionality
- Test restart functionality with timeout cleanup
- Test window visibility changes

### 10. Cross-Browser Testing
**Issue**: Game behavior may vary across different browsers
**Implementation**:
- Test on Chrome, Firefox, Safari, Edge
- Verify audio functionality across browsers
- Test touch controls on mobile devices

## Notes

- All changes should maintain backward compatibility
- Consider adding console logging for debugging game state issues
- Test thoroughly after each change to ensure no regressions
- Consider adding a debug mode to help identify state inconsistencies

## Implementation Order

1. **Window Inactive Auto-Pause** - Quick win, improves user experience
2. **Timeout Management** - Critical for game stability
3. **Game Over Pause Fix** - Improves user experience
4. **Game State Management Refactor** - Foundation for other improvements
5. **Audio State Management** - Polish and consistency
6. **Error Handling** - Robustness and reliability
