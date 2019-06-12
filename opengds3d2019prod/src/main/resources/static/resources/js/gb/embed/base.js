/**
 * @classdesc 임베드 객체를 정의한다.
 * 
 * @class gb.embed.EmbedBase
 * @memberof gb.embed
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {(function|HTMLElement)}
 *            obj.body - 객체 본문에 포함될 내용
 * @param {HTMLElement}
 *            obj.append - 객체 본문이 포함될 부모객체
 * @author SOYIJUN
 * 
 */
gb.embed.EmbedBase = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	var body = typeof options.body === "function" ? options.body() : $(options.body);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panelBody = $("<div>").addClass("panel-body");
	if (body) {
		$(this.panelBody).append(body);
	}
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panel = $("<div>").addClass("panel").addClass("panel-default").append(this.panelBody);
	if (typeof options.append === "string") {
		$(options.append).append(this.panel);
	}
};
/**
 * 객체 본문을 설정한다.
 * 
 * @method gb.embed.EmbedBase#setEmbedBody
 * @param {(function|HTMLElement)}
 *            body - 객체 본문에 포함될 내용
 */
gb.embed.EmbedBase.prototype.setEmbedBody = function(body) {
	if (typeof body === "function") {
		$(this.panelBody).append(body());
	} else {
		$(this.panelBody).append(body);
	}
};
/**
 * 객체 본문을 반환한다.
 * 
 * @method gb.embed.EmbedBase#getEmbedBody
 * @return {HTMLElement} 객체 본문
 */
gb.embed.EmbedBase.prototype.getEmbedBody = function() {
	return this.panelBody;
};
/**
 * 패널을 반환한다.
 * 
 * @method gb.embed.EmbedBase#getEmbed
 * @return {HTMLElement} 본문을 감싸고 있는 객체 경계
 */
gb.embed.EmbedBase.prototype.getEmbed = function() {
	return this.panel;
};
/**
 * 패널을 나타낸다.
 * 
 * @method gb.embed.EmbedBase#open
 */
gb.embed.EmbedBase.prototype.open = function() {
	this.panel.css("display", "block");
};
/**
 * 패널을 숨긴다.
 * 
 * @method gb.embed.EmbedBase#close
 */
gb.embed.EmbedBase.prototype.close = function() {
	this.panel.css("display", "none");
};
