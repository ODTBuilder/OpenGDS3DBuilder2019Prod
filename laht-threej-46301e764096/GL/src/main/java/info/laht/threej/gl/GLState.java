/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import info.laht.threej.core.Constants;
import info.laht.threej.math.Vector4d;
import java.nio.ByteBuffer;
import java.nio.IntBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.lwjgl.BufferUtils;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL12;
import org.lwjgl.opengl.GL13;
import org.lwjgl.opengl.GL14;
import org.lwjgl.opengl.GL20;
import org.lwjgl.opengl.GL40;
import org.lwjgl.opengl.GL42;
import org.lwjgl.opengl.GL43;
import org.lwjgl.opengl.GL44;

/**
 *
 * @author laht
 */
public class GLState {
    
    static class ColorBuffer {
        
        boolean locked = false;
        Vector4d color = new Vector4d();
        Boolean currentColorMask = null;
        Vector4d currentColorClear = new Vector4d();
        
        public void setMask(boolean colorMask) {
            
            if (currentColorMask != colorMask && !locked) {
                GL11.glColorMask(colorMask, colorMask, colorMask, colorMask);
                currentColorMask = colorMask;
            }
            
        }
        
        public void setLocked(boolean lock) {
            this.locked = lock;
        }
        
        public void setClear(float r, float g, float b, float a, boolean premultipliedAlpha) {
            if (premultipliedAlpha) {
                r *= a;
                g *= a;
                b *= a;
            }
            color.set(r, g, b, a);
            
            if (!currentColorClear.equals(color)) {
                GL11.glClearColor(r, g, b, a);
                currentColorClear.copy(color);
            }
        }
        
        public void reset() {
            locked = false;
            currentColorMask = null;
            currentColorClear.set(0, 0, 0, 1);
        }
        
    }
    
    class DepthBuffer {
        
        boolean locked = false;
        
        Boolean currentDepthMask = null;
        Integer currentDepthFunc = null;
        Double currentDepthClear = null;
        
        public void setTest(boolean depthTest) {
            
            if (depthTest) {
                enable(GL11.GL_DEPTH_TEST);
            } else {
                disable(GL11.GL_DEPTH_TEST);
            }
            
        }
        
        public void setMask(boolean depthMask) {
            
            if (currentDepthMask != depthMask && !locked) {
                GL11.glDepthMask(depthMask);
                currentDepthMask = depthMask;
            }
            
        }
        
        public void setFunc(int depthFunc) {
            if (currentDepthFunc != depthFunc) {
                
                switch (depthFunc) {
                    
                    case Constants.NeverDepth:
                        
                        GL11.glDepthFunc(GL11.GL_NEVER);
                        break;
                    
                    case Constants.AlwaysDepth:
                        
                        GL11.glDepthFunc(GL11.GL_ALWAYS);
                        break;
                    
                    case Constants.LessDepth:
                        
                        GL11.glDepthFunc(GL11.GL_LESS);
                        break;
                    
                    case Constants.LessEqualDepth:
                        
                        GL11.glDepthFunc(GL11.GL_LEQUAL);
                        break;
                    
                    case Constants.EqualDepth:
                        
                        GL11.glDepthFunc(GL11.GL_EQUAL);
                        break;
                    
                    case Constants.GreaterEqualDepth:
                        
                        GL11.glDepthFunc(GL11.GL_GEQUAL);
                        break;
                    
                    case Constants.GreaterDepth:
                        
                        GL11.glDepthFunc(GL11.GL_GREATER);
                        break;
                    
                    case Constants.NotEqualDepth:
                        
                        GL11.glDepthFunc(GL11.GL_NOTEQUAL);
                        break;
                    
                    default:
                        
                        GL11.glDepthFunc(GL11.GL_LEQUAL);
                    
                }
                
            }
            
            currentDepthFunc = depthFunc;
            
        }
        
        public void setLocked(boolean lock) {
            this.locked = lock;
        }
        
