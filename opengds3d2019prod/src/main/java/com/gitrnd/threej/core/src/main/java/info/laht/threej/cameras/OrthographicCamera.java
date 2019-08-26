/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras;

/**
 *
 * @author laht
 */
public class OrthographicCamera extends Camera {

    public int zoom;
    private CameraView view = null;

    public int left;
    public int right;
    public int top;
    public int bottom;

    public double near;
    public double far;

    public OrthographicCamera(int left, int right, int top, int bottom, double near, double far) {
        this.zoom = 1;
        this.view = null;

        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;

        this.near = near;
        this.far = far;
    }

    public void setViewOffset(int fullWidth, int fullHeight, int x, int y, int width, int height) {
        this.view = new CameraView(fullWidth, fullHeight, x, y, width, height);
        updateProjectionMatrix();
    }

    public void clearViewOffset() {
        this.view = null;
        this.updateProjectionMatrix();
    }

    public void updateProjectionMatrix() {
        int dx = (this.right - this.left) / (2 * this.zoom);
        int dy = (this.top - this.bottom) / (2 * this.zoom);
        int cx = (this.right + this.left) / 2;
        int cy = (this.top + this.bottom) / 2;

        int left = cx - dx;
        int right = cx + dx;
        int top = cy + dy;
        int bottom = cy - dy;

        if (this.view != null) {

            int zoomW = this.zoom / (this.view.width / this.view.fullWidth);
            int zoomH = this.zoom / (this.view.height / this.view.fullHeight);
            int scaleW = (this.right - this.left) / this.view.width;
            int scaleH = (this.top - this.bottom) / this.view.height;

            left += scaleW * (this.view.offsetX / zoomW);
            right = left + scaleW * (this.view.width / zoomW);
            top -= scaleH * (this.view.offsetY / zoomH);
            bottom = top - scaleH * (this.view.height / zoomH);

        }

        this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
    }

    public OrthographicCamera copy(OrthographicCamera source) {

        super.copy(source);

        this.left = source.left;
        this.right = source.right;
        this.top = source.top;
        this.bottom = source.bottom;
        this.near = source.near;
        this.far = source.far;

        this.zoom = source.zoom;
        this.view = source.view == null ? null : source.view.copy();

        return this;

    }

}
