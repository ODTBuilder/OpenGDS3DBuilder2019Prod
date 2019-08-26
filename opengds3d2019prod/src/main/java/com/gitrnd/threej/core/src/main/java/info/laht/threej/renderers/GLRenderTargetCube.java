/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.renderers;

import org.apache.commons.lang3.tuple.Pair;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderTargetCube.js
 * @author laht
 */
public class GLRenderTargetCube extends GLRenderTarget {
    
    public boolean isRenderTargetCube = true;
    
    public int activeCubeFace = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
    public int activeMipMapLevel = 0;

    public GLRenderTargetCube(int width, int height, Pair<String, Object>... parameters) {
        super(width, height, parameters);
    }
    
    
    
}
