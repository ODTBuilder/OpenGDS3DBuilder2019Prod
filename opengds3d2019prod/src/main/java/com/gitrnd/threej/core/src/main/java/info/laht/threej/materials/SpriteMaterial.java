/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.*;
import org.apache.commons.lang3.tuple.*;

/**
 https://github.com/mrdoob/three.js/blob/master/src/materials/SpriteMaterial.js
 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class SpriteMaterial extends Material {
    
    public Color color = new Color().set("#ffffff");
    
    public Texture map = null;
    
    public final Angle rotation = Angle.rad(0);

    public SpriteMaterial(Pair<String, Object> ... values) {
        
        type = "SpriteMaterial";
        
        fog = false;
        lights = false;
        
        super.setValues(values);
    }

   public SpriteMaterial copy(SpriteMaterial source) {
       
       super.copy(source);
       
       this.color.copy(source.color);
       this.map = source.map;
       
       this.rotation.copy(source.rotation);
       
       return this;
       
       
   }
    

    
    
    
    
}
