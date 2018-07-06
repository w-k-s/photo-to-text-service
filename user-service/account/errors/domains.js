const domains = {
	account: {
		code: 10000,
		registration: {
			code: 11000,
			validation: {
				code: 11010,
				path: 'account.registration.validation',
			},
			duplicateAccount:{
				code: 11020,
				path: 'account.registration.duplicateAccount',
				message: 'An account has already been registered with this email'
			},
			undocumented:{
				code: 11999,
				path: 'account.registration.undocumented'
			}
		},
		verification:{
			code: 12000,
			tokenNotFound:{
				code: 12010,
				path: 'account.verification.tokenNotFound'
			},
			tokenNotValid:{
				code: 12020,
				path: 'account.verification.tokenNotValid'
			},
			undocumented:{
				code: 12999,
				path: 'account.verification.undocumented'
			}
		},
		login:{
			code: 13000,
			invalidCredentials:{
				code: 13010,
				path: 'account.login.invalidCredentials'
			},
			accountNotFound:{
				code: 13020,
				path: 'account.login.accountNotFound'
			},
			accountUnverified:{
				code: 13030,
				path: 'account.login.accountUnverified'
			},
			accountLocked:{
				code: 13040,
				path: 'account.login.accountLocked'
			},
			undocumented:{
				code: 13999,
				path: 'account.login.undocumented'
			}
		}
	}
}

module.exports = domains;