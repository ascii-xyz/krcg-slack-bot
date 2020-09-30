const axios = require('axios');

const slack = require('./slack');
const krcg = require('./krcg');

const BOT_TOKEN = process.env.BOT_TOKEN;
const POST_SLACK_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

const handleEvent = async body => {
  const cardName = slack.getTextFromMention(body);
  var cardResult = await krcg.getCard(cardName);

  const slackHeaders = {
    headers: {
      'Authorization': `Bearer ${BOT_TOKEN}`,
    },
  };

  const slackMessage = {
    channel: body.event.channel,
  };

  if (cardResult) {
    slackMessage.text = `Found it! :vampire:`;
    slackMessage.blocks = krcg.getCardBlock(cardResult);
  } else {
    slackMessage.text = `Didn't find your card :disappointed:`;
  }
  
  var result = await axios.post(
    POST_SLACK_MESSAGE_URL,
    slackMessage,
    slackHeaders,
  );

  if (result.status === 200 && !result.data.ok) {
    console.error(result.data);
    await axios.post(
      POST_SLACK_MESSAGE_URL,
      {
        channel: body.event.channel,
        text: `:cry:\nFailed to search for \`${cardName}\`\nFailed with: \`${JSON.stringify(result.data)}\`\nAttempted to write:\n\`\`\`${JSON.stringify(slackMessage)}\`\`\``,
      },
      slackHeaders,
    );
  }
}

exports.lambdaHandler = async (event, context) => {
  const { body } = event;
  const deserializedBody = JSON.parse(body);

  if (!slack.messageTokenIsValid) {
    return {
      'statusCode': 403,
    };
  }

  if (deserializedBody.challenge) {
    return slack.getChallengeResponse(deserializedBody)
  }
  
  await handleEvent(deserializedBody);

  return {
    'statusCode': 204,
  };
}
