const domains = {
    account: {
        code: 10000,
        registration: {
            code: 11000,
            validation: {
                code: 11010,
                path: 'account.registration.validation',
            },
            duplicateAccount: {
                code: 11020,
                path: 'account.registration.duplicateAccount',
                message: 'An account has already been registered with this email'
            },
            undocumented: {
                code: 11999,
                path: 'account.registration.undocumented'
            }
        },
        verification: {
            code: 12000,
            validation: {
                code: 12010,
                path: 'account.verification.validation',
            },
            tokenNotFound: {
                code: 12020,
                path: 'account.verification.tokenNotFound'
            },
            tokenNotValid: {
                code: 12030,
                path: 'account.verification.tokenNotValid'
            },
            accountNotFound: {
                code: 12040,
                path: 'account.verification.tokenNotFound'
            },
            accountAlreadyActive: {
                code: 12050,
                path: 'account.verification.accountAlreadyActive'
            },
            verificationCodeNotSent: {
                code: 12060,
                path: 'account.registration.verificationCodeNotSent',
                message: 'Error while sending verification code. Contact support to request resend'
            },
            undocumented: {
                code: 12999,
                path: 'account.verification.undocumented'
            }
        },
        login: {
            code: 13000,
            unauthorizedAccess:{
                code: 13010,
                path: 'account.login.unauthorizedAccess'
            },
            validation: {
                code: 13020,
                path: 'account.login.validation'
            },
            invalidCredentials: {
                code: 13030,
                path: 'account.login.invalidCredentials'
            },
            accountNotFound: {
                code: 13040,
                path: 'account.login.accountNotFound'
            },
            accountUnverified: {
                code: 13050,
                path: 'account.login.accountUnverified'
            },
            sessionExpired: {
                code: 13060,
                path: 'account.login.sessionExpired'
            },
            undocumented: {
                code: 13999,
                path: 'account.login.undocumented'
            }
        }
    }
}

module.exports = domains;