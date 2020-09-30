const axios = require('axios');

const KRCG_API_BASE_URL = 'https://api.krcg.org';

const buildRulingBlock = (rulings) => {
  if (!rulings || rulings.length === 0) {
    return undefined;
  }
  let text = '*Rulings*';
  for (var ruling of rulings) {
    text += `\n- ${ruling}`
  }
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      text
    }
  }
};

const buildImageBlock = (cardName) => {
  const shortenedCardName = cardName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, '')
    .replace(/-/g, '')
    .toLowerCase();
  const imageUrl = `https://codex-of-the-damned.org/card-images/${encodeURI(shortenedCardName)}.jpg`;
  return {
			"type": "image",
			"image_url": imageUrl,
			"alt_text": "inspiration"
		}
};

const buildCardBlock = (cardResponse) => {
  const cardName = cardResponse['Name'];
  const cardType = cardResponse['Type'];
  const cardText = cardResponse['Card Text'];
  const codexUrl = `https://codex-of-the-damned.org/en/card-search.html?card=${encodeURI(cardName)}`;
  const rulingsBlock = buildRulingBlock(cardResponse['Rulings']);
  const imageBlock = buildImageBlock(cardName);
  let cardBlocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*<${codexUrl}|${cardName}>*`
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": `*Type*\n${cardType}`
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Card Text*\n${cardText}`
      }
    },
  ];
  if (rulingsBlock) {
    cardBlocks.push(rulingsBlock);
  }
  cardBlocks.push(imageBlock);
  return cardBlocks
};

module.exports = {
  getCard: async (cardName) => {
    try {
      var cardResult = await axios.get(`${KRCG_API_BASE_URL}/card/${encodeURI(cardName)}`)
      if (cardResult.status === 200) {
        return cardResult.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error occured:')
      console.error(error);
      return null;
    }
  },
  getCardBlock: buildCardBlock,
}
