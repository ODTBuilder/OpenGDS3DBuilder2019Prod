var gb;
if (!gb)
	gb = {};
if (!gb.footer)
	gb.footer = {};

/**
 * @classdesc
 * ol Map footer 객체를 정의한다.
 * footer를 생성하고 싶은 element를 인자값으로 받는다.
 * 해당 element는 반드시 relative position 이어야만 한다.
 * @class gb.footer.FooterBase
 * @memberof gb.footer
 * @constructor
 * @param {Object} obj - gb.footer.FooterBase 생성 기본 옵션
 * @param {HTMLElement} obj.targetElement - footer를 생성할 element
 * @param {boolean} [obj.isDisplay=false] - Default display
 * @param {string} [obj.toggleTarget=.footer-toggle-btn] - footer 토글 이벤트 element 클래스명
 * @param {string} [obj.title] - footer 제목
 * @param {HTMLElement} [obj.content=$("<h4>content area</h4>")] - footer 내용
 * @author KIM HOCHUL
 * @date 2019. 03. 18
 * @version 0.01
 */
gb.footer.FooterBase = function(obj) {
	/**
	 * 최상위 element
	 * @private
	 * @type {HTMLElement}
	 */
	this.footerTag = $("<footer>").addClass("gb-footerbase");
	
	/**
	 * 내용 element
	 * @private
	 * @type {HTMLElement}
	 */
	this.contentTag = undefined;
	
	// element style 정의
//	this.footerStyle = {
//		"position": "absolute",
//		"z-index": "3",
//		"padding": "5px",
//		"bottom": "0",
//		"left": "0",
//		"right": "0",
//		"height": "30%",
//		"background": "linear-gradient(to bottom, rgba(52,71,98,0.8) 0%,rgba(38,35,35,0.8) 100%)",
//		"box-shadow": "0px 0px 20px rgba(0,0,0, 0.5)",
//		"color": "#DDD"
//	};
	
	this.titleAreaStyle = {
		"height": "20%",
		"padding": "8px 16px"
	};
	
	this.contentAreaStyle = {
		"height": "80%"
	};
	
	this.titleStyle = {
		"margin-top": "0"
	};
	
	var options = obj || {};
	this.isDisplay = options.isDisplay ? true : false;
	this.toggleTarget = options.toggleTarget || ".footer-toggle-btn";
	this.targetElement = $(options.targetElement);
	if(this.targetElement.length === 0){
		console.error("gb.footer.FooterBase: targetElement is a required field");
	}
	this.title = options.title;
	this.content = $(options.content) || $("<h4>content area</h4>");
	
	this.createFooter({
		title: this.title,
		content: this.content
	});
	
	// 토글 이벤트 생성
	this.createToggleEvent(this.toggleTarget);
	
	// 다른 foorter가 열려있거나 가시화 옵션이 false일 시 footer를 닫는다.
	if(!this.isDisplay || this.anotherFooterIsOpen()){
		this.close();
		this.isDisplay = false;
	}
}

/**
 * 다른 footer element를 연다.
 * @method gb.footer.FooterBase#anotherFooterIsOpen
 * @return {boolean} 다른 footer가 성공적으로 가시화되었을 때 True 반환
 */
gb.footer.FooterBase.prototype.anotherFooterIsOpen = function(){
	var bool = false;
	var that = this;
	this.targetElement.find("footer").each(function(){
		if(that.footerTag[0] !== this){
			if($(this).css("display") === "block"){
				bool = true;
			}
		}
	});
	return bool;
}

/**
 * 다른 footer element를 닫는다.
 * @method gb.footer.FooterBase#anotherFooterClose
 */
gb.footer.FooterBase.prototype.anotherFooterClose = function(){
	var that = this;
	this.targetElement.find("footer").each(function(){
		if(that.footerTag[0] !== this){
			if($(this).css("display") === "block"){
				$(this).css("display", "none");
			}
		}
	});
}


/**
 * element style 적용 함수
 * @method gb.footer.FooterBase#adjustStyle_
 * @param {n.fn.init} element - jQuery 선택자
 * @param {Object.<string, string>} style - style정의 객체
 * @private
 */
gb.footer.FooterBase.prototype.adjustStyle_ = function(element, style){
	for(var content in style){
		element.css(content, style[content]);
	}
}

/**
 * footer layout을 생성한다
 * @method gb.footer.FooterBase#createContent
 * @param {Object} opt - footer Tag 내부에 정의할 element 정보
 * @param {string} opt.title - footer Title
 * @param {HTMLElement} opt.content - footer Content
 */
gb.footer.FooterBase.prototype.createFooter = function(opt){
	
	var that = this;
	
	// footer Tag 초기화
	this.footerTag.empty();
	
//	this.adjustStyle_(this.footerTag, this.footerStyle);
	
	var titleArea = $("<div>").addClass(opt.titleClass || "gb-footerbase-wrapper-title");
//	this.adjustStyle_(titleArea, this.titleAreaStyle);
	
	this.contentTag = $("<div>").addClass(opt.contentClass || "gb-footerbase-wrapper-content");
//	this.adjustStyle_(this.contentTag, this.contentAreaStyle);
	
	this.title = opt.title || "";
	
	this.titleTag = $("<h3>").addClass("gb-footerbase-title");
//	this.adjustStyle_(this.titleTag, this.titleStyle);
	this.titleTag.text(this.title);
	
	titleArea.append(this.titleTag);
	this.footerTag.append(titleArea);
	
	if(!!opt.content){
		this.contentTag.append(opt.content);
		this.footerTag.append(this.contentTag);
	}
	
	this.targetElement.append(this.footerTag);
}

/**
 * footer를 나타낸다.
 * @method gb.footer.FooterBase#open
 */
gb.footer.FooterBase.prototype.open = function(){
	this.footerTag.css("display", "block");
	this.footerTag.addClass("footer-open").trigger("footeropen");
}

/**
 * footer를 숨긴다
 * @method gb.footer.FooterBase#close
 */
gb.footer.FooterBase.prototype.close = function(){
	this.footerTag.css("display", "none");
	this.footerTag.removeClass("footer-open").trigger("footerclose");
}

/**
 * 특정 element에 footer를 토글하는 이벤트를 생성한다.
 * @method gb.footer.FooterBase#createToggleEvent
 * @param {string} target - HTML Tag 클래스명 또는 ID
 */
gb.footer.FooterBase.prototype.createToggleEvent = function(target){
	var that = this;
	
	$(target).click(function(){
		if(that.footerTag.css("display") === "block"){
			that.close();
			that.isDisplay = false;
		} else {
			that.anotherFooterClose();
			that.open();
			that.isDisplay = true;
		}
	})
}

/**
 * footer의 제목을 설정한다.
 * @method gb.footer.FooterBase#setTitle
 * @param {string} title - 제목
 */
gb.footer.FooterBase.prototype.setTitle = function(title){
	if(typeof title === "string"){
		this.title = title;
		this.titleTag.text(title);
	}
}