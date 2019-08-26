/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.textures;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import java.awt.image.*;

/**
 https://github.com/mrdoob/three.js/blob/master/src/textures/CubeTexture.js
 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class CubeTexture extends Texture {

    public CubeTexture(BufferedImage image, Integer mapping, Integer wrapS, Integer wrapT, Integer magFilter, Integer minFilter, Integer format, Integer type, Integer anisotropy, Integer encoding) {
        super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
        
        this.mapping = mapping == null ? Constants.CubeReflectionMapping : mapping;
        
        flipY = false;
        
    }
    
    
    
}
