/**
 * Slack channel adapter (v2) — uses Chat SDK bridge.
 * Self-registers on import.
 */
import { createSlackAdapter } from '@chat-adapter/slack';

import { readEnvFile } from '../env.js';
import { createChatSdkBridge } from './chat-sdk-bridge.js';
import { registerChannelAdapter } from './channel-registry.js';

registerChannelAdapter('slack', {
  factory: () => {
    const env = readEnvFile(['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET']);
    if (!env.SLACK_BOT_TOKEN) return null;
    const slackAdapter = createSlackAdapter({
      botToken: env.SLACK_BOT_TOKEN,
      signingSecret: env.SLACK_SIGNING_SECRET,
    });
    const bridge = createChatSdkBridge({ adapter: slackAdapter, concurrency: 'concurrent', supportsThreads: true });

    // For public/private channels (IDs starting with C or G), strip the message
    // timestamp from the threadId so replies post to the channel rather than
    // creating a thread. DMs (ID starting with D) keep the full threadId.
    const originalDeliver = bridge.deliver.bind(bridge);
    bridge.deliver = async (platformId: string, threadId: string | null, message) => {
      const effectiveThreadId = !platformId.match(/^slack:D/) && threadId ? `${platformId}:` : threadId;
      return originalDeliver(platformId, effectiveThreadId, message);
    };

    bridge.resolveChannelName = async (platformId: string) => {
      try {
        const info = await slackAdapter.fetchThread(platformId);
        return (info as { channelName?: string }).channelName ?? null;
      } catch {
        return null;
      }
    };
    return bridge;
  },
});
