<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<div id="textureImageModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="gridSystemModalLabel">Texture Image</h4>
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