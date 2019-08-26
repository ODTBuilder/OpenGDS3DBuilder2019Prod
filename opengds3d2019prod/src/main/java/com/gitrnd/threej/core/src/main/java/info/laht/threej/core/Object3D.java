/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.IGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.Identifiable;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Quaterniond;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Eulerd;
import java.io.*;
import java.util.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Object3D implements Identifiable, Serializable {

    private static AtomicInteger object3DIdGen = new AtomicInteger();

    public static final Vector3d DEFAULT_UP = new Vector3d(0, 0, 1);

    public int id;
    private final UUID uuid;
    public String name;

    public Object3D parent;
    public final List<Object3D> children;

    public final Vector3d up;
    public final Vector3d position;
    public final Eulerd rotation;
    public final Quaterniond quaternion;
    public final Vector3d scale;

    public final Matrix4d matrix;
    public final Matrix4d matrixWorld;

    public Layers layers;

    public final Map<String, Object> userData;

    private int renderOrder;

    public boolean visible, castShadow, receiveShadow;
    public boolean frustumCulled;
    public boolean matrixAutoUpdate, matrixWorldNeedsUpdate;

    public Object3D() {
        id = object3DIdGen.incrementAndGet();

        this.uuid = UUID.randomUUID();
        this.name = "";

        this.children = new ArrayList<>();
        this.userData = new HashMap<>();

        this.up = DEFAULT_UP;
        this.position = new Vector3d();
        this.rotation = new Eulerd();
        this.quaternion = new Quaterniond();
        this.scale = new Vector3d(1, 1, 1);

        this.matrix = new Matrix4d();
        this.matrixWorld = new Matrix4d();

        this.matrixAutoUpdate = true;
        this.matrixWorldNeedsUpdate = false;

        this.layers = new Layers();

        this.visible = true;
        this.castShadow = false;
        this.receiveShadow = false;
        this.frustumCulled = false;

        this.renderOrder = 0;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void applyMatrix(Matrix4d matrix) {
        this.matrix.multiply(matrix, this.matrix);
        this.matrix.decompose(position, quaternion, scale);
    }

    public void setRotationFromEuler(Eulerd euler) {
        this.quaternion.setFromEuler(euler);
    }

    public void setRotationFromAxisAngle(Vector3d axis, Angle angle) {
        this.quaternion.setFromAxisAngle(axis, angle);
    }

    public void setRotationFromMatrix(Matrix4d m) {
        this.quaternion.setFromRotationMatrix(m);
    }

    public void setRotationFromQuaternion(Quaterniond q) {
        this.quaternion.copy(q);
    }

    public void rotateOnAxis(Vector3d axis, Angle angle) {
        Quaterniond q1 = new Quaterniond().setFromAxisAngle(axis, angle);
        this.quaternion.multiply(q1);
    }

    public Vector3d localToWorld(Vector3d vector) {
        return vector.applyMatrix4(this.matrixWorld);
    }

    public Vector3d worldToLocal(Vector3d vector) {
        Matrix4d m1 = new Matrix4d();
        return vector.applyMatrix4(m1.getInverse(matrixWorld));
    }

    public void lookAt(Vector3d vector) {
        Matrix4d m1 = new Matrix4d().lookAt(vector, position, up);
        this.quaternion.setFromRotationMatrix(m1);
    }

    public void add(Object3D object) {

        if (object == this) {
            return;
        }

        if (object.parent != null) {
            object.parent.remove(object);
        }

        object.parent = this;
        children.add(object);

    }

    public void remove(Object3D object) {
        int index = children.indexOf(object);

        if (index != -1) {
            object.parent = null;
            children.remove(object);
        }

    }

    public Vector3d getWorldPosition(Vector3d optionalTarget) {
        Vector3d result = optionalTarget == null ? new Vector3d() : optionalTarget;
        this.updateMatrixWorld(true);
        return result.setFromMatrixPosition(this.matrixWorld);
    }

    public Quaterniond getWorldQuaternion(Quaterniond optionalTarget) {
        Quaterniond result = optionalTarget == null ? new Quaterniond() : optionalTarget;
        this.updateMatrixWorld(true);
        this.matrixWorld.decompose(new Vector3d(), quaternion, new Vector3d());
        return result;
    }

    public void traverse(Consumer<Object3D> callback) {
        callback.accept(this);
        children.forEach(c -> c.traverse(callback));
    }

    public void traverseVisible(Consumer<Object3D> callback) {
        if (visible) {
            callback.accept(this);
        }
        children.forEach(c -> c.traverseVisible(callback));
    }

    public void traverseAncestors(Consumer<Object3D> callback) {
        if (this.parent != null) {
            callback.accept(parent);
            parent.traverseAncestors(callback);
        }
    }

    public final void updateMatrix() {
        this.matrix.compose(position, quaternion, scale);
        this.matrixWorldNeedsUpdate = true;
    }

    public final void updateMatrixWorld(boolean force) {
        if (matrixAutoUpdate) {
            updateMatrix();
        }
        if (matrixWorldNeedsUpdate || force) {

            if (this.parent == null) {
                this.matrixWorld.copy(this.matrix);
            } else {
                this.matrixWorld.multiply(this.parent.matrixWorld, this.matrix);
            }

            this.matrixWorldNeedsUpdate = false;
            force = true;

        }

        for (int i = 0; i < children.size(); i++) {
            children.get(i).updateMatrixWorld(force);
        }

    }

    public void raycast(RayCaster rayCaster, List<RayCastHit> intersects) {
        //should be empty
    }

    public IGeometry getGeometry() {
        return null;
    }

    public Object3D copy() {
        return copy(true);
    }

    public Object3D copy(boolean recursive) {
        return new Object3D().copy(this, recursive);
    }

    public Object3D copy(Object3D source) {
        return copy(source, true);
    }

    public Object3D copy(Object3D source, boolean recursive) {

        this.name = source.name;

        this.up.copy(source.up);

        this.position.copy(source.position);
        this.quaternion.copy(source.quaternion);
        this.scale.copy(source.scale);

        this.matrix.copy(source.matrix);
        this.matrixWorld.copy(source.matrixWorld);

        this.matrixAutoUpdate = source.matrixAutoUpdate;
        this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

        this.layers.mask = source.layers.mask;
        this.visible = source.visible;

        this.castShadow = source.castShadow;
        this.receiveShadow = source.receiveShadow;

        this.frustumCulled = source.frustumCulled;
        this.renderOrder = source.renderOrder;

        if (recursive) {
            for (int i = 0; i < source.children.size(); i++) {

                Object3D child = source.children.get(i);
                this.add(child.copy(recursive));

            }
        }

        return this;
    }
}
