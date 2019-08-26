/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import static info.laht.threej.core.Constants.*;
import info.laht.threej.materials.Material;
import info.laht.threej.materials.RawShaderMaterial;
import info.laht.threej.renderers.shaders.ShaderChunk;
import info.laht.threej.textures.Texture;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL12;
import org.lwjgl.opengl.GL13;
import org.lwjgl.opengl.GL15;
import org.lwjgl.opengl.GL20;
import org.lwjgl.opengl.GL30;
import org.lwjgl.opengl.GL40;

/**
 *
 * @author laht
 */
public class GLProgram {

    private static final AtomicInteger idGen = new AtomicInteger();

    public static String[] getEncodingComponents(int encoding) {

        switch (encoding) {

            case LinearEncoding:
                return new String[]{"Linear", "( value )"};
            case sRGBEncoding:
                return new String[]{"sRGB", "( value )"};
            case RGBEEncoding:
                return new String[]{"RGBE", "( value )"};
            case RGBM7Encoding:
                return new String[]{"RGBM", "( value, 7.0 )"};
            case RGBM16Encoding:
                return new String[]{"RGBM", "( value, 16.0 )"};
            case RGBDEncoding:
                return new String[]{"RGBD", "( value, 256.0 )"};
            case GammaEncoding:
                return new String[]{"Gamma", "( value, float( GAMMA_FACTOR ) )"};
            default:
                throw new IllegalArgumentException("unsupported encoding: " + encoding);
        }

    }

    public static String getTexelDecodingFunction(String functionName, int encoding) {
        String[] components = getEncodingComponents(encoding);
        return "vec4 " + functionName + "( vec4 value ) { return " + components[0] + "ToLinear" + components[1] + "; }";
    }

    public static String getTexelEncodingFunction(String functionName, int encoding) {
        String[] components = getEncodingComponents(encoding);
        return "vec4 " + functionName + "( vec4 value ) { return LinearTo" + components[0] + components[1] + "; }";
    }

    public static String getToneMappingFunction(String functionName, int toneMapping) {

        String toneMappingName;

        switch (toneMapping) {

            case LinearToneMapping:
                toneMappingName = "Linear";
                break;

            case ReinhardToneMapping:
                toneMappingName = "Reinhard";
                break;

            case Uncharted2ToneMapping:
                toneMappingName = "Uncharted2";
                break;

            case CineonToneMapping:
                toneMappingName = "OptimizedCineon";
                break;

            default:
                throw new IllegalArgumentException("unsupported toneMapping: " + toneMapping);

        }

        return "vec3 " + functionName + "( vec3 color ) { return " + toneMappingName + "ToneMapping( color ); }";

    }

    public static String generateDefines(Map<String, Boolean> defines) {

        StringJoiner chunks = new StringJoiner("\n");
        for (String name : defines.keySet()) {
            boolean value = defines.get(name);
            if (value == false) {
                continue;
            }
            chunks.add("#define " + name + " " + value);
        }

        return chunks.toString();
    }
    
    public Map<String, Integer> fetchAttributeLocations(int program) {
        Map<String, Integer> attriutes = new HashMap<>();

        int n = GL20.glGetProgrami(program, GL20.GL_ACTIVE_ATTRIBUTES);
        int strLen = GL20.glGetProgrami(program, GL20.GL_ACTIVE_ATTRIBUTE_MAX_LENGTH);
        for (int i = 0; i < n; i++) {
            
            String name = "";//GL20.glGetActiveAttrib(program, i, strLen);
            attriutes.put(name, GL20.glGetAttribLocation(program, name));
        }
        return attriutes;
    }

    public static Predicate<String> filterEmptyLine() {

        return (String t) -> {
            return !"".equals(t);
        };

    }

