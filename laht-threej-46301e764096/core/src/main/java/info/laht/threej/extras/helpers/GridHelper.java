/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras.helpers;

import com.google.common.primitives.Doubles;
import com.google.common.primitives.Floats;
import info.laht.threej.core.BufferAttribute;
import info.laht.threej.core.BufferGeometry;
import info.laht.threej.core.Constants;
import info.laht.threej.materials.LineBasicMaterial;
import info.laht.threej.math.Color;
import info.laht.threej.objects.LineSegments;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.tuple.ImmutablePair;

/**
 *
 * @author laht
 */
public class GridHelper extends LineSegments {

    public GridHelper() {
        this(10);
    }

    public GridHelper(int size) {
        this(size, 10);
    }

    public GridHelper(int size, int divisions) {
        this(size, divisions, new Color().set("#444444"), new Color().set("#888888"));
    }

    public GridHelper(int size, int divisions, Color color1, Color color2) {
        super(create(size, divisions, color1, color2), new LineBasicMaterial(new ImmutablePair<>("vertexColors", Constants.VertexColors)));

    }

    static BufferGeometry create(int size, int divisions, Color color1, Color color2) {
        double center = (double) divisions / 2;
        int step = (size * 2) / divisions;

        List<Double> vertices = new ArrayList<>();
        List<Float> colors = new ArrayList<>();

        for (int i = 0, j = 0, k = -size; i <= divisions; i++, k += step) {

            vertices.add((double) -size);
            vertices.add((double) 0);
            vertices.add((double) k);
            vertices.add((double) size);
            vertices.add((double) 0);
            vertices.add((double) k);

            Color color = i == center ? color1 : color2;
            float[] colorArray = Floats.toArray(colors);

            color.toArray(colorArray, j);
            j += 3;
            color.toArray(colorArray, j);
            j += 3;
            color.toArray(colorArray, j);
            j += 3;
            color.toArray(colorArray, j);
            j += 3;

        }

        BufferGeometry geometry = new BufferGeometry();
        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(Doubles.toArray(vertices), 3));
        geometry.addAttribute("color", new BufferAttribute.FloatBufferAttribute(Floats.toArray(colors), 3));

        return geometry;
    }

}
