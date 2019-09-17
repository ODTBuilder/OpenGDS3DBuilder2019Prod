/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.lights;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Object3D;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Angle;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;

/**
 *
 * @author laht
 */
public class SpotLight extends Light {
    
    public Object3D target;
    public LightShadow shadow;
    public final Angle angle;
    public double distance, penumbra, decay;

    public SpotLight(Color color) {
        this(color, 1);
    }
    
     public SpotLight(Color color, double intensity) {
        this(color, intensity, 0, Angle.rad(Math.PI/3), 0, 1);
    }

    public SpotLight(Color color, double intensity, double distance, Angle angle, double penumbra, double decay) {
        super(color, intensity);
        
        type = "SpotLight";
        
        this.distance = distance;
        this.angle = angle;
        this.penumbra = penumbra;
        this.decay = decay;
        
        this.target = new Object3D();
        
        this.position.copy(Object3D.DEFAULT_UP);
        this.updateMatrix();
        
        this.shadow = new SpotLightShadow();
        
    }
    
    public double getPower() {
        return this.intensity * Math.PI;
    }
    
    public void setPower(double power) {
        this.intensity = power / Math.PI;
    }
    
    public SpotLight copy(SpotLight source) {
        
        super.copy(source);
        
        this.distance = source.distance;
        this.angle.copy(source.angle);
        this.penumbra = source.penumbra;
        this.decay = source.decay; 
        
        this.target = source.target.copy();
        
        this.shadow = source.shadow.copy();
        
        return this;
        
        
        
    }
    
    
}
