/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.Texture;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.*;
import org.apache.commons.lang3.tuple.*;

/**
 *
 * @author laht
 */
public class MeshBasicMaterial extends Material {
    
    public Color color = new Color().set("#ffffff");
    
    public Texture map = null;
    
    public Texture lightMap = null;
    public double lightMapIntensity = 1;
    
    public Texture aoMap = null;
    public double aoMapIntensity = 1;
    
    public Texture specularMap = null;
    
    public Texture alphaMap = null;
    
    public CubeTexture envMap = null;
    public int combine = Constants.MultiplyOperation;
    public double reflectivity = 1;
    public double refractionRatio = 0.98;
    
    public boolean wireframe;
    public double wireframeLinewidth = 1;
    public String wireframeLinecap = "round";
    public String wireframeLinejoin = "round";
    
    public boolean skinning = false;
    public boolean morphTargets = false;

    public MeshBasicMaterial(Pair<String, Object> ... values) {
        
        type = "MeshBasicMaterial";
        
        lights = false;
        
        super.setValues(values);
    }
    
    
    public MeshBasicMaterial copy(MeshBasicMaterial source) {
        super.copy(source);
        
        this.map = source.map;

	this.lightMap = source.lightMap;
	this.lightMapIntensity = source.lightMapIntensity;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

	this.specularMap = source.specularMap;

	this.alphaMap = source.alphaMap;

	this.envMap = source.envMap;
	this.combine = source.combine;
	this.reflectivity = source.reflectivity;
	this.refractionRatio = source.refractionRatio;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;
	this.wireframeLinecap = source.wireframeLinecap;
	this.wireframeLinejoin = source.wireframeLinejoin;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;

	return this;
        
    }
    
    
}
