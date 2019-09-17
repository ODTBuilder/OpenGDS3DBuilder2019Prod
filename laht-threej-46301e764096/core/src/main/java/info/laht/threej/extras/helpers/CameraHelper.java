/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.extras.helpers;

import com.google.common.primitives.Doubles;
import com.google.common.primitives.Floats;
import info.laht.threej.cameras.*;
import info.laht.threej.core.*;
import info.laht.threej.interfaces.IGeometry;
import info.laht.threej.materials.*;
import info.laht.threej.math.*;
import info.laht.threej.objects.*;
import java.util.*;
import org.apache.commons.lang3.tuple.*;

/**
 *
 * @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class CameraHelper extends LineSegments {

    private final Camera camera;

    private final Map<String, List<Integer>> pointMap = new HashMap<>();

    public CameraHelper(Camera camera) {
        super(null, null);
        this.camera = camera;
        
        Helper helper = new Helper();
        
        this.geometry = helper.geometry;
        this.material = helper.material;

    }

    private class Helper {

        private final BufferGeometry geometry;
        private final Material material;

        private final List<Double> vertices = new ArrayList<>();
        private final List<Float> colors = new ArrayList<>();

        public Helper() {

            geometry = new BufferGeometry();
            material = new LineBasicMaterial(
                    new ImmutablePair<>("color", new Color().set("#ffffff")),
                    new ImmutablePair<>("vertexColors", Constants.FaceColors)
            );

            Color colorFrustum = new Color().set("#ffaa00");
            Color colorCone = new Color().set("#ff0000");
            Color colorUp = new Color().set("#00aaff");
            Color colorTarget = new Color().set("#ffffff");
            Color colorCross = new Color().set("#333333");

            // near
            addLine("n1", "n2", colorFrustum);
            addLine("n2", "n4", colorFrustum);
            addLine("n4", "n3", colorFrustum);
            addLine("n3", "n1", colorFrustum);

            // far
            addLine("f1", "f2", colorFrustum);
            addLine("f2", "f4", colorFrustum);
            addLine("f4", "f3", colorFrustum);
            addLine("f3", "f1", colorFrustum);

            // sides
            addLine("n1", "f1", colorFrustum);
            addLine("n2", "f2", colorFrustum);
            addLine("n3", "f3", colorFrustum);
            addLine("n4", "f4", colorFrustum);

            // cone
            addLine("p", "n1", colorCone);
            addLine("p", "n2", colorCone);
            addLine("p", "n3", colorCone);
            addLine("p", "n4", colorCone);

            // up
            addLine("u1", "u2", colorUp);
            addLine("u2", "u3", colorUp);
            addLine("u3", "u1", colorUp);

            // target
            addLine("c", "t", colorTarget);
            addLine("p", "c", colorCross);

            // cross
            addLine("cn1", "cn2", colorCross);
            addLine("cn3", "cn4", colorCross);

            addLine("cf1", "cf2", colorCross);
            addLine("cf3", "cf4", colorCross);

            geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(Doubles.toArray(colors), 3));
            geometry.addAttribute("color", new BufferAttribute.FloatBufferAttribute(Floats.toArray(colors), 3));
        
        
        
        }

        private void addLine(String a, String b, Color color) {
            addPoint(a, color);
            addPoint(b, color);
        }

        private void addPoint(String id, Color color) {
            vertices.add(0d);
            vertices.add(0d);
            vertices.add(0d);

            colors.add(color.r);
            colors.add(color.g);
            colors.add(color.b);

            if (!pointMap.containsKey(id)) {
                pointMap.put(id, new ArrayList<>());
            }

            pointMap.get(id).add((vertices.size() / 3) - 1);
        }

    }

}