        public void setClear(double depth) {
            if (currentDepthClear != depth) {
                GL11.glClearDepth(depth);
                currentDepthClear = depth;
            }
        }
        
        public void reset() {
            locked = false;
            currentDepthClear = null;
            currentDepthFunc = null;
            currentDepthMask = null;
        }
        
    }
    
    class StencilBuffer {
        
        boolean locked = false;
        
        Integer currentStencilMask = null;
        Integer currentStencilFunc = null;
        Integer currentStencilRef = null;
        Integer currentStencilFuncMask = null;
        Integer currentStencilFail = null;
        Integer currentStencilZFail = null;
        Integer currentStencilZPass = null;
        Integer currentStencilClear = null;
        
        public void setTest(boolean stencilTest) {
            
            if (stencilTest) {
                enable(GL11.GL_STENCIL_TEST);
            } else {
                disable(GL11.GL_STENCIL_TEST);
            }
            
        }
        
        public void setMask(int stencilMask) {
            if (currentStencilMask != stencilMask && !locked) {
                GL11.glStencilMask(stencilMask);
                currentStencilMask = stencilMask;
            }
        }
        
        public void setFunc(int stencilFunc, int stencilRef, int stencilMask) {
            
            if (currentStencilFunc != stencilFunc
                    || currentStencilRef != stencilRef
                    || currentStencilMask != stencilMask) {
                
                GL11.glStencilFunc(stencilFunc, stencilRef, stencilMask);
                
                currentStencilFunc = stencilFunc;
                currentStencilRef = stencilRef;
                currentStencilMask = stencilMask;
                
            }
        }
        
        public void setOp(int stencilFail, int stencilZFail, int stencilZPass) {
            
            if (currentStencilFail != stencilFail
                    || currentStencilZFail != stencilZFail
                    || currentStencilZPass != stencilZPass) {
                
                GL11.glStencilOp(stencilFail, stencilZFail, stencilZPass);
                
                currentStencilFail = stencilFail;
                currentStencilZFail = stencilZFail;
                currentStencilZPass = stencilZPass;
            }
        }
        
        public void setLocked(boolean locked) {
            this.locked = locked;
        }
        
        public void setClear(int stencil) {
            if (currentStencilClear != stencil) {
                GL11.glClearStencil(stencil);
                currentStencilClear = stencil;
            }
        }
        
        public void reset() {
            locked = false;
            
            currentStencilMask = null;
            currentStencilFunc = null;
            currentStencilRef = null;
            currentStencilFuncMask = null;
            currentStencilFail = null;
            currentStencilZFail = null;
            currentStencilZPass = null;
            currentStencilClear = null;
            
        }
        
    }
    
    ColorBuffer colorBuffer = new ColorBuffer();
    DepthBuffer depthBuffer = new DepthBuffer();
    StencilBuffer stencilBuffer = new StencilBuffer();
    
    int maxVertexAttributes;
    IntBuffer newAttributes;
    IntBuffer enabledAttributes;
    IntBuffer attributeDivisors;
    
    Map<Integer, Boolean> capabilities = new HashMap<>();
    
    List<Integer> compressedTextureFormats = null;
    
    Integer currentBlending = null;
    Integer currentBlendEquation = null;
    Integer currentBlendSrc = null;
    Integer currentBlendDst = null;
    Integer currentBlendEquationAlpha = null;
    Integer currentBlendSrcAlpha = null;
    Integer currentBlendDstAlpha = null;
    boolean currentPremultipledAlpha = false;
    
    Boolean currentFlipSided = null;
    Integer currentCullFace = null;
    
    Float currentLineWidth = null;
    
    Float currentPolygonOffsetFactor = null;
    Float currentPolygonOffsetUnits = null;
    
    Boolean currentScissorTest = null;
    
    int maxTextures;
    
    boolean lineWidthAvailable = true;
    
    Integer currentTextureSlot = null;
    Map<Integer, BoundTexture> currentBoundTextures = new HashMap<>();
    
