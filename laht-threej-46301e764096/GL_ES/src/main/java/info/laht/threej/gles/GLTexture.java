/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import static info.laht.threej.core.Constants.*;
import info.laht.threej.math.MathUtil;
import info.laht.threej.textures.CompressedTexture;
import info.laht.threej.textures.DataTexture;
import info.laht.threej.textures.DepthTexture;
import info.laht.threej.textures.Texture;
import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Map;
import org.lwjgl.opengles.GLES20;
import org.lwjgl.opengles.GLES30;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author laht
 */
public class GLTexture {

    private static final Logger LOG = LoggerFactory.getLogger(GLTexture.class);

    private final GLState state;
    private final GLProperties properties;
    private final GLCapabilities capabilities;
    
    private InfoMemory _infoMemory;

    public GLTexture(GLExtensions extensions, GLState state, GLProperties properties, GLCapabilities capabilities) {

        this.state = state;
        this.properties = properties;
        this.capabilities = capabilities;
        
        _infoMemory = new InfoMemory();

    }

    private BufferedImage clampToMaxSize(BufferedImage image, int maxSize) {

        if (image.getWidth() > maxSize || image.getHeight() > maxSize) {

            double scale = ((double) maxSize) / Math.max(image.getWidth(), image.getHeight());

            throw new UnsupportedOperationException("Not implmented yet!");

        }

        return image;

    }

    public boolean isPowerOfTwo(BufferedImage image) {
        return MathUtil.isPowerOfTwo(image.getWidth()) && MathUtil.isPowerOfTwo(image.getHeight());
    }

    public BufferedImage makePowerOfTwo(BufferedImage image) {
        throw new UnsupportedOperationException("not implemented yet!");
    }

    public boolean textureNeedsPowerOfTwo(Texture texture) {

        return (texture.wrapS != ClampToEdgeWrapping || texture.wrapT != ClampToEdgeWrapping)
                || (texture.minFilter != NearestFilter && texture.minFilter != LinearFilter);

    }

    public int filterFallback(int f) {
        if (f == NearestFilter || f == NearestMipMapNearestFilter || f == NearestMipMapLinearFilter) {
            return GLES20.GL_NEAREST;
        }

        return GLES20.GL_LINEAR;
    }

    public void setTexture2D(Texture texture, int slot) {

        Map<String, Object> textureProperties = properties.get(texture);

        if (texture.version > 0 && (int) textureProperties.get("__version") != texture.version) {

            BufferedImage image = texture.image;

            if (image == null) {

                LOG.warn("Texture marked for update but image is undefined: {}", texture);

            } else {

                uploadTexture(textureProperties, texture, slot);
                return;

            }

        }

        state.activeTexture(GLES20.GL_TEXTURE0 + slot);
        state.bindTexture(GLES20.GL_TEXTURE_2D, (int) textureProperties.get("__webglTexture"));

    }

    public void setTextureCubeDynamic(Texture texture, int slot) {

        state.activeTexture(GLES20.GL_TEXTURE0 + slot);
        state.bindTexture(GLES20.GL_TEXTURE_CUBE_MAP, ((Texture) properties.get(texture)).__webglTexture);

    }

