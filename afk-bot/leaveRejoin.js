// Safe Anti-AFK helper (Zero voluntary disconnects, zero duplicate bot instances)
function setupLeaveRejoin(bot, createBot) {
    let jumpInterval = null;
    let lookInterval = null;

    bot.once('spawn', () => {
        // Subtle arm swing and look every 15 seconds to prevent server AFK kick
        lookInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            try {
                const yaw = (Math.random() * Math.PI * 2) - Math.PI;
                const pitch = (Math.random() * 0.4) - 0.2;
                bot.look(yaw, pitch, true);
                bot.swingArm('right');
            } catch (e) {}
        }, 15000);

        // Gentle jump every 45-90 seconds
        jumpInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            try {
                bot.setControlState('jump', true);
                setTimeout(() => {
                    if (bot) bot.setControlState('jump', false);
                }, 300);
            } catch (e) {}
        }, 45000 + Math.floor(Math.random() * 45000));
    });

    function cleanup() {
        if (lookInterval) clearInterval(lookInterval);
        if (jumpInterval) clearInterval(jumpInterval);
        lookInterval = null;
        jumpInterval = null;
    }

    bot.on('end', cleanup);
    bot.on('kicked', cleanup);
    bot.on('error', cleanup);
}

module.exports = setupLeaveRejoin;
