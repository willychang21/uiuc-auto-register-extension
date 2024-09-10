let intervalId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        if (intervalId === null) { // Prevent multiple intervals
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                intervalId = setInterval(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ['content.js']
                    });
                }, 10000); // Adjust the interval time as needed (10000ms = 10 seconds)
            });
        }
    } else if (message.action === 'stop') {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null; // Reset intervalId to prevent issues on subsequent starts
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        window.isScriptRunning = false;
                    }
                });
            });
        }
    }
});

chrome.runtime.onSuspend.addListener(() => {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
});
