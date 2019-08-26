/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.Texture;
import org.apache.commons.lang3.tuple.*;

/**
 *
 * @author laht
 */
public class PointsMaterial extends Material {
    
    public double size = 1;
    public boolean sizeAttenuation = true;
    
    public Texture map = null;
    
    public Color color = new Color().set("#ffffff");
    
    public PointsMaterial(Pair<String, Object> ... values) {
        
        type = "PointsMaterial";
        
        lights = false;
        
        setValues(values);
    }
    
    public PointsMaterial copy(PointsMaterial source) {
        super.copy(source);
        
        this.color.copy(source.color);
        
        this.map = source.map;
        
        this.size = source.size;
        this.sizeAttenuation = source.sizeAttenuation;
        
        return this;
        
    }
    
}
