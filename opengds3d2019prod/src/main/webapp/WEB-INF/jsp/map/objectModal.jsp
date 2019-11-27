<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!-- ThreeJS Object 타입 선택 Modal -->
<div id="pointObjectCreateModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">3D Object Attribute</h4>
			</div>
			<div class="modal-body">
				<div class="gb-object-row" data-val="type">
					<span class="Text">Type</span>
					<select class="form-control" style="flex: 1;">
						<option value="box">Box</option>
						<option value="cylinder">Cylinder</option>
						<option value="circle">Circle</option>
						<option value="dodecahedron">Dodecahedron</option>
						<option value="icosahedron">Icosahedron</option>
					</select>
				</div>
				<div class="type-content">
					<div class="gb-object-row" data-val="width">
						<span class="Text">Width</span>
						<input class="form-control" style="flex: 1;" value="40">
					</div>
					<div class="gb-object-row" data-val="height">
						<span class="Text">Height</span>
						<input class="form-control" style="flex: 1;" value="40">
					</div>
					<div class="gb-object-row" data-val="depth">
						<span class="Text">Depth</span>
						<input class="form-control" style="flex: 1;" value="40">
					</div>
				</div>
				<div class="gb-object-row" data-val="texture">
					<span class="Text">Texture</span>
					<input class="form-control" style="flex: 1;">
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" id="pointObjectConfirm" class="btn btn-primary"><spring:message code="lang.confirm" /></button>
			</div>
		</div>
	</div>
</div>

<div id="lineObjectCreateModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">3D Object Attribute</h4>
			</div>
			<div class="modal-body">
				<div class="type-content">
					<div class="gb-object-row" data-val="width">
						<span class="Text">Width</span>
						<input class="form-control" style="flex: 1;" placeholder="default 40">
					</div>
					<div class="gb-object-row" data-val="depth">
						<span class="Text">Depth</span>
						<input class="form-control" style="flex: 1;" placeholder="default 40">
					</div>
				</div>
				<div class="gb-object-row" data-val="texture">
					<span class="Text">Texture</span>
					<input class="form-control" style="flex: 1;">
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" id="lineObjectConfirm" class="btn btn-primary"><spring:message code="lang.confirm" /></button>
			</div>
		</div>
	</div>
</div>

<div id="polygonObjectCreateModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog modal-sm">
		<div class="modal-content">
			<div class="modal-header">
				<h4 class="modal-title">3D Object Attribute</h4>
			</div>
			<div class="modal-body">
				<div class="type-content">
					<div class="gb-object-row" data-val="depth">
						<span class="Text">Depth</span>
						<input class="form-control" style="flex: 1;" placeholder="default 50">
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" id="polygonObjectConfirm" class="btn btn-primary"><spring:message code="lang.confirm" /></button>
			</div>
		</div>
	</div>
</div>

<!-- Texture 선택 Modal -->
<div id="textureImageModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Texture Image</h4>
			</div>
			<div class="modal-body">
				<div class="row">
					<div class="col-md-4">
						<div class="gb-article">
							<div class="gb-article-head" style="background-color: rgb(51, 122, 183);">
								<label>
									<input type="radio" name="basemap" value="worldLight">
									<span style="vertical-align: text-bottom; margin: 5px; color: rgb(255, 255, 255);">World Light</span>
								</label>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="gb-article">
							<div class="gb-article-head" style="background-color: rgb(51, 122, 183);">
								<label>
									<input type="radio" name="basemap" value="worldLight">
									<span style="vertical-align: text-bottom; margin: 5px; color: rgb(255, 255, 255);">World Light</span>
								</label>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="gb-article">
							<div class="gb-article-head" style="background-color: rgb(51, 122, 183);">
								<label>
									<input type="radio" name="basemap" value="worldLight">
									<span style="vertical-align: text-bottom; margin: 5px; color: rgb(255, 255, 255);">World Light</span>
								</label>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="gb-article">
							<div class="gb-article-head" style="background-color: rgb(51, 122, 183);">
								<label>
									<input type="radio" name="basemap" value="worldLight">
									<span style="vertical-align: text-bottom; margin: 5px; color: rgb(255, 255, 255);">World Light</span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="lang.close" /></button>
				<button type="button" id="textrueImageConfirm" class="btn btn-primary"><spring:message code="lang.confirm" /></button>
			</div>
		</div>
	</div>
</div>