    Vector4d currentScissor = new Vector4d();
    Vector4d currentViewport = new Vector4d();
    
    Map<Integer, Integer> emptyTextures = new HashMap<>();
    
    public GLState() {
        
        maxVertexAttributes = GL11.glGetInteger(GL20.GL_MAX_VERTEX_ATTRIBS);
        newAttributes = BufferUtils.createIntBuffer(maxVertexAttributes);
        enabledAttributes = BufferUtils.createIntBuffer(maxVertexAttributes);
        attributeDivisors = BufferUtils.createIntBuffer(maxVertexAttributes);
        
        maxTextures = GL11.glGetInteger(GL20.GL_MAX_TEXTURE_IMAGE_UNITS);
        
        emptyTextures.put(GL11.GL_TEXTURE_2D, createTexture(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_2D, 1));
        emptyTextures.put(GL13.GL_TEXTURE_CUBE_MAP, createTexture(GL13.GL_TEXTURE_CUBE_MAP, GL13.GL_TEXTURE_CUBE_MAP_POSITIVE_X, 6));
        
    }
    
    public final int createTexture(int type, int target, int count) {
        
        IntBuffer data = BufferUtils.createIntBuffer(4);
        int texture = GL11.glGenTextures();
        
        GL11.glBindTexture(type, texture);
        GL11.glTexParameteri(type, GL11.GL_TEXTURE_MIN_FILTER, GL11.GL_NEAREST);
        GL11.glTexParameteri(type, GL11.GL_TEXTURE_MAG_FILTER, GL11.GL_NEAREST);
        
        for (int i = 0; i < count; i++) {
            GL11.glTexImage2D(target + i, 0, GL11.GL_RGBA, 1, 1, 0, GL11.GL_RGBA, GL11.GL_UNSIGNED_BYTE, data);
        }
        
        return texture;
        
    }
    
    public void init() {
        colorBuffer.setClear(0, 0, 0, 1, false);
        depthBuffer.setClear(1);
        stencilBuffer.setClear(0);
        
        enable(GL11.GL_DEPTH_TEST);
        setDepthFunc(Constants.LessEqualDepth);
        
        setFlipSided(false);
        setCullFace(Constants.CullFaceBack);
        enable(GL11.GL_CULL_FACE);
        
        enable(GL11.GL_BLEND);
        setBlending(Constants.NormalBlending, null, null, null, null, null, null, null);
    }
    
    void initAttributes() {
        
        for (int i = 0, l = newAttributes.capacity(); i < l; i++) {
            newAttributes.put(i, 0);
        }
        
    }
    
    void enableAttribute(int attribute) {
        
        newAttributes.put(attribute, 1);
        
        if (enabledAttributes.get(attribute) == 0) {
            GL20.glEnableVertexAttribArray(attribute);
            
            enabledAttributes.put(attribute, 1);
            
        }
        
        if (attributeDivisors.get(attribute) != 0) {

//			var extension = extensions.get( 'ANGLE_instanced_arrays' );
//
//			extension.vertexAttribDivisorANGLE( attribute, 0 );
//			attributeDivisors.put(attribute, 0);
        }
        
    }
    
    void enableAttributeAndDivisor(int attribute, int meshPerAttribute) {
        
        newAttributes.put(attribute, 1);
        
        if (enabledAttributes.get(attribute) == 0) {
            
            GL20.glEnableVertexAttribArray(attribute);
            enabledAttributes.put(attribute, 1);
            
        }
        
        if (attributeDivisors.get(attribute) != meshPerAttribute) {

//			extension.vertexAttribDivisorANGLE( attribute, meshPerAttribute );
//			attributeDivisors.put(attribute, meshPerAttribute);
        }
        
    }
    
    void disableUnusedAttributes() {
        
        for (int i = 0, l = enabledAttributes.capacity(); i != l; ++i) {
            
            if (enabledAttributes.get(i) != newAttributes.get(i)) {
                
                GL20.glDisableVertexAttribArray(i);
                enabledAttributes.put(i, 0);
                
            }
            
        }
        
    }
    
