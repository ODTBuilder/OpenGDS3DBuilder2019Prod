/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.renderers.shaders;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.*;
import java.util.*;
import org.apache.commons.lang3.tuple.*;

/**
 https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsLib.js

 @author laht
 */
public final class UniformsLib {

    private final Map<String, Uniforms> map;

    public final Uniforms common;
    public final Uniforms aomap;
    public final Uniforms lightmap;
    public final Uniforms emissivemap;
    public final Uniforms bumpmap;
    public final Uniforms normalmap;
    public final Uniforms displacementmap;
    public final Uniforms roughnessmap;
    public final Uniforms metalnessmap;
    public final Uniforms gradientmap;
    public final Uniforms fog;
    public final Uniforms lights;
    public final Uniforms points;

    private UniformsLib() {

        this.map = new HashMap<>();

        common = new Uniforms(new Uniform[]{
            new Uniform("diffuse", new Color().set("#eeeeee")),
            new Uniform("opacity", 1.0),
            new Uniform("map", null),
            new Uniform("offsetRepeat", new Vector4d(0, 0, 1, 1)),
            new Uniform("specularMap", null),
            new Uniform("alphaMap", null),
            new Uniform("envMap", null),
            new Uniform("flipEnvMap", -1),
            new Uniform("reflectivity", 1.0),
            new Uniform("refractionRatio", 0.98)});

        aomap = new Uniforms(new Uniform[]{
            new Uniform("aoMap", null),
            new Uniform("aoMapIntensity", 1.0)});

        lightmap = new Uniforms(new Uniform[]{
            new Uniform("lightMap", null),
            new Uniform("lightMapIntensity", 1.0)});

        emissivemap = new Uniforms(new Uniform[]{
            new Uniform("emissiveMap", null)});

        bumpmap = new Uniforms(new Uniform[]{
            new Uniform("bumpMap", null),
            new Uniform("bumpScale", 1.0)});

        normalmap = new Uniforms(new Uniform[]{
            new Uniform("normalMap", null),
            new Uniform("normalScale", new Vector2d(1, 1))});

        displacementmap = new Uniforms(new Uniform[]{
            new Uniform("displacementMap", null),
            new Uniform("displacementScale", 1.0),
            new Uniform("displacementBias", 0)});

        metalnessmap = new Uniforms(new Uniform[]{
            new Uniform("metalnessMap", null)});

        roughnessmap = new Uniforms(new Uniform[]{
            new Uniform("roughnessMap", null)});

        gradientmap = new Uniforms(new Uniform[]{
            new Uniform("gradientMap", null)});

        fog = new Uniforms(new Uniform[]{
            new Uniform("fogDensity", 0.00025),
            new Uniform("fogNear", 1),
            new Uniform("fogFar", 2000),
            new Uniform("fogColor", new Color().set("#ffffff"))});

        lights = new Uniforms(new Uniform[]{
            new Uniform("ambientLightColor", null),
            new Uniform("directionalShadowMap", null),
            new Uniform("directionalShadowMatrix", null),
            new Uniform("spotShadowMap", null),
            new Uniform("spotShadowMatrix", null),
            new Uniform("pointShadowMap", null),
            new Uniform("pointShadowMatrix", null)
        });

        points = new Uniforms(new Uniform[]{
            new Uniform("diffuse", null),
            new Uniform("opacity", 1.0),
            new Uniform("size", 1.0),
            new Uniform("scale", 1.0),
            new Uniform("map", null),
            new Uniform("offsetRepeat", new Vector4d(0, 0, 1, 1))
        });

        map.put("common", common);
        map.put("aomap", aomap);
        map.put("lightmap", lightmap);
        map.put("emissivemap", emissivemap);
        map.put("bumpmap", bumpmap);
        map.put("normalmap", normalmap);
        map.put("displacementmap", displacementmap);
        map.put("roughnessmap", roughnessmap);
        map.put("metalnessmap", metalnessmap);
        map.put("gradientmap", gradientmap);
        map.put("fog", fog);
        map.put("lights", lights);
        map.put("points", points);
    }

    public Uniforms get(String name) {
        return map.get(name);
    }

    public void put(String name, Uniforms uniforms) {
        map.put(name, aomap);
    }
    
    private final static class SingletonHolder {

        private final static UniformsLib INSTANCE = new UniformsLib();
    }

    public static UniformsLib getInstance() {
        return SingletonHolder.INSTANCE;
    }

    public class Chunk extends HashMap<String, ChunkEntry> {

        private String name;

        public Chunk(String name, ChunkEntry[] entries) {
            this.name = name;
            for (ChunkEntry e : entries) {
                put(e.name, e);
            }
        }

        @Override
        public String toString() {

            StringBuilder sb = new StringBuilder();
            sb.append(name).append(": {").append("\n");
            for (String key : keySet()) {
                sb.append("\t").append(key).append(": ").append(get(key)).append("\n");
            }
            sb.append("}");
            return sb.toString();
        }
    }

    public class ChunkEntry extends HashMap<String, Object> {

        private String name;

