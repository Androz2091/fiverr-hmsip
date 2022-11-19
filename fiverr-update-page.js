const editDistance = (stringOne, stringTwo) => {
    stringOne = stringOne.toLowerCase();
    stringTwo = stringTwo.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= stringOne.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= stringTwo.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (stringOne.charAt(i - 1) != stringTwo.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[stringTwo.length] = lastValue;
    }
    return costs[stringTwo.length];
}

const similarity = (stringOne, stringTwo) => {
    let longer = stringOne;
    let shorter = stringTwo;
    if (stringOne.length < stringTwo.length) {
        longer = stringTwo;
        shorter = stringOne;
    }
    let longerLength = longer.length;
    if (longerLength == 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
  
const fetchSellerReviews = (userId) => {
    return fetch(`https://www.fiverr.com/reviews/user_page/fetch_user_reviews/${userId}?user_id=${userId}&page_size=5&as_seller=true&can_be_ignored_`).then((res) => res.json());
}

const getUserId = (username) => {
    return fetch(`https://www.fiverr.com/search/users_json?username=${username}&limit=50&page=1`)
        .then((res) => res.json())
        .then((res) => res?.users[0]?.id);
}

const appendReviewDetails = (review) => {

    const reviewsOnPage = document.querySelectorAll('.review-item-component');

    let actualReviewOnPage = null;

    for (let i = 0; i < reviewsOnPage.length; i++) {
        const reviewOnPage = reviewsOnPage[i];
        const descriptionOnPage = reviewOnPage.querySelector('.review-description > p').innerText;
        if (similarity(descriptionOnPage, review.comment) > 0.7) {
            actualReviewOnPage = reviewsOnPage[i];
            break;
        }
    }

    if (!actualReviewOnPage) return;

    const detailsOnPage = actualReviewOnPage.querySelector('.reviewer-details');
    console.log('appended')

    const toAppend = `
        <span class="kyP0uN0">
            <span class="XQskgrQ zzTcbrs" aria-hidden="true" style="width: 15px; height: 15px;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
            </span>
            <span class="tbody-6 co-grey-900 m-t-3">$${review.price_range_start || '5'} - $${review.price_range_end}</span>
        </span>
    `
    detailsOnPage.insertAdjacentHTML('beforeend', toAppend);
    
}

setTimeout(async () => {

    const perseusJson = document.querySelector('#perseus-initial-props').textContent.slice(2);
    const { sellerId: userId } = JSON.parse(perseusJson);
    console.log(`Found user id: ${userId}`);
    if (!userId) return;

    fetchSellerReviews(userId).then((res) => {

        console.log(`Reviews fetched: ${res.reviews.length}`);
        
        res.reviews.forEach((review) => {
            appendReviewDetails(review);
        });

    });

}, 1500);

// Listen for messages
chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    if (data.text === 'append_review') {
        setTimeout(() => appendReviewDetails(data.review), 1500);
    }
});
