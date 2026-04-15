
(function(){
fetch("https://analytics-backend-6xr9.onrender.com/track",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
url:window.location.href,
referrer:document.referrer,
userAgent:navigator.userAgent
})
});
})();
