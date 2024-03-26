const axios = require('axios').default;
const { CloudEvent, HTTP } = require('cloudevents');
const dotenv = require('dotenv');

dotenv.config();

const SOLACE_USERNAME = process.env.SOLACE_SMF_USERNAME;
const SOLACE_PASSWORD = process.env.SOLACE_SMF_PASSWORD;
const SAP_COMMUNITY_ID = 'Ruthiel';

const cloudevent = new CloudEvent({
  type: 'sap.s4.beh.allergen.v1.Allergen.Created.v1',
  specversion: '1.0',
  source: '../dictionary',
  subject: 'string',
  id: 'QgEK7wzuHtqdhJwqCS+VOA==',
  time: '2018-04-05T17:31:00Z',
  datacontenttype: 'application/json',
  data: {
    AllergenInternalID: 'string',
  },
  sapcommunityid: SAP_COMMUNITY_ID,
});

const sentEvent = async () => {
  const response = await axios({
    method: 'post',
    url: `https://mr-connection-plh11u5eu6a.messaging.solace.cloud:9443/TOPIC/dev-challenge/week-4/${SAP_COMMUNITY_ID}/notification`,
    data: cloudevent,
    headers: {
      'content-type': 'application/cloudevents+json',
      Authorization: `Basic ${Buffer.from(
        `${SOLACE_USERNAME}:${SOLACE_PASSWORD}`
      ).toString('base64')}`,
    },
  });
  console.log(
    'Sending message to the topic: ',
    `dev-challenge/week-4/${SAP_COMMUNITY_ID}`
  );
  console.log('Response Status:', response.status);
};

const { headers, body } = HTTP.structured(cloudevent);
console.log(JSON.stringify(headers, null, 2));
console.log(JSON.stringify(JSON.parse(body), null, 2));

sentEvent();
