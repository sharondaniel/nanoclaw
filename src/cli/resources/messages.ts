/**
 * `ncl messages send` — deliver a proactive message to a messaging group
 * through the live delivery adapter, bypassing the agent pipeline.
 */
import { getDeliveryAdapter } from '../../delivery.js';
import { getMessagingGroup, getAllMessagingGroups } from '../../db/messaging-groups.js';
import type { MessagingGroup } from '../../types.js';
import { registerResource } from '../crud.js';

registerResource({
  name: 'message',
  plural: 'messages',
  table: 'messaging_groups',
  description: 'Proactive message delivery — send a message to a channel without an incoming trigger.',
  idColumn: 'id',
  columns: [],
  operations: {},
  customOperations: {
    send: {
      access: 'open',
      description:
        'Send a proactive message to a messaging group. Use --to <mg-id-or-name>, --text <text>, optionally --from <sender-name>.',
      handler: async (args) => {
        const toArg = args.to as string;
        const text = args.text as string;
        const fromName = args.from as string | undefined;

        if (!toArg?.trim()) throw new Error('--to is required');
        if (!text?.trim()) throw new Error('--text is required');

        let mg: MessagingGroup | undefined = getMessagingGroup(toArg);
        if (!mg) {
          mg = getAllMessagingGroups().find((g: MessagingGroup) => g.name?.toLowerCase() === toArg.toLowerCase());
        }
        if (!mg) throw new Error(`Messaging group not found: ${toArg}`);

        const adapter = getDeliveryAdapter();
        if (!adapter) throw new Error('Delivery adapter not ready');

        const body = fromName ? `${text}\n— ${fromName}` : text;
        const content = JSON.stringify({ text: body });

        await adapter.deliver(mg.channel_type, mg.platform_id, null, 'chat', content);

        return { sent: true, messaging_group_id: mg.id, channel_type: mg.channel_type, name: mg.name };
      },
    },
  },
});
