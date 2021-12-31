import { UsernamePasswordInput } from './UsernamePasswordInput';
import * as EmailValidator from 'email-validator';

export const validateRegister = (options: UsernamePasswordInput) => {
	let errors = [];

	if (options.username.length <= 2) {
		errors.push({
			field: 'username',
			message: 'Length must be greater than 2'
		});
	}

	if (options.username.includes('@')) {
		errors.push({
			field: 'username',
			message: 'Cannot include an @'
		});
	}

	if (
		!options.email.includes('@') ||
		options.email.length <= 2 ||
		!EmailValidator.validate(options.email)
	) {
		errors.push({
			field: 'email',
			message: 'Invalid email address'
		});
	}

	if (options.password.length <= 2) {
		errors.push({
			field: 'password',
			message: 'Length must be greater than 2'
		});
	}

	if (errors.length > 0) {
		return errors;
	}

	return null;
};