    public void setTextureParameters(int textureType, Texture texture, boolean isPowerOfTwoImage) {

        if (isPowerOfTwoImage) {

            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_WRAP_S, ParamThreeToGL.map(texture.wrapS));
            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_WRAP_T, ParamThreeToGL.map(texture.wrapT));

            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_MAG_FILTER, ParamThreeToGL.map(texture.magFilter));
            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_MIN_FILTER, ParamThreeToGL.map(texture.minFilter));

        } else {

            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);

            if (texture.wrapS != ClampToEdgeWrapping || texture.wrapT != ClampToEdgeWrapping) {

                LOG.warn("Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to ClampToEdgeWrapping: {}", texture);

            }

            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_MAG_FILTER, filterFallback(texture.magFilter));
            GLES20.glTexParameteri(textureType, GLES20.GL_TEXTURE_MIN_FILTER, filterFallback(texture.minFilter));

            if (texture.minFilter != NearestFilter && texture.minFilter != LinearFilter) {

                LOG.warn("Texture is not power of two. Texture.minFilter should be set to NearestFilter or LinearFilter: {}", texture);

            }

        }

    }

    public void uploadTexture(Map<String, Object> textureProperties, Texture texture, int slot) {

        if (textureProperties.get("__webglInit") == null) {

            textureProperties.put("__webglInit", true);

//			texture.addEventListener( 'dispose', onTextureDispose );
            textureProperties.put("__webglTexture", GLES20.glGenTextures());

            _infoMemory.textures++;

        }

        state.activeTexture(GLES20.GL_TEXTURE0 + slot);
        state.bindTexture(GLES20.GL_TEXTURE_2D, (int) textureProperties.get("__webglTexture"));

//		GLES20.GL_pixelStorei( GLES20.GL_UNPACK_FLIP_Y_WEBGL, texture.flipY );
//		GLES20.GL_pixelStorei( GLES20.GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
        GLES20.glPixelStorei(GLES20.GL_UNPACK_ALIGNMENT, texture.unpackAlignment);

        BufferedImage image = clampToMaxSize(texture.image, capabilities.maxTextureSize);

        if (textureNeedsPowerOfTwo(texture) && isPowerOfTwo(image) == false) {

            image = makePowerOfTwo(image);

        }

        boolean isPowerOfTwoImage = isPowerOfTwo(image);
        int glFormat = ParamThreeToGL.map(texture.format);
        int glType = ParamThreeToGL.map(texture.type);

        setTextureParameters(GLES20.GL_TEXTURE_2D, texture, isPowerOfTwoImage);

        BufferedImage mipmap;
        List<BufferedImage> mipmaps = texture.mipmaps;

        if (texture instanceof DepthTexture) {

            // populate depth texture with dummy data
            int internalFormat = GLES20.GL_DEPTH_COMPONENT;

            if (texture.type == FloatType) {

                internalFormat = GLES30.GL_DEPTH_COMPONENT32F;

            } else {

                // WebGL 2.0 requires signed internalformat for glTexImage2D
                internalFormat = GLES20.GL_DEPTH_COMPONENT16;

            }

            if (texture.format == DepthFormat && internalFormat == GLES20.GL_DEPTH_COMPONENT) {

				// The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
                // DEPTH_COMPONENT and type is not UNSIGNED_SHORT or UNSIGNED_INT
                // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
                if (texture.type != UnsignedShortType && texture.type != UnsignedIntType) {

                    LOG.warn("Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture.");

                    texture.type = UnsignedShortType;
                    glType = ParamThreeToGL.map(texture.type);

                }

            }

            // Depth stencil textures need the DEPTH_STENCIL internal format
            // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
            if (texture.format == DepthStencilFormat) {

                internalFormat = GLES30.GL_DEPTH_STENCIL;

				// The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
                // DEPTH_STENCIL and type is not UNSIGNED_INT_24_8_WEBGL.
                // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
                if (texture.type != UnsignedInt248Type) {

                    LOG.warn(" Use UnsignedInt248Type for DepthStencilFormat DepthTexture.");

                    texture.type = UnsignedInt248Type;
                    glType = ParamThreeToGL.map(texture.type);

                }

            }

            state.texImage2D(GLES20.GL_TEXTURE_2D, 0, internalFormat, image.getWidth(), image.getHeight(), 0, glFormat, glType, null);

        } else if (texture instanceof DataTexture) {

            // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels
            if (mipmaps.size() > 0 && isPowerOfTwoImage) {

                for (int i = 0, il = mipmaps.size(); i < il; i++) {

                    mipmap = mipmaps.get(i);
//                    state.texImage2D(GLES20.GL_TEXTURE_2D, i, glFormat, mipmap.getWidth(), mipmap.getHeight(), 0, glFormat, glType, mipmap.data);

                }

                texture.generateMipmaps = false;

            } else {
//                image.getData().getDataBuffer().state.texImage2D(GLES20.GL_TEXTURE_2D, 0, glFormat, image.getWidth(), image.getHeight(), 0, glFormat, glType, image.data);

            }

        } else if (texture instanceof CompressedTexture) {

//            for (int i = 0, il = mipmaps.size(); i < il; i++) {
//
//                mipmap = mipmaps.get(i);
//
//                if (texture.format != RGBAFormat && texture.format != RGBFormat) {
//
//                    if (state.getCompressedTextureFormats().indexOf(glFormat) > - 1) {
//
//                        state.compressedTexImage2D(GLES20.GL_TEXTURE_2D, i, glFormat, mipmap.getWidth(), mipmap.getHeight(), 0, mipmap.data);
//
//                    } else {
//
//                        LOG.warn("Attempt to load unsupported compressed texture format in .uploadTexture()");
//
//                    }
//
//                } else {
//
//                    state.texImage2D(GLES20.GL_TEXTURE_2D, i, glFormat, mipmap.getWidth(), mipmap.getHeight(), 0, glFormat, glType, mipmap.data);
//
//                }
//
//            }

        } else {

            // regular Texture (image, video, canvas)
	    // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels
            if (mipmaps.size() > 0 && isPowerOfTwoImage) {

                for (int i = 0, il = mipmaps.size(); i < il; i++) {

                    mipmap = mipmaps.get(i);
//                    state.texImage2D(GLES20.GL_TEXTURE_2D, i, glFormat, glFormat, glType, mipmap);

                }

                texture.generateMipmaps = false;

            } else {

//                state.texImage2D(GLES20.GL_TEXTURE_2D, 0, glFormat, glFormat, glType, image);

            }

        }

        if (texture.generateMipmaps && isPowerOfTwoImage) {
            GLES20.glGenerateMipmap(GLES20.GL_TEXTURE_2D);
        }

        textureProperties.put("__version", texture.version);

        if (texture.onUpdate != null) {
            texture.onUpdate.onUpdate(texture);
        }

    }
    
    class InfoMemory {
        int textures;
    }

}
