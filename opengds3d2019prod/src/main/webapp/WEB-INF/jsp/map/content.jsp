<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<div class="builderContent container-fluid">
	<div class="row">
		<div class="col-xs-7 col-sm-9 col-md-10">
			<div class="row">
				<div class="col-xs-12 col-sm-12 col-md-6" style="padding: 0;">
					<div class="bind" style="width: 100%;"></div>
				</div>
				<div class="col-xs-12 col-sm-12 col-md-6" style="padding: 0; background-color: #bfbfbf;">
					<div class="cesium-three">Cesium</div>
				</div>
			</div>
		</div>
		<div class="col-xs-5 col-sm-3 col-md-2">
			<div class="row attribute-content">
				<div class="col-md-12 gb-attribute-container">
					<ul class="nav nav-tabs" role="tablist">
						<li role="presentation" class="active">
							<a href="#attrObject" role="tab" data-toggle="tab"><spring:message code="lang.object" /></a>
						</li>
						<li role="presentation">
							<a href="#attrLayer" role="tab" data-toggle="tab"><spring:message code="lang.layer" /></a>
						</li>
						<li role="presentation">
							<a href="#attrDeclare" role="tab" data-toggle="tab"><spring:message code="lang.declare" /></a>
						</li>
					</ul>
					<div class="tab-content gb-attribute-item">
						<div role="tabpanel" class="tab-pane active" id="attrObject">
							<div class="gb-article" style="margin: 0px; height: 100%; display: flex; flex-direction: column;">
								<div class="gb-article-head">
									<div>
										<p class="gb-openlayers-title">Now editing</p>
									</div>
								</div>
								<div class="gb-article-body jstreeol3 jstreeol3-1" style="overflow-y: auto; flex: 1 1 0%;">
								</div>
							</div>
						</div>
						<div role="tabpanel" class="tab-pane" id="attrLayer">
							<div class="builderLayerClientPanel"></div>
						</div>
						<div role="tabpanel" class="tab-pane" id="attrDeclare">
							<div class="Panel" style="border-top: 0px; padding-top: 20px; display: block;">
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-12 gb-attribute-container">
					<ul class="nav nav-tabs nav-justified" role="tablist">
						<li role="presentation" class="active">
							<a href="#attrAttr" role="tab" data-toggle="tab"><spring:message code="lang.attribute" /></a>
						</li>
						<li role="presentation">
							<a href="#attrStyle" role="tab" data-toggle="tab"><spring:message code="lang.style" /></a>
						</li>
						<li role="presentation">
							<a href="#attrMaterial" role="tab" data-toggle="tab"><spring:message code="lang.material" /></a>
						</li>
					</ul>
					<div class="tab-content gb-attribute-item">
						<div role="tabpanel" class="tab-pane active" id="attrAttr">
							<div class="gb-object-row">
								<span class="Text">Type</span>
								<span class="Text">Mesh</span>
							</div>
							<div class="gb-object-row">
								<span class="Text">UUID</span>
								<input class="Input" disabled="" style="padding: 2px; border: 1px solid transparent; width: 102px; font-size: 12px;">
								<button class="Button" style="margin-left: 7px;">New</button>
							</div>
							<div class="gb-object-row">
								<span class="Text">Name</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Position</span>
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
							</div>
							<div class="gb-object-row">
								<span class="Text">Rotation</span>
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
							</div>
							<div class="gb-object-row">
								<span class="Text">Scale</span>
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Fov</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Left</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Right</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Top</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Bottom</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Near</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Far</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Intensity</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Color</span>
								<input class="Color" type="color" style="width: 64px; height: 17px; border: 0px; padding: 2px; background-color: transparent;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Ground Color</span>
								<input class="Color" type="color" style="width: 64px; height: 17px; border: 0px; padding: 2px; background-color: transparent;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Distance</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Angle</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Penumbra</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row" style="display: none;">
								<span class="Text">Decay</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Shadow</span>
								<span style="margin-right: 10px;">
									<input class="Checkbox" type="checkbox">
									<span class="Text" style=" margin-left: 3px;">cast</span>
								</span>
								<span style="margin-right: 10px;">
									<input class="Checkbox" type="checkbox">
									<span class="Text" style=" margin-left: 3px;">receive</span>
								</span>
								<input class="gb-object-input" style="background-color: transparent; cursor: col-resize; display: none;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Visible</span>
								<input class="Checkbox" type="checkbox">
							</div>
							<div class="gb-object-row">
								<span class="Text">Render Order</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">User data</span>
								<textarea class="TextArea" spellcheck="false" style="padding: 2px; width: 150px; height: 40px; font-size: 12px; border-color: transparent;"></textarea>
							</div>
						</div>
						<div role="tabpanel" class="tab-pane" id="attrStyle">Style</div>
						<div role="tabpanel" class="tab-pane" id="attrMaterial">Material</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>