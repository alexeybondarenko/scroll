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
function offsetTop (element) {
    var result = element.offsetTop;
    if (/webkit.*mobile/i.test(navigator.userAgent)) {
        result.top -= window.scrollY;
    }
    return result;
}
window.getOffsetTop = offsetTop;
function getActiveElement() {
    try {
        return document.activeElement;  // can get exeption in IE8
    } catch (e) {
    }
}

function isInput(el) {
    var tagName = el && el.tagName && el.tagName.toLowerCase();
    return (tagName == 'input' && el.type != 'button' && el.type != 'radio' && el.type != 'checkbox') || (tagName == 'textarea' || tagName == 'label' || tagName == 'form');
}
function isInputEvent (e) {
    return e.touches[0] && e.touches[0].target && isInput(e.touches[0].target)
}
function isAndroid () {
    return /Android/i.test(navigator.userAgent);
}
EasyScroller.prototype.bindEvents = function() {

    var that = this;
    // reflow handling
    var reflow = Utils.throttle(function () {
        that.reflow();
    }, 300);

    window.addEventListener("resize", Utils.debounce(function () {
        that.reflow();
    }, 300), false);
    window.addEventListener("DOMNodeInserted", Utils.debounce(function () {
        that.reflow();
    }, 600), false);
    window.addEventListener("DOMNodeRemoved", Utils.debounce(function () {
        that.reflow();
    }, 300), false);

    function waitForEvent (event, callback) {
        var listener = function () {
            callback();
            window.removeEventListener(event, listener);
        };
        window.addEventListener(event, listener, false);
    }
    function scrollToElement (element) {
        console.log('scroll to element', element);
        var topElement = angular.element(element).offset().top;
        waitForEvent('resize', function () {
            console.log('scroll to element: resize', element, that.scroller, topElement);
            that.scroller.scrollTo(0, topElement - 50, false, 1);
            element.focus();
        });
    }
    window.scroll = that; // for test from console

    // touch devices bind touch events
    if ('ontouchstart' in window) {

        var focusedInput = null;
        var __isTouchDevice = isTouchDevice();
        var __isAndroid = isAndroid();

        this.container.addEventListener("touchstart", function(e) {
            // Don't react if initial down happens on a form element
            if (isInputEvent(e)) {
                //if (focusedInput) return;
                if (__isTouchDevice) {
                    scrollToElement(e.touches[0].target);
                    focusedInput = true;
                }
                return;
            }

            if (focusedInput) {
                console.log('blur', focusedInput);
                getActiveElement().blur();
                focusedInput = false;
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
            that.scroller.doTouchEnd(e.timeStamp);
        }, false);

        this.container.addEventListener("touchcancel", function(e) {
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