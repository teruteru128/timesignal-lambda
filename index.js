var lambda = require("@aws-sdk/client-lambda");
var { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: 'ap-northeast-1' });
var { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const { buildSignal } = require('./modules/signalbuilder');

const djc = new Client({
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ], intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ]
});

djc.on(Events.Error, (e) => console.error(e));
djc.on(Events.Warn, (w) => console.warn(w));

djc.login().then();
exports.handler = async (event, context, callback) => {
  const input = {
    Bucket: 'timesignal-bucket',
    Key: 'channel-list.json'
  };
  const body = buildSignal(new Date());
  const command = new GetObjectCommand(input);
  const response2 = await client.send(command);
  const list = JSON.parse(await response2.Body.transformToString())['channels'];
  list.forEach((c) => { djc.channels.fetch(c) });
  await Promise.all(list.map((channelId) => djc.channels.fetch(channelId, { allowUnknownGuild: true, cache: true }).then(c => { console.log("channel: %s", c); if (c !== null && c.isTextBased()) return c.send(body); else Promise.reject("channel is " + (c === null ? "null" : "not text based")); })))
    .catch((error) => console.error("err!!!: %s", error));
};
