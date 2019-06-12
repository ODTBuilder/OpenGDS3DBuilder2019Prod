var gb;
if (!gb)
	gb = {};
if (!gb.layer)
	gb.layer = {};

/**
 * @classdesc
 * 레이어 속성 정보 객체를 정의한다.
 * @class gb.layer.Attribute
 * @memberof gb.layer
 * @constructor
 * @param {Object} obj - gb.layer.Attribute 생성 옵션
 * @param {string} obj.fieldName - 속성 컬럼명
 * @param {string} obj.type - 속성 타입
 * @param {number} [obj.decimal] - Double 타입값 소수점 자리수 허용 범위
 * @param {number} [obj.size] - 값 크기
 * @param {boolean} [obj.nullable=true] - null 허용 여부
 * @author KIM HOCHUL
 * @date 2019. 03. 29
 * @version 0.01
 */
gb.layer.Attribute = function(obj) {
	var options = obj;
	this.originFieldName = options.fieldName ? options.fieldName : null;
	this.fieldName = options.fieldName ? options.fieldName : null;
	this.type = options.type ? options.type : null;
	this.decimal = options.decimal ? options.decimal : null;
	this.size = options.size ? options.size : null;
	this.isUnique = options.isUnique ? options.isUnique : null;
	this.nullable = options.nullable !== undefined ? options.nullable : true;
	this.isNew = options.isNew ? options.isNew : true;
}

/**
 * original 속성 컬럼명을 설정한다.
 * @method gb.layer.Attribute#setOriginFieldName
 * @function
 * @param {string} fname - 속성명
 */
gb.layer.Attribute.prototype.setOriginFieldName = function(fname) {
	this.fieldName = fname;
};

/**
 * original 속성 컬럼명을 반환한다.
 * @method gb.layer.Attribute#getOriginFieldName
 * @function
 * @return {string}
 */
gb.layer.Attribute.prototype.getOriginFieldName = function() {
	return this.fieldName;
};

/**
 * 속성 컬럼명을 설정한다.
 * @method gb.layer.Attribute#setFieldName
 * @function
 * @param {string} fname - 속성명
 */
gb.layer.Attribute.prototype.setFieldName = function(fname) {
	this.fieldName = fname;
};

/**
 * 속성 컬럼명을 반환한다.
 * @method gb.layer.Attribute#getFieldName
 * @function
 * @return {string}
 */
gb.layer.Attribute.prototype.getFieldName = function() {
	return this.fieldName;
};

/**
 * 속성 컬럼 타입을 설정한다.
 * @method gb.layer.Attribute#setType
 * @function
 * @param {string} type - 속성 컬럼 타입
 */
gb.layer.Attribute.prototype.setType = function(type) {
	this.type = type;
};

/**
 * 속성 컬럼 타입을 반환한다.
 * @method gb.layer.Attribute#getType
 * @function
 * @return {string}
 */
gb.layer.Attribute.prototype.getType = function() {
	return this.type;
};

/**
 * 속성 컬럼값 소수점 자리수 허용범위를 설정한다.
 * @method gb.layer.Attribute#setDecimal
 * @function
 * @param {number} dcm - 소수점 자리수 허용범위
 */
gb.layer.Attribute.prototype.setDecimal = function(dcm) {
	this.decimal = dcm;
};

/**
 * 속성 컬럼값 소수점 자리수 허용범위를 반환한다.
 * @method gb.layer.Attribute#getDecimal
 * @function
 * @return {number}
 */
gb.layer.Attribute.prototype.getDecimal = function() {
	return this.decimal;
};

/**
 * 속성 컬럼값 크기 허용범위를 설정한다.
 * @method gb.layer.Attribute#setSize
 * @function
 * @param {number} size - 속성 컬럼값 크기 허용범위
 */
gb.layer.Attribute.prototype.setSize = function(size) {
	this.size = size;
};

/**
 * 속성 컬럼값 크기 허용범위를 반환한다.
 * @method gb.layer.Attribute#getSize
 * @function
 * @return {number}
 */
gb.layer.Attribute.prototype.getSize = function() {
	return this.size;
};
gb.layer.Attribute.prototype.setUnique = function(unq) {
	this.isUnique = unq;
};
gb.layer.Attribute.prototype.getUnique = function() {
	return this.isUnique;
};

/**
 * 속성 컬럼값 null 허용 여부를 설정한다.
 * @method gb.layer.Attribute#setNull
 * @function
 * @return {boolean}
 */
gb.layer.Attribute.prototype.setNull = function(nll) {
	this.nullable = nll;
};

/**
 * 속성 컬럼값 null 허용 여부를 반환한다.
 * @method gb.layer.Attribute#getNull
 * @function
 * @return {boolean}
 */
gb.layer.Attribute.prototype.getNull = function() {
	return this.nullable;
};

/**
 * 현재 객체의 속성값을 복사한 새로운 gb.layer.Attribute 객체를 반환한다.
 * @method gb.layer.Attribute#clone
 * @function
 * @return {gb.layer.Attribute}
 */
gb.layer.Attribute.prototype.clone = function() {
	var that = this;
	var obj = new gb.layer.Attribute({
		originFieldName : this.getOriginFieldName(),
		fieldName : this.getFieldName(),
		type : this.getType(),
		decimal : this.getDecimal(),
		size : this.getSize(),
		isUnique : this.getUnique(),
		nullable : this.getNull()
	});
	return obj;
};

/**
 * 현재 객체의 속성값을 복사한 Object를 반환한다.
 * @method gb.layer.Attribute#getStructure
 * @function
 * @return {Object.<string, *>}
 */
gb.layer.Attribute.prototype.getStructure = function() {
	var that = this;
	var obj;
	if (this.isNew === true) {
		obj = {
			fieldName : this.getFieldName(),
			type : this.getType(),
			decimal : this.getDecimal(),
			size : this.getSize(),
			isUnique : this.getUnique(),
			nullable : this.getNull()
		};
	} else {
		obj = {
			originFieldName : this.getOriginFieldName(),
			fieldName : this.getFieldName(),
			type : this.getType(),
			decimal : this.getDecimal(),
			size : this.getSize(),
			isUnique : this.getUnique(),
			nullable : this.getNull()
		};
	}
	return obj;
};