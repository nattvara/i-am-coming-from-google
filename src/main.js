/**
 * This will modify all requests to have a Referer header
 * with the value "https://google.com".
 *
 * The reason for this is some website uses paywalls but allows
 * incomming traffic from google.com to bypass those paywalls.
 */

toggleDomain = async () => {
    var tabs = await browser.tabs.query({currentWindow: true, active: true});
    var hostname = parseHostname(tabs[0].url);

    var storage = await browser.storage.local.get('domains');
    var domains = storage.domains;

    if (!domains) {
        domains = [];
    }

    if (domains.indexOf(hostname) != -1) {
        domains.splice(domains.indexOf(hostname), 1);
    } else {
        domains.push(hostname);
    }

    await browser.storage.local.set({domains: domains})

    reloadPage();
}

reloadPage = async () => {
    var tab = await browser.tabs.query({currentWindow: true, active: true});
    browser.tabs.reload(tab.id, {bypassCache: true});
}

parseHostname = (url) => {
    var l = document.createElement("a");
    l.href = url;
    return l.hostname;
};

rewriteRequest = async (e) => {

    var tabs = await browser.tabs.query({currentWindow: true, active: true});
    var hostname = parseHostname(tabs[0].url);

    var storage = await browser.storage.local.get('domains');
    var domains = storage.domains;

    if (!domains) {
        return {requestHeaders: e.requestHeaders};
    }

    if (domains.indexOf(hostname) == -1) {
        return {requestHeaders: e.requestHeaders};
    }

    localStorage.clear();
    clearCookies();

    e.requestHeaders.push({
        name: 'Referer',
        value: 'https://google.com'
    })

    return {requestHeaders: e.requestHeaders};
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

browser.browserAction.onClicked.addListener(toggleDomain);
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
