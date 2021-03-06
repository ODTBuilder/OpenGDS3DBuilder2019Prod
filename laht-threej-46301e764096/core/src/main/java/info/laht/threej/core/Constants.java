/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.core;

import java.io.Serializable;

/**
 *
 * @author laht
 */
public final class Constants implements Serializable{
    
    private Constants() {
        
    }

    public static final int CullFaceNone = 0;
    public static final int CullFaceBack = 1;
    public static final int CullFaceFront = 2;
    public static final int CullFaceFrontBack = 3;
    public static final int FrontFaceDirectionCW = 0;
    public static final int FrontFaceDirectionCCW = 1;
    public static final int BasicShadowMap = 0;
    public static final int PCFShadowMap = 1;
    public static final int PCFSoftShadowMap = 2;
    public static final int FrontSide = 0;
    public static final int BackSide = 1;
    public static final int DoubleSide = 2;
    public static final int FlatShading = 1;
    public static final int SmoothShading = 2;
    public static final int NoColors = 0;
    public static final int FaceColors = 1;
    public static final int VertexColors = 2;
    public static final int NoBlending = 0;
    public static final int NormalBlending = 1;
    public static final int AdditiveBlending = 2;
    public static final int SubtractiveBlending = 3;
    public static final int MultiplyBlending = 4;
    public static final int CustomBlending = 5;
    public static final int AddEquation = 100;
    public static final int SubtractEquation = 101;
    public static final int ReverseSubtractEquation = 102;
    public static final int MinEquation = 103;
    public static final int MaxEquation = 104;
    public static final int ZeroFactor = 200;
    public static final int OneFactor = 201;
    public static final int SrcColorFactor = 202;
    public static final int OneMinusSrcColorFactor = 203;
    public static final int SrcAlphaFactor = 204;
    public static final int OneMinusSrcAlphaFactor = 205;
    public static final int DstAlphaFactor = 206;
    public static final int OneMinusDstAlphaFactor = 207;
    public static final int DstColorFactor = 208;
    public static final int OneMinusDstColorFactor = 209;
    public static final int SrcAlphaSaturateFactor = 210;
    public static final int NeverDepth = 0;
    public static final int AlwaysDepth = 1;
    public static final int LessDepth = 2;
    public static final int LessEqualDepth = 3;
    public static final int EqualDepth = 4;
    public static final int GreaterEqualDepth = 5;
    public static final int GreaterDepth = 6;
    public static final int NotEqualDepth = 7;
    public static final int MultiplyOperation = 0;
    public static final int MixOperation = 1;
    public static final int AddOperation = 2;
    public static final int NoToneMapping = 0;
    public static final int LinearToneMapping = 1;
    public static final int ReinhardToneMapping = 2;
    public static final int Uncharted2ToneMapping = 3;
    public static final int CineonToneMapping = 4;
    public static final int UVMapping = 300;
    public static final int CubeReflectionMapping = 301;
    public static final int CubeRefractionMapping = 302;
    public static final int EquirectangularReflectionMapping = 303;
    public static final int EquirectangularRefractionMapping = 304;
    public static final int SphericalReflectionMapping = 305;
    public static final int CubeUVReflectionMapping = 306;
    public static final int CubeUVRefractionMapping = 307;
    public static final int RepeatWrapping = 1000;
    public static final int ClampToEdgeWrapping = 1001;
    public static final int MirroredRepeatWrapping = 1002;
    public static final int NearestFilter = 1003;
    public static final int NearestMipMapNearestFilter = 1004;
    public static final int NearestMipMapLinearFilter = 1005;
    public static final int LinearFilter = 1006;
    public static final int LinearMipMapNearestFilter = 1007;
    public static final int LinearMipMapLinearFilter = 1008;
    public static final int UnsignedByteType = 1009;
    public static final int ByteType = 1010;
    public static final int ShortType = 1011;
    public static final int UnsignedShortType = 1012;
    public static final int IntType = 1013;
    public static final int UnsignedIntType = 1014;
    public static final int FloatType = 1015;
    public static final int HalfFloatType = 1016;
    public static final int UnsignedShort4444Type = 1017;
    public static final int UnsignedShort5551Type = 1018;
    public static final int UnsignedShort565Type = 1019;
    public static final int UnsignedInt248Type = 1020;
    public static final int AlphaFormat = 1021;
    public static final int RGBFormat = 1022;
    public static final int RGBAFormat = 1023;
    public static final int LuminanceFormat = 1024;
    public static final int LuminanceAlphaFormat = 1025;
    public static final int RGBEFormat = RGBAFormat;
    public static final int DepthFormat = 1026;
    public static final int DepthStencilFormat = 1027;
    public static final int RGB_S3TC_DXT1_Format = 2001;
    public static final int RGBA_S3TC_DXT1_Format = 2002;
    public static final int RGBA_S3TC_DXT3_Format = 2003;
    public static final int RGBA_S3TC_DXT5_Format = 2004;
    public static final int RGB_PVRTC_4BPPV1_Format = 2100;
    public static final int RGB_PVRTC_2BPPV1_Format = 2101;
    public static final int RGBA_PVRTC_4BPPV1_Format = 2102;
    public static final int RGBA_PVRTC_2BPPV1_Format = 2103;
    public static final int RGB_ETC1_Format = 2151;
    public static final int LoopOnce = 2200;
    public static final int LoopRepeat = 2201;
    public static final int LoopPingPong = 2202;
    public static final int InterpolateDiscrete = 2300;
    public static final int InterpolateLinear = 2301;
    public static final int InterpolateSmooth = 2302;
    public static final int ZeroCurvatureEnding = 2400;
    public static final int ZeroSlopeEnding = 2401;
    public static final int WrapAroundEnding = 2402;
    public static final int TrianglesDrawMode = 0;
    public static final int TriangleStripDrawMode = 1;
    public static final int TriangleFanDrawMode = 2;
    public static final int LinearEncoding = 3000;
    public static final int sRGBEncoding = 3001;
    public static final int GammaEncoding = 3007;
    public static final int RGBEEncoding = 3002;
    public static final int LogLuvEncoding = 3003;
    public static final int RGBM7Encoding = 3004;
    public static final int RGBM16Encoding = 3005;
    public static final int RGBDEncoding = 3006;
    public static final int BasicDepthPacking = 3200;
    public static final int RGBADepthPacking = 3201;

}
