/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import info.laht.threej.core.Constants;
import info.laht.threej.math.Vector4d;
import java.nio.ByteBuffer;
import java.nio.IntBuffer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.lwjgl.BufferUtils;
import org.lwjgl.opengles.GLES20;

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
                GLES20.glColorMask(colorMask, colorMask, colorMask, colorMask);
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
                GLES20.glClearColor(r, g, b, a);
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
        Float currentDepthClear = null;

        public void setTest(boolean depthTest) {

            if (depthTest) {
                enable(GLES20.GL_DEPTH_TEST);
            } else {
                disable(GLES20.GL_DEPTH_TEST);
            }

        }

        public void setMask(boolean depthMask) {

            if (currentDepthMask != depthMask && !locked) {
                GLES20.glDepthMask(depthMask);
                currentDepthMask = depthMask;
            }

        }

        public void setFunc(int depthFunc) {
            if (currentDepthFunc != depthFunc) {

                switch (depthFunc) {

                    case Constants.NeverDepth:

                        GLES20.glDepthFunc(GLES20.GL_NEVER);
                        break;

                    case Constants.AlwaysDepth:

                        GLES20.glDepthFunc(GLES20.GL_ALWAYS);
                        break;

                    case Constants.LessDepth:

                        GLES20.glDepthFunc(GLES20.GL_LESS);
                        break;

                    case Constants.LessEqualDepth:

                        GLES20.glDepthFunc(GLES20.GL_LEQUAL);
                        break;

                    case Constants.EqualDepth:

                        GLES20.glDepthFunc(GLES20.GL_EQUAL);
                        break;

                    case Constants.GreaterEqualDepth:

                        GLES20.glDepthFunc(GLES20.GL_GEQUAL);
                        break;

                    case Constants.GreaterDepth:

                        GLES20.glDepthFunc(GLES20.GL_GREATER);
                        break;

                    case Constants.NotEqualDepth:

                        GLES20.glDepthFunc(GLES20.GL_NOTEQUAL);
                        break;

                    default:

                        GLES20.glDepthFunc(GLES20.GL_LEQUAL);

                }

            }

            currentDepthFunc = depthFunc;

        }

        public void setLocked(boolean lock) {
            this.locked = lock;
        }

        public void setClear(float depth) {
            if (currentDepthClear != depth) {
                GLES20.glClearDepthf(depth);
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
                enable(GLES20.GL_STENCIL_TEST);
            } else {
                disable(GLES20.GL_STENCIL_TEST);
            }

        }

        public void setMask(int stencilMask) {
            if (currentStencilMask != stencilMask && !locked) {
                GLES20.glStencilMask(stencilMask);
                currentStencilMask = stencilMask;
            }
        }

        public void setFunc(int stencilFunc, int stencilRef, int stencilMask) {

            if (currentStencilFunc != stencilFunc
                    || currentStencilRef != stencilRef
                    || currentStencilMask != stencilMask) {

                GLES20.glStencilFunc(stencilFunc, stencilRef, stencilMask);

                currentStencilFunc = stencilFunc;
                currentStencilRef = stencilRef;
                currentStencilMask = stencilMask;

            }
        }

        public void setOp(int stencilFail, int stencilZFail, int stencilZPass) {

            if (currentStencilFail != stencilFail
                    || currentStencilZFail != stencilZFail
                    || currentStencilZPass != stencilZPass) {

                GLES20.glStencilOp(stencilFail, stencilZFail, stencilZPass);

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
                GLES20.glClearStencil(stencil);
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

        maxVertexAttributes = GLES20.glGetInteger(GLES20.GL_MAX_VERTEX_ATTRIBS);
        newAttributes = BufferUtils.createIntBuffer(maxVertexAttributes);
        enabledAttributes = BufferUtils.createIntBuffer(maxVertexAttributes);
        attributeDivisors = BufferUtils.createIntBuffer(maxVertexAttributes);

        maxTextures = GLES20.glGetInteger(GLES20.GL_MAX_TEXTURE_IMAGE_UNITS);

        emptyTextures.put(GLES20.GL_TEXTURE_2D, createTexture(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_2D, 1));
        emptyTextures.put(GLES20.GL_TEXTURE_CUBE_MAP, createTexture(GLES20.GL_TEXTURE_CUBE_MAP, GLES20.GL_TEXTURE_CUBE_MAP_POSITIVE_X, 6));

    }

    public final int createTexture(int type, int target, int count) {

        IntBuffer data = BufferUtils.createIntBuffer(4);
        int texture = GLES20.glGenTextures();

        GLES20.glBindTexture(type, texture);
        GLES20.glTexParameteri(type, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST);
        GLES20.glTexParameteri(type, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_NEAREST);

        for (int i = 0; i < count; i++) {
            GLES20.glTexImage2D(target + i, 0, GLES20.GL_RGBA, 1, 1, 0, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, data);
        }

        return texture;

    }

    public void init() {
        colorBuffer.setClear(0, 0, 0, 1, false);
        depthBuffer.setClear(1);
        stencilBuffer.setClear(0);

        enable(GLES20.GL_DEPTH_TEST);
        setDepthFunc(Constants.LessEqualDepth);

        setFlipSided(false);
        setCullFace(Constants.CullFaceBack);
        enable(GLES20.GL_CULL_FACE);

        enable(GLES20.GL_BLEND);
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
            GLES20.glEnableVertexAttribArray(attribute);

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

            GLES20.glEnableVertexAttribArray(attribute);
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

                GLES20.glDisableVertexAttribArray(i);
                enabledAttributes.put(i, 0);

            }

        }

    }

    void enable(int id) {

        if (!capabilities.get(id)) {

            GLES20.glEnable(id);
            capabilities.put(id, true);

        }
    }

    void disable(int id) {

        if (capabilities.get(id)) {

            GLES20.glDisable(id);
            capabilities.put(id, false);

        }
    }

    void setBlending(int blending, Integer blendEquation, Integer blendSrc, Integer blendDst, Integer blendEquationAlpha, Integer blendSrcAlpha, Integer blendDstAlpha, Boolean premultipliedAlpha) {

        if (blending != Constants.NoBlending) {

            enable(GLES20.GL_BLEND);

        } else {

            disable(GLES20.GL_BLEND);

        }

        if (blending != currentBlending || premultipliedAlpha != currentPremultipledAlpha) {

            if (blending == Constants.AdditiveBlending) {

                if (premultipliedAlpha) {

                    GLES20.glBlendEquationSeparate(GLES20.GL_FUNC_ADD, GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFuncSeparate(GLES20.GL_ONE, GLES20.GL_ONE, GLES20.GL_ONE, GLES20.GL_ONE);

                } else {

                    GLES20.glBlendEquation(GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE);

                }

            } else if (blending == Constants.SubtractiveBlending) {

                if (premultipliedAlpha) {

                    GLES20.glBlendEquationSeparate(GLES20.GL_FUNC_ADD, GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFuncSeparate(GLES20.GL_ZERO, GLES20.GL_ZERO, GLES20.GL_ONE_MINUS_SRC_COLOR, GLES20.GL_ONE_MINUS_SRC_ALPHA);

                } else {

                    GLES20.glBlendEquation(GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFunc(GLES20.GL_ZERO, GLES20.GL_ONE_MINUS_SRC_COLOR);

                }

            } else if (blending == Constants.MultiplyBlending) {

                if (premultipliedAlpha) {

                    GLES20.glBlendEquationSeparate(GLES20.GL_FUNC_ADD, GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFuncSeparate(GLES20.GL_ZERO, GLES20.GL_SRC_COLOR, GLES20.GL_ZERO, GLES20.GL_SRC_ALPHA);

                } else {

                    GLES20.glBlendEquation(GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFunc(GLES20.GL_ZERO, GLES20.GL_SRC_COLOR);

                }

            } else {

                if (premultipliedAlpha) {

                    GLES20.glBlendEquationSeparate(GLES20.GL_FUNC_ADD, GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFuncSeparate(GLES20.GL_ONE, GLES20.GL_ONE_MINUS_SRC_ALPHA, GLES20.GL_ONE, GLES20.GL_ONE_MINUS_SRC_ALPHA);

                } else {

                    GLES20.glBlendEquationSeparate(GLES20.GL_FUNC_ADD, GLES20.GL_FUNC_ADD);
                    GLES20.glBlendFuncSeparate(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA, GLES20.GL_ONE, GLES20.GL_ONE_MINUS_SRC_ALPHA);

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

                GLES20.glBlendEquationSeparate(ParamThreeToGL.map(blendEquation), ParamThreeToGL.map(blendEquationAlpha));

                currentBlendEquation = blendEquation;
                currentBlendEquationAlpha = blendEquationAlpha;

            }

            if (blendSrc != currentBlendSrc || blendDst != currentBlendDst || blendSrcAlpha != currentBlendSrcAlpha || blendDstAlpha != currentBlendDstAlpha) {

                GLES20.glBlendFuncSeparate(ParamThreeToGL.map(blendSrc), ParamThreeToGL.map(blendDst), ParamThreeToGL.map(blendSrcAlpha), ParamThreeToGL.map(blendDstAlpha));

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

                GLES20.glFrontFace(GLES20.GL_CW);

            } else {

                GLES20.glFrontFace(GLES20.GL_CCW);

            }

            currentFlipSided = flipSided;

        }

    }

    void setCullFace(int cullFace) {

        if (cullFace != Constants.CullFaceNone) {

            enable(GLES20.GL_CULL_FACE);

            if (cullFace != currentCullFace) {

                if (cullFace == Constants.CullFaceBack) {

                    GLES20.glCullFace(GLES20.GL_BACK);

                } else if (cullFace == Constants.CullFaceFront) {

                    GLES20.glCullFace(GLES20.GL_FRONT);

                } else {

                    GLES20.glCullFace(GLES20.GL_FRONT_AND_BACK);

                }

            }

        } else {

            disable(GLES20.GL_CULL_FACE);

        }

        currentCullFace = cullFace;

    }

    void setLineWidth(float width) {

        if (width != currentLineWidth) {

            if (lineWidthAvailable) {
                GLES20.glLineWidth(width);
            }

            currentLineWidth = width;

        }

    }

    void setPolygonOffset(boolean polygonOffset, float factor, float units) {

        if (polygonOffset) {

            enable(GLES20.GL_POLYGON_OFFSET_FILL);

            if (currentPolygonOffsetFactor != factor || currentPolygonOffsetUnits != units) {

                GLES20.glPolygonOffset(factor, units);

                currentPolygonOffsetFactor = factor;
                currentPolygonOffsetUnits = units;

            }

        } else {

            disable(GLES20.GL_POLYGON_OFFSET_FILL);

        }

    }

    boolean getScissorTest() {

        return currentScissorTest;

    }

    void setScissorTest(boolean scissorTest) {

        currentScissorTest = scissorTest;

        if (scissorTest) {

            enable(GLES20.GL_SCISSOR_TEST);

        } else {

            disable(GLES20.GL_SCISSOR_TEST);

        }

    }

    // texture
    void activeTexture(Integer webglSlot) {

        if (webglSlot == null) {
            webglSlot = GLES20.GL_TEXTURE0 + maxTextures - 1;
        }

        if (!Objects.equals(currentTextureSlot, webglSlot)) {

            GLES20.glActiveTexture(webglSlot);
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
                GLES20.glBindTexture(webglType, emptyTextures.get(webglType));
            } else {
                GLES20.glBindTexture(webglType, webglTexture);
            }

            boundTexture.type = webglType;
            boundTexture.texture = webglTexture;

        }

    }

    void compressedTexImage2D(int target, int level, int internalFormat, int width, int height, int border, ByteBuffer data) {
        GLES20.glCompressedTexImage2D(target, level, internalFormat, width, height, border, data);
    }

    void texImage2D(int target, int level, int internalFormat, int width, int height, int border, int format, int type, ByteBuffer data) {
        GLES20.glTexImage2D(target, level, internalFormat, width, height, border, format, type, data);
    }

    void scissor(Vector4d scissor) {

        if (!currentScissor.equals(scissor)) {

            GLES20.glScissor((int) scissor.x(), (int) scissor.y(), (int) scissor.z(), (int) scissor.w());
            currentScissor.copy(scissor);

        }

    }

    void reset() {

        for (int i = 0; i < enabledAttributes.capacity(); i++) {

            if (enabledAttributes.get(i) == 1) {

                GLES20.glDisableVertexAttribArray(i);
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

            GLES20.glViewport((int) viewport.x(), (int) viewport.y(), (int) viewport.z(), (int) viewport.w());
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
