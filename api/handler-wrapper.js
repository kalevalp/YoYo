const recorder = require('watchtower-recorder');
const eventsStreamName = process.env['WATCHTOWER_EVENT_KINESIS_STREAM'];
const eventPublisher = recorder.createEventPublisher(eventsStreamName);
const debug = process.env.DEBUG_WATCHTOWER;

// Loading modules that fail when required via vm2
const request = require('request');

let context, lambdaExecutionContext, lambdaInputEvent;
function updateContext(name, event, lambdaContext) { context = name; lambdaExecutionContext = lambdaContext; lambdaInputEvent = event; }


const getProxyConditions = [], queryProxyConditions = [];
const putProxyConditions = [
    {
	cond: (target, thisArg, argumentsList) => context === 'consent', // Could also do tableName === consent table
	opInSucc: (argumentsList) => (response) => {
            eventPublisher({name: "GRANTED_CONSENT", params: {email: argumentsList[0].Item.email}},
			   lambdaExecutionContext);
	}
    },
]
const deleteProxyConditions = [
    {
	cond: (target, thisArg, argumentsList) => context === 'revoke', // Could also do tableName === consent table
	opInSucc: (argumentsList) => (response) => {
            eventPublisher({name: "REVOKED_CONSENT", params: {email: argumentsList[0].Key.email}},
			   lambdaExecutionContext);
	}
    },
]

const sendgridConditions = [{ cond: () => true, opInSucc: (argumentsList) => (response) => eventPublisher({name: "SENT_EMAIL", params: {email: argumentsList[0].to}}, lambdaExecutionContext) }]

const mock = {
    'aws-sdk' : recorder.createDDBDocClientMock(getProxyConditions, putProxyConditions, deleteProxyConditions, queryProxyConditions, true),
    'request' : request,
    '@sendgrid/mail' : recorder.createSendgridMailMock(sendgridConditions),
};


module.exports.create = recorder.createRecordingHandler('handler.js', 'create', mock, false, updateContext, true);
module.exports.get = recorder.createRecordingHandler('handler.js', 'get', mock, false, updateContext, true);
module.exports.update = recorder.createRecordingHandler('handler.js', 'update', mock, false, updateContext, true);
module.exports.query = recorder.createRecordingHandler('handler.js', 'query', mock, false, updateContext, true);
module.exports.consent = recorder.createRecordingHandler('handler.js', 'consent', mock, false, updateContext, true);
module.exports.revoke = recorder.createRecordingHandler('handler.js', 'revoke', mock, false, updateContext, true);
