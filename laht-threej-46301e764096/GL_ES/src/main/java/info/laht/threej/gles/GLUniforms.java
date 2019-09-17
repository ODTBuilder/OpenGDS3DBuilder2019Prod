/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import info.laht.threej.textures.Texture;
import java.util.List;
import java.util.Map;

/**
 *
 * @author laht
 */
public class GLUniforms {
 
    private final static Texture EMPTY_TEXTURE = new Texture(null);
    //private final static CubeTexture EMPTY_CUBE_TEXTURE = new CubeTexture(null);
    
    public GLUniforms(int program, Renderer renderer) {
        
    }
    
    void flatten() {
        
    }
    
    void allocTexUnits() {
        
    }
    
    static class UniformContainer {
        List seq;
        Map map;
    }
    
}
