import '@testing-library/jest-dom';

import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}

jest.mock('next/navigation', () => {
	const push = jest.fn();
	const replace = jest.fn();
	const prefetch = jest.fn();
	const back = jest.fn();

	return {
		useRouter: jest.fn(() => ({
			push,
			replace,
			prefetch,
			back,
			pathname: '/',
			query: {},
			asPath: '/',
		})),
		useSearchParams: jest.fn(() => new URLSearchParams()),
		usePathname: jest.fn(() => '/'),
	};
});

jest.mock('next-themes', () => ({
	ThemeProvider: ({ children }) => children,
	useTheme: () => ({
		theme: 'light',
		setTheme: jest.fn(),
	}),
}));

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
};

global.ResizeObserver = class ResizeObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	unobserve() {}
};

const originalError = console.error;
beforeAll(() => {
	console.error = (...args) => {
		if (
			typeof args[0] === 'string' &&
			(args[0].includes('Warning: ReactDOM.render') ||
				args[0].includes('Warning: useLayoutEffect') ||
				args[0].includes(
					'Not implemented: HTMLFormElement.prototype.requestSubmit'
				))
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
});
