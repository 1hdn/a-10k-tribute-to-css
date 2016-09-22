// This script loads the playback controls if JavaScript is enabled.
// I was running low on bytes when I wrote this, so to save a few bytes I had to go old school 
// and turn to things like setting the className attribute directly instead of going through the classList API 
// and choose onclick handlers over addEventListener and stuff like that. 
// Please don't judge me on this. I'm still cool...

window.addEventListener('load', function () {

    function createElement(tag, attributes, parentNode) {
        var element = document.createElement(tag);
        for (var name in attributes) {
            element.setAttribute(name, attributes[name]);
        }
        if (parentNode) {
            parentNode.appendChild(element);
        }
        return element;
    }

    function addStyle() {
        var style = createElement('style');
        var script = document.querySelector('script');
        document.head.insertBefore(style, script);
        return style;
    }

    function clearStyle(style) {
        while (style.sheet.cssRules.length > 0) style.sheet.deleteRule(0);
    }

    // Apply styles for the controls only if JavaScript is available. No need to bloat the CSSOM otherwise.
    var playerStyle = addStyle();
    playerStyle.appendChild(document.createTextNode("/*builder:controls.css*/"));

    var banner = document.querySelector('h1');
    var player = createElement('div', { 'id': 'player', 'aria-hidden': 'true' });
    var controls = createElement('div', { 'id': 'controls' }, player);
    var openerButton = createElement('button', { 'id': 'opener', 'tabindex': '1' }, player);
    var stateButton = createElement('button', { 'id': 'state', 'tabindex': '2' }, controls);
    var timelineTrack = createElement('div', { 'id': 'track' }, controls);
    var timelinePosition = createElement('div', { 'id': 'pos' }, timelineTrack);
    var timelineHandle = createElement('div', { 'id': 'handle' }, timelineTrack);
    var elapsedDisplay = createElement('div', { 'id': 'time' }, controls);
    var pauseStyle = addStyle();
    var delayStyle = addStyle();
    var touchDevice = false;

    banner.parentNode.insertBefore(player, banner.nextSibling);

    function play() {
        clearStyle(pauseStyle);
        stateButton.className = '';
    }

    function pause() {
        clearStyle(pauseStyle);
        pauseStyle.sheet.insertRule('h1,h1::before,h1::after,#pos{animation-play-state:paused}', 0);
        stateButton.className = 'paused';
    }

    function goto(value, playState) {

        clearStyle(delayStyle);
        delayStyle.sheet.insertRule('h1,h1::before,h1::after,#pos{animation:none;opacity:0}', 0);

        var expectedLeft = ((Math.abs(parseFloat(value.replace('s', ''))) / 15) * 100) % 100;
        var time = new Date().getTime();

        function checkApplied() {
            var left = getElapsedPercent();
            if (Math.abs(left - expectedLeft) < 1) {
                requestAnimationFrame(function () {
                    delayStyle.sheet.insertRule('h1,h1::before,h1::after,#pos{opacity:1;}', delayStyle.sheet.cssRules.length);
                    if (playState == 'paused') pause();
                });
            }
            else if (new Date().getTime() - time < 300) {
                requestAnimationFrame(checkApplied);
            }
        }

        requestAnimationFrame(function () {
            clearStyle(delayStyle);
            delayStyle.sheet.insertRule('h1,h1::before,h1::after,#pos{animation-delay:' + value + ';opacity:0;}', 0);
            play();
            checkApplied();
        });
    }

    function getElapsedPercent() {
        var computed = window.getComputedStyle(timelinePosition).getPropertyValue('left');
        if (computed.indexOf('%') != -1) {
            return parseFloat(computed.replace('%', ''));
        }
        else if (computed.indexOf('px') != -1) {
            var pos = parseFloat(computed.replace('px', ''));
            return Math.floor((pos / timelineTrack.clientWidth) * 10000) / 100;
        }
        return NaN;
    }

    function updateElapsedDisplay() {

        if (controls.className == 'open') {
            var left = getElapsedPercent();
            if (!isNaN(left)) {
                var secs = Math.floor((left / 100) * 15);
                elapsedDisplay.innerHTML = '00:' + ('0' + secs).slice(-2);
            }
        }

        // On requestAnimationFrame vs setTimeout:
        // No doubt requestAnimationFrame gives me the best result with instant updates, 
        // but setTimeout with 200ms updates delivers a decent result with about 10 times less updates. 
        // So this one is for the battery powered devices...  

        setTimeout(updateElapsedDisplay, 200);
    }

    openerButton.onclick = function () {
        if (controls.className == 'open') {
            controls.className = '';
        }
        else {
            controls.className = 'open';
        }
    }

    stateButton.onclick = function () {
        if (stateButton.className == 'paused') {
            play();
        }
        else {
            pause();
        }
    }

    timelineTrack.ontouchstart = timelineTrack.onmousedown = function (e) {

        if (/touch/i.test(e.type)) {
            touchDevice = true;
        } else if (touchDevice) {
            return false;
        }

        var moveHandler = touchDevice ? 'ontouchmove' : 'onmousemove';
        var doneHandler = touchDevice ? 'ontouchend' : 'onmouseup';
        var playState = window.getComputedStyle(timelinePosition).getPropertyValue('animation-play-state');
        if (playState != 'paused') pause();

        function getValue(pos) {
            var val = pos - timelineTrack.offsetLeft;
            return Math.max(0, Math.min(timelineTrack.clientWidth, val));
        }

        document[moveHandler] = function (e) {
            timelinePosition.style.display = 'none';
            timelineHandle.style.display = 'block';
            timelineHandle.style.left = getValue(e.pageX) + 'px'
        }

        document[doneHandler] = function (e) {
            timelinePosition.style.display = 'block';
            timelineHandle.style.display = '';
            document[moveHandler] = null;
            document[doneHandler] = null;
            var cue = Math.floor((getValue(e.pageX) / timelineTrack.clientWidth) * 1500) / 100;
            var value = '-' + cue + 's';
            goto(value, playState);
        }
    }

    updateElapsedDisplay();

});