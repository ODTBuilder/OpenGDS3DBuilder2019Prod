/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.renderers.shaders;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.util.*;

/**

 @author laht
 */
public final class ShaderLib {
    
    private final UniformsLib uniformsLib;
    private final Map<String, Shader> map;
    
    public final Shader basic;
    public final Shader lambert;
    public final Shader phong;
    public final Shader standard;
    public final Shader points;
    
    private ShaderLib() {
        
        this.uniformsLib = UniformsLib.getInstance();
        this.map = new HashMap<>();
        
        basic = new Shader(
                Uniforms.merge(
                        uniformsLib.common,
                        uniformsLib.aomap,
                        uniformsLib.lightmap,
                        uniformsLib.fog
                ),
                ShaderChunk.meshbasic_vert(),
                ShaderChunk.meshbasic_frag());
        
        lambert = new Shader(
                Uniforms.merge(
                        uniformsLib.common,
                        uniformsLib.aomap,
                        uniformsLib.lightmap,
                        uniformsLib.emissivemap,
                        uniformsLib.fog,
                        uniformsLib.lights,
                        new Uniforms(new Uniform[]{
                            new Uniform("emissive", new Color().set("#000000"))
                        })
                ),
                ShaderChunk.meshlambert_vert(),
                ShaderChunk.meshlambert_frag());
        
        phong = new Shader(
                Uniforms.merge(
                        uniformsLib.common,
                        uniformsLib.aomap,
                        uniformsLib.lightmap,
                        uniformsLib.emissivemap,
                        uniformsLib.bumpmap,
                        uniformsLib.normalmap,
                        uniformsLib.displacementmap,
                        uniformsLib.gradientmap,
                        uniformsLib.fog,
                        uniformsLib.lights,
                        new Uniforms(new Uniform[]{
                            new Uniform("emissive", new Color().set("#000000")),
                            new Uniform("specular", new Color().set("#111111")),
                            new Uniform("shininess", 30)
                        })
                ),
                ShaderChunk.meshphong_vert(),
                ShaderChunk.meshphong_frag());
        
        standard = new Shader(
                Uniforms.merge(
                        uniformsLib.common,
                        uniformsLib.aomap,
                        uniformsLib.lightmap,
                        uniformsLib.emissivemap,
                        uniformsLib.bumpmap,
                        uniformsLib.normalmap,
                        uniformsLib.displacementmap,
                        uniformsLib.roughnessmap,
                        uniformsLib.metalnessmap,
                        uniformsLib.fog,
                        uniformsLib.lights,
                        new Uniforms(new Uniform[]{
                            new Uniform("emissive", new Color().set("#000000")),
                            new Uniform("roughness", 0.5),
                            new Uniform("metalness", 0),
                            new Uniform("envMapIntensity", 1)
                        })
                ),
                ShaderChunk.meshphysical_vert(),
                ShaderChunk.meshphysical_frag());
        
         points = new Shader(
                Uniforms.merge(
                        uniformsLib.common,
                        uniformsLib.fog,
                        new Uniforms(new Uniform[]{
                            new Uniform("scale", 1),
                            new Uniform("dashSize", 1),
                            new Uniform("totalSize", 2)
                        })
                ),
                ShaderChunk.linedashed_vert(),
                ShaderChunk.linedashed_frag());
        
        map.put("basic", basic);
        map.put("lambert", lambert);
        map.put("phong", phong);
        map.put("standard", standard);
        map.put("points", points);
        
    }
    
    public void put(String name, Shader shader) {
        map.put(name, shader);
    }
    
    public Shader get(String name) {
        return map.get(name);
    }
    
    private final static class SingletonHolder {
        
        private final static ShaderLib INSTANCE = new ShaderLib();
    }
    
    public static ShaderLib getInstance() {
        return SingletonHolder.INSTANCE;
    }
    
    public class Shader {
        
        public final Uniforms uniforms;
        public final String vertexShader;
        public final String fragmentShader;
        
        public Shader(Uniforms uniforms, String vertexShader, String fragmentShader) {
            this.uniforms = uniforms;
            this.vertexShader = vertexShader;
            this.fragmentShader = fragmentShader;
        }
        
    }
    
    public static void main(String[] args) {

//        Map<String, Map<String, Map<String, Object>>> get = ShaderLib.getInstance().get("basic");
//        for (String key : get.keySet()) {
//            Map<String, Map<String, Object>> get1 = get.get(key);
//            for (String key1 : get1.keySet()) {
//                System.out.println(key1 + ":" + get1.get(key1));
//            }
//        }
    }
    
}
