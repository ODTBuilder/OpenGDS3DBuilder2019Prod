/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang3.tuple.*;

/**

 @author laht
 */
public class ShaderMaterial extends Material {

    public final Map<String, Object> defines = new HashMap<>();
    public final Map<String, Object> uniforms = new HashMap<>();
    public final Map<String, Boolean> extensions = new HashMap<>();

    public String vertexShader = "void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";
    public String fragmentShader = "void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}";

    public double lineWidth = 1;

    public boolean wireframe = false;
    public double wireframeLineWidth = 1;

    public boolean clipping = false;

    public boolean skinning = false; // set to use skinning attribute streams
    public boolean morphTargets = false; // set to use morph targets
    public boolean morphNormals = false; // set to use morph normals

    public ShaderMaterial(Pair<String, Object>... values) {
        
        type = "ShaderMaterial";

        fog = false;
        lights = false;

        super.setValues(values);

        extensions.put("derivatives", false);
        extensions.put("fragDepth", false);
        extensions.put("drawBuffers", false);
        extensions.put("shaderTextureLOD", false);

    }

}
