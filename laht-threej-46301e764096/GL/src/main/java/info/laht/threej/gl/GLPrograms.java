/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author laht
 */
public class GLPrograms {

    private final List<GLProgram> programs;
    private final List<String> parameterNames;
    private final Map<String, String> shaderIds;

    public GLPrograms(Renderer renderer) {

        this.programs = new ArrayList<>();

        this.parameterNames = Arrays.asList(new String[]{
            "precision", "supportsVertexTextures", "map", "mapEncoding", "envMap", "envMapMode", "envMapEncoding",
            "lightMap", "aoMap", "emissiveMap", "emissiveMapEncoding", "bumpMap", "normalMap", "displacementMap", "specularMap",
            "roughnessMap", "metalnessMap", "gradientMap",
            "alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
            "flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
            "maxBones", "useVertexTexture", "morphTargets", "morphNormals",
            "maxMorphTargets", "maxMorphNormals", "premultipliedAlpha",
            "numDirLights", "numPointLights", "numSpotLights", "numHemiLights", "numRectAreaLights",
            "shadowMapEnabled", "shadowMapType", "toneMapping", "physicallyCorrectLights",
            "alphaTest", "doubleSided", "flipSided", "numClippingPlanes", "numClipIntersection", "depthPacking"
        });

        this.shaderIds = new HashMap<>();
        this.shaderIds.put("MeshDepthMaterial", "depth");
        this.shaderIds.put("MeshNormalMaterial", "normal");
        this.shaderIds.put("MeshBasicMaterial", "basic");
        this.shaderIds.put("MeshLambertMaterial", "lambert");
        this.shaderIds.put("MeshPhongMaterial", "phong");
        this.shaderIds.put("MeshToonMaterial", "phong");
        this.shaderIds.put("MeshStandardMaterial", "physical");
        this.shaderIds.put("MeshPhysicalMaterial", "physical");
        this.shaderIds.put("LineBasicMaterial", "basic");
        this.shaderIds.put("LineDashedMaterial", "dashed");
        this.shaderIds.put("PointsMaterial", "points");
    }
    
    private void allocateBones(Object object) {
        
    }

}
