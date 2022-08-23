import Head from 'next/head';

import { NavBar } from './NavBar';
import type { WrapperVariant } from './Wrapper';
import { Wrapper } from './Wrapper';

interface LayoutProps {
	variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
	return (
		<>
			<Head>
				<title>LiReddit</title>
			</Head>
			<NavBar />
			<Wrapper variant={variant}>{children}</Wrapper>
		</>
	);
};
