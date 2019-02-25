/**
 * This will modify all requests to have a Referer header
 * with the value "https://google.com".
 *
 * The reason for this is some website uses paywalls but allows
 * incomming traffic from google.com to bypass those paywalls.
 */

rewriteRequest = (e) => {

    localStorage.clear();
    clearCookies();

    e.requestHeaders.push({
        name: 'Referer',
        value: 'https://google.com'
    })
    return {
        requestHeaders: e.requestHeaders
    };
}

/**
 * Clear cookies for current domain
 *
 * @return {Void}
 * @see https://stackoverflow.com/a/33366171/2278359 source
 */
clearCookies = () => {
    var cookies = document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
            var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
            var p = location.pathname.split('/');
            document.cookie = cookieBase + '/';
            while (p.length > 0) {
                document.cookie = cookieBase + p.join('/');
                p.pop();
            };
            d.shift();
        }
    }
}

browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteRequest,
    {
        urls: ['*://*/*']
    },
    [
        'blocking',
        'requestHeaders'
    ]
);
