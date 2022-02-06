import {
	FormControl,
	FormErrorMessage,
	FormLabel
} from '@chakra-ui/form-control';
import { Input, Textarea } from '@chakra-ui/react';
import { useField } from 'formik';
import { InputHTMLAttributes } from 'react';

// set props to that of regular input field, but make name required (necessary for formik)
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
	textarea?: boolean;
};

export const InputField: React.FC<InputProps> = ({
	label,
	size: _,
	textarea,
	...props
}) => {
	const [field, { error }] = useField(props);

	let InputOrTextarea = textarea ? (
		<Textarea
			{...field}
			name={props.name}
			id={field.name}
			placeholder={props.placeholder}
		></Textarea>
	) : (
		<Input
			{...field}
			{...props}
			id={field.name}
			placeholder={props.placeholder}
		/>
	);

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			{InputOrTextarea}
			{error && <FormErrorMessage>{error}</FormErrorMessage>}
		</FormControl>
	);
};
