import i18next from 'i18next';

export async function initializeLocales(defaultLocale = 'en') {
	const resources = {};
	try {
		const en = await import('./locales/en.json', { assert: { type: 'json' } });
		resources['en'] = { translation: en.default || en };
	} catch (e) {
		console.warn('Could not load en locale', e);
	}

	try {
		const pt = await import('./locales/pt.json', { assert: { type: 'json' } });
		resources['pt'] = { translation: pt.default || pt };
	} catch (e) {
		// not fatal
	}

	await i18next.init({
		lng: defaultLocale,
		debug: false,
		resources,
		fallbackLng: 'en'
	});

	// expose to window for simple access from other scripts
	if (typeof window !== 'undefined') {
		window.i18next = i18next;
	}

	return i18next;
}
