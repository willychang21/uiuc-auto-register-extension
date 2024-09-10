try {
    console.log('Popup.js loaded');

    document.getElementById('start').addEventListener('click', (event) => {
        event.preventDefault();
        chrome.runtime.sendMessage({ action: 'start' }, () => {
        });
    });

    document.getElementById('stop').addEventListener('click', (event) => {
        event.preventDefault();
        chrome.runtime.sendMessage({ action: 'stop' }, () => {
        });
    });
} catch (error) {
    console.error('Error in popup.js:', error);
}