    void enable(int id) {
        
        if (!capabilities.get(id)) {
            
            GL11.glEnable(id);
            capabilities.put(id, true);
            
        }
    }
    
    void disable(int id) {
        
        if (capabilities.get(id)) {
            
            GL11.glDisable(id);
            capabilities.put(id, false);
            
        }
    }
    
    void setBlending(int blending, Integer blendEquation, Integer blendSrc, Integer blendDst, Integer blendEquationAlpha, Integer blendSrcAlpha, Integer blendDstAlpha, Boolean premultipliedAlpha) {
        
        if (blending != Constants.NoBlending) {
            
            enable(GL11.GL_BLEND);
            
        } else {
            
            disable(GL11.GL_BLEND);
            
        }
        
        if (blending != currentBlending || premultipliedAlpha != currentPremultipledAlpha) {
            
            if (blending == Constants.AdditiveBlending) {
                
                if (premultipliedAlpha) {
                    
                    GL20.glBlendEquationSeparate(GL14.GL_FUNC_ADD, GL14.GL_FUNC_ADD);
                    GL14.glBlendFuncSeparate(GL11.GL_ONE, GL11.GL_ONE, GL11.GL_ONE, GL11.GL_ONE);
                    
                } else {
                    
                    GL14.glBlendEquation(GL14.GL_FUNC_ADD);
                    GL11.glBlendFunc(GL11.GL_SRC_ALPHA, GL11.GL_ONE);
                    
                }
                
            } else if (blending == Constants.SubtractiveBlending) {
                
                if (premultipliedAlpha) {
                    
                    GL20.glBlendEquationSeparate(GL14.GL_FUNC_ADD, GL14.GL_FUNC_ADD);
                    GL14.glBlendFuncSeparate(GL11.GL_ZERO, GL11.GL_ZERO, GL11.GL_ONE_MINUS_SRC_COLOR, GL11.GL_ONE_MINUS_SRC_ALPHA);
                    
                } else {
                    
                    GL14.glBlendEquation(GL14.GL_FUNC_ADD);
                    GL11.glBlendFunc(GL11.GL_ZERO, GL11.GL_ONE_MINUS_SRC_COLOR);
                    
                }
                
            } else if (blending == Constants.MultiplyBlending) {
                
                if (premultipliedAlpha) {
                    
                    GL20.glBlendEquationSeparate(GL14.GL_FUNC_ADD, GL14.GL_FUNC_ADD);
                    GL14.glBlendFuncSeparate(GL11.GL_ZERO, GL11.GL_SRC_COLOR, GL11.GL_ZERO, GL11.GL_SRC_ALPHA);
                    
                } else {
                    
                    GL14.glBlendEquation(GL14.GL_FUNC_ADD);
                    GL11.glBlendFunc(GL11.GL_ZERO, GL11.GL_SRC_COLOR);
                    
                }
                
            } else {
                
                if (premultipliedAlpha) {
                    
                    GL20.glBlendEquationSeparate(GL14.GL_FUNC_ADD, GL14.GL_FUNC_ADD);
                    GL14.glBlendFuncSeparate(GL11.GL_ONE, GL11.GL_ONE_MINUS_SRC_ALPHA, GL11.GL_ONE, GL11.GL_ONE_MINUS_SRC_ALPHA);
                    
                } else {
                    
                    GL20.glBlendEquationSeparate(GL14.GL_FUNC_ADD, GL14.GL_FUNC_ADD);
                    GL14.glBlendFuncSeparate(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA, GL11.GL_ONE, GL11.GL_ONE_MINUS_SRC_ALPHA);
                    
                }
                
            }
            
            currentBlending = blending;
            currentPremultipledAlpha = premultipliedAlpha;
            
        }
        
        if (blending == Constants.CustomBlending) {

//			blendEquationAlpha = blendEquationAlpha || blendEquation;
//			blendSrcAlpha = blendSrcAlpha || blendSrc;
//			blendDstAlpha = blendDstAlpha || blendDst;
            if (blendEquation != currentBlendEquation || blendEquationAlpha != currentBlendEquationAlpha) {
                
                GL20.glBlendEquationSeparate(ParamThreeToGL.map(blendEquation), ParamThreeToGL.map(blendEquationAlpha));
                
                currentBlendEquation = blendEquation;
                currentBlendEquationAlpha = blendEquationAlpha;
                
            }
            
            if (blendSrc != currentBlendSrc || blendDst != currentBlendDst || blendSrcAlpha != currentBlendSrcAlpha || blendDstAlpha != currentBlendDstAlpha) {
                
                GL14.glBlendFuncSeparate(ParamThreeToGL.map(blendSrc), ParamThreeToGL.map(blendDst), ParamThreeToGL.map(blendSrcAlpha), ParamThreeToGL.map(blendDstAlpha));
                
                currentBlendSrc = blendSrc;
                currentBlendDst = blendDst;
                currentBlendSrcAlpha = blendSrcAlpha;
                currentBlendDstAlpha = blendDstAlpha;
                
            }
            
        } else {
            
            currentBlendEquation = null;
            currentBlendSrc = null;
            currentBlendDst = null;
            currentBlendEquationAlpha = null;
            currentBlendSrcAlpha = null;
            currentBlendDstAlpha = null;
            
        }
        
    }

