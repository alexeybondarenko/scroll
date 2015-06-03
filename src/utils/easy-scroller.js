var EasyScroller = function(content, options) {
	
	this.content = content;
	this.container = content.parentNode;
	this.options = options || {};

	// create Scroller instance
	var that = this;
	this.scroller = new Scroller(function(left, top, zoom) {
		that.options.onScroll({
			left: left,
			top: top,
			zoom: zoom
		});
		that.render(left, top, zoom);
	}, options);

	// bind events
	this.bindEvents();

	// the content element needs a correct transform origin for zooming
	this.content.style[EasyScroller.vendorPrefix + 'TransformOrigin'] = "left top";

	// reflow for the first time
	this.reflow();

};

EasyScroller.prototype.render = (function() {
	
	var docStyle = document.documentElement.style;
	
	var engine;
	if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
		engine = 'presto';
	} else if ('MozAppearance' in docStyle) {
		engine = 'gecko';
	} else if ('WebkitAppearance' in docStyle) {
		engine = 'webkit';
	} else if (typeof navigator.cpuClass === 'string') {
		engine = 'trident';
	}
	
	var vendorPrefix = EasyScroller.vendorPrefix = {
		trident: 'ms',
		gecko: 'Moz',
		webkit: 'Webkit',
		presto: 'O'
	}[engine];
	
	var helperElem = document.createElement("div");
	var undef;
	
	var perspectiveProperty = vendorPrefix + "Perspective";
	var transformProperty = vendorPrefix + "Transform";
	
	if (helperElem.style[perspectiveProperty] !== undef) {
		
		return function(left, top, zoom) {
			this.content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
		};	
		
	} else if (helperElem.style[transformProperty] !== undef) {
		
		return function(left, top, zoom) {
			this.content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
		};
		
	} else {
		
		return function(left, top, zoom) {
			this.content.style.marginLeft = left ? (-left/zoom) + 'px' : '';
			this.content.style.marginTop = top ? (-top/zoom) + 'px' : '';
			this.content.style.zoom = zoom || '';
		};
		
	}
})();

EasyScroller.prototype.reflow = function() {

    console.log('reflow');
	// set the right scroller dimensions
	this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);

	// refresh the position for zooming purposes
	var rect = this.container.getBoundingClientRect();
	this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);
	
};
function isTouchDevice() {
    return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
}
function isInput(el) {
    var tagName = el && el.tagName && el.tagName.toLowerCase();
    return (tagName == 'input' && el.type != 'button' && el.type != 'radio' && el.type != 'checkbox') || (tagName == 'textarea');
}
function getActiveElement() {
    try {
        return document.activeElement;  // can get exeption in IE8
    } catch(e) {
    }
}
function getViewport() {    // Note viewport sizing broken in Android 2.x see http://stackoverflow.com/questions/6601881/problem-with-meta-viewport-and-android

    var viewport = {
        left: window.pageXOffset,   // http://www.quirksmode.org/mobile/tableViewport.html
        top: window.pageYOffset,
        width: window.innerWidth || documentElement.clientWidth,
        height: window.innerHeight || documentElement.clientHeight
    };
    if (isTouchDevice() && isInput(getActiveElement())) {     // iOS *lies* about viewport size when keyboard is visible. See http://stackoverflow.com/questions/2593139/ipad-web-app-detect-virtual-keyboard-using-javascript-in-safari Input focus/blur can indicate, also scrollTop:
        return {
            left: viewport.left,
            top: viewport.top,
            width: viewport.width,
            height: viewport.height * (viewport.height > viewport.width ? 0.66 : 0.45)  // Fudge factor to allow for keyboard on iPad
        };
    }
    return viewport;
}
function isInputEvent (e) {
    return e.touches[0] && e.touches[0].target && isInput(e.touches[0].target)
}

EasyScroller.prototype.bindEvents = function() {

	var that = this;

	// reflow handling
    var reflow = Utils.throttle(function () {
        that.reflow();
    }, 300);
	window.addEventListener("resize", reflow, false);
    window.addEventListener("DOMNodeInserted", reflow, false);
    window.addEventListener("DOMNodeRemoved", reflow, false);

	// touch devices bind touch events
	if ('ontouchstart' in window) {

        var __hasStarted = false;
        var __viewportSize = getViewport();
		this.container.addEventListener("touchstart", function(e) {
			// Don't react if initial down happens on a form element
			if (isInputEvent(e)) {
                reflow(); // it is possible, that on mobile devices keyboard will appear
                return;
			}
			that.scroller.doTouchStart(e.touches, e.timeStamp);
		}, false);
        this.container.parentNode.addEventListener("touchmove", function (e) {
            e.preventDefault();
        });
        this.container.addEventListener("touchmove", function(e) {
            that.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
		}, false);

        this.container.addEventListener("touchend", function(e) {
            if (isInputEvent(e)) {
                console.log('touchend', __viewportSize, getViewport());
            }
            that.scroller.doTouchEnd(e.timeStamp);
		}, false);

        this.container.addEventListener("touchcancel", function(e) {
            if (isInputEvent(e)) {
                console.log('touchcancel', __viewportSize, getViewport());
            }
			that.scroller.doTouchEnd(e.timeStamp);
		}, false);

	// non-touch bind mouse events
	} else {
		
		var mousedown = false;

		this.container.addEventListener("mousedown", function(e) {

			if (e.target.tagName.match(/input|textarea|select/i)) {
				return;
			}
		
			that.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			mousedown = true;
			e.preventDefault();

		}, false);

		document.addEventListener("mousemove", function(e) {

			if (!mousedown) {
				return;
			}
			
			that.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			mousedown = true;

		}, false);

		document.addEventListener("mouseup", function(e) {

			if (!mousedown) {
				return;
			}
			
			that.scroller.doTouchEnd(e.timeStamp);

			mousedown = false;

		}, false);

		this.container.addEventListener("mousewheel", function(e) {
			if(that.options.zooming) {
				that.scroller.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);	
				e.preventDefault();
			}
		}, false);

	}

};