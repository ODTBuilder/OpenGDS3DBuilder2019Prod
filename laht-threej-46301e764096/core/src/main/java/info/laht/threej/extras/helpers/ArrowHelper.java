/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras.helpers;

import info.laht.threej.core.BufferAttribute;
import info.laht.threej.core.BufferGeometry;
import info.laht.threej.core.Object3D;
import info.laht.threej.geometries.CylinderBufferGeometry;
import info.laht.threej.materials.LineBasicMaterial;
import info.laht.threej.materials.MeshBasicMaterial;
import info.laht.threej.math.Angle;
import info.laht.threej.math.Color;
import info.laht.threej.math.Vector3d;
import info.laht.threej.objects.Line;
import info.laht.threej.objects.Mesh;
import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 *
 * @author laht
 */
public class ArrowHelper extends Object3D {

    private Line line;
    private Mesh cone;

    public ArrowHelper(Vector3d dir, Vector3d origin, double length) {
        this(dir, origin, length, new Color().set("#ffff00"), null, null);
    }

    public ArrowHelper(Vector3d dir, Vector3d origin, double length, Color color, Double headLength, Double headWidth) {

        headLength = headLength == null ? 0.2 * length : headLength;
        headWidth = headWidth == null ? 0.2 * headLength : headWidth;

        position.copy(origin);

        line = new Line(lineGeometry(), new LineBasicMaterial(new ImmutablePair<>("color", color)));
        line.matrixAutoUpdate = false;
        add(line);

        cone = new Mesh(coneGeometry(), new MeshBasicMaterial(new ImmutablePair<>("color", color)));
        cone.matrixAutoUpdate = false;
        add(cone);
        
        setDirection(dir);
        setLength(length, headLength, headWidth);

    }

    private void setDirection(Vector3d dir) {
        Vector3d axis = new Vector3d();
        Angle radians;

        if (dir.y() > 0.99999) {
            quaternion.set(0, 0, 0, 1);
        } else if (dir.y() < -0.99999) {
            quaternion.set(1, 0, 0, 0);
        } else {
            axis.set(dir.z(), 0, -dir.x());
            radians = Angle.rad(Math.acos(dir.y()));
            quaternion.setFromAxisAngle(axis, radians);
        }

    }

    private void setLength(double length, double headLength, double headWidth) {
        this.line.scale.set(1, Math.max(0, length - headLength), 1);
        this.line.updateMatrix();

        this.cone.scale.set(headWidth, headLength, headWidth);
        this.cone.position.y(length);
        this.cone.updateMatrix();
    }
    
    public void setColor(Color color) {
        throw new UnsupportedOperationException("Not implemented yet!");
//        line.material.setProperty("color", color);
//        cone.material.setProperty("color", color);
    }

    static CylinderBufferGeometry coneGeometry() {
        CylinderBufferGeometry coneGeometry = new CylinderBufferGeometry(0, 0.5, 1, 5, 1);
        coneGeometry.translate(0, -0.5, 0);
        return coneGeometry;
    }

    static BufferGeometry lineGeometry() {
        BufferGeometry geometry = new BufferGeometry();
        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(new double[]{0, 0, 0, 0, 1, 0}, 3));
        return geometry;
    }

}
