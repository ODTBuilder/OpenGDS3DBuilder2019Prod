/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.lights;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class PointLight extends Light {
    
    public double distance, decay;
    
    public LightShadow shadow;
    
    public PointLight(Color color, double intensity) {
        this(color, intensity, 0, 1);
    }
    
    public PointLight(Color color, double intensity, double distance, double decay) {
        super(color, intensity);
        
        type = "PointLight";
        
        this.distance = distance;
        this.decay = decay;
        
        this.shadow = new LightShadow(new PerspectiveCamera(90, 1, 0.5, 500));
        
    }
    
    public double getPower() {
        return intensity * 4 * Math.PI;
    }
    
    public void setPower(double power) {
        intensity = power / (4 * Math.PI);
    }
    
    public PointLight copy(PointLight source) {
        
        super.copy(source);
        
        this.distance = source.distance;
        this.decay = source.decay;
        
        this.shadow = source.shadow.copy();
        
        return this;
        
    }
    
    
}