    // TODO Deprecate
    void setColorWrite(boolean colorWrite) {
        
        colorBuffer.setMask(colorWrite);
        
    }
    
    void setDepthTest(boolean depthTest) {
        
        depthBuffer.setTest(depthTest);
        
    }
    
    void setDepthWrite(boolean depthWrite) {
        
        depthBuffer.setMask(depthWrite);
        
    }
    
    void setDepthFunc(int depthFunc) {
        
        depthBuffer.setFunc(depthFunc);
        
    }
    
    void setStencilTest(boolean stencilTest) {
        
        stencilBuffer.setTest(stencilTest);
        
    }
    
    void setStencilWrite(int stencilWrite) {
        
        stencilBuffer.setMask(stencilWrite);
        
    }
    
    void setStencilFunc(int stencilFunc, int stencilRef, int stencilMask) {
        
        stencilBuffer.setFunc(stencilFunc, stencilRef, stencilMask);
        
    }
    
    void setStencilOp(int stencilFail, int stencilZFail, int stencilZPass) {
        
        stencilBuffer.setOp(stencilFail, stencilZFail, stencilZPass);
        
    }
    
    void setFlipSided(boolean flipSided) {
        
        if (currentFlipSided != flipSided) {
            
            if (flipSided) {
                
                GL11.glFrontFace(GL11.GL_CW);
                
            } else {
                
                GL11.glFrontFace(GL11.GL_CCW);
                
            }
            
            currentFlipSided = flipSided;
            
        }
        
    }
    
    void setCullFace(int cullFace) {
        
        if (cullFace != Constants.CullFaceNone) {
            
            enable(GL11.GL_CULL_FACE);
            
            if (cullFace != currentCullFace) {
                
                if (cullFace == Constants.CullFaceBack) {
                    
                    GL11.glCullFace(GL11.GL_BACK);
                    
                } else if (cullFace == Constants.CullFaceFront) {
                    
                    GL11.glCullFace(GL11.GL_FRONT);
                    
                } else {
                    
                    GL11.glCullFace(GL11.GL_FRONT_AND_BACK);
                    
                }
                
            }
            
        } else {
            
            disable(GL11.GL_CULL_FACE);
            
        }
        
        currentCullFace = cullFace;
        
    }
    
    void setLineWidth(float width) {
        
        if (width != currentLineWidth) {
            
            if (lineWidthAvailable) {
                GL11.glLineWidth(width);
            }
            
            currentLineWidth = width;
            
        }
        
    }
    
