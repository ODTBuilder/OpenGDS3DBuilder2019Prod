/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Quaterniond;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public abstract class Camera extends Object3D {

    public Matrix4d matrixWorldInverse = new Matrix4d();
    public Matrix4d projectionMatrix = new Matrix4d();

    public Camera() {
        this.matrixWorldInverse = new Matrix4d();
        this.projectionMatrix = new Matrix4d();
    }

    public Vector3d getWorldDirection(Vector3d optionalTarget) {
        Quaterniond q = new Quaterniond();

        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        getWorldQuaternion(q);

        return result.set(0, 0, -1).applyQuaternion(q);

    }

    public abstract void setViewOffset(int fullWidth, int fullHeight, int x, int y, int width, int height);

    public abstract void clearViewOffset();

    public abstract void updateProjectionMatrix();
    
    public Camera copy(Camera source) {

        super.copy(source);

        this.matrixWorldInverse.copy(source.matrixWorldInverse);
        this.projectionMatrix.copy(source.projectionMatrix);

        return this;

    }

}
