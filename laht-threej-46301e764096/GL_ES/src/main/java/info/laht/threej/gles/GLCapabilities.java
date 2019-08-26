/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import org.lwjgl.opengles.GLES20;

/**
 *
 * @author laht
 */
public class GLCapabilities {

    private Integer maxAnisotropy;

    public final int maxTextures;
    public final int maxVertexTextures;
    public final int maxTextureSize;
    public final int maxCubemapSize;

    public final int maxAttributes;
    public final int maxVertexUniforms;
    public final int maxVaryings;
    public final int maxFragmentUniforms;

    public boolean vertexTextures;

    public GLCapabilities() {

        this.maxTextures = GLES20.glGetInteger(GLES20.GL_MAX_TEXTURE_IMAGE_UNITS);
        this.maxVertexTextures = GLES20.glGetInteger(GLES20.GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this.maxTextureSize = GLES20.glGetInteger(GLES20.GL_MAX_TEXTURE_SIZE);
        this.maxCubemapSize = GLES20.glGetInteger(GLES20.GL_MAX_CUBE_MAP_TEXTURE_SIZE);
        this.maxAttributes = GLES20.glGetInteger(GLES20.GL_MAX_VERTEX_ATTRIBS);
        this.maxVertexUniforms = GLES20.glGetInteger(GLES20.GL_MAX_VERTEX_UNIFORM_VECTORS);
        this.maxVaryings = GLES20.glGetInteger(GLES20.GL_MAX_VARYING_VECTORS);
        this.maxFragmentUniforms = GLES20.glGetInteger(GLES20.GL_MAX_FRAGMENT_UNIFORM_VECTORS);
        this.vertexTextures = maxVertexTextures > 0;

    }

    public int getMaxAnisotropy() {

        if (maxAnisotropy != null) {
            return maxAnisotropy;
        } else {
            maxAnisotropy = 0;
        }
 
        return maxAnisotropy;
    }

    public String getMaxPrecision(String precision) {
        return "highp";
    }

}
