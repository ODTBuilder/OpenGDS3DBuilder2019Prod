/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.Texture;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.*;
import org.apache.commons.lang3.tuple.*;

/**
 *
 * @author laht
 */
public class MeshPhongMaterial extends Material {

    public Color color = new Color().set("#ffffff");
    public Color specular = new Color().set("#111111");
    public double shininess = 30;
    
    public Texture map = null;
    
    public Texture lightMap = null;
    public double lightMapIntensity = 1;
    
    public Texture aoMap = null;
    public double aoMapIntensity = 1;

    public Color emissive = new Color().set("#000000");
    public double emissiveIntensity = 1.0;
    public Texture emissiveMap = null;

    public Texture bumpMap = null;
    public int bumpScale = 1;

    public Vector2d normalMap = null;
    public Vector2d normalScale = new Vector2d(1, 1);

    public Texture displacementMap = null;
    public int displacementScale = 1;
    public int displacementBias = 0;
    
    public Texture specularMap = null;
    
    public Texture alphaMap = null;

    public CubeTexture envMap = null;
    public int combine = Constants.MultiplyOperation;
    public int reflectivity = 1;
    public double refractionRatio = 0.98;

    public boolean wireframe = false;
    public int wireframeLinewidth = 1;
    public String wireframeLinecap = "round";
    public String wireframeLinejoin = "round";

    public boolean skinning = false;
    public boolean morphTargets = false;
    public boolean morphNormals = false;

    public MeshPhongMaterial(Pair<String, Object> ... values) {
        type = "MeshPhongMaterial";
        
        setValues(values);
    }
    
    public MeshPhongMaterial copy(MeshPhongMaterial source) {
        super.copy(source);
        
        this.color.copy( source.color );
	this.specular.copy( source.specular );
	this.shininess = source.shininess;

	this.map = source.map;

	this.lightMap = source.lightMap;
	this.lightMapIntensity = source.lightMapIntensity;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

	this.emissive.copy( source.emissive );
	this.emissiveMap = source.emissiveMap;
	this.emissiveIntensity = source.emissiveIntensity;

	this.bumpMap = source.bumpMap;
	this.bumpScale = source.bumpScale;

	this.normalMap = source.normalMap;
	this.normalScale.copy( source.normalScale );

	this.displacementMap = source.displacementMap;
	this.displacementScale = source.displacementScale;
	this.displacementBias = source.displacementBias;

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
	this.morphNormals = source.morphNormals;

	return this;
        
    }

}
