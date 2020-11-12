const URL = "http://localhost:3000/tweets";
var nextResults = null;

document.getElementById('theme-selector').checked = true;

const setTheme = (e) => {
    if (!e.target.checked) {
        $('.home-page').css('background-color', 'white');
        $('.logo').css('color', '#00acee');
        $('.search-bar-container input, .search-bar-container i').css('color', 'black')
        $('.tweet-user-info-container').css('color', 'black');
        $('.tweet-text-container p').css('color', 'black');
        $('#theme-select-label').css('color', 'black');
        $('.trendings').css('background-color', '#f5f9ff');
        $('.trendings-title').css('color', 'black');
        $('.trendings-item').css('color', '#4a4a4a');
    } else {
        $('.home-page').css('background-color', '');
        $('.logo').css('color', '');
        $('.tweet-user-info-container').css('color', '');
        $('.tweet-text-container p').css('color', '');
        $('#theme-select-label').css('color', '');
    }
}

const checkForEnter = (e) => {
    if (e.key == 'Enter') {
        getTwitterData();
    }
}

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (isNextPage) => {
    let input = document.getElementById('search-input').value;
    if (!input) { return }

    let encodedInput = encodeURIComponent(input);
    let dinamic_url = URL + `?q=${encodedInput}&count=10`;
    if (nextResults) { dinamic_url = URL + nextResults };


    fetch(dinamic_url).then((response) => {
        return response.json()
    }).then((data) => {
        buildTweets(data.statuses, isNextPage);
        saveNextPage(data.search_metadata);
        setNextPageBtnVisibility(data.search_metadata);
    })
}

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
    if (metadata.next_results) {
        nextResults = metadata.next_results;
    } else {
        nextResults = null;
    }
}

const getNextPage = () => {
    if (nextResults) {
        getTwitterData(true);
    }
}

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
    const trend = e.target.textContent;
    document.getElementById('search-input').value = trend;
    getTwitterData();
}

/**
 * Set the visibility of next page based on if there is data on next page
 */
const setNextPageBtnVisibility = (metadata) => {
    if (metadata.next_results){
        document.querySelector('.next-page-btn-container').style.visibility = 'visible';
    } else {
        document.querySelector('.next-page-btn-container').style.visibility = 'visible';
    }
}

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, isNextPage) => {
    let tweet_component = '';
    tweets.map(tweet => {
        const createdDate = moment(tweet.created_at).fromNow();
        tweet_component += `
        <div class="tweet-container">
            <div class="tweet-header-container">
                <div class="tweet-profile-picture" style="background-image: url(${tweet.user.profile_image_url_https})"></div>
                <div class="tweet-user-info-container">
                    <div class="tweet-user-name">
                        ${tweet.user.name}
                    </div>
                    <div class="tweet-user-username">
                        @${tweet.user.screen_name}
                    </div>
                </div>
            </div>
            <div class="tweet-text-container" )>
                <p>${tweet.full_text}</p>
            </div>`

        if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
            tweet_component += buildImages(tweet.extended_entities.media);
            tweet_component += buildVideo(tweet.extended_entities.media);
        }

        tweet_component += `
            <div class="tweet-date-container">
                <span class="tweet-date-text">${createdDate}</span>
            </div>
        </div>
        `
        if (isNextPage) {
            document.getElementById('tweet-list').innerHTML += tweet_component; 
        } else {
            document.getElementById('tweet-list').innerHTML = tweet_component; 
        }
    })
}

/** 
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
    let imagesComponent = `<div class="tweet-media-container">`;
    let imageExists = false;
    mediaList.map((media_item) => {
        if (media_item.type == 'photo') {
            imageExists = true
            imagesComponent += `<div class="tweet-media-item" style="background-image: url(${media_item.media_url_https})"></div>`
        }
    });

    imagesComponent += `</div>`;

    return imageExists ? imagesComponent : '';
}

/** 
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
    let videoComponent = `<div class="tweet-video-container">`;
    let videoExists = false;
    mediaList.map((media_item) => {
        if (media_item.type == 'video') {
            videoExists = true
            videoComponent += `
                <video controls>
                    <source src="${media_item.video_info.variants[0].url}" type="video/mp4">
                </source>
            `
        } else if (media_item.type == 'animated_gif') {
            videoExists = true
            videoComponent += `
                <video loop autoplay>
                    <source src="${media_item.video_info.variants[0].url}" type="video/mp4">
                </source>
            `
        }
    });

    videoComponent += `</div>`;

    return videoExists ? videoComponent : '';
}