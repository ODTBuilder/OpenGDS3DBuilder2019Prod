/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gl;

import static info.laht.threej.core.Constants.*;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GL12;
import org.lwjgl.opengl.GL14;
import org.lwjgl.opengl.GL30;

/**
 *
 * @author laht
 */
public class ParamThreeToGL {

    public static int map(int p) {
        if (p == RepeatWrapping) {
            return GL11.GL_REPEAT;
        }
        if (p == ClampToEdgeWrapping) {
            return GL12.GL_CLAMP_TO_EDGE;
        }
        if (p == MirroredRepeatWrapping) {
            return GL14.GL_MIRRORED_REPEAT;
        }

        if (p == NearestFilter) {
            return GL11.GL_NEAREST;
        }
        if (p == NearestMipMapNearestFilter) {
            return GL11.GL_NEAREST_MIPMAP_NEAREST;
        }
        if (p == NearestMipMapLinearFilter) {
            return GL11.GL_NEAREST_MIPMAP_LINEAR;
        }

        if (p == LinearFilter) {
            return GL11.GL_LINEAR;
        }
        if (p == LinearMipMapNearestFilter) {
            return GL11.GL_LINEAR_MIPMAP_NEAREST;
        }
        if (p == LinearMipMapLinearFilter) {
            return GL11.GL_LINEAR_MIPMAP_LINEAR;
        }

        if (p == UnsignedByteType) {
            return GL11.GL_UNSIGNED_BYTE;
        }
        if (p == UnsignedShort4444Type) {
            return GL12.GL_UNSIGNED_SHORT_4_4_4_4;
        }
        if (p == UnsignedShort5551Type) {
            return GL12.GL_UNSIGNED_SHORT_5_5_5_1;
        }
        if (p == UnsignedShort565Type) {
            return GL12.GL_UNSIGNED_SHORT_5_6_5;
        }

        if (p == ByteType) {
            return GL11.GL_BYTE;
        }
        if (p == ShortType) {
            return GL11.GL_SHORT;
        }
        if (p == UnsignedShortType) {
            return GL11.GL_UNSIGNED_SHORT;
        }
        if (p == IntType) {
            return GL11.GL_INT;
        }
        if (p == UnsignedIntType) {
            return GL11.GL_UNSIGNED_INT;
        }
        if (p == FloatType) {
            return GL11.GL_FLOAT;
        }

        if (p == HalfFloatType) {

//			extension = extensions.get( 'OES_texture_half_float' );
//
//			if ( extension != null ) {
//                            return extension.HALF_FLOAT_OES;
//                        }
        }

        if (p == AlphaFormat) {
            return GL11.GL_ALPHA;
        }
        if (p == RGBFormat) {
            return GL11.GL_RGB;
        }
        if (p == RGBAFormat) {
            return GL11.GL_RGBA;
        }
        if (p == LuminanceFormat) {
            return GL11.GL_LUMINANCE;
        }
        if (p == LuminanceAlphaFormat) {
            return GL11.GL_LUMINANCE_ALPHA;
        }
        if (p == DepthFormat) {
            return GL11.GL_DEPTH_COMPONENT;
        }
        if (p == DepthStencilFormat) {
            return GL30.GL_DEPTH_STENCIL;
        }

        if (p == AddEquation) {
            return GL14.GL_FUNC_ADD;
        }
        if (p == SubtractEquation) {
            return GL14.GL_FUNC_SUBTRACT;
        }
        if (p == ReverseSubtractEquation) {
            return GL14.GL_FUNC_REVERSE_SUBTRACT;
        }

        if (p == ZeroFactor) {
            return GL11.GL_ZERO;
        }
        if (p == OneFactor) {
            return GL11.GL_ONE;
        }
        if (p == SrcColorFactor) {
            return GL11.GL_SRC_COLOR;
        }
        if (p == OneMinusSrcColorFactor) {
            return GL11.GL_ONE_MINUS_SRC_COLOR;
        }
        if (p == SrcAlphaFactor) {
            return GL11.GL_SRC_ALPHA;
        }
        if (p == OneMinusSrcAlphaFactor) {
            return GL11.GL_ONE_MINUS_SRC_ALPHA;
        }
        if (p == DstAlphaFactor) {
            return GL11.GL_DST_ALPHA;
        }
        if (p == OneMinusDstAlphaFactor) {
            return GL11.GL_ONE_MINUS_DST_ALPHA;
        }

        if (p == DstColorFactor) {
            return GL11.GL_DST_COLOR;
        }
        if (p == OneMinusDstColorFactor) {
            return GL11.GL_ONE_MINUS_DST_COLOR;
        }
        if (p == SrcAlphaSaturateFactor) {
            return GL11.GL_SRC_ALPHA_SATURATE;
        }

        if (p == RGB_S3TC_DXT1_Format || p == RGBA_S3TC_DXT1_Format
                || p == RGBA_S3TC_DXT3_Format || p == RGBA_S3TC_DXT5_Format) {

//			extension = extensions.get( 'WEBGL_compressed_texture_s3tc' );
//
//			if ( extension != null ) {
//
//				if ( p == RGB_S3TC_DXT1_Format ) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
//				if ( p == RGBA_S3TC_DXT1_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
//				if ( p == RGBA_S3TC_DXT3_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
//				if ( p == RGBA_S3TC_DXT5_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
//
//			}
        }

        if (p == RGB_PVRTC_4BPPV1_Format || p == RGB_PVRTC_2BPPV1_Format
                || p == RGBA_PVRTC_4BPPV1_Format || p == RGBA_PVRTC_2BPPV1_Format) {

//			extension = extensions.get( 'WEBGL_compressed_texture_pvrtc' );
//
//			if ( extension != null ) {
//
//				if ( p == RGB_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
//				if ( p == RGB_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
//				if ( p == RGBA_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
//				if ( p == RGBA_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
//
//			}
        }

        if (p == RGB_ETC1_Format) {

//			extension = extensions.get( 'WEBGL_compressed_texture_etc1' );
//
//			if ( extension != null ) {
//                            return extension.COMPRESSED_RGB_ETC1_WEBGL;
//                        }
        }

        if (p == MinEquation || p == MaxEquation) {

//			extension = extensions.get( 'EXT_blend_minmax' );
//
//			if ( extension != null ) {
//
//				if ( p == MinEquation ) return extension.MIN_EXT;
//				if ( p == MaxEquation ) return extension.MAX_EXT;
//
//			}
        }

        if (p == UnsignedInt248Type) {

//			extension = extensions.get( 'WEBGL_depth_texture' );
//
//			if ( extension !== null ) {
//                            return extension.UNSIGNED_INT_24_8_WEBGL;
//                        }
        }

        return 0;
    }

}
