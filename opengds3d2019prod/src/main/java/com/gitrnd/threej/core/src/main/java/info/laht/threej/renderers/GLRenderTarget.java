/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.renderers;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.Copyable;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector4d;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.textures.Texture;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.apache.commons.lang3.tuple.Pair;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderTarget.js
 * @author laht
 */
public class GLRenderTarget implements Serializable, Copyable {
    
    public final boolean isRenderTarget = true;

    private final UUID uuid = UUID.randomUUID();
    
    private Map<String, Object> options;

    private Vector4d viewport;

    private int width, height;

    private Vector4d scissor;
    public boolean scissorTest, depthBuffer, stencilBuffer;
    
    private Texture texture, depthTexture; //TODO
    
    private GLRenderTarget() {
        //for copy only
    }

    public GLRenderTarget(int width, int height, Pair<String, Object> ... parameters) {
        this.width = width;
        this.height = height;
        
        this.options = new HashMap<>();
        if(options != null) {
            for (Pair<String, Object> p : parameters) {
                this.options.put(p.getKey(), p.getValue());
            }
        }
        if (!options.containsKey("minFilter")) {
            options.put("minFilter", Constants.LinearFilter);
        }
        
        this.depthBuffer = options.containsKey("depthBuffer") ? (boolean) options.get("depthBuffer") : true;
        this.stencilBuffer = options.containsKey("stencilBuffer") ? (boolean) options.get("stencilBuffer") : true;

        this.scissor = new Vector4d(0, 0, width, height);
        this.viewport = new Vector4d(0, 0, width, height);
        
        

    }

    public UUID getUuid() {
        return uuid;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }
    
    public GLRenderTarget copy() {
        return new GLRenderTarget().copy(this);
    }

    public GLRenderTarget copy(GLRenderTarget source) {
        this.width = source.width;
        this.height = source.height;
        
        this.viewport.copy(source.viewport);
        
//        this.scissor.copy(source.scissor);
//        this.scissorTest = source.scissorTest;
        
        this.depthBuffer = source.depthBuffer;
        this.stencilBuffer = source.stencilBuffer;
        this.depthTexture = source.depthTexture;
        
        return this;
    }
    
}
