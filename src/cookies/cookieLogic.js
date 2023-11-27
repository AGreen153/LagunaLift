let daysToLive = 7

/* Set cookie */
export function setCookie(name, value) {
    const date = new Date();
    date.setTime(date.getTime() + daysToLive * 24 * 60 * 60 * 1000) // currentTime + daystoLive * 24hrs * 60 mins * 60 secs * 1000 ms
    let expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`
}

/* Delete cookie */
export function deleteCookie(name) {
    const date = new Date();
    date.setTime(date.getTime() + -5 * 24 * 60 * 60 * 1000)
    let expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=del; ${expires}; path=/`
}

/* Get the value of a cookie by it's name */
export function getCookie(name) {
    const cookieDecoded = decodeURIComponent(document.cookie)
    const cookieArray = cookieDecoded.split("; ")
    let result = null;

    cookieArray.forEach((element) => {
        if (element.indexOf(name) == 0) {
            result = element.substring(name.length+1)
        }
    })
    return result;
}