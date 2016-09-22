#A 10k tribute to CSS
This is my entry for the [10k Apart](https://a-k-apart.com/) contest. I used my 10 kilobytes to tell how awesome CSS is. This statement is backed up by applying CSS to a single `<h1>` element that turns it into a cartoon, just to emphasize that additional markup isn’t needed for CSS to shine. 

[Go to the page](http://henrik.dahlbom.dk/css-is-awesome/)

##Progressive enhancements
* The content is served in lean semantic markup with ARIA attributes to assist screen readers. This will ensure that a browser without CSS rendering capabilities gets the core message. 
* If the browser can render CSS, the page’s `<h1>` element is turned into a cartoon that complements the subject of the content, and the content itself adapts to the best reading experience for the viewport size. 
* If the browser is capable of executing JavaScript, a set of playback controls is injected into the page. These playback controls can be operated with mouse, touch or keyboard.

##Files and folders
I wanted the project output to be a single self-contained html file to call attention to the fact that only one http request is made. There are no external dependencies. So index.html is this self-contained file. It is generated by running the unminified files in the workfiles folder through the build tool located in the builder folder. The workfiles and builder folders are included for transparency only. Index.html is the sole project output.

##Browsers and headaches
For this particular project the latest versions of Chrome, Edge and Firefox all made me happy. Each of them had their quirks but I was able to work around them. Internet Explorer was a challenge because it doesn’t seem to animate background-sizes. This results in a weird facial expression of the cartoon monster, but given the fact that the browser is retired and not a contest requirement I was able to come to peace with this.

What did make me sad was Safari. It seems Safari has an issue using the vh unit for background-sizes. The initial rendering is fine, but when the height of the viewport changes, the computed value isn’t updated. This leaves the speech bubble and some shadows with incorrect sizes. This is particular sad because orientation changes on mobile devices triggers this bug. I tried to work around this issue but I ran out of bytes. I was hoping Safari 10 would fix this issue for me, but it doesn’t seem to be the case.
