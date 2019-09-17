/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.textures;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.Constants;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.Identifiable;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Vector2d;
import java.awt.image.*;
import java.io.Serializable;
import java.util.*;
import java.util.concurrent.atomic.*;

/**
 * https://github.com/mrdoob/three.js/blob/master/src/textures/Texture.js
 *
 * @author laht
 */
public class Texture implements Identifiable, Serializable {

    private static final AtomicInteger textureIdGen = new AtomicInteger();

    public int id = textureIdGen.incrementAndGet();

    public static BufferedImage DEFAULT_IMAGE = null;
    public static int DEFAULT_MAPPING = Constants.UVMapping;

    private final UUID uuid = UUID.randomUUID();
    public String name = "";

    public BufferedImage image;

    public List<BufferedImage> mipmaps;
    
    public TextureUpdateCallback onUpdate;

    public int mapping;
    public int wrapS, wrapT;
    public int magFilter, minFilter;
    public int format, type;
    public int anisotropy;
    public int encoding;

    public Vector2d offset = new Vector2d(0, 0);
    public Vector2d repeat = new Vector2d(1, 1);

    public boolean generateMipmaps = true;
    public boolean premultiplyAlpha = false;
    public boolean flipY = true;
    public int unpackAlignment = 4;	// valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

    public int __webglTexture;
    
    public int version = 0;
    
    public Texture() {
        this(null);
    }

    public Texture(BufferedImage image) {
        this(image, null, null, null, null, null, null, null, null, null);
    }

    public Texture(BufferedImage image, Integer mapping, Integer wrapS, Integer wrapT, Integer magFilter, Integer minFilter, Integer format, Integer type, Integer anisotropy, Integer encoding) {
        this.image = image == null ? DEFAULT_IMAGE : image;
        
        this.mipmaps = new ArrayList<>();

        this.mapping = mapping == null ? DEFAULT_MAPPING: mapping;
        this.wrapS = wrapS == null ? Constants.ClampToEdgeWrapping : wrapS;
        this.wrapT = wrapT == null ? Constants.ClampToEdgeWrapping : wrapT;
        this.magFilter = magFilter == null ? Constants.LinearFilter : magFilter;
        this.minFilter = minFilter == null ? Constants.LinearMipMapLinearFilter: minFilter;
        this.format = format == null ? Constants.RGBAFormat : format;
        this.type = type == null ? Constants.UnsignedByteType: type;
        this.anisotropy = anisotropy == null ? 1 : anisotropy;
        this.encoding = encoding == null ? Constants.LinearEncoding : encoding;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void needsUpdate(boolean flag) {
        if (flag) {
            version++;
        }
    }

    public Texture copy(Texture source) {
        this.image = source.image;

        this.mipmaps.clear();
        this.mipmaps.addAll(source.mipmaps);

        this.mapping = source.mapping;

        this.wrapS = source.wrapS;
        this.wrapT = source.wrapT;

        this.magFilter = source.magFilter;
        this.minFilter = source.minFilter;

        this.anisotropy = source.anisotropy;

        this.format = source.format;
        this.type = source.type;

        this.offset.copy(source.offset);
        this.repeat.copy(source.repeat);

        this.generateMipmaps = source.generateMipmaps;
        this.premultiplyAlpha = source.premultiplyAlpha;
        this.flipY = source.flipY;
        this.unpackAlignment = source.unpackAlignment;
        this.encoding = source.encoding;

        return this;
    }
    
    public interface TextureUpdateCallback {
        public void onUpdate(Texture texture);
    }

}
