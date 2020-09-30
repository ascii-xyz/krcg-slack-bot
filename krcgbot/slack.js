const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

const MENTION_REGEX = /<@[a-zA-Z0-9]+>/g;

module.exports = {
  messageTokenIsValid: (body) => {
    return body.token === SLACK_VERIFICATION_TOKEN;
  },
  getChallengeResponse: (slackChallenge) => {
    return {
      'statusCode': 200,
      'body': slackChallenge.challenge,
    };
  },
  getTextFromMention: (body) => {
    return body.event.text.replace(MENTION_REGEX, '').trim();
  }
};
