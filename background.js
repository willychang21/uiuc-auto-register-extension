let intervalId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        if (intervalId === null) { // Prevent multiple intervals
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        window.isScriptRunning = true;
                    }
                }, () => {
                    intervalId = setInterval(() => {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: fetchSearchResults
                        });
                    }, 10000); // Adjust the interval time as needed (3000ms = 3 seconds)
                });
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

function fetchSearchResults() {
    if (!window.isScriptRunning) return;
    // console.log('Fetching search results...');

    const url = 'https://banner.apps.uillinois.edu/StudentRegistrationSSB/ssb/searchResults/searchResults?txt_subject=CS&txt_courseNumber=588&txt_term=120251&startDatepicker=&endDatepicker=&uniqueSessionId=mlko51737564310990&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json;charset=UTF-8',
            'Connection': 'keep-alive'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!window.isScriptRunning) return;

        if (data.success && data.totalCount > 0) {
            const classInfo = data.data[0];
            // console.log(classInfo.enrollment, classInfo.maximumEnrollment);
            if (classInfo.enrollment < classInfo.maximumEnrollment) {
                console.log('Class is available!');
                document.querySelector("#search-go").click(); // Click the search button
                setTimeout(() => {
                    document.querySelector(`#addSection${classInfo.term}${classInfo.courseReferenceNumber}`).click();
                    setTimeout(() => {
                        document.querySelector("#saveButton").click();
                    }, 1000);
                }, 2000); // Wait 2 seconds after clicking search button
            } else {
                console.log('Class is full');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error); // Print out the error
        // Handle error silently or with appropriate actions
    });
}