    public static String replaceLightNums(String string, Map<String, String> parameters) {

        return string
                .replaceAll("NUM_DIR_LIGHTS/g", parameters.get("numDirLights"))
                .replaceAll("NUM_SPOT_LIGHTS/g", parameters.get("numSpotLights"))
                .replaceAll("NUM_RECT_AREA_LIGHTS/g", parameters.get("numRectAreaLights"))
                .replaceAll("NUM_POINT_LIGHTS/g", parameters.get("numPointLights"))
                .replaceAll("NUM_HEMI_LIGHTS/g", parameters.get("numHemiLights"));

    }


//    public String parseIncludes( String string ) {
//
//	Pattern pattern = Pattern.compile("#include +<([\\w\\d.]+)>/g");
//        Matcher matcher = pattern.matcher(string);
//        String str = "";
//        while (matcher.find()) {
//            String group = matcher.group();
//            String get = ShaderChunk.get(group);
//            if (get != null) {
//                str = string.re
//            }
//            string.replace(group, string)
//        }
//        
//        return string;
//
//	function replace(String match, String include ) {
//
//		var replace = ShaderChunk[ include ];
//
//		if ( replace == null ) {
//
//			throw new Error( 'Can not resolve #include <' + include + '>' );
//
//		}
//
//		return parseIncludes( replace );
//
//	}
//
//	return string.replace( pattern, replace );
//
//}
    private static String replace(int start, int end, String snippet) {
        String unroll = "";
        for (int i = start; i < end; i++) {
            unroll += snippet.replaceAll("\\[ i \\]/g", "[ " + i + " ]");
        }
        return unroll;
    }

    public static String unrollLoops(String string) {

        //String pattern = "for \\( int i \\= (\\d+)\\; i < (\\d+)\\; i \\+\\+ \\) \\{([\\s\\S]+?)(?=\\})\\}/g";
        Pattern pattern = Pattern.compile("for \\( int i \\= (\\d+)\\; i < (\\d+)\\; i \\+\\+ \\) \\{([\\s\\S]+?)(?=\\})\\}/g");
        Matcher matcher = pattern.matcher(string);
        while (matcher.find()) {
            String group = matcher.group();
            int start = string.indexOf(group);
            int end = start + group.length();
            string = string.replaceFirst(group, replace(start, end, group));
        }
        return string;

    }


    public int programIdCount;
    public int usedTimes = 1;

    private GLUniforms cachedUniforms = null;

    private final Renderer renderer;
    private final Material material;

    private Integer program;
    
