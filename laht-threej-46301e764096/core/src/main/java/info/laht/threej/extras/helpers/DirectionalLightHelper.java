/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras.helpers;

import info.laht.threej.core.BufferAttribute;
import info.laht.threej.core.BufferGeometry;
import info.laht.threej.core.Object3D;
import info.laht.threej.lights.DirectionalLight;
import info.laht.threej.materials.LineBasicMaterial;
import info.laht.threej.materials.Material;
import info.laht.threej.math.Color;
import info.laht.threej.math.Matrix4d;
import info.laht.threej.math.Vector3d;
import info.laht.threej.objects.Line;
import info.laht.threej.objects.Mesh;
import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 *
 * @author laht
 */
public class DirectionalLightHelper extends Object3D {

    private final DirectionalLight light;
    private final Matrix4d matrix;

    public DirectionalLightHelper(DirectionalLight light) {
        this(light, 1);
    }

    public DirectionalLightHelper(DirectionalLight light, int size) {
        this.light = light;
        this.light.updateMatrixWorld(false);

        this.matrix = light.matrix;
        this.matrixAutoUpdate = false;

        BufferGeometry geometry = new BufferGeometry();
        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(new double[]{
            -size, size, 0,
            size, size, 0,
            size, -size, 0,
            -size, -size, 0,
            -size, size, 0

        }, 3));

        Material material = new LineBasicMaterial(new ImmutablePair<>("fog", false));
        add(new Line(geometry, material));

        geometry = new BufferGeometry();
        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(new double[]{
            0, 0, 0, 0, 0, 1

        }, 3));

        add(new Line(geometry, material));

        update();

    }

    public void update() {
        Vector3d v1 = new Vector3d();
        Vector3d v2 = new Vector3d();
        Vector3d v3 = new Vector3d();
        
        v1.setFromMatrixPosition(light.matrixWorld);
        v2.setFromMatrixPosition(light.target.matrixWorld);
        v3.sub(v1, v2);
        
        Line lightPlane = (Line) children.get(0);
        Line targetLine = (Line) children.get(1);
        
        lightPlane.lookAt(v3);
        ((Color)lightPlane.material.getProperty("color")).copy(light.color).multiply((float)light.intensity);
        
        targetLine.lookAt(v3);
        targetLine.scale.z(v3.length());
    }

}
