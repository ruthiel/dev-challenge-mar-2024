const solace = require('solclientjs');
const dotenv = require('dotenv');

dotenv.config();

const SOLACE_TRANSPORT_PROTOCOL = process.env.SOLACE_SMF_TRANSPORT_PROTOCOL;
const SOLACE_HOST = process.env.SOLACE_SMF_HOST;
const SOLACE_PORT = process.env.SOLACE_SMF_PORT;
const SOLACE_USERNAME = process.env.SOLACE_SMF_USERNAME;
const SOLACE_PASSWORD = process.env.SOLACE_SMF_PASSWORD;
const SOLACE_VPNNAME = process.env.SOLACE_SMF_VPNNAME;
const SAP_COMMUNITY_ID = 'Ruthiel';

function directMessageConsume(session, consumerSubscription) {
  const topic = solace.SolclientFactory.createTopic(consumerSubscription);
  session.subscribe(topic, true, consumerSubscription, 1000);
  console.log(`Subscribe to: ${consumerSubscription}`);
}

const connectAndConsume = async () => {
  const factoryProps = new solace.SolclientFactoryProperties();
  factoryProps.profile = solace.SolclientFactoryProfiles.version10;
  solace.SolclientFactory.init(factoryProps);

  const sessionProperties = new solace.SessionProperties();
  sessionProperties.url = `${SOLACE_TRANSPORT_PROTOCOL}://${SOLACE_HOST}:${SOLACE_PORT}`;
  sessionProperties.vpnName = SOLACE_VPNNAME;
  sessionProperties.userName = SOLACE_USERNAME;
  sessionProperties.password = SOLACE_PASSWORD;

  const session = await solace.SolclientFactory.createSession(
    sessionProperties
  );
  session.connect();

  session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
    console.log('Session is up');
    directMessageConsume(
      session,
      `dev-challenge/week-4/${SAP_COMMUNITY_ID}/processed`
    );
  });

  session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
    console.log(
      'Connection failed to the message router: ' + sessionEvent.infoStr
    );
  });

  session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
    console.log('Disconnected');
  });

  session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent) => {
    console.log('Cannot add subscription: ' + sessionEvent.correlationKey);
  });

  session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent) => {
    console.log('Subscription added: ' + sessionEvent.correlationKey);
  });

  session.on(solace.SessionEventCode.MESSAGE, (sessionEvent) => {
    console.log('Message Received: ' + sessionEvent.getBinaryAttachment());
  });
};

connectAndConsume();
