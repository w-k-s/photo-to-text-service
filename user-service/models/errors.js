module.exports.error = {
	account: {
		code: 10000,
		registration: {
			code: 11000,
			validation: {
				code: 11010,
				status: 400
			},
			duplicateAccount:{
				code: 11020,
				status: 400
			},
			undocumented:{
				code: 11999,
				status: 500
			}
		},
		verification:{
			code: 12000,
			tokenExpired:{
				code: 12010,
				status: 400
			},
			undocumented:{
				code: 12999,
				status: 500
			}
		},
		login:{
			code: 13000,
			invalidCredentials:{
				code: 13010,
				status: 401
			},
			noSuchAccount:{
				code: 13020,
				status: 400
			},
			accountUnverified:{
				code: 13030,
				status: 401
			},
			accountLocked:{
				code: 13040,
				status: 403
			},
			undocumented:{
				code: 13999,
				status: 500
			}
		}
	}
}