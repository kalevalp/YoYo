/* **************************************************************************
 *
 * Property:
 *   Emails can only be sent after consent was given, and as long as
 *   consent had not been revoked.
 *
 * ************************************************************************** */
const properties = [
    {
        name: 'genprop',
        quantifiedVariables: ['email'],
        projections: [['email']],
        stateMachine: {
            'GRANTED_CONSENT': {
                params: [ 'email' ],
                'INITIAL' : { to: 'consented' },
            },
	    'SENT_EMAIL': {
		params: [ 'email' ],
		'INITIAL' : { to: 'FAILURE' },
	    },
	    'REVOKED_CONSENT': {
		params: [ 'email' ],
		'consented' : {to: 'INITIAL'},
	    },
        }
    },
];

module.exports = properties;
