/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.lights;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.Camera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.PerspectiveCamera;

/**
 *
 * @author laht
 */
public class SpotLightShadow extends LightShadow {

    public final boolean isSpotLightShadow = true;

    public SpotLightShadow() {
        super(new PerspectiveCamera(50, 1, 0.5, 500));
    }

    public void update(SpotLight light) {

        double fov = Math.toDegrees(2 * light.angle.inRadians());
        double aspect = this.mapSize.x() / this.mapSize.y();
        double far = light.distance;
        PerspectiveCamera cam = (PerspectiveCamera) camera;

        if (fov != cam.fov || aspect != cam.aspect || far != cam.far) {

            cam.fov = fov;
            cam.aspect = aspect;
            cam.far = far;
            cam.updateProjectionMatrix();

        }

    }

}
