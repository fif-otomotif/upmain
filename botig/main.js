const { IgApiClient } = require('instagram-private-api');
const { sample } = require('lodash');

const ig = new IgApiClient();
const username = 'not_full_speed';
const password = 'icikiwir1';

const emojis = ['😂', '🔥', '🎉', '💯', '😍', '👍', '🙏', '😎', '🤯', '🙌', '🥳', '💪', '🎶', '🙄', '🩲'];
const targetUser = 'xyzbl_hnz';

(async () => {
    try {
        ig.state.generateDevice(username);
        await ig.account.login(username, password);
        console.log("✅ Login berhasil!");

        const inboxFeed = ig.feed.directInbox();
        const threads = await inboxFeed.items();

        for (let thread of threads) {
            const user = thread.users[0].username;
            const threadId = thread.thread_id;

            let emoji = (user === targetUser) ? '❤️' : sample(emojis);

            await ig.entity.directThread(threadId).broadcastText(emoji);

            console.log(`✅ Mengirim emoji ke @${user}: ${emoji}`);
        }
    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error);
    }
})();