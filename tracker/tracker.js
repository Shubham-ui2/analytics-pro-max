
(function(){
fetch("http://localhost:5000/track",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
url:window.location.href,
referrer:document.referrer,
userAgent:navigator.userAgent
})
});
})();
