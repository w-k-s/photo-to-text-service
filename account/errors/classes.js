class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
}

class ValidationError extends BaseError {
    constructor(fields, message) {
        super(message);
        this.fields = fields;
    }
}

class DuplicateAccountError extends BaseError {}

class WeakPasswordError extends ValidationError {}

class IncorrectPasswordError extends BaseError {}

class InvalidTokenError extends BaseError {}

class AccountNotFoundError extends BaseError {}

class AccountNotVerifiedError extends BaseError {}

class UnauthorizedAccessError extends BaseError{}

class ReverifyingActiveAccountError extends BaseError {}

module.exports = {
    ValidationError,
    DuplicateAccountError,
    WeakPasswordError,
    InvalidTokenError,
    UnauthorizedAccessError,
    IncorrectPasswordError,
    AccountNotFoundError,
    AccountNotVerifiedError,
    ReverifyingActiveAccountError
}