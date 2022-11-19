console.log('ok')
let ignoreRequests = [];

chrome.webRequest.onCompleted.addListener(
    async function (details) {
        const url = details?.url;
        if (url.includes('can_be_ignored_')) return;
        if (!url || ignoreRequests.includes(url)) return;
        ignoreRequests.push(url);
        const res = await fetch(url);
        const data = await res.json();
        data.reviews.forEach((review) => {
            chrome.tabs.sendMessage(details.tabId, { text: 'append_review', review }, () => {});
        });
    },
    {
        urls: [
            "https://www.fiverr.com/reviews/user_page/fetch_user_reviews/*"
        ],
        types: ["xmlhttprequest"],
    }
);
