import { render, screen } from '@testing-library/react';
import { Form, Formik } from 'formik';

import { InputField } from '@/components/InputField';

const mockHandleSubmit = jest
	.fn()
	.mockImplementation(values => 'Form submitted! Values: ' + values);

describe('InputField', () => {
	it('renders an input field', () => {
		render(
			<Formik
				initialValues={{ email: '', username: '', password: '' }}
				onSubmit={values => mockHandleSubmit(values)}
			>
				<Form>
					<InputField
						name="title"
						label="Title"
						placeholder="Title"
						type="text"
						role="input"
						required
					/>
				</Form>
			</Formik>
		);

		const inputElement = screen.getByRole('input');
		expect(inputElement).toBeInTheDocument();
	});
});
