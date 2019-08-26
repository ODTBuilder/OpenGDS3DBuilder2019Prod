/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.lights;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.cameras.Camera;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Matrix4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.Texture;
import java.io.Serializable;

/**
 *
 * @author laht
 */
public class LightShadow implements Serializable {
    
    protected Camera camera;
    protected double bias = 0;
    protected double radius = 1;
    
    protected Vector2d mapSize = new Vector2d(512, 512);
    
    protected Texture map = null;
    protected Matrix4d matrix = new Matrix4d();
    
    public LightShadow(Camera camera) {
        this.camera = camera;
    }
    
    public LightShadow copy() {
        return new LightShadow(null).copy(this);
    }
    
    public LightShadow copy(LightShadow source) {
        this.camera = (Camera) source.camera.copy();
        this.bias = source.bias;
        this.radius = source.radius;
        this.mapSize.copy(source.mapSize);
        
        return this;
    }
    
}
