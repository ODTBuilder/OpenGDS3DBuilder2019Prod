<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<div class="builderContent container-fluid">
	<div class="row">
		<div class="col-xs-7 col-sm-9 col-md-10">
			<div class="row">
				<div class="col-xs-12 col-sm-12 col-md-6" style="padding: 0;">
					<div class="area-2d"></div>
				</div>
				<div class="col-xs-12 col-sm-12 col-md-6" style="padding: 0; background-color: #bfbfbf;">
					<div class="area-3d"></div>
				</div>
			</div>
		</div>
		<div class="col-xs-5 col-sm-3 col-md-2">
			<div class="row attribute-content">
				<div class="col-md-12 gb-attribute-container">
					<ul class="nav nav-tabs" role="tablist">
						<li role="presentation" class="active">
							<a href="#attrLayer" role="tab" data-toggle="tab"><spring:message code="lang.layer" /></a>
						</li>
						<li role="presentation">
							<a href="#attrObject" role="tab" data-toggle="tab"><spring:message code="lang.objectlist" /></a>
						</li>
						<li role="presentation">
							<a href="#attrDeclare" role="tab" data-toggle="tab"><spring:message code="lang.declare" /></a>
						</li>
					</ul>
					<div class="tab-content gb-attribute-item">
						<div role="tabpanel" class="tab-pane active" id="attrLayer">
							<div class="builderLayerClientPanel"></div>
						</div>
						<div role="tabpanel" class="tab-pane" id="attrObject">
						</div>
						<div role="tabpanel" class="tab-pane" id="attrDeclare">
							<!-- <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
								<div class="panel panel-default"  id="declareTemp" style="display: none;">
									<div class="panel-heading" role="tab" id="headingOne">
										<h4 class="panel-title gb-flex-between">
											<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse1" aria-expanded="true" aria-controls="collapseOne">
												TileSet #1
											</a>
											<select class="form-control" style="flex: 0 0 90px;">
												<option>Key1</option>
												<option>Key2</option>
												<option>Key3</option>
											</select>
										</h4>
									</div>
									<div id="collapse1" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
										<div class="panel-body">
											<div class="gb-declare-row">
												<span class="Text">Condition</span>
												<span class="Text">Value</span>
												<span class="Text">Color</span>
												<span class="Text">Hide</span>
												<span class="Text"><a href="#"><i class="fas fa-plus"></i></a></span>
											</div>
											<div class="gb-declare-row">
												<div class="gb-declare-item">
													<select class="form-control">
														<option>&lt=</option>
														<option>&gt=</option>
														<option>&lt</option>
														<option>&gt</option>
														<option>=</option>
													</select>
												</div>
												<div class="gb-declare-item">
													<input class="form-control">
												</div>
												<div class="gb-declare-item">
													<input class="form-control">
												</div>
												<div class="gb-declare-item">
													<input type="checkbox">
												</div>
												<a href="#"><i class="far fa-trash-alt"></i></a>
											</div>
										</div>
									</div>
								</div>
								<div class="panel panel-default">
									<div class="panel-heading" role="tab" id="heading2">
										<h4 class="panel-title gb-flex-between">
											<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse2" aria-expanded="true" aria-controls="collapse2">
												TileSet #2
											</a>
											<select class="form-control" style="flex: 0 0 90px;">
												<option>Key1</option>
												<option>Key2</option>
												<option>Key3</option>
											</select>
										</h4>
									</div>
									<div id="collapse2" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading2">
										<div class="panel-body">
											<div class="gb-declare-row">
												<span class="Text">Condition</span>
												<span class="Text">Value</span>
												<span class="Text">Color</span>
												<span class="Text">Hide</span>
												<span class="Text"><a href="#"><i class="fas fa-plus"></i></a></span>
											</div>
										</div>
									</div>
								</div>
							</div> -->
						</div>
					</div>
				</div>
				<div class="col-md-12 gb-attribute-container">
					<ul class="nav nav-tabs nav-justified" role="tablist">
						<li role="presentation" class="active">
							<a href="#attrAttr" role="tab" data-toggle="tab"><spring:message code="lang.objectinfo" /></a>
						</li>
						<li role="presentation">
							<a href="#attrStyle" role="tab" data-toggle="tab"><spring:message code="lang.geometryinfo" /></a>
						</li>
						<li role="presentation">
							<a href="#attrMaterial" role="tab" data-toggle="tab"><spring:message code="lang.material" /></a>
						</li>
					</ul>
					<div class="tab-content gb-attribute-item">
						<div role="tabpanel" class="tab-pane active" id="attrAttr" style="position: relative;">
							<!-- <div class="gb-object-row" data-key="type">
								<span class="Text">Type</span>
								<span class="Text">Mesh</span>
							</div>
							<div class="gb-object-row" data-key="uuid">
								<span class="Text">UUID</span>
								<input class="Input" disabled="" style="padding: 2px; border: 1px solid transparent; width: 102px; font-size: 12px;">
								<button class="Button" style="margin-left: 7px;">New</button>
							</div> -->
							<!-- <div class="gb-object-row" data-key="name">
								<span class="Text">Name</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row" data-key="position">
								<span class="Text">Position</span>
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
							</div>
							<div class="gb-object-row" data-key="rotation">
								<span class="Text">Rotation</span>
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
							</div>
							<div class="gb-object-row" data-key="scale">
								<span class="Text">Scale</span>
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
								<input class="form-control gb-object-input">
							</div> -->
							<!-- <div class="gb-object-row">
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
							</div> -->
							<!-- <div class="gb-object-row" data-key="visible">
								<span class="Text">Visible</span>
								<input class="Checkbox" type="checkbox">
							</div>
							<div class="gb-object-row" data-key="userData">
								<span class="Text">User data</span>
								<textarea class="TextArea" spellcheck="false" style="padding: 2px; width: 150px; height: 40px; font-size: 12px; border-color: transparent;"></textarea>
							</div> -->
						</div>
						<div role="tabpanel" class="tab-pane" id="attrStyle">
							<!-- <div class="gb-object-row">
								<span class="Text">Opacity</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Width</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Height</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Radius</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Color</span>
								<input id="styleColor" class="form-control" style="flex: 1;">
							</div> -->
						</div>
						<div role="tabpanel" class="tab-pane" id="attrMaterial">
							<!-- <div class="gb-object-row">
								<span class="Text">Blending</span>
								<select class="form-control" style="flex: 1;">
									<option>hochul</option>
								</select>
							</div>
							<div class="gb-object-row">
								<span class="Text">Wireframe</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Roughness</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Metalness</span>
								<input class="form-control" style="flex: 1;">
							</div>
							<div class="gb-object-row">
								<span class="Text">Texture</span>
								<input class="form-control" style="flex: 1;">
								<img id="textureImage" src="resources/img/git_new_logo.png" alt="..." class="img-thumbnail" data-toggle="modal" data-target="#textureImageModal">
							</div>
							<div class="gb-object-row">
								<span class="Text">Emissive</span>
								<input id="textureEmissive" class="form-control" style="flex: 1;">
							</div> -->
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>