var gb;
if (!gb)
	gb = {};
if (!gb.header)
	gb.header = {};

/**
 * @classdesc
 * ol Map header 객체를 정의한다.
 * header를 생성하고 싶은 element를 인자값으로 받는다.
 * 해당 element는 반드시 relative position 이어야만 한다.
 * 필수 라이브러리: jQuery, fontawesome
 * @class gb.header.HeaderBase
 * @memberof gb.header
 * @constructor
 * @param {Object} obj - gb.header 생성 기본 옵션
 * @param {boolean} [obj.isDisplay=false] - 기본 Display 옵션. true일 시 header가 생성될 때 바로 가시화
 * @param {string} [obj.toggleClass="header-toggle-btn"] - 토글 이벤트를 생성할 element 클래스 이름
 * @param {HTMLElement} [obj.targetElement] - header를 생성할 element. 기본 body에 생성
 * @param {Array.<Object.<string, string>>} [obj.list] - header의 내용에 표시될 목록. content, icon, color 항목 필요
 * @param {string} [obj.locale="en"] - 언어 코드
 * @author KIM HOCHUL
 * @date 2019. 03. 25
 * @version 0.01
 */
gb.header.HeaderBase = function(obj) {
	var that = this;
	// 다국적 언어 지원
	this.translator = {
		"draw": {
			"en": "Draw",
			"ko": "그리기"
		},
		"move": {
			"en": "Move",
			"ko": "이동"
		},
		"rotate": {
			"en": "Transform",
			"ko": "변환"
		},
		"modify": {
			"en": "Modify",
			"ko": "수정"
		},
		"delete": {
			"en": "Delete",
			"ko": "삭제"
		},
		"undo": {
			"en": "Undo",
			"ko": "되돌리기"
		},
		"redo": {
			"en": "Redo",
			"ko": "다시하기"
		},
		"area": {
			"en": "Area",
			"ko": "면적"
		},
		"length": {
			"en": "Length",
			"ko": "길이"
		}
	}
	
	/**
	 * 최상위 element
	 * @type {n.fn.init.<HTMLDivElement>}
	 * @private
	 */
	this.headerTag = undefined;
	
	/**
	 * 좌측 ul element
	 * @type {n.fn.init.<HTMLDivElement>}
	 * @private
	 */
	this.ulTagLeft = undefined;
	
	/**
	 * 우측 ul element
	 * @type {n.fn.init.<HTMLDivElement>}
	 * @private
	 */
	this.ulTagRight = undefined;
	
	/**
	 * content list
	 * @type {Array.<n.fn.init.<HTMLDivElement>>}
	 * @private
	 */
	this.contentList = [];
	
	/**
	 * active header
	 * @type {boolean}
	 * @private
	 */
	this.active_ = false;
	
	// default list
	var defaultList = [
		{
			content: "Draw",
			icon: "fas fa-pencil-alt fa-lg",
			color: ""
		}
	];
	
	// element style 정의
	this.aStyle = {
		"color": "#555555"
	};
	
	this.iStyle = {
		
	};
	
	this.liStyle = {
		"display": "inline-block",
		"padding-left": "20px",
		"list-style-type": "none"
	};
	
	this.ulStyleLeft = {
		"margin-top": "14px",
		"padding": "0",
		"display": "inline-block",
		"font-size": "16px"
	};
	
	this.ulStyleRight = {
		"margin-top": "14px",
		"display": "inline-block",
		"float": "right",
		"font-size": "16px"
	};
	
	this.headerStyle = {
		"position": "absolute",
		"z-index": "3",
		"top": "0",
		"left": "0",
		"right": "0",
		"height": "52px",
		"background-color": "rgba(255,255,255, 0.78)",
		"box-shadow": "0px 0px 20px rgba(0,0,0, 0.5)"
	};
	
	this.closeBtnStyle = {
		"display": "inline-block",
		"float": "right",
		"padding": "0",
		"margin": "0",
		"border": "none",
		"background-color": "transparent",
		"cursor": "pointer",
		"outline": "none",
		"color": "rgb(85, 85, 85)"
	};
	
	this.closeSpanStyle = {
		"padding": "2px 8px",
		"font-size": "18px",
		"font-weight": "700"
	};
	
	var options = obj ? obj : {};
	this.locale = options.locale || "en";
	this.isDisplay = options.isDisplay ? true : false;
	this.toggleClass = options.toggleClass || "header-toggle-btn";
	this.targetElement = $(options.targetElement);
	this.list = options.list || defaultList;
	
	this.createContent(this.list);
	
	this.createToggleEvent(this.toggleClass);
	
	if(!this.isDisplay){
		this.closeTool();
	}
}

/**
 * header에 list content를 생성한다.
 * @method gb.header.HeaderBase#createContent
 * @param {Array.<Object.<string, string>>} list - header에 나열할 content list
 */
