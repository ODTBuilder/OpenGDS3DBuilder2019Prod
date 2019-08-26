/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class PerspectiveCamera extends Camera {

    public double fov;
    public double near, far;

    public double zoom;
    public double focus;
    public double aspect;
    public double filmGauge;
    public int filmOffset;

    private CameraView view;

    public PerspectiveCamera(int fov, double aspect, double near, double far) {

        this.fov = fov;
        this.near = near;
        this.far = far;
        this.zoom = 1;

        this.aspect = aspect;
        this.filmGauge = 35;
        this.filmOffset = 0;

        this.view = null;

    }

    public double getFilmWidth() {
        // film not completely covered in portrait format (aspect < 1)
        return this.filmGauge * Math.min(this.aspect, 1);
    }

    @Override
    public void setViewOffset(int fullWidth, int fullHeight, int x, int y, int width, int height) {
        this.aspect = (double) fullWidth / (double) fullHeight;
        this.view = new CameraView(fullWidth, fullHeight, x, y, width, height);
        this.updateProjectionMatrix();
    }

    @Override
    public void clearViewOffset() {
        this.view = null;
        this.updateProjectionMatrix();
    }

    @Override
    public void updateProjectionMatrix() {

        int top = Math.round((float) (near * Math.tan(Math.toRadians(0.5) * this.fov) / this.zoom));
        int height = 2 * top;
        int width = Math.round((float) this.aspect * height);
        int left = Math.round((float) -0.5 * width);

        if (view != null) {

            int fullWidth = view.fullWidth;
            int fullHeight = view.fullHeight;

            left += view.offsetX * width / fullWidth;
            top -= view.offsetY * height / fullHeight;
            width *= view.width / fullWidth;
            height *= view.height / fullHeight;

        }

        int skew = this.filmOffset;
        if (skew != 0) {
            left += near * skew / this.getFilmWidth();
        }

        this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);
    }
    
    
    public PerspectiveCamera copy(PerspectiveCamera source) {

        super.copy(source);

        this.fov = source.fov;
        this.zoom = source.zoom;

        this.near = source.near;
        this.far = source.far;
        this.focus = source.focus;

        this.aspect = source.aspect;
        this.view = source.view == null ? null : view.copy();

        this.filmGauge = source.filmGauge;
        this.filmOffset = source.filmOffset;

        return this;

    }

}
