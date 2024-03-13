var lambda = require("@aws-sdk/client-lambda");
var { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: 'ap-northeast-1' });
var { Client, Events, Partials } = require('discord.js');

const djc = new Client({
  partials: [
    Partials.Channel, Partials.Message
  ]
});

function buildSignal(now) {
  let prefix = '真夜中';
  let secondPrefix = 'だよ';
  let name = 'ハルト';
  const date = now.getDate();
  const month = now.getMonth();
  const day = now.getDay();
  // choose prefix
  if (date === 1) {
    if (month === 0) {
      // 毎年1月1日
      prefix = '新年あけましておめでとう';
      secondPrefix = '';
    } else {
      // 2~12月1日
      prefix = `${month + 1}月1日`;
      if (day === 1) {
        prefix += '月曜日';
      }
    }
  } else if (date === 20 && month === 10) {
    prefix = '20, november';
  } else if (day === 1) {
    prefix = '月曜日';
  } else if (month === 1 && (date === 2 || date === 22)) {
    // 2月2日 || 2月22日
    name = 'にゃんこ';
  }
  // build signal message
  // オは40以上100(未満ではなく)以下
  return prefix + secondPrefix + name + 'オ'.repeat(40 + random.nextInt(61));
}

djc.on(Events.Error, (e) => console.error(e));
djc.on(Events.Warn, (w) => console.warn(w));

exports.handler = async (event, context, callback) => {
  const input = {
    Bucket: 'timesignal-bucket',
    Key: 'channel-list.json'
  };
  const body = buildSignal(new Date());
  const command = new GetObjectCommand(input);
  const response2 = await client.send(command);
  Promise.all(JSON.parse(await response2.Body.transformToString())['channels']
    .map((channelId) => djc.channels.fetch(channelId)))
    .then((c) => c.map((channel) => channel.send(body)))
    .catch((error) => logger.error(error));
};
djc.login();