    public GLProgram(Renderer renderer, String code, Material material, Map<String, Object> parameters) {
        this.programIdCount = idGen.incrementAndGet();

        this.renderer = renderer;
        this.material = material;

        String envMapTypeDefine = "ENVMAP_TYPE_CUBE";
        String envMapModeDefine = "ENVMAP_MODE_REFLECTION";
        String envMapBlendingDefine = "ENVMAP_BLENDING_MULTIPLY";

        if (parameters.containsKey("envMap")) {
            Texture envMap = (Texture) parameters.get("envMap");
            int mapping = envMap.mapping;
            switch (mapping) {
                case CubeReflectionMapping:
                case CubeRefractionMapping:
                    envMapTypeDefine = "ENVMAP_TYPE_CUBE";
                    break;

                case CubeUVReflectionMapping:
                case CubeUVRefractionMapping:
                    envMapTypeDefine = "ENVMAP_TYPE_CUBE_UV";
                    break;

                case EquirectangularReflectionMapping:
                case EquirectangularRefractionMapping:
                    envMapTypeDefine = "ENVMAP_TYPE_CUBE_EQUIREC";
                    break;

                case SphericalReflectionMapping:
                    envMapTypeDefine = "ENVMAP_TYPE_SPHERE";
                    break;
            }

            double gammaFactorDefine = (renderer.gammaFactor > 0) ? renderer.gammaFactor : 1;

            String customDefines = generateDefines(null);

            int program = GL20.glCreateProgram();

            String prefixVertex, prefixFragment;
            if (material instanceof RawShaderMaterial) {
                prefixVertex = Arrays.asList(new String[]{
                    customDefines,
                    "\n"

                }).stream().filter(filterEmptyLine()).collect(Collectors.joining("\n"));

                prefixFragment = Arrays.asList(new String[]{
                    customDefines,
                    "\n"

                }).stream().filter(filterEmptyLine()).collect(Collectors.joining("\n"));

            } else {

                prefixVertex = Arrays.asList(new String[]{
                    //                    "precision " + parameters.precision + " float;",
                    //			"precision " + parameters.precision + " int;",
                    //
                    //			"#define SHADER_NAME " + material.__webglShader.name,
                    //
                    //			customDefines,
                    //
                    //			parameters.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "",
                    //
                    //			"#define GAMMA_FACTOR " + gammaFactorDefine,
                    //
                    //			"#define MAX_BONES " + parameters.maxBones,
                    //
                    //			parameters.map ? "#define USE_MAP" : "",
                    //			parameters.envMap ? "#define USE_ENVMAP" : "",
                    //			parameters.envMap ? "#define " + envMapModeDefine : "",
                    //			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
                    //			parameters.aoMap ? "#define USE_AOMAP" : "",
                    //			parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
                    //			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
                    //			parameters.normalMap ? "#define USE_NORMALMAP" : "",
                    //			parameters.displacementMap && parameters.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "",
                    //			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
                    //			parameters.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
                    //			parameters.metalnessMap ? "#define USE_METALNESSMAP" : "",
                    //			parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
                    //			parameters.vertexColors ? "#define USE_COLOR" : "",
                    //
                    //			parameters.flatShading ? "#define FLAT_SHADED" : "",
                    //
                    //			parameters.skinning ? "#define USE_SKINNING" : "",
                    //			parameters.useVertexTexture ? "#define BONE_TEXTURE" : "",
                    //
                    //			parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
                    //			parameters.morphNormals && parameters.flatShading == false ? "#define USE_MORPHNORMALS" : "",
                    //			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
                    //			parameters.flipSided ? "#define FLIP_SIDED" : "",
                    //
                    //			"#define NUM_CLIPPING_PLANES " + parameters.numClippingPlanes,
                    //
                    //			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
                    //			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
                    //
                    //			parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
                    //
                    //			parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
                    //			parameters.logarithmicDepthBuffer && renderer.extensions.get( "EXT_frag_depth" ) ? "#define USE_LOGDEPTHBUF_EXT" : "",

                    "uniform mat4 modelMatrix;",
                    "uniform mat4 modelViewMatrix;",
                    "uniform mat4 projectionMatrix;",
                    "uniform mat4 viewMatrix;",
                    "uniform mat3 normalMatrix;",
                    "uniform vec3 cameraPosition;",
                    "attribute vec3 position;",
                    "attribute vec3 normal;",
                    "attribute vec2 uv;",
                    "#ifdef USE_COLOR",
                    "	attribute vec3 color;",
                    "#endif",
                    "#ifdef USE_MORPHTARGETS",
                    "	attribute vec3 morphTarget0;",
                    "	attribute vec3 morphTarget1;",
                    "	attribute vec3 morphTarget2;",
                    "	attribute vec3 morphTarget3;",
                    "	#ifdef USE_MORPHNORMALS",
                    "		attribute vec3 morphNormal0;",
                    "		attribute vec3 morphNormal1;",
                    "		attribute vec3 morphNormal2;",
                    "		attribute vec3 morphNormal3;",
                    "	#else",
                    "		attribute vec3 morphTarget4;",
                    "		attribute vec3 morphTarget5;",
                    "		attribute vec3 morphTarget6;",
                    "		attribute vec3 morphTarget7;",
                    "	#endif",
                    "#endif",
                    "#ifdef USE_SKINNING",
                    "	attribute vec4 skinIndex;",
                    "	attribute vec4 skinWeight;",
                    "#endif",
                    "\n"

                }).stream().filter(filterEmptyLine()).collect(Collectors.joining("\n"));

                prefixFragment = Arrays.asList(new String[]{
                    //                    customExtensions,

                    //			"precision " + parameters.precision + " float;",
                    //			"precision " + parameters.precision + " int;",
                    //
                    //			"#define SHADER_NAME " + material.__webglShader.name,

                    customDefines,
                    //			parameters.alphaTest ? "#define ALPHATEST " + parameters.alphaTest : "",
                    //
                    "#define GAMMA_FACTOR " + gammaFactorDefine,
                    //
                    //			( parameters.useFog && parameters.fog ) ? "#define USE_FOG" : "",
                    //			( parameters.useFog && parameters.fogExp ) ? "#define FOG_EXP2" : "",
                    //
                    //			parameters.map ? "#define USE_MAP" : "",
                    //			parameters.envMap ? "#define USE_ENVMAP" : "",
                    //			parameters.envMap ? "#define " + envMapTypeDefine : "",
                    //			parameters.envMap ? "#define " + envMapModeDefine : "",
                    //			parameters.envMap ? "#define " + envMapBlendingDefine : "",
                    //			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
                    //			parameters.aoMap ? "#define USE_AOMAP" : "",
                    //			parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
                    //			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
                    //			parameters.normalMap ? "#define USE_NORMALMAP" : "",
                    //			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
                    //			parameters.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
                    //			parameters.metalnessMap ? "#define USE_METALNESSMAP" : "",
                    //			parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
                    //			parameters.vertexColors ? "#define USE_COLOR" : "",
                    //
                    //			parameters.gradientMap ? "#define USE_GRADIENTMAP" : "",
                    //
                    //			parameters.flatShading ? "#define FLAT_SHADED" : "",
                    //
                    //			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
                    //			parameters.flipSided ? "#define FLIP_SIDED" : "",
                    //
                    //			"#define NUM_CLIPPING_PLANES " + parameters.numClippingPlanes,
                    //			"#define UNION_CLIPPING_PLANES " + (parameters.numClippingPlanes - parameters.numClipIntersection),
                    //
                    //			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
                    //			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
                    //
                    //			parameters.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
                    //
                    //			parameters.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : "",
                    //
                    //			parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
                    //			parameters.logarithmicDepthBuffer && renderer.extensions.get( "EXT_frag_depth" ) ? "#define USE_LOGDEPTHBUF_EXT" : "",
                    //
                    //			parameters.envMap && renderer.extensions.get( "EXT_shader_texture_lod" ) ? "#define TEXTURE_LOD_EXT" : "",
                    //
                    "uniform mat4 viewMatrix;",
                    "uniform vec3 cameraPosition;",
                    //
                    //			( parameters.toneMapping != NoToneMapping ) ? "#define TONE_MAPPING" : "",
                    //			( parameters.toneMapping != NoToneMapping ) ? ShaderChunk[ "tonemapping_pars_fragment" ] : "",  // this code is required here because it is used by the toneMapping() function defined below
                    //			( parameters.toneMapping != NoToneMapping ) ? getToneMappingFunction( "toneMapping", parameters.toneMapping ) : "",
                    //
                    //			( parameters.outputEncoding || parameters.mapEncoding || parameters.envMapEncoding || parameters.emissiveMapEncoding ) ? ShaderChunk[ "encodings_pars_fragment" ] : "", // this code is required here because it is used by the various encoding/decoding function defined below
                    //			parameters.mapEncoding ? getTexelDecodingFunction( "mapTexelToLinear", parameters.mapEncoding ) : "",
                    //			parameters.envMapEncoding ? getTexelDecodingFunction( "envMapTexelToLinear", parameters.envMapEncoding ) : "",
                    //			parameters.emissiveMapEncoding ? getTexelDecodingFunction( "emissiveMapTexelToLinear", parameters.emissiveMapEncoding ) : "",
                    //			parameters.outputEncoding ? getTexelEncodingFunction( "linearToOutputTexel", parameters.outputEncoding ) : "",
                    //
                    //			parameters.depthPacking ? "#define DEPTH_PACKING " + material.depthPacking : "",

                    "\n"

                }).stream().filter(filterEmptyLine()).collect(Collectors.joining("\n"));

            }
        }

    }

    public GLUniforms getUniforms() {
        if (cachedUniforms == null) {
            cachedUniforms = new GLUniforms(program, renderer);
        }
        return cachedUniforms;
    }

    public void destroy() {
        GL20.glDeleteProgram(program);
        program = null;
    }

}
