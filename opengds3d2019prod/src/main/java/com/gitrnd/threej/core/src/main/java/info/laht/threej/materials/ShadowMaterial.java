/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.renderers.shaders.*;
import org.apache.commons.lang3.tuple.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class ShadowMaterial extends ShaderMaterial {

    public ShadowMaterial() {

        super(new ImmutablePair<>("uniforms", 
                Uniforms.merge(
                        UniformsLib.getInstance().lights, 
                        new Uniforms(new Uniform[]{new Uniform("opacity", 1.0)})
                )),
              new ImmutablePair<>("vertexShader", ShaderChunk.shadow_vert()),
              new ImmutablePair<>("fragmentShader", ShaderChunk.shadow_frag()));
        
        type = "ShadowMaterial";
        
        lights = true;
        transparent = true;

    }
    
    public double getOpacity() {
        Object property = getProperty("uniforms");
        Uniforms uniforms = (Uniforms) property;
        return (double) uniforms.get("opacity").getValue();
    }
    
    public void setOpacity(double value) {
        Object property = getProperty("uniforms");
        Uniforms uniforms = (Uniforms) property;
        uniforms.get("opacity").setValue(value);
    }

}
