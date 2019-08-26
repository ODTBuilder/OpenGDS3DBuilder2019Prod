/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import org.lwjgl.opengl.GL;
import org.lwjgl.opengl.GL11;



/**
 *
 * @author laht
 */
public class GLExtensions {
    
    public GLExtensions() {
        
        GL.createCapabilities();
        String glGetString = GL11.glGetString(GL11.GL_EXTENSIONS);
        System.out.println(glGetString);
    }
    
}
