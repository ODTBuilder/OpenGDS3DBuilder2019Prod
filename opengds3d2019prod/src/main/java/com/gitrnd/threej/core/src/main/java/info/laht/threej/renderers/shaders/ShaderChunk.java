/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.renderers.shaders;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.charset.Charset;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author laht
 */
public final class ShaderChunk {
    
    private ShaderChunk() {
        
    }
    
    public static String get(String name) {
        Method[] methods = ShaderChunk.class.getMethods();
        for (Method m : methods) {
            if (m.getName().equals(name)) {
                try {
                    return (String) m.invoke(null);
                } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException ex) {
                    Logger.getLogger(ShaderChunk.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        }
        return null;
    }
    

    public static String alphamap_fragment() {
        return readShaderChunk("alphamap_fragment");
    }

    public static String alphamap_pars_fragment() {
        return readShaderChunk("alphamap_pars_fragment");
    }

    public static String alphatest_fragment() {
        return readShaderChunk("alphatest_fragment");
    }

    public static String aomap_fragment() {
        return readShaderChunk("aomap_fragment");
    }

    public static String aomap_pars_fragment() {
        return readShaderChunk("aomap_pars_fragment");
    }

    public static String begin_vertex() {
        return readShaderChunk("begin_vertex");
    }

    public static String beginnormal_vertex() {
        return readShaderChunk("beginnormal_vertex");
    }

    public static String bsdfs() {
        return readShaderChunk("bsdfs");
    }

    public static String bumpmap_pars_fragment() {
        return readShaderChunk("bumpmap_pars_fragment");
    }

    public static String clipping_planes_fragment() {
        return readShaderChunk("clipping_planes_fragment");
    }

    public static String clipping_planes_pars_fragment() {
        return readShaderChunk("clipping_planes_pars_fragment");
    }

    public static String clipping_planes_pars_vertex() {
        return readShaderChunk("clipping_planes_pars_vertex");
    }

    public static String clipping_planes_vertex() {
        return readShaderChunk("clipping_planes_vertex");
    }

    public static String color_fragment() {
        return readShaderChunk("color_fragment");
    }

    public static String color_pars_fragment() {
        return readShaderChunk("color_pars_fragment");
    }

    public static String color_pars_vertex() {
        return readShaderChunk("color_pars_vertex");
    }

    public static String color_vertex() {
        return readShaderChunk("color_vertex");
    }

    public static String common() {
        return readShaderChunk("common");
    }

    public static String cube_uv_reflection_fragment() {
        return readShaderChunk("cube_uv_reflection_fragment");
    }

    public static String defaultnormal_vertex() {
        return readShaderChunk("defaultnormal_vertex");
    }

    public static String displacementmap_pars_vertex() {
        return readShaderChunk("displacementmap_pars_vertex");
    }

    public static String displacementmap_vertex() {
        return readShaderChunk("displacementmap_vertex");
    }

    public static String emissivemap_fragment() {
        return readShaderChunk("emissivemap_fragment");
    }

    public static String emissivemap_pars_fragment() {
        return readShaderChunk("emissivemap_pars_fragment");
    }

    public static String encodings_fragment() {
        return readShaderChunk("encodings_fragment");
    }

    public static String encodings_pars_fragment() {
        return readShaderChunk("encodings_pars_fragment");
    }

    public static String envmap_fragment() {
        return readShaderChunk("envmap_fragment");
    }

    public static String envmap_pars_fragment() {
        return readShaderChunk("envmap_pars_fragment");
    }

    public static String envmap_pars_vertex() {
        return readShaderChunk("envmap_pars_vertex");
    }

    public static String envmap_vertex() {
        return readShaderChunk("envmap_vertex");
    }

    public static String fog_fragment() {
        return readShaderChunk("fog_fragment");
    }

    public static String fog_pars_fragment() {
        return readShaderChunk("fog_pars_fragment");
    }

    public static String gradientmap_pars_fragment() {
        return readShaderChunk("gradientmap_pars_fragment");
    }

    public static String lightmap_fragment() {
        return readShaderChunk("lightmap_fragment");
    }

    public static String lightmap_pars_fragment() {
        return readShaderChunk("lightmap_pars_fragment");
    }

    public static String lights_lambert_vertex() {
        return readShaderChunk("lights_lambert_vertex");
    }

    public static String lights_pars() {
        return readShaderChunk("lights_pars");
    }

    public static String lights_phong_fragment() {
        return readShaderChunk("lights_phong_fragment");
    }

    public static String lights_phong_pars_fragment() {
        return readShaderChunk("lights_phong_pars_fragment");
    }

    public static String lights_physical_fragment() {
        return readShaderChunk("lights_physical_fragment");
    }

    public static String lights_physical_pars_fragment() {
        return readShaderChunk("lights_physical_pars_fragment");
    }

    public static String lights_template() {
        return readShaderChunk("lights_template");
    }

    public static String logdepthbuf_fragment() {
        return readShaderChunk("logdepthbuf_fragment");
    }

    public static String logdepthbuf_pars_fragment() {
        return readShaderChunk("logdepthbuf_pars_fragment");
    }

    public static String logdepthbuf_pars_vertex() {
        return readShaderChunk("logdepthbuf_pars_vertex");
    }

    public static String logdepthbuf_vertex() {
        return readShaderChunk("logdepthbuf_vertex");
    }

    public static String map_fragment() {
        return readShaderChunk("map_fragment");
    }

    public static String map_pars_fragment() {
        return readShaderChunk("map_pars_fragment");
    }

    public static String map_particle_fragment() {
        return readShaderChunk("map_particle_fragment");
    }

    public static String map_particle_pars_fragment() {
        return readShaderChunk("map_particle_pars_fragment");
    }

    public static String metalnessmap_fragment() {
        return readShaderChunk("metalnessmap_fragment");
    }

    public static String metalnessmap_pars_fragment() {
        return readShaderChunk("metalnessmap_pars_fragment");
    }

    public static String morphnormal_vertex() {
        return readShaderChunk("morphnormal_vertex");
    }

    public static String morphtarget_pars_vertex() {
        return readShaderChunk("morphtarget_pars_vertex");
    }

    public static String morphtarget_vertex() {
        return readShaderChunk("morphtarget_vertex");
    }

    public static String normal_flip() {
        return readShaderChunk("normal_flip");
    }

    public static String normal_fragment() {
        return readShaderChunk("normal_fragment");
    }

    public static String normalmap_pars_fragment() {
        return readShaderChunk("normalmap_pars_fragment");
    }

    public static String packing() {
        return readShaderChunk("packing");
    }

    public static String premultiplied_alpha_fragment() {
        return readShaderChunk("premultiplied_alpha_fragment");
    }

    public static String project_vertex() {
        return readShaderChunk("project_vertex");
    }

    public static String roughnessmap_fragment() {
        return readShaderChunk("roughnessmap_fragment");
    }

    public static String roughnessmap_pars_fragment() {
        return readShaderChunk("roughnessmap_pars_fragment");
    }

    public static String shadowmap_pars_fragment() {
        return readShaderChunk("shadowmap_pars_fragment");
    }

    public static String shadowmap_pars_vertex() {
        return readShaderChunk("shadowmap_pars_vertex");
    }

    public static String shadowmap_vertex() {
        return readShaderChunk("shadowmap_vertex");
    }

    public static String shadowmask_pars_fragment() {
        return readShaderChunk("shadowmask_pars_fragment");
    }

    public static String skinbase_vertex() {
        return readShaderChunk("skinbase_vertex");
    }

    public static String skinning_pars_vertex() {
        return readShaderChunk("skinning_pars_vertex");
    }

    public static String skinning_vertex() {
        return readShaderChunk("skinning_vertex");
    }

    public static String skinnormal_vertex() {
        return readShaderChunk("skinnormal_vertex");
    }

    public static String specularmap_fragment() {
        return readShaderChunk("specularmap_fragment");
    }

    public static String specularmap_pars_fragment() {
        return readShaderChunk("specularmap_pars_fragment");
    }

    public static String tonemapping_fragment() {
        return readShaderChunk("tonemapping_fragment");
    }

    public static String tonemapping_pars_fragment() {
        return readShaderChunk("tonemapping_pars_fragment");
    }

    public static String uv_pars_fragment() {
        return readShaderChunk("uv_pars_fragment");
    }

    public static String uv_pars_vertex() {
        return readShaderChunk("uv_pars_vertex");
    }

    public static String uv_vertex() {
        return readShaderChunk("uv_vertex");
    }

    public static String uv2_pars_fragment() {
        return readShaderChunk("uv2_pars_fragment");
    }

    public static String uv2_pars_vertex() {
        return readShaderChunk("uv2_pars_vertex");
    }

    public static String uv2_vertex() {
        return readShaderChunk("uv2_vertex");
    }

    public static String worldpos_vertex() {
        return readShaderChunk("worldpos_vertex");
    }

    public static String cube_frag() {
        return readShaderLib("cube_frag");
    }

    public static String cube_vert() {
        return readShaderLib("cube_vert");
    }

    public static String depth_frag() {
        return readShaderLib("depth_frag");
    }

    public static String depth_vert() {
        return readShaderLib("depth_vert");
    }

    public static String distanceRGBA_frag() {
        return readShaderLib("distanceRGBA_frag");
    }

    public static String distanceRGBA_vert() {
        return readShaderLib("distanceRGBA_vert");
    }

    public static String equirect_frag() {
        return readShaderLib("equirect_frag");
    }

    public static String equirect_vert() {
        return readShaderLib("equirect_vert");
    }

    public static String linedashed_frag() {
        return readShaderLib("linedashed_frag");
    }

    public static String linedashed_vert() {
        return readShaderLib("linedashed_vert");
    }

    public static String meshbasic_frag() {
        return readShaderLib("meshbasic_frag");
    }

    public static String meshbasic_vert() {
        return readShaderLib("meshbasic_vert");
    }

    public static String meshlambert_frag() {
        return readShaderLib("meshlambert_frag");
    }

    public static String meshlambert_vert() {
        return readShaderLib("meshlambert_vert");
    }

    public static String meshphong_frag() {
        return readShaderLib("meshphong_frag");
    }

    public static String meshphong_vert() {
        return readShaderLib("meshphong_vert");
    }

    public static String meshphysical_frag() {
        return readShaderLib("meshphysical_frag");
    }

    public static String meshphysical_vert() {
        return readShaderLib("meshphysical_vert");
    }

    public static String normal_frag() {
        return readShaderLib("normal_frag");
    }

    public static String normal_vert() {
        return readShaderLib("normal_vert");
    }

    public static String points_frag() {
        return readShaderLib("points_frag");
    }

    public static String points_vert() {
        return readShaderLib("points_vert");
    }

    public static String shadow_frag() {
        return readShaderLib("shadow_frag");
    }

    public static String shadow_vert() {
        return readShaderLib("shadow_vert");
    }

    private static String readShaderChunk(String file) {
        try {
            return IOUtils.toString(ShaderChunk.class.getClassLoader().getResourceAsStream("ShaderChunk" + File.separator + file + ".glsl"), Charset.defaultCharset());
        } catch (IOException ex) {
            Logger.getLogger(ShaderChunk.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    private static String readShaderLib(String file) {
        try {
            return IOUtils.toString(ShaderChunk.class.getClassLoader().getResourceAsStream("ShaderLib" + File.separator + file + ".glsl"), Charset.defaultCharset());
        } catch (IOException ex) {
            Logger.getLogger(ShaderChunk.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

}
