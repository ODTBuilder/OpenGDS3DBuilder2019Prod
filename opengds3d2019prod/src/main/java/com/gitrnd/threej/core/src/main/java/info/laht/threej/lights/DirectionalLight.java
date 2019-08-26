/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.lights;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class DirectionalLight extends Light {

    public Object3D target;
    
    public LightShadow shadow;

    public DirectionalLight(Color color) {
        super(color, 1);
    }

    public DirectionalLight(Color color, double intensity) {
        super(color, intensity);
        
        type = "DirectionalLight";
        
        position.copy(Object3D.DEFAULT_UP);
        updateMatrix();

        target = new Object3D();
        
        shadow = new DirectionalLightShadow();

    }

   public DirectionalLight copy(DirectionalLight source) {
       super.copy(source);
       
       this.target = source.target.copy(true);
       this.shadow = source.shadow.copy();
       
       return this;
   }

}