    void setPolygonOffset(boolean polygonOffset, float factor, float units) {
        
        if (polygonOffset) {
            
            enable(GL11.GL_POLYGON_OFFSET_FILL);
            
            if (currentPolygonOffsetFactor != factor || currentPolygonOffsetUnits != units) {
                
                GL11.glPolygonOffset(factor, units);
                
                currentPolygonOffsetFactor = factor;
                currentPolygonOffsetUnits = units;
                
            }
            
        } else {
            
            disable(GL11.GL_POLYGON_OFFSET_FILL);
            
        }
        
    }
    
    boolean getScissorTest() {
        
        return currentScissorTest;
        
    }
    
    void setScissorTest(boolean scissorTest) {
        
        currentScissorTest = scissorTest;
        
        if (scissorTest) {
            
            enable(GL11.GL_SCISSOR_TEST);
            
        } else {
            
            disable(GL11.GL_SCISSOR_TEST);
            
        }
        
    }

    // texture
    void activeTexture(Integer webglSlot) {
        
        if (webglSlot == null) {
            webglSlot = GL13.GL_TEXTURE0 + maxTextures - 1;
        }
        
        if (!Objects.equals(currentTextureSlot, webglSlot)) {
            
            GL13.glActiveTexture(webglSlot);
            currentTextureSlot = webglSlot;
            
        }
        
    }
    
    void bindTexture(Integer webglType, Integer webglTexture) {
        
        if (currentTextureSlot == null) {
            
            activeTexture(null);
            
        }
        
        BoundTexture boundTexture = currentBoundTextures.get(currentTextureSlot);
        
        if (boundTexture == null) {
            
            boundTexture = new BoundTexture(null, null);
            currentBoundTextures.put(currentTextureSlot, boundTexture);
            
        }
        
        if (!Objects.equals(boundTexture.type, webglType) || !Objects.equals(boundTexture.texture, webglTexture)) {
            if (webglTexture == null) {
                GL11.glBindTexture(webglType, emptyTextures.get(webglType));
            } else {
                GL11.glBindTexture(webglType, webglTexture);
            }
            
            boundTexture.type = webglType;
            boundTexture.texture = webglTexture;
            
        }
        
    }
    
    void compressedTexImage2D(int target, int level, int internalFormat, int width, int height, int border, ByteBuffer data) {
        GL13.glCompressedTexImage2D(target, level, internalFormat, width, height, border, data);
    }
    
    void texImage2D(int target, int level, int internalFormat, int width, int height, int border, int format, int type, ByteBuffer data) {
        GL11.glTexImage2D(target, level, internalFormat, width, height, border, format, type, data);
    }
    
    void scissor(Vector4d scissor) {
        
        if (!currentScissor.equals(scissor)) {
            
            GL11.glScissor((int) scissor.x(), (int) scissor.y(), (int) scissor.z(), (int) scissor.w());
            currentScissor.copy(scissor);
            
        }
        
    }
    
    void reset() {
        
        for (int i = 0; i < enabledAttributes.capacity(); i++) {
            
            if (enabledAttributes.get(i) == 1) {
                
                GL20.glDisableVertexAttribArray(i);
                enabledAttributes.put(i, 0);
                
            }
            
        }
        
        capabilities = new HashMap<>();
        
        compressedTextureFormats = null;
        
        currentTextureSlot = null;
        currentBoundTextures = new HashMap<>();
        
        currentBlending = null;
        
        currentFlipSided = null;
        currentCullFace = null;
        
        colorBuffer.reset();
        depthBuffer.reset();
        stencilBuffer.reset();
        
    }
    
    void viewport(Vector4d viewport) {
        
        if (!currentViewport.equals(viewport)) {
            
            GL11.glViewport((int) viewport.x(), (int) viewport.y(), (int) viewport.z(), (int) viewport.w());
            currentViewport.copy(viewport);
            
        }
        
    }
    
}

class BoundTexture {
    
    Integer type;
    Integer texture;
    
    public BoundTexture(Integer type, Integer texture) {
        this.type = type;
        this.texture = texture;
    }
    
}
