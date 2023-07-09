const RELOAD_TIME = 3 * 1000;
let ACTIVE_TAB_FLAG = false;

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
	console.debug('tabInfo', { tabId, changeInfo, tab });
});

chrome.webRequest.onResponseStarted.addListener((details: chrome.webRequest.WebResponseCacheDetails) => {
	console.debug('onResponseStarted', details);

	if (details.statusCode >= 500) {
		console.debug(`${details.tabId} をリロードします`);
		setTimeout(async () => {
			try {
				await chrome.tabs.reload(details.tabId);
			} catch (error) {
				console.warn(error);
			}
		}, RELOAD_TIME);
	} else if (details.statusCode < 300) {
		console.debug(`${details.tabId} が表示できます`);
		if (!ACTIVE_TAB_FLAG) {
			ACTIVE_TAB_FLAG = true;
			chrome.tabs.update(details.tabId, { active: true });
			setTimeout(() => {
				ACTIVE_TAB_FLAG = false;
			}, RELOAD_TIME * 2);
		}
	}
}, { urls: [ 'https://*/*', 'http://localhost/*' ], types: [ 'main_frame' ] });
