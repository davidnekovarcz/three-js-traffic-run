// Simple test script to run with Node.js
import { TrafficRunGame } from './src/core/Game.js';

console.log('Testing game initialization...');

try {
    const game = new TrafficRunGame();
    console.log('✓ Game instance created');
    
    // We can't test full init without browser environment
    console.log('✓ Basic test passed');
} catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
}