        public ChunkEntry(String name, Pair<String, Object>... values) {
            this.name = name;
            for (Pair<String, Object> val : values) {
                put(val.getKey(), val.getValue());
            }

        }

    }

    public static void main(String[] args) {
        UniformsLib.getInstance();
    }

//    public static Common common = new Common();
//    public static AOMap aomap = new AOMap();
//    public static LightMap lightmap = new LightMap();
//    public static EmissiveMap emissivemap = new EmissiveMap();
//    public static BumpMap bumpmap = new BumpMap();
//    public static NormalMap normalmap = new NormalMap();
//    public static DisplacementMap displacementmap = new DisplacementMap();
//    public static RoughnessMap roughnessmap = new RoughnessMap();
//    public static MetallnessMap metallnessmap = new MetallnessMap();
//    public static GradientMap gradientmap = new GradientMap();
//    public static Fog fog = new Fog();
//    public static Lights lights = new Lights();
//    public static Points points = new Points();
//
//    public static class Uniforms extends HashMap<String, Map<String, Object>> {
//
//        public final void puts(String name, Object object) {
//            HashMap<String, Object> m = new HashMap<>();
//            m.put("value", object);
//            put(name, m);
//        }
//
//        public Uniforms merge(Uniforms... uniforms) {
//            for (Uniforms u : uniforms) {
//                for (String key : u.keySet()) {
//                    Map<String, Object> m = u.get(key);
//                    Object value = m.get("value");
//
//                    if (value instanceof Copyable) {
//                        puts(key, ((Copyable) value).copy());
//                    }
//                    else {
//                        puts(key, value);
//                    }
//
//                }
//            }
//            return this;
//        }
//    }
//
//    public static class Common extends Uniforms {
//
//        public Common() {
//            puts("diffuse", new Color().set("#eeeeee"));
//            puts("opacity", 1);
//            puts("map", null);
//            puts("offsetRepeat", new Vector4d(0, 0, 1, 0));
//            puts("specularMap", null);
//            puts("alphaMap", null);
//            puts("envMap", null);
//            puts("flipEnvMap", -1);
//            puts("reflectivity", 1);
//            puts("reflectionRatio", 0.98);
//        }
//
////        Color diffuse = new Color().set("#eeeeee");
////        double opacity = 1;
////
////        Texture map = null;
////        Vector4d offsetRepeat = new Vector4d(0, 0, 1, 1);
////
////        Texture specularMap = null;
////        Texture alphaMap = null;
////
////        Texture envMap = null;
////        int flipEnvMap = -1;
////        double reflectivity = 1;
////        double reflectionRatio = 0.98;
//
//    }
//
//    public static class AOMap extends Uniforms {
//        
//        public AOMap() {
//            puts("aoMap", null);
//            puts("aoMapIntensity", 1);
//        }
//
////        Texture aoMap = null;
////        double aoMapIntensity = 1;
//    }
//
//    public static class LightMap extends Uniforms {
//        
//        public LightMap() {
//            puts("lightMap", null);
//            puts("lightMapIntensity", 1);
//        }
//
////        Texture lightMap = null;
////        double lightMapIntensity = 1;
//    }
//
//    public static class EmissiveMap extends Uniforms {
//        
//        public EmissiveMap() {
//            puts("emissiveMap", null);
//        }
//
//        Texture emissiveMap = null;
//    }
//
//    public static class BumpMap extends Uniforms {
//        
//        public BumpMap() {
//            puts("bumpMap", null);
//            puts("bumpScale", 1);
//        }
//
//        Texture bumpMap = null;
//        double bumpScale = 1;
//    }
//
//    public static class NormalMap extends Uniforms {
//
//        Texture normalMap = null;
//        Vector2d normalScale = new Vector2d(1, 1);
//    }
//
//    public static class DisplacementMap extends Uniforms {
//
//        Texture displacementMap = null;
//        double displacementScale = 1;
//        double displacementBias = 0;
//    }
//
//    public static class RoughnessMap extends Uniforms {
//
//        Texture roughnessMap = null;
//    }
//
//    public static class MetallnessMap extends Uniforms {
//
//        Texture metallnessMap = null;
//    }
//
//    public static class GradientMap extends Uniforms {
//
//        Texture gradientMap = null;
//    }
//
//    public static class Fog extends Uniforms {
//
//        public Fog() {
//            puts("fogDensity", 0.00025);
//            puts("fogNear", 1);
//            puts("fogFar", 2000);
//            puts("fogColor", new Color().set("#ffffff"));
//        }
//
////        double fogDensity = 0.00025;
////        double fogNear = 1;
////        double fogFar = 2000;
////        Color fogColor = new Color().set("#ffffff");
//    }
//
//    public static class Lights extends Uniforms {
//
//        float[] ambientLightColor = new float[]{3};
//        Map<String, Object> directionalLights = new HashMap<>();
//
//    }
//
//    public static class Points extends Uniforms {
//
//        Color diffuse = new Color().set("#eeeeee");
//        double opacity = 1;
//        double size = 1;
//        double scale = 1;
//        Texture map = null;
//        Vector4d offsetRepeat = new Vector4d(0, 0, 1, 1);
//    }
}
