import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
	initialColorMode: 'light',
	useSystemColorMode: true
};

const colors = {
	black: '#16161D'
};

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = createBreakpoints({
	sm: '40em',
	md: '52em',
	lg: '64em',
	xl: '80em'
});

const theme = extendTheme({
	config,
	colors,
	fonts,
	breakpoints
});

export default theme;
