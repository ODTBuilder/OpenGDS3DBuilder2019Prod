/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras.helpers;

import info.laht.threej.core.*;
import info.laht.threej.materials.*;
import info.laht.threej.objects.*;
import org.apache.commons.lang3.tuple.*;

/**

 @author laht
 */
public class AxisHelper extends LineSegments {

    public AxisHelper() {
        this(1);
    }
    
    public AxisHelper(double size) {
        super(create(size), new LineBasicMaterial(new ImmutablePair<>("vertexColors", Constants.VertexColors)));
    }

    static BufferGeometry create(double size) {
        double[] vertices = new double[]{
            0, 0, 0, size, 0, 0,
            0, 0, 0, 0, size, 0,
            0, 0, 0, 0, 0, size
        };

        double[] colors = new double[]{
            1, 0, 0, 1, 0.6, 0,
            0, 1, 0, 0.6, 1, 0,
            0, 0, 1, 0, 0.6, 1
        };

        BufferGeometry geometry = new BufferGeometry();
        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(vertices, 3));
        geometry.addAttribute("color", new BufferAttribute.DoubleBufferAttribute(colors, 3));

        return geometry;
    }

}