gb.header.HeaderBase.prototype.createContent = function(list){
	
	var that = this;
	
	// target element에 header가 이미 존재한다면 header element 삭제
	this.targetElement.find("header").remove();
	
	// content 저장 배열 초기화
	this.contentList = [];
	
	/**
	 * element style 적용 함수
	 * @method adjustStyle
	 * @param {n.fn.init} element - jQuery 선택자
	 * @param {Object} style - style정의 객체
	 * @private
	 */
	function adjustStyle(element, style){
		for(var content in style){
			element.css(content, style[content]);
		}
	}
	
	// header element 생성
	this.headerTag = $("<header>").addClass("gb-headerbase-header");
//	adjustStyle(this.headerTag, this.headerStyle);t
	
	this.ulTagLeft = $("<ul class='left-content'>").addClass("gb-headerbase-ul-lef");
//	adjustStyle(this.ulTagLeft, this.ulStyleLeft);
	
	this.ulTagRight = $("<ul class='right-conent'>").addClass("gb-headerbase-ul-right");
//	adjustStyle(this.ulTagRight, this.ulStyleRight);
	
	
	// close button 생성
	/*var closeBtn = $("<button>");
	adjustStyle(closeBtn, this.closeBtnStyle);
	closeBtn.hover(function(){
		$(this).css("color", "#4c6ef5");
	},function(){
		$(this).css("color", "rgb(85, 85, 85)");
	});
	
	closeBtn.click(function(){
		that.closeTool();
	});
	
	var closeSpan = $("<span>×</span>");
	adjustStyle(closeSpan, this.closeSpanStyle);
	
	closeBtn.append(closeSpan);*/
	
	// header content 생성
	var iTag, aTag, liTag;
	for(var i in list){
		iTag = $("<i>").addClass(list[i].icon).attr("aria-hidden", "true");
		
		aTag = $("<a>").addClass("gb-headerbase-a").attr("href", "#").attr("data-content", list[i].content);
		
		aTag.hover(function(){
			if(!$(this).hasClass("active")){
				$(this).css("color", "#23527c");
				$(this).css("text-decoration", "none");
			}
		},function(){
			if(!$(this).hasClass("active")){
				$(this).css("color", "rgb(85, 85, 85)");
			}
		});
		
		// content element 저장
		this.contentList.push(aTag);
		
		liTag = $("<li>").addClass("gb-headerbase-li");
		
		if(typeof list[i].clickEvent === "function"){
			aTag.click(list[i].clickEvent);
		}
		
		if(list[i].className){
			liTag.addClass(list[i].className);
		}
		
		if(list[i].color){
			iTag.css("color", list[i].color);
		}
		
//		adjustStyle(iTag, this.iStyle);
//		adjustStyle(aTag, this.aStyle);
//		adjustStyle(liTag, this.liStyle);
		
		if(this.translator[list[i].content]){
			aTag.html(this.translator[list[i].content][this.locale]);
		} else {
			aTag.html(list[i].content);
		}
		
		aTag.prepend(iTag);
		liTag.append(aTag);
		
		if(!list[i].float){
			this.ulTagLeft.append(liTag);
		} else {
			if(list[i].float === "right"){
				liTag.css("padding-left", "0").css("padding-right", "20px");
				this.ulTagRight.append(liTag);
			} else if(list[i].float === "left"){
				this.ulTagLeft.append(liTag);
			} else {
				this.ulTagLeft.append(liTag);
			}
		}
	}
	
	//this.headerTag.append(closeBtn);
	this.headerTag.append(this.ulTagLeft);
	this.headerTag.append(this.ulTagRight);
	
	this.targetElement.prepend(this.headerTag);
}

/**
 * header를 나타낸다.
 * @method gb.header.HeaderBase#openTool
 */
gb.header.HeaderBase.prototype.openTool = function(){
	if(this.active_){
		this.headerTag.css("display", "block");
		this.isDisplay = true;
	}
}

/**
 * header를 숨긴다
 * @method gb.header.HeaderBase#closeTool
 */
gb.header.HeaderBase.prototype.closeTool = function(){
	this.headerTag.css("display", "none");
	this.isDisplay = false;
}

/**
 * header open/close toggle
 * @method gb.header.HeaderBase#toggleTool
 */
gb.header.HeaderBase.prototype.toggleTool = function(){
	if(this.isDisplay){
		this.closeTool();
	} else {
		this.openTool();
	}
}

/**
 * header를 open, close 하는 이벤트 함수를 생성한다.
 * @method gb.header.HeaderBase#createToggleEvent
 * @param {string} className - header 토글 이벤트를 바인딩할 element의 클래스 이름
 */
gb.header.HeaderBase.prototype.createToggleEvent = function(className){
	var that = this;
	
	$("." + className).on("click", function(){
		that.toggleTool();
	});
}

/**
 * header 활성화 설정
 * @method gb.header.HeaderBase#setActiveTool
 * @param {boolean} bool - header 활성화 여부
 */
gb.header.HeaderBase.prototype.setActiveTool = function(bool){
	this.active_ = bool;
	
	if(bool){
		this.openTool();
	} else {
		this.closeTool();
	}
}

/**
 * header 활성화 설정값 반환
 * @method gb.header.HeaderBase#getActiveTool
 * @return {boolean} 
 */
gb.header.HeaderBase.prototype.getActiveTool = function(){
	return this.active_;
}