if (!window.isScriptRunning) {
    window.isScriptRunning = true; // Prevents multiple executions

    let retryTimeout = null;

    const stopExecution = () => {
        window.isScriptRunning = false;
        if (retryTimeout) clearTimeout(retryTimeout); // Clear any pending timeouts
    };

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'stop') {
            stopExecution();
        }
    });

    const checkClassAvailability = () => {
        if (!window.isScriptRunning) return;

        const url = 'https://banner.apps.uillinois.edu/StudentRegistrationSSB/ssb/searchResults/searchResults?txt_subject=CS&txt_courseNumber=500&txt_term=120248&pageOffset=0&pageMaxSize=10';

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
                if (classInfo.enrollment < classInfo.maximumEnrollment) {
                    document.querySelector(`#addSection${classInfo.term}${classInfo.courseReferenceNumber}`).click();
                    setTimeout(() => {
                        document.querySelector("#saveButton").click();
                    }, 1000);
                } else {
                    retrySearch();
                }
            }
        })
        .catch(error => {
            // Handle error silently or with appropriate actions
        });
    };

    const retrySearch = () => {
        if (!window.isScriptRunning) return;

        retryTimeout = setTimeout(() => {
            document.querySelector("#search-again-button").click();
            setTimeout(() => {
                startSearch();
            }, 2000);
        }, 3000); // Wait 3 seconds before retrying
    };

    const startSearch = () => {
        if (!window.isScriptRunning) return;

        const searchButton = document.querySelector("#search-go");
        if (searchButton) {
            searchButton.click();

            setTimeout(() => {
                checkClassAvailability();
            }, 2000);
        }
    };

    startSearch();
}
