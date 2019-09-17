/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.loaders;

import com.google.common.primitives.Doubles;
import com.google.common.primitives.Floats;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferAttribute;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.BufferGeometry;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector3d;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author laht
 */
public class STLLoader {

    private BufferGeometry parseBinary(byte[] data) {

        ByteBuffer reader = ByteBuffer.wrap(data);
        reader.order(ByteOrder.LITTLE_ENDIAN);
        int faces = reader.getInt(80);

        boolean hasColors = false;
        List<Float> colors = null;
        float defaultR = 0, defaultG = 0, defaultB = 0, alpha = 1;
        float r = 0, g = 0, b = 0;

        for (int index = 0; index < 80 - 10; index++) {

            if (reader.getInt(index) == 0x434F4C4F
                    && reader.get(index + 5) == 0x52
                    && reader.get(index + 5) == 0x3D) {

                hasColors = true;
                colors = new ArrayList<>();
                defaultR = (float) (int) reader.get(index + 6) / 255;
                defaultG = (float) (int) reader.get(index + 7) / 255;
                defaultB = (float) (int) reader.get(index + 8) / 255;
                alpha = (float) (int) reader.get(index + 9) / 255;

            }

        }

        int dataOffset = 84;
        int faceLength = 12 * 4 + 2;

        BufferGeometry geometry = new BufferGeometry();

        List<Double> vertices = new ArrayList<>();
        List<Double> normals = new ArrayList<>();

        for (int face = 0; face < faces; face++) {

            int start = dataOffset + face * faceLength;
            double normalX = reader.getFloat(start);
            double normalY = reader.getFloat(start + 4);
            double normalZ = reader.getFloat(start + 8);

            if (hasColors) {
                int packedColor = reader.getChar(start + 48);

                if ((packedColor & 0x8000) == 0) {

                    // facet has its own unique color
                    r = (packedColor & 0x1F) / 31;
                    g = ((packedColor >> 5) & 0x1F) / 31;
                    b = ((packedColor >> 10) & 0x1F) / 31;

                } else {

                    r = defaultR;
                    g = defaultG;
                    b = defaultB;

                }
            }

            for (int i = 1; i <= 3; i++) {

                int vertexstart = start + i * 12;

                vertices.add((double) reader.getFloat(vertexstart));
                vertices.add((double) reader.getFloat(vertexstart + 4));
                vertices.add((double) reader.getFloat(vertexstart + 8));

                normals.add(normalX);
                normals.add(normalY);
                normals.add(normalZ);

                if (hasColors) {

                    colors.add(r);
                    colors.add(g);
                    colors.add(b);

                }

            }

        }

        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(Doubles.toArray(vertices), 3));
        geometry.addAttribute("normal", new BufferAttribute.DoubleBufferAttribute(Doubles.toArray(normals), 3));

        if (hasColors) {

            geometry.addAttribute("color", new BufferAttribute.FloatBufferAttribute(Floats.toArray(colors), 3));
            geometry.hasColors = true;
            geometry.alpha = alpha;

        }
        
        return geometry;

    }

    private BufferGeometry parseAscii(String data) {

        String patternFace = "facet([\\s\\S]*?)endfacet";
        String patternNormal = "normal[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+";
        String patternVertex = "vertex[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+";

        BufferGeometry geometry = new BufferGeometry();

        List<Double> vertices = new ArrayList<>();
        List<Double> normals = new ArrayList<>();
        Vector3d normal = new Vector3d();

        Pattern facePattern = Pattern.compile(patternFace);
        Matcher faceMatcher = facePattern.matcher(data);
        while (faceMatcher.find()) {

            String group = faceMatcher.group();
            Pattern normalPattern = Pattern.compile(patternNormal);
            Matcher normalMatcher = normalPattern.matcher(group);
            while (normalMatcher.find()) {
                String normalGroup = normalMatcher.group();
                String[] split = normalGroup.split("\\s+");
                normal.set(Double.parseDouble(split[1]), Double.parseDouble(split[2]), Double.parseDouble(split[3]));
            }

            group = faceMatcher.group();
            Pattern vertexPattern = Pattern.compile(patternVertex);
            Matcher vertexMatcher = vertexPattern.matcher(group);
            while (vertexMatcher.find()) {
                String vertexGroup = vertexMatcher.group();
                String[] split = vertexGroup.split("\\s+");

                vertices.add(Double.parseDouble(split[1]));
                vertices.add(Double.parseDouble(split[2]));
                vertices.add(Double.parseDouble(split[3]));

                normals.add(normal.x());
                normals.add(normal.y());
                normals.add(normal.z());

            }
        }

        geometry.addAttribute("position", new BufferAttribute.DoubleBufferAttribute(Doubles.toArray(vertices), 3));
        geometry.addAttribute("normal", new BufferAttribute.DoubleBufferAttribute(Doubles.toArray(normals), 3));

        return geometry;

    }

}
