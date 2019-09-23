/*
 * 사용하지않는 Class
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.UI)
	gb3d.UI = {};

gb3d.UI.Texture = function ( obj, key ) {
	var that = this;
	
	this.threeObject = obj || undefined;
	if(!this.threeObject){
		return;
	}
	this.key = key || "map";
	
	var span, canvas, input, fileInput;
	
	canvas = $("<img width='64' height='32' style='cursor: pointer; margin-right: 5px; border: 1px solid rgb(136, 136, 136);'>");
	input = $("<p style='border: 1px solid rgb(204, 204, 204);'>");
	fileInput = $("<input type='file' accept='image/*' style='display: none;'>");
	this.span = $("<span>").append(canvas);
	this.texture = null;
	
	fileInput.change(function() {
		var file, reader, output, image;
		
		if (!!this.files) {
			file = this.files[0];
			
			if(!file){
				return;
			}
			
			if (file.type.match(/image/g) === null){
				alert("Not Image");
				return;
			}
			
			if (file.size > 0) {
				reader = new FileReader();
				reader.onload = function() {
					output = canvas;
					image = new Image();

					output[0].src = reader.result;
					image.src = reader.result;
					
					image.onload = function(){
						var texture = new THREE.Texture( image );
//						var texture = new THREE.TextureLoader().load(this.src);
//						texture.sourceFile = file.name;
//						texture.format = file.type === 'image/jpeg' ? THREE.RGBFormat : THREE.RGBAFormat;
						texture.needsUpdate = true;
//						texture.encoding = THREE.sRGBEncoding;
						texture.minFilter = THREE.LinearFilter;
						
						that.threeObject.material[that.key] = THREE.ImageUtils.loadTexture( this.src );
						that.threeObject.material.needsUpdate = true;
						that.setValue( texture );
					}
				}
				reader.readAsDataURL(file);
			}
		}
	});
	
	canvas.on("click", function(e){
		fileInput.click();
	});
	
	return this;
}

gb3d.UI.Texture.prototype.setValue = function ( texture ) {
	this.texture = texture;